import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PharmacyService, InventoryItem, DispensationLog } from '../services/pharmacy.service';
import { PrescriptionDocument } from '@/firebase/types';
import { toast } from 'sonner';

export function usePharmacyPrescriptions() {
  return useQuery<PrescriptionDocument[]>({
    queryKey: ['pharmacy', 'prescriptions'],
    queryFn: () => PharmacyService.getAllPrescriptions(),
    staleTime: 60 * 1000,
  });
}

export function usePharmacyInventory(hospitalId: string) {
  return useQuery<InventoryItem[]>({
    queryKey: ['pharmacy', 'inventory', hospitalId],
    queryFn: () => PharmacyService.getInventory(hospitalId),
    staleTime: 60 * 1000,
  });
}

export function useDispenseHistory(hospitalId: string) {
  return useQuery<DispensationLog[]>({
    queryKey: ['pharmacy', 'dispenseHistory', hospitalId],
    queryFn: () => PharmacyService.getDispenseHistory(hospitalId),
    staleTime: 60 * 1000,
  });
}

export function useAddInventoryItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      hospitalId,
      data,
    }: {
      hospitalId: string;
      data: Omit<InventoryItem, 'inventoryId' | 'hospitalId'>;
    }) => {
      return PharmacyService.addInventoryItem(hospitalId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy', 'inventory', variables.hospitalId] });
      toast.success('Medicine added to inventory successfully.');
    },
  });
}

export function useUpdateInventoryItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      inventoryId,
      data,
    }: {
      inventoryId: string;
      hospitalId: string;
      data: Partial<Omit<InventoryItem, 'inventoryId' | 'hospitalId'>>;
    }) => {
      return PharmacyService.updateInventoryItem(inventoryId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy', 'inventory', variables.hospitalId] });
      toast.success('Inventory item updated successfully.');
    },
  });
}

export function useDeleteInventoryItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      inventoryId,
    }: {
      inventoryId: string;
      hospitalId: string;
    }) => {
      return PharmacyService.deleteInventoryItem(inventoryId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy', 'inventory', variables.hospitalId] });
      toast.success('Medicine deleted from inventory.');
    },
  });
}

export function useDispenseMedicineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      recordId,
      patientId,
      patientName,
      hospitalId,
      dispensedBy,
      medicines,
    }: {
      recordId: string;
      patientId: string;
      patientName: string;
      hospitalId: string;
      dispensedBy: string;
      medicines: Array<{ medicineId: string; quantity: number }>;
    }) => {
      return PharmacyService.dispenseMedicine(
        recordId,
        patientId,
        patientName,
        hospitalId,
        dispensedBy,
        medicines
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy', 'inventory', variables.hospitalId] });
      queryClient.invalidateQueries({ queryKey: ['pharmacy', 'dispenseHistory', variables.hospitalId] });
      toast.success('Prescription dispensed successfully and stock adjusted.');
    },
  });
}
