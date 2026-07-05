'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
  useHospitalInventory,
  useSaveInventoryItemMutation,
  useDeleteInventoryItemMutation,
  HospitalInventoryDocument,
} from '@/features/hospital/hooks/useHospital';
import { PageHeader, LoadingState } from '@/features/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Edit2, X } from 'lucide-react';

const inventorySchema = zod.object({
  inventoryId: zod.string().min(2, 'Inventory ID is required'),
  medicineId: zod.string().min(2, 'Medicine ID is required'),
  medicineName: zod.string().min(2, 'Medicine name must be at least 2 characters'),
  quantity: zod.number().min(0, 'Quantity cannot be negative'),
  minimumStock: zod.number().min(0, 'Minimum stock cannot be negative'),
  expiryDate: zod.string().min(10, 'Provide a valid date (YYYY-MM-DD)'),
  category: zod.string().min(2, 'Category is required'),
  supplier: zod.string().min(2, 'Supplier name is required'),
});

type InventoryFormValues = zod.infer<typeof inventorySchema>;

export default function InventoryPage() {
  const hospitalId = 'hosp_city_gen';
  const { data: inventory, isLoading } = useHospitalInventory(hospitalId);
  const saveMutation = useSaveInventoryItemMutation();
  const deleteMutation = useDeleteInventoryItemMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryFormValues | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      inventoryId: '',
      medicineId: '',
      medicineName: '',
      quantity: 100,
      minimumStock: 20,
      expiryDate: '',
      category: 'Analgesics',
      supplier: '',
    },
  });

  if (isLoading) {
    return <LoadingState variant="table" />;
  }

  const handleEdit = (item: HospitalInventoryDocument) => {
    setEditingItem({
      inventoryId: item.inventoryId,
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      quantity: item.quantity,
      minimumStock: item.minimumStock,
      expiryDate: item.expiryDate as string,
      category: item.category,
      supplier: item.supplier,
    });
    setValue('inventoryId', item.inventoryId);
    setValue('medicineId', item.medicineId);
    setValue('medicineName', item.medicineName);
    setValue('quantity', item.quantity);
    setValue('minimumStock', item.minimumStock);
    setValue('expiryDate', item.expiryDate as string);
    setValue('category', item.category);
    setValue('supplier', item.supplier);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    const randId = `med_${Date.now()}`;
    reset({
      inventoryId: `${hospitalId}_${randId}`,
      medicineId: randId,
      medicineName: '',
      quantity: 100,
      minimumStock: 20,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'Analgesics',
      supplier: '',
    });
    setShowForm(true);
  };

  const onSubmit = async (values: InventoryFormValues) => {
    const computedStatus = new Date(values.expiryDate) < new Date()
      ? 'expired'
      : values.quantity === 0
      ? 'out_of_stock'
      : values.quantity <= values.minimumStock
      ? 'low_stock'
      : 'in_stock';

    await saveMutation.mutateAsync({
      item: {
        ...values,
        hospitalId,
        status: computedStatus,
      },
    });
    setShowForm(false);
    reset();
  };

  const handleDelete = async (inventoryId: string) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      await deleteMutation.mutateAsync({ hospitalId, inventoryId });
    }
  };

  const filtered = inventory?.filter((item) => {
    const matchesSearch = item.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) || item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory ? item.category === selectedCategory : true;
    return matchesSearch && matchesCat;
  }) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Manager"
        description="Oversee stockpiles, check low stock alarms, track suppliers, and configure procurement limits."
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Medicine / Supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-transparent rounded-xl text-xs font-bold text-slate-750 dark:border-slate-800 focus:outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs font-bold text-slate-650 dark:border-slate-800 dark:text-slate-350 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="Analgesics">Analgesics</option>
            <option value="Antibiotics">Antibiotics</option>
            <option value="Cardiovascular">Cardiovascular</option>
            <option value="Vitamin Supplements">Vitamin Supplements</option>
          </select>
        </div>

        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs px-4 py-2.5 flex items-center justify-center gap-2 cursor-pointer transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      {/* Inventory table list */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-450 font-bold">
                <th className="pb-3">Medicine ID</th>
                <th className="pb-3">Name</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Qty / Min</th>
                <th className="pb-3">Expiry Date</th>
                <th className="pb-3">Supplier</th>
                <th className="pb-3">Stock Level</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.inventoryId} className="border-b border-slate-50 dark:border-slate-900 text-slate-700 dark:text-slate-350">
                  <td className="py-3.5 font-bold text-slate-900 dark:text-slate-100">{item.medicineId}</td>
                  <td className="py-3.5 font-semibold">{item.medicineName}</td>
                  <td className="py-3.5">{item.category}</td>
                  <td className="py-3.5 font-bold">
                    {item.quantity} <span className="text-slate-400 font-medium">/ {item.minimumStock}</span>
                  </td>
                  <td className="py-3.5 font-semibold text-slate-600 dark:text-slate-400">{item.expiryDate as string}</td>
                  <td className="py-3.5">{item.supplier}</td>
                  <td className="py-3.5">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold capitalize ${
                      item.status === 'in_stock'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20'
                        : item.status === 'low_stock'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                        : 'bg-red-50 text-red-650 dark:bg-red-950/20'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(item)} className="p-1 text-slate-550 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(item.inventoryId)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-slate-250 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2.5 mb-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">
                  {editingItem ? 'Edit Stock item details' : 'Configure New Inventory Stock'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
                <input type="hidden" {...register('inventoryId')} />
                <input type="hidden" {...register('medicineId')} />

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Medicine Name</label>
                  <input
                    type="text"
                    {...register('medicineName')}
                    className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100"
                  />
                  {errors.medicineName && <p className="text-red-500 mt-1 font-bold">{errors.medicineName.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Category</label>
                    <select
                      {...register('category')}
                      className="w-full border border-slate-200 bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none"
                    >
                      <option value="Analgesics">Analgesics</option>
                      <option value="Antibiotics">Antibiotics</option>
                      <option value="Cardiovascular">Cardiovascular</option>
                      <option value="Vitamin Supplements">Vitamin Supplements</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Supplier Name</label>
                    <input
                      type="text"
                      {...register('supplier')}
                      className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100"
                    />
                    {errors.supplier && <p className="text-red-500 mt-1 font-bold">{errors.supplier.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Current Stock Qty</label>
                    <input
                      type="number"
                      {...register('quantity', { valueAsNumber: true })}
                      className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Minimum Alert Threshold</label>
                    <input
                      type="number"
                      {...register('minimumStock', { valueAsNumber: true })}
                      className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    {...register('expiryDate')}
                    className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100"
                  />
                  {errors.expiryDate && <p className="text-red-500 mt-1 font-bold">{errors.expiryDate.message}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-slate-500 font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-5 py-2 text-white font-bold hover:bg-blue-750"
                  >
                    Save Stock Item
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
