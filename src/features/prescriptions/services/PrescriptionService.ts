import { HealthVaultService } from '@/features/health-vault/services/HealthVaultService';
import { RefillRepository } from '../repositories/RefillRepository';
import { PrescriptionEventBus } from '../core/events';
import { PrescriptionRecord, RefillTransaction } from '../types';
import { RefillLimitExceededError, PrescriptionExpiredError } from '../core/errors';
import { ulid } from '@/features/health-vault/utils/ulid';
import { Timestamp } from 'firebase/firestore';

const vaultService = new HealthVaultService();
const refillRepo = new RefillRepository();
const eventBus = PrescriptionEventBus.getInstance();

export class PrescriptionService {
  /**
   * Request a refill for a prescription.
   */
  public async requestRefill(
    prescriptionId: string,
    quantity: number,
    context: {
      requesterId: string;
      pharmacyId?: string;
      pharmacyName?: string;
      notes?: string;
    }
  ): Promise<RefillTransaction> {
    // 1. Fetch prescription details
    const record = await vaultService.getRecordDetails('prescription', prescriptionId) as unknown as PrescriptionRecord;
    if (!record) {
      throw new Error(`Prescription with ID ${prescriptionId} not found.`);
    }

    // 2. Validate refills remaining
    // If refillsRemaining is undefined in old schema, default to refillsAllowed or 0
    const remaining = record.refillsRemaining !== undefined ? record.refillsRemaining : record.refillsAllowed;
    if (remaining <= 0) {
      throw new RefillLimitExceededError();
    }

    // 3. Validate expiration
    if (record.validUntil) {
      let validUntilDate: Date;
      if (record.validUntil instanceof Date) {
        validUntilDate = record.validUntil;
      } else if (typeof record.validUntil === 'object' && 'toDate' in record.validUntil) {
        const obj = record.validUntil as { toDate?: () => unknown };
        if (typeof obj.toDate === 'function') {
          const date = obj.toDate();
          validUntilDate = date instanceof Date ? date : new Date(date as string | number);
        } else {
          validUntilDate = new Date();
        }
      } else {
        validUntilDate = new Date(record.validUntil as string);
      }
      if (Date.now() > validUntilDate.getTime()) {
        throw new PrescriptionExpiredError();
      }
    }

    // 4. Create Refill transaction record
    const refillId = `refill_${ulid()}`;
    const transaction: RefillTransaction = {
      refillId,
      prescriptionId,
      requestedAt: Timestamp.now(),
      requestedQuantity: quantity,
      status: 'requested',
      pharmacyId: context.pharmacyId,
      pharmacyName: context.pharmacyName,
      notes: context.notes,
    };

    await refillRepo.createRefill(prescriptionId, transaction);

    // 5. Publish Event
    await eventBus.publish('RefillRequested', {
      transaction,
      requesterId: context.requesterId,
      timestamp: new Date(),
    });

    return transaction;
  }

  /**
   * Dispense a refill (Pharmacist action).
   */
  public async dispenseRefill(
    prescriptionId: string,
    refillId: string,
    context: {
      pharmacistId: string;
      pharmacyId: string;
      pharmacyName: string;
      ownerId: string; // Citizen owner of prescription
    }
  ): Promise<void> {
    const record = await vaultService.getRecordDetails('prescription', prescriptionId) as unknown as PrescriptionRecord;
    if (!record) {
      throw new Error(`Prescription with ID ${prescriptionId} not found.`);
    }

    const remaining = record.refillsRemaining !== undefined ? record.refillsRemaining : record.refillsAllowed;
    if (remaining <= 0) {
      throw new RefillLimitExceededError();
    }

    const refills = await refillRepo.getByPrescriptionId(prescriptionId);
    const refillTx = refills.find((r) => r.refillId === refillId);
    if (!refillTx) {
      throw new Error(`Refill transaction ${refillId} not found.`);
    }

    const updatedTx: RefillTransaction = {
      ...refillTx,
      status: 'dispensed',
      processedAt: Timestamp.now(),
      dispensedBy: context.pharmacistId,
      pharmacyId: context.pharmacyId,
      pharmacyName: context.pharmacyName,
    };

    // 1. Update refill record
    await refillRepo.updateRefillStatus(prescriptionId, refillId, {
      status: 'dispensed',
      processedAt: updatedTx.processedAt,
      dispensedBy: updatedTx.dispensedBy,
      pharmacyId: updatedTx.pharmacyId,
      pharmacyName: updatedTx.pharmacyName,
    });

    // 2. Decrement remaining refills count on prescription in vault
    const nextRemaining = remaining - 1;
    await vaultService.updateRecord('prescription', prescriptionId, {
      refillsRemaining: nextRemaining,
      // If refillsRemaining drops to 0 and validUntil duration ends, mark completed, else keep active
      status: nextRemaining <= 0 ? 'Completed' : record.status,
    }, {
      updatedBy: context.pharmacistId,
      ownerId: context.ownerId,
      actorRole: 'pharmacist',
      origin: {
        deviceId: 'pharmacy-terminal',
        deviceType: 'desktop',
        platform: 'linux',
        browser: 'chrome',
        appVersion: '1.0.0',
      },
    });

    // 3. Publish Event
    await eventBus.publish('RefillDispensed', {
      transaction: updatedTx,
      processorId: context.pharmacistId,
      timestamp: new Date(),
    });
  }

  /**
   * Authorize a refill request (Doctor action).
   */
  public async authorizeRefill(
    prescriptionId: string,
    refillId: string,
    context: {
      doctorId: string;
    }
  ): Promise<void> {
    const refills = await refillRepo.getByPrescriptionId(prescriptionId);
    const refillTx = refills.find((r) => r.refillId === refillId);
    if (!refillTx) {
      throw new Error(`Refill transaction ${refillId} not found.`);
    }

    const updatedTx: RefillTransaction = {
      ...refillTx,
      status: 'authorized',
      processedAt: Timestamp.now(),
      authorizedBy: context.doctorId,
    };

    await refillRepo.updateRefillStatus(prescriptionId, refillId, {
      status: 'authorized',
      processedAt: updatedTx.processedAt,
      authorizedBy: updatedTx.authorizedBy,
    });

    await eventBus.publish('RefillAuthorized', {
      transaction: updatedTx,
      processorId: context.doctorId,
      timestamp: new Date(),
    });
  }

  /**
   * Reject a refill request.
   */
  public async rejectRefill(
    prescriptionId: string,
    refillId: string,
    context: {
      processorId: string;
      notes?: string;
    }
  ): Promise<void> {
    const refills = await refillRepo.getByPrescriptionId(prescriptionId);
    const refillTx = refills.find((r) => r.refillId === refillId);
    if (!refillTx) {
      throw new Error(`Refill transaction ${refillId} not found.`);
    }

    const updatedTx: RefillTransaction = {
      ...refillTx,
      status: 'rejected',
      processedAt: Timestamp.now(),
      notes: context.notes || 'Request rejected.',
    };

    await refillRepo.updateRefillStatus(prescriptionId, refillId, {
      status: 'rejected',
      processedAt: updatedTx.processedAt,
      notes: updatedTx.notes,
    });

    await eventBus.publish('RefillRejected', {
      transaction: updatedTx,
      processorId: context.processorId,
      timestamp: new Date(),
    });
  }

  /**
   * Fetch all refills for a prescription.
   */
  public async getRefills(prescriptionId: string): Promise<RefillTransaction[]> {
    return refillRepo.getByPrescriptionId(prescriptionId);
  }
}
