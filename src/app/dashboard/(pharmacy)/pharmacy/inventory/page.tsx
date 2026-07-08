'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/providers/AuthProvider';
import {
  usePharmacyInventory,
  useAddInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation } from
'@/features/pharmacy/hooks/usePharmacy';
import { InventoryItem } from '@/features/pharmacy/services/pharmacy.service';
import { PageHeader, LoadingState } from '@/features/shared';
import { Search, Plus, Trash2, Edit2, X, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/toast';

const inventorySchema = zod.object({
  medicineName: zod.string().min(3, 'Medicine name must be at least 3 letters'),
  category: zod.string().min(2, 'Category is required'),
  quantity: zod.number().min(0, 'Quantity cannot be negative'),
  minimumStock: zod.number().min(0, 'Minimum stock cannot be negative'),
  batchNumber: zod.string().min(2, 'Batch number is required'),
  expiryDate: zod.string().min(10, 'Valid expiry date required'),
  supplier: zod.string().min(2, 'Supplier name is required')
});

type InventoryFormValues = zod.infer<typeof inventorySchema>;

export default function PharmacyInventoryPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const hospitalId = user?.uid || 'hosp_city_gen';

  const { data: inventory, isLoading } = usePharmacyInventory(hospitalId);
  const addMutation = useAddInventoryItemMutation();
  const updateMutation = useUpdateInventoryItemMutation();
  const deleteMutation = useDeleteInventoryItemMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{id: string;name: string;} | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      medicineName: '',
      category: 'Analgesics',
      quantity: 100,
      minimumStock: 20,
      batchNumber: 'BAT-101',
      expiryDate: '',
      supplier: ''
    }
  });

  if (isLoading) {
    return <LoadingState variant="table" />;
  }

  const items = inventory || [];

  // Filter
  const categories = Array.from(new Set(items.map((i) => i.category)));
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const onSubmit = async (values: InventoryFormValues) => {
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({
          inventoryId: editingItem.id,
          hospitalId,
          data: values
        });
        setEditingItem(null);
      } else {
        await addMutation.mutateAsync({
          hospitalId,
          data: {
            ...values,
            medicineId: `med_${values.medicineName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            status: 'active'
          }
        });
      }
      setIsFormOpen(false);
      reset();
    } catch {
      toast.error(t("pharmacy.failed_to_register_stock_updates"));
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem({ id: item.inventoryId, name: item.medicineName });
    setIsFormOpen(true);
    reset({
      medicineName: item.medicineName,
      category: item.category,
      quantity: item.quantity,
      minimumStock: item.minimumStock,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate,
      supplier: item.supplier
    });
  };

  const handleDelete = async (inventoryId: string) => {
    if (confirm('Delete this medicine formulation from active inventory list?')) {
      try {
        await deleteMutation.mutateAsync({ inventoryId, hospitalId });
      } catch {
        toast.error(t("pharmacy.deletion_cancelled_due_to_transaction_errors"));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title={t("pharmacy.medicine_stock_inventory")}
          description={t("pharmacy.manage_hospital_medicine_formula_batches_supplier_logistics_and_warning_parameters")} />
        
        <button
          onClick={() => {
            setEditingItem(null);
            setIsFormOpen(!isFormOpen);
            reset();
          }}
          className="rounded-xl bg-slate-900 dark:bg-slate-100 dark:text-slate-950 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold transition flex items-center gap-1.5">
          
          {isFormOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isFormOpen ? 'Close Form' : 'Register Stock'}
        </button>
      </div>

      {/* CRUD Form overlay */}
      {isFormOpen &&
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4 max-w-3xl">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-850 dark:text-slate-100">
            {editingItem ? `Edit: ${editingItem.name}` : 'Register New Medicine Batch'}
          </h3>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase block">{t("pharmacy.medicine_name")}</label>
              <input
              type="text"
              {...register('medicineName')}
              placeholder={t("pharmacy.paracetamol_650mg")}
              className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none" />
            
              {errors.medicineName && <p className="text-[9px] text-red-500 font-bold">{errors.medicineName.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase block">{t("pharmacy.category")}</label>
              <select
              {...register('category')}
              className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none">
              
                <option value="Analgesics">{t("pharmacy.analgesics")}</option>
                <option value="Antibiotics">{t("pharmacy.antibiotics")}</option>
                <option value="Cardiovascular">{t("pharmacy.cardiovascular")}</option>
                <option value="Antidiabetics">{t("pharmacy.antidiabetics")}</option>
                <option value="Gastrointestinal">{t("pharmacy.gastrointestinal")}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase block">{t("pharmacy.batch_number")}</label>
              <input
              type="text"
              {...register('batchNumber')}
              placeholder={t("pharmacy.prc_998")}
              className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none" />
            
              {errors.batchNumber && <p className="text-[9px] text-red-500 font-bold">{errors.batchNumber.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase block">{t("pharmacy.initial_stock_qty")}</label>
              <input
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none" />
            
              {errors.quantity && <p className="text-[9px] text-red-500 font-bold">{errors.quantity.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase block">{t("pharmacy.min_alert_limit")}</label>
              <input
              type="number"
              {...register('minimumStock', { valueAsNumber: true })}
              className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none" />
            
              {errors.minimumStock && <p className="text-[9px] text-red-500 font-bold">{errors.minimumStock.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase block">{t("pharmacy.expiry_date")}</label>
              <input
              type="date"
              {...register('expiryDate')}
              className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none" />
            
              {errors.expiryDate && <p className="text-[9px] text-red-500 font-bold">{errors.expiryDate.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase block">{t("pharmacy.supplier")}</label>
              <input
              type="text"
              {...register('supplier')}
              placeholder={t("pharmacy.astra_biotech")}
              className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none" />
            
              {errors.supplier && <p className="text-[9px] text-red-500 font-bold">{errors.supplier.message}</p>}
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
            type="submit"
            disabled={addMutation.isPending || updateMutation.isPending}
            className="rounded-xl bg-blue-650 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2 text-xs font-bold transition">{t("pharmacy.commit_stock_parameters")}


          </button>
          </div>
        </form>
      }

      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("pharmacy.search_stock_by_formula_name_or_batch")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-transparent dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none" />
          
        </div>

        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-transparent px-3.5 py-2 text-xs font-bold text-slate-650 dark:border-slate-800 dark:text-slate-350 focus:outline-none">
            
            <option value="all">{t("pharmacy.all_categories")}</option>
            {categories.map((c) =>
            <option key={c} value={c}>{c}</option>
            )}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      {filteredItems.length === 0 ?
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <AlertCircle className="h-10 w-10 text-slate-350 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("pharmacy.no_matching_stock_found")}</p>
          <p className="text-xs text-slate-450 mt-1">{t("pharmacy.add_items_or_broaden_your_filter_search")}</p>
        </div> :

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-850 dark:bg-slate-900">
          <table className="w-full text-left border-collapse text-xs font-semibold text-slate-700 dark:text-slate-300">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-150 dark:border-slate-850 text-slate-450 text-[10px] uppercase font-bold">
                <th className="p-4">{t("pharmacy.medicine_batch")}</th>
                <th className="p-4">{t("pharmacy.category")}</th>
                <th className="p-4 text-center">{t("pharmacy.quantity")}</th>
                <th className="p-4">{t("pharmacy.expiry_date")}</th>
                <th className="p-4">{t("pharmacy.supplier")}</th>
                <th className="p-4">{t("pharmacy.status")}</th>
                <th className="p-4 text-right">{t("pharmacy.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {filteredItems.map((item) => {
              const today = new Date();
              const expDate = new Date(item.expiryDate);
              const isExpired = expDate <= today;
              const isLow = item.quantity > 0 && item.quantity <= item.minimumStock;
              const isOut = item.quantity <= 0;

              return (
                <tr key={item.inventoryId} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-slate-55">{item.medicineName}</p>
                      <p className="text-[10px] text-slate-400">{t("pharmacy.batch")}{item.batchNumber}</p>
                    </td>
                    <td className="p-4">{item.category}</td>
                    <td className="p-4 text-center font-bold text-slate-850 dark:text-slate-50">{item.quantity}</td>
                    <td className="p-4">
                      <span className={isExpired ? 'text-red-500 font-bold' : ''}>
                        {item.expiryDate}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{item.supplier}</td>
                    <td className="p-4">
                      {isExpired ?
                    <span className="bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400 px-2 py-0.5 rounded-md text-[9px] font-bold">{t("pharmacy.expired")}</span> :
                    isOut ?
                    <span className="bg-red-50 text-red-650 dark:bg-red-950/10 dark:text-red-400 px-2 py-0.5 rounded-md text-[9px] font-bold">{t("pharmacy.out_of_stock")}</span> :
                    isLow ?
                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 px-2 py-0.5 rounded-md text-[9px] font-bold">{t("pharmacy.low_stock")}</span> :

                    <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-2 py-0.5 rounded-md text-[9px] font-bold">{t("pharmacy.healthy")}</span>
                    }
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                        
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                        onClick={() => handleDelete(item.inventoryId)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-red-650">
                        
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>);

            })}
            </tbody>
          </table>
        </div>
      }
    </div>);

}