'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
  useHospitalStaff,
  useHospitalDepartments,
  useSaveStaffMutation,
  useDeleteStaffMutation,
} from '@/features/hospital/hooks/useHospital';
import { PageHeader, LoadingState } from '@/features/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Edit2, X, BadgeCheck } from 'lucide-react';

const staffSchema = zod.object({
  staffId: zod.string().min(2, 'Staff ID must be at least 2 characters'),
  fullName: zod.string().min(2, 'Staff name must be at least 2 characters'),
  email: zod.string().email('Please enter a valid email'),
  role: zod.enum(['nurse', 'pharmacist', 'receptionist', 'lab_tech', 'admin']),
  departmentId: zod.string().min(1, 'Please select a department'),
  shift: zod.enum(['morning', 'evening', 'night']),
  status: zod.enum(['active', 'inactive']),
});

type StaffFormValues = zod.infer<typeof staffSchema>;

export default function HospitalStaffPage() {
  const hospitalId = 'hosp_city_gen';
  const { data: staff, isLoading: staffLoading } = useHospitalStaff(hospitalId);
  const { data: departments, isLoading: deptsLoading } = useHospitalDepartments(hospitalId);
  const saveStaffMutation = useSaveStaffMutation();
  const deleteStaffMutation = useDeleteStaffMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffFormValues | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      staffId: '',
      fullName: '',
      email: '',
      role: 'nurse',
      departmentId: '',
      shift: 'morning',
      status: 'active',
    },
  });

  if (staffLoading || deptsLoading) {
    return <LoadingState variant="table" />;
  }

  const handleEdit = (s: StaffFormValues) => {
    setEditingStaff(s);
    setValue('staffId', s.staffId);
    setValue('fullName', s.fullName);
    setValue('email', s.email);
    setValue('role', s.role);
    setValue('departmentId', s.departmentId);
    setValue('shift', s.shift);
    setValue('status', s.status);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingStaff(null);
    reset({
      staffId: `${hospitalId}_staff_${Date.now()}`,
      fullName: '',
      email: '',
      role: 'nurse',
      departmentId: departments?.[0]?.departmentId || '',
      shift: 'morning',
      status: 'active',
    });
    setShowForm(true);
  };

  const onSubmit = async (values: StaffFormValues) => {
    await saveStaffMutation.mutateAsync({
      staff: {
        ...values,
        hospitalId,
      },
    });
    setShowForm(false);
    reset();
  };

  const handleDelete = async (staffId: string) => {
    if (confirm('Are you sure you want to delete this staff record?')) {
      await deleteStaffMutation.mutateAsync({ hospitalId, staffId });
    }
  };

  const filtered = staff?.filter((s) =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Directory"
        description="Oversee administrative officers, nurses, pharmacists, and lab technicians, assigning shift slots."
      />

      {/* Action panel */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff by name or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-transparent rounded-xl text-xs font-bold text-slate-750 dark:border-slate-800 focus:outline-none"
          />
        </div>

        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs px-4 py-2.5 flex items-center justify-center gap-2 cursor-pointer transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Form Modal */}
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
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">
                  {editingStaff ? 'Modify Staff Record' : 'Configure New Staff Member'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Staff ID</label>
                  <input
                    type="text"
                    disabled={!!editingStaff}
                    {...register('staffId')}
                    className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50"
                  />
                  {errors.staffId && <p className="text-red-500 mt-1 font-bold">{errors.staffId.message}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Full Name</label>
                  <input
                    type="text"
                    {...register('fullName')}
                    className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100"
                  />
                  {errors.fullName && <p className="text-red-500 mt-1 font-bold">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Email Address</label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100"
                  />
                  {errors.email && <p className="text-red-500 mt-1 font-bold">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Role</label>
                    <select
                      {...register('role')}
                      className="w-full border border-slate-200 bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none"
                    >
                      <option value="nurse">Nurse</option>
                      <option value="pharmacist">Pharmacist</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="lab_tech">Lab Technician</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Department</label>
                    <select
                      {...register('departmentId')}
                      className="w-full border border-slate-200 bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none"
                    >
                      {departments?.map((d) => (
                        <option key={d.departmentId} value={d.departmentId}>
                          {d.departmentName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Shift Slot</label>
                    <select
                      {...register('shift')}
                      className="w-full border border-slate-200 bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none"
                    >
                      <option value="morning">Morning</option>
                      <option value="evening">Evening</option>
                      <option value="night">Night</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Status</label>
                    <select
                      {...register('status')}
                      className="w-full border border-slate-200 bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveStaffMutation.isPending}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-white font-bold hover:bg-blue-750 transition"
                  >
                    {saveStaffMutation.isPending ? 'Saving...' : 'Save Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grid listing */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => {
          const deptMatch = departments?.find((d) => d.departmentId === s.departmentId);
          return (
            <motion.div
              key={s.staffId}
              layout
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 font-extrabold text-sm uppercase">
                    {s.fullName.slice(0, 2)}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-1.5 text-slate-500 hover:text-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.staffId)}
                      className="p-1.5 text-red-500 hover:text-red-750 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">
                    {s.fullName}
                  </h3>
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">{s.role.replace('_', ' ')}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{s.email}</p>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Department:</span>
                    <span className="text-slate-850 dark:text-slate-350">{deptMatch?.departmentName || 'General Medicine'}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Shift Type:</span>
                    <span className="text-slate-850 dark:text-slate-350 capitalize">{s.shift} Shift</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center">
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold flex items-center gap-1 ${
                  s.status === 'active'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                    : 'bg-slate-50 text-slate-500 dark:bg-slate-850'
                }`}>
                  <BadgeCheck className="h-3 w-3" />
                  {s.status === 'active' ? 'Active' : 'Inactive'}
                </span>
                <span className="text-[9px] text-slate-400 font-bold">Staff ID: {s.staffId.split('_').pop()}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
