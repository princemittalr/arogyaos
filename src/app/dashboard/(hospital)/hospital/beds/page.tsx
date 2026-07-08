'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
  useHospitalBeds,
  useHospitalRooms,
  useSaveBedMutation,
  useDeleteBedMutation } from
'@/features/hospital/hooks/useHospital';
import { PageHeader, LoadingState } from '@/features/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Edit2, X, Bed } from 'lucide-react';
import { Input } from '@/components/ui/input';


const bedSchema = zod.object({
  bedId: zod.string().min(2, 'Bed ID is required'),
  roomId: zod.string().min(1, 'Please select a room'),
  bedNumber: zod.string().min(1, 'Bed number is required'),
  status: zod.enum(['available', 'occupied', 'reserved', 'maintenance']),
  patientId: zod.string().optional(),
  patientName: zod.string().optional()
});

type BedFormValues = zod.infer<typeof bedSchema>;

export default function BedsPage() {const { t } = useLanguage();
  const hospitalId = 'hosp_city_gen';
  const { data: beds, isLoading: bedsLoading } = useHospitalBeds(hospitalId);
  const { data: rooms, isLoading: roomsLoading } = useHospitalRooms(hospitalId);
  const saveMutation = useSaveBedMutation();
  const deleteMutation = useDeleteBedMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBed, setEditingBed] = useState<BedFormValues | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<BedFormValues>({
    resolver: zodResolver(bedSchema),
    defaultValues: {
      bedId: '',
      roomId: '',
      bedNumber: '',
      status: 'available',
      patientId: '',
      patientName: ''
    }
  });

  if (bedsLoading || roomsLoading) {
    return <LoadingState variant="table" />;
  }

  const handleEdit = (b: BedFormValues) => {
    setEditingBed(b);
    setValue('bedId', b.bedId);
    setValue('roomId', b.roomId);
    setValue('bedNumber', b.bedNumber);
    setValue('status', b.status);
    setValue('patientId', b.patientId || '');
    setValue('patientName', b.patientName || '');
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingBed(null);
    reset({
      bedId: `${hospitalId}_bed_${Date.now()}`,
      roomId: rooms?.[0]?.roomId || '',
      bedNumber: '',
      status: 'available',
      patientId: '',
      patientName: ''
    });
    setShowForm(true);
  };

  const onSubmit = async (values: BedFormValues) => {
    await saveMutation.mutateAsync({
      bed: {
        ...values,
        hospitalId
      }
    });
    setShowForm(false);
    reset();
  };

  const handleDelete = async (bedId: string) => {
    if (confirm('Are you sure you want to delete this bed allocation?')) {
      await deleteMutation.mutateAsync({ hospitalId, bedId });
    }
  };

  const filtered = beds?.filter((b) => {
    const matchesSearch = b.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) || (b.patientName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? b.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("hospital.bed_allocation_center")}
        description={t("hospital.monitor_real_time_patient_bed_sensor_statuses_assign_icugeneral_wards_and_modify_maintenance_tags")} />
      

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder={t("hospital.search_bed_patient")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-transparent rounded-xl text-xs font-bold text-slate-750 dark:border-slate-800 focus:outline-none" />
            
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs font-bold text-slate-650 dark:border-slate-800 dark:text-slate-350 focus:outline-none">
            
            <option value="">{t("hospital.all_statuses")}</option>
            <option value="available">{t("hospital.available")}</option>
            <option value="occupied">{t("hospital.occupied")}</option>
            <option value="reserved">{t("hospital.reserved")}</option>
            <option value="maintenance">{t("hospital.maintenance")}</option>
          </select>
        </div>

        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs px-4 py-2.5 flex items-center justify-center gap-2 cursor-pointer transition">
          
          <Plus className="h-4 w-4" />
          <span>{t("hospital.add_bed_allocation")}</span>
        </button>
      </div>

      {/* Grid listing */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((b) =>
        <motion.div
          key={b.bedId}
          layout
          className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                    <Bed className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">{t("hospital.bed")}{b.bedNumber}</h3>
                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">{t("hospital.room")}{b.roomNumber} &bull; {b.roomType}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(b)} className="p-1 text-slate-550 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(b.bedId)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-850 pt-3 text-[10px] font-bold text-slate-500">
                <div className="flex justify-between">
                  <span>{t("hospital.current_status")}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold capitalize ${
                b.status === 'available' ?
                'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' :
                b.status === 'occupied' ?
                'bg-red-50 text-red-650 dark:bg-red-950/20' :
                'bg-slate-50 text-slate-450'}`
                }>
                    {b.status}
                  </span>
                </div>
                {b.status === 'occupied' &&
              <div className="flex justify-between">
                    <span>{t("hospital.patient_name")}</span>
                    <span className="text-slate-850 dark:text-slate-350">{b.patientName || 'Anonymous Citizen'}</span>
                  </div>
              }
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[9px] text-slate-400 font-bold">
              <span>{t("hospital.bed_id")}{b.bedId.split('_').pop()}</span>
              <span>{t("hospital.sensor_sync_active")}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" />
          
            <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-250 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2 mb-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">
                  {editingBed ? 'Modify Bed Parameters' : 'Register Bed Sensor Node'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
                <Input type="hidden" {...register('bedId')} />

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.bed_number")}</label>
                  <Input
                  type="text"
                  {...register('bedNumber')}
                  className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
                
                  {errors.bedNumber && <p className="text-red-500 mt-1 font-bold">{errors.bedNumber.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.ward_room")}</label>
                    <select
                    {...register('roomId')}
                    className="w-full border border-slate-200 bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none">
                    
                      {rooms?.map((r) =>
                    <option key={r.roomId} value={r.roomId}>{t("hospital.room")}
                      {r.roomNumber} ({r.roomType})
                        </option>
                    )}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.bed_status")}</label>
                    <select
                    {...register('status')}
                    className="w-full border border-slate-200 bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none">
                    
                      <option value="available">{t("hospital.available")}</option>
                      <option value="occupied">{t("hospital.occupied")}</option>
                      <option value="reserved">{t("hospital.reserved")}</option>
                      <option value="maintenance">{t("hospital.maintenance")}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.patient_name")}</label>
                    <Input
                    type="text"
                    {...register('patientName')}
                    placeholder={t("hospital.optional")}
                    className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
                  
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.patient_id")}</label>
                    <Input
                    type="text"
                    {...register('patientId')}
                    placeholder={t("hospital.optional")}
                    className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
                  
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-500 font-bold hover:bg-slate-50">{t("hospital.cancel")}


                </button>
                  <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-white font-bold hover:bg-blue-750">{t("hospital.save_bed")}


                </button>
                </div>
              </form>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

}