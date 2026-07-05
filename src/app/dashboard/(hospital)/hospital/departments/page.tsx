'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
  useHospitalDepartments,
  useSaveDepartmentMutation,
  useDeleteDepartmentMutation,
} from '@/features/hospital/hooks/useHospital';
import { PageHeader, LoadingState } from '@/features/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Plus, Trash2, Search, Edit2, X } from 'lucide-react';

const deptSchema = zod.object({
  departmentId: zod.string().min(2, 'Department ID must be at least 2 characters'),
  departmentName: zod.string().min(2, 'Name must be at least 2 characters'),
  description: zod.string().min(5, 'Description must be at least 5 characters'),
  doctorCount: zod.number().min(0),
  patientCount: zod.number().min(0),
});

type DeptFormValues = zod.infer<typeof deptSchema>;

export default function DepartmentsPage() {
  const hospitalId = 'hosp_city_gen';
  const { data: departments, isLoading } = useHospitalDepartments(hospitalId);
  const saveDeptMutation = useSaveDepartmentMutation();
  const deleteDeptMutation = useDeleteDepartmentMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingDept, setEditingDept] = useState<DeptFormValues | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DeptFormValues>({
    resolver: zodResolver(deptSchema),
    defaultValues: {
      departmentId: '',
      departmentName: '',
      description: '',
      doctorCount: 0,
      patientCount: 0,
    },
  });

  if (isLoading) {
    return <LoadingState variant="table" />;
  }

  const handleEdit = (dept: DeptFormValues) => {
    setEditingDept(dept);
    setValue('departmentId', dept.departmentId);
    setValue('departmentName', dept.departmentName);
    setValue('description', dept.description);
    setValue('doctorCount', dept.doctorCount);
    setValue('patientCount', dept.patientCount);
    setShowAddForm(true);
  };

  const handleAddNew = () => {
    setEditingDept(null);
    reset({
      departmentId: `${hospitalId}_${Date.now()}`,
      departmentName: '',
      description: '',
      doctorCount: 0,
      patientCount: 0,
    });
    setShowAddForm(true);
  };

  const onSubmit = async (values: DeptFormValues) => {
    await saveDeptMutation.mutateAsync({
      dept: {
        ...values,
        hospitalId,
      },
    });
    setShowAddForm(false);
    reset();
  };

  const handleDelete = async (departmentId: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      await deleteDeptMutation.mutateAsync({ hospitalId, departmentId });
    }
  };

  const filtered = departments?.filter((d) =>
    d.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments Manager"
        description="Configure medical branches, track clinician counts, and inspect current patient load quotas."
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search branches..."
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
          <span>Add Department</span>
        </button>
      </div>

      {/* CRUD Form Dialog Overlay */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
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
                  {editingDept ? 'Update Department Details' : 'Configure New Department'}
                </h3>
                <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Branch ID</label>
                  <input
                    type="text"
                    disabled={!!editingDept}
                    {...register('departmentId')}
                    className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50"
                  />
                  {errors.departmentId && <p className="text-red-500 mt-1 font-bold">{errors.departmentId.message}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Department Name</label>
                  <input
                    type="text"
                    {...register('departmentName')}
                    className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100"
                  />
                  {errors.departmentName && <p className="text-red-500 mt-1 font-bold">{errors.departmentName.message}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Brief Description</label>
                  <textarea
                    rows={3}
                    {...register('description')}
                    className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100"
                  />
                  {errors.description && <p className="text-red-500 mt-1 font-bold">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Doctor Quota</label>
                    <input
                      type="number"
                      {...register('doctorCount', { valueAsNumber: true })}
                      className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">Patient Capacity</label>
                    <input
                      type="number"
                      {...register('patientCount', { valueAsNumber: true })}
                      className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saveDeptMutation.isPending}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-white font-bold hover:bg-blue-750 transition"
                  >
                    {saveDeptMutation.isPending ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Department Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {filtered.map((d) => (
          <motion.div
            key={d.departmentId}
            layout
            className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">
                      {d.departmentName}
                    </h3>
                    <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">{d.departmentId}</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleEdit(d)}
                    className="p-2 text-slate-500 hover:text-slate-850 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(d.departmentId)}
                    className="p-2 text-red-500 hover:text-red-750 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {d.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-850 pt-4 mt-6">
              <div className="text-center bg-slate-50/50 p-2.5 rounded-xl dark:bg-slate-950/20">
                <span className="block text-xl font-extrabold text-slate-900 dark:text-slate-50">{d.doctorCount}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Doctors Assigned</span>
              </div>
              <div className="text-center bg-slate-50/50 p-2.5 rounded-xl dark:bg-slate-950/20">
                <span className="block text-xl font-extrabold text-slate-900 dark:text-slate-50">{d.patientCount}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Active Patients</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
