'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  usePharmacyInventory,
  usePharmacyPrescriptions,
  useDispenseMedicineMutation,
  useDispenseHistory } from
'@/features/pharmacy/hooks/usePharmacy';
import { useDoctorPatients } from '@/features/doctor/hooks/useDoctor';
import { PageHeader, LoadingState } from '@/features/shared';
import { Search, FileText, CheckCircle2, Layers } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { PrescriptionDocument } from '@/firebase/types';
import { Input } from '@/components/ui/input';


interface SelectedPrescription extends PrescriptionDocument {
  patientName: string;
}

export default function PharmacyDispensingPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const hospitalId = user?.uid || 'hosp_city_gen';
  const dispensedBy = user?.uid || 'pharmacist_user_1';

  const { data: prescriptions, isLoading: rxLoading } = usePharmacyPrescriptions();
  const { data: inventory, isLoading: invLoading } = usePharmacyInventory(hospitalId);
  const { data: history, isLoading: histLoading } = useDispenseHistory(hospitalId);
  // Also get patients to display patient names properly
  const { data: patients } = useDoctorPatients('doc_arav_mehta');

  const dispenseMutation = useDispenseMedicineMutation();

  const [searchRxId, setSearchRxId] = useState('');
  const [selectedRx, setSelectedRx] = useState<SelectedPrescription | null>(null);

  if (rxLoading || invLoading || histLoading) {
    return <LoadingState variant="card" />;
  }

  const handleLookup = () => {
    if (!searchRxId.trim()) {
      toast.error(t("pharmacy.please_enter_a_prescription_reference_number"));
      return;
    }

    const rx = prescriptions?.find(
      (r) => r.recordId.toLowerCase() === searchRxId.trim().toLowerCase()
    );

    if (rx) {
      const patient = patients?.find((p) => p.uid === rx.patientId);
      setSelectedRx({
        ...rx,
        patientName: patient?.fullName || 'Patient Profile'
      });
      toast.success(t("pharmacy.prescription_docket_retrieved_successfully"));
    } else {
      setSelectedRx(null);
      toast.error(t("pharmacy.no_matching_prescription_reference_docket_found"));
    }
  };

  const handleDispense = async () => {
    if (!selectedRx) return;

    // Build dispensation list
    const medicinesToDispense = selectedRx.medicines.map((m) => {
      // Find matching inventory item by matching names (or ID if aligned)
      const matchingStock = inventory?.find(
        (inv) => inv.medicineName.toLowerCase().includes(m.name.toLowerCase()) ||
        m.name.toLowerCase().includes(inv.medicineName.toLowerCase())
      );

      return {
        medicineId: matchingStock?.medicineId || m.medicineId,
        name: m.name,
        quantity: m.duration * 2 // assume 2 tablets a day for simple dispensation quantity
      };
    });

    // Validate stock levels before mutation
    for (const item of medicinesToDispense) {
      const stock = inventory?.find((inv) => inv.medicineId === item.medicineId);
      if (!stock) {
        toast.error(`Formulation ${item.name} not registered in local hospital inventory.`);
        return;
      }
      if (stock.quantity < item.quantity) {
        toast.error(`Out-of-stock blocker: ${item.name} has only ${stock.quantity} available. Required: ${item.quantity}`);
        return;
      }
    }

    try {
      await dispenseMutation.mutateAsync({
        recordId: selectedRx.recordId,
        patientId: selectedRx.patientId,
        patientName: selectedRx.patientName,
        hospitalId,
        dispensedBy,
        medicines: medicinesToDispense
      });

      setSelectedRx(null);
      setSearchRxId('');
    } catch {
      toast.error(t("pharmacy.failed_to_commit_dispensation_transaction"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("pharmacy.prescription_dispensing_desk")}
        description={t("pharmacy.verify_doctor_prescription_dockets_validate_inventory_shelf_quantities_and_log_dispensing_updates")} />
      

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Lookup & Dispense Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lookup Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-850 dark:text-slate-100">{t("pharmacy.prescription_docket_lookup")}

            </h3>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder={t("pharmacy.enter_prescription_id_eg_pres__or_lookup_index")}
                  value={searchRxId}
                  onChange={(e) => setSearchRxId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-transparent dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none font-semibold" />
                
              </div>
              <button
                onClick={handleLookup}
                className="rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-950 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-bold transition">{t("pharmacy.fetch_docket")}


              </button>
            </div>
          </div>

          {/* Prescription Details Card */}
          {selectedRx ?
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-850 pb-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50">{selectedRx.patientName}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{t("pharmacy.docket_id")}{selectedRx.recordId}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{t("pharmacy.diagnosis")}
                {selectedRx.diagnosis}
                </span>
              </div>

              {/* Medicines List to Dispense */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">{t("pharmacy.formula_stock_check")}</h5>

                <div className="divide-y divide-slate-100 dark:divide-slate-850">
                  {selectedRx.medicines.map((m, idx) => {
                  const matchingStock = inventory?.find(
                    (inv) => inv.medicineName.toLowerCase().includes(m.name.toLowerCase()) ||
                    m.name.toLowerCase().includes(inv.medicineName.toLowerCase())
                  );
                  const qtyNeeded = m.duration * 2;
                  const stockAvailable = matchingStock ? matchingStock.quantity : 0;
                  const hasEnough = stockAvailable >= qtyNeeded;

                  return (
                    <div key={idx} className="py-3.5 flex justify-between items-center text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 dark:text-slate-100">{m.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{t("pharmacy.dosage")}{typeof m.dosage === 'string' ? m.dosage : (m.dosage as any)?.pattern}{t("pharmacy.duration")}{m.duration}{t("pharmacy.days")}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-850 dark:text-slate-200">{t("pharmacy.required")}{qtyNeeded}{t("pharmacy.units")}</p>
                          <p className={`text-[10px] font-semibold ${hasEnough ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                            {matchingStock ? `In-stock: ${stockAvailable}` : 'Not registered'}
                          </p>
                        </div>
                      </div>);

                })}
                </div>
              </div>

              {/* Dispense Trigger */}
              <div className="flex justify-end pt-4 border-t border-slate-150 dark:border-slate-800">
                <button
                onClick={handleDispense}
                disabled={dispenseMutation.isPending}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2.5 text-xs font-bold transition flex items-center gap-1.5">
                
                  <CheckCircle2 className="h-4 w-4" />{t("pharmacy.confirm_dispensation_print_label")}
              </button>
              </div>
            </div> :

          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <FileText className="h-10 w-10 text-slate-350 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("pharmacy.no_active_prescription_retrieved")}</p>
              <p className="text-xs text-slate-450 mt-1">{t("pharmacy.use_the_search_box_above_to_fetch_a_docket_for_validation")}</p>
            </div>
          }
        </div>

        {/* Right Column: Dispensing Log History */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-50 uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-blue-500" />{t("pharmacy.dispensing_audit_logs")}
          </h4>

          {history && history.length > 0 ?
          <div className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
              {history.map((log) =>
            <div key={log.dispenseId} className="py-3 space-y-1.5 font-bold text-slate-700 dark:text-slate-400">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-900 dark:text-slate-50">{log.patientName}</p>
                      <p className="text-[10px] text-slate-400">{t("pharmacy.rx")}{log.recordId}</p>
                    </div>
                    <span className="text-[9px] text-slate-400">
                      {log.dispensedAt.split('T')[0]}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900 text-[10px] font-semibold text-slate-550 dark:text-slate-300">
                    {log.medicines.map((m) => `${m.name} (x${m.quantity})`).join(', ')}
                  </div>
                </div>
            )}
            </div> :

          <p className="text-[10px] text-slate-450 leading-relaxed text-center py-6">{t("pharmacy.no_dispensing_transaction_logs_found_in_this_shift")}

          </p>
          }
        </div>
      </div>
    </div>);

}