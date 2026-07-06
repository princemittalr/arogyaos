'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
  useHospitalRooms,
  useSaveRoomMutation,
  useDeleteRoomMutation } from
'@/features/hospital/hooks/useHospital';
import { PageHeader, LoadingState } from '@/features/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Edit2, X, Home } from 'lucide-react';

const roomSchema = zod.object({
  roomId: zod.string().min(2, 'Room ID is required'),
  roomNumber: zod.string().min(1, 'Room number is required'),
  roomType: zod.enum(['icu', 'general', 'private', 'semi-private']),
  capacity: zod.number().min(1, 'Capacity must be at least 1'),
  occupiedCount: zod.number().min(0, 'Occupied count cannot be negative')
});

type RoomFormValues = zod.infer<typeof roomSchema>;

export default function RoomsPage() {const { t } = useLanguage();
  const hospitalId = 'hosp_city_gen';
  const { data: rooms, isLoading } = useHospitalRooms(hospitalId);
  const saveMutation = useSaveRoomMutation();
  const deleteMutation = useDeleteRoomMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomFormValues | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomId: '',
      roomNumber: '',
      roomType: 'general',
      capacity: 4,
      occupiedCount: 0
    }
  });

  if (isLoading) {
    return <LoadingState variant="table" />;
  }

  const handleEdit = (r: RoomFormValues) => {
    setEditingRoom(r);
    setValue('roomId', r.roomId);
    setValue('roomNumber', r.roomNumber);
    setValue('roomType', r.roomType);
    setValue('capacity', r.capacity);
    setValue('occupiedCount', r.occupiedCount);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingRoom(null);
    reset({
      roomId: `${hospitalId}_room_${Date.now()}`,
      roomNumber: '',
      roomType: 'general',
      capacity: 4,
      occupiedCount: 0
    });
    setShowForm(true);
  };

  const onSubmit = async (values: RoomFormValues) => {
    await saveMutation.mutateAsync({
      room: {
        ...values,
        hospitalId
      }
    });
    setShowForm(false);
    reset();
  };

  const handleDelete = async (roomId: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      await deleteMutation.mutateAsync({ hospitalId, roomId });
    }
  };

  const filtered = rooms?.filter((r) =>
  r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
  r.roomType.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("hospital.rooms_directory")}
        description={t("hospital.inspect_medical_ward_structures_occupancy_parameters_room_categories_and_bed_quotas")} />
      

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("hospital.search_by_room_number")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-transparent rounded-xl text-xs font-bold text-slate-750 dark:border-slate-800 focus:outline-none" />
          
        </div>

        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs px-4 py-2.5 flex items-center justify-center gap-2 cursor-pointer transition">
          
          <Plus className="h-4 w-4" />
          <span>{t("hospital.add_ward_room")}</span>
        </button>
      </div>

      {/* Grid listing */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => {
          const availabilityCount = r.capacity - r.occupiedCount;
          return (
            <motion.div
              key={r.roomId}
              layout
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
              
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                      <Home className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-55">{t("hospital.room")}{r.roomNumber}</h3>
                      <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">{r.roomType}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(r)} className="p-1 text-slate-500 hover:text-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(r.roomId)} className="p-1 text-red-500 hover:text-red-750 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 border-t border-slate-100 dark:border-slate-850 pt-4 text-center">
                  <div className="bg-slate-50/50 dark:bg-slate-950/20 p-2.5 rounded-xl">
                    <span className="block text-lg font-extrabold text-slate-900 dark:text-slate-50">{r.occupiedCount} / {r.capacity}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{t("hospital.occupied_beds")}</span>
                  </div>
                  <div className="bg-slate-50/50 dark:bg-slate-950/20 p-2.5 rounded-xl">
                    <span className="block text-lg font-extrabold text-slate-900 dark:text-slate-50">{availabilityCount}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{t("hospital.available_slots")}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center text-[9px] text-slate-400 font-bold">
                <span>{t("hospital.room_id")}{r.roomId.split('_').pop()}</span>
                <span className={availabilityCount > 0 ? 'text-emerald-600' : 'text-red-650'}>
                  {availabilityCount > 0 ? 'Vacant Slots' : 'Full capacity'}
                </span>
              </div>
            </motion.div>);

        })}
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
                  {editingRoom ? 'Modify Ward Room' : 'Configure New Ward Room'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
                <input type="hidden" {...register('roomId')} />

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.room_number")}</label>
                  <input
                  type="text"
                  {...register('roomNumber')}
                  className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
                
                  {errors.roomNumber && <p className="text-red-500 mt-1 font-bold">{errors.roomNumber.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.room_type")}</label>
                    <select
                    {...register('roomType')}
                    className="w-full border border-slate-200 bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none">
                    
                      <option value="icu">{t("hospital.icu")}</option>
                      <option value="general">{t("hospital.general")}</option>
                      <option value="private">{t("hospital.private")}</option>
                      <option value="semi-private">{t("hospital.semi_private")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.total_capacity")}</label>
                    <input
                    type="number"
                    {...register('capacity', { valueAsNumber: true })}
                    className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
                  
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.occupied_beds")}</label>
                  <input
                  type="number"
                  {...register('occupiedCount', { valueAsNumber: true })}
                  className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
                
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-500 font-bold hover:bg-slate-50">{t("hospital.cancel")}


                </button>
                  <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-white font-bold hover:bg-blue-750">{t("hospital.save_room")}


                </button>
                </div>
              </form>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

}