'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
  useHospitalDoctors,
  useHospitalDepartments,
  useSaveDoctorMutation,
  useDeleteDoctorMutation,
  DetailedDoctorWithUser } from
'@/features/hospital/hooks/useHospital';
import { PageHeader, LoadingState } from '@/features/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Trash2, Edit2, X, UserCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';


const doctorSchema = zod.object({
  uid: zod.string().min(2, 'Doctor UID must be at least 2 characters'),
  doctorName: zod.string().min(2, 'Doctor name must be at least 2 characters'),
  email: zod.string().email('Please enter a valid email'),
  departmentId: zod.string().min(1, 'Please select a department'),
  specialization: zod.string().min(2, 'Specialization is required'),
  qualification: zod.string().min(2, 'Qualification is required'),
  consultationFee: zod.number().min(0, 'Fee cannot be negative')
});

type DoctorFormValues = zod.infer<typeof doctorSchema>;

export default function HospitalDoctorsPage() {const { t } = useLanguage();
  const hospitalId = 'hosp_city_gen';
  const { data: doctors, isLoading: docsLoading } = useHospitalDoctors(hospitalId);
  const { data: departments, isLoading: deptsLoading } = useHospitalDepartments(hospitalId);
  const saveDoctorMutation = useSaveDoctorMutation();
  const deleteDoctorMutation = useDeleteDoctorMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DoctorFormValues | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      uid: '',
      doctorName: '',
      email: '',
      departmentId: '',
      specialization: '',
      qualification: '',
      consultationFee: 500
    }
  });

  if (docsLoading || deptsLoading) {
    return <LoadingState variant="table" />;
  }

  const handleEdit = (docItem: DetailedDoctorWithUser) => {
    setEditingDoc({
      uid: docItem.uid,
      doctorName: docItem.doctorName,
      email: docItem.email,
      departmentId: docItem.departmentId,
      specialization: docItem.specialization,
      qualification: docItem.qualification,
      consultationFee: docItem.consultationFee
    });
    setValue('uid', docItem.uid);
    setValue('doctorName', docItem.doctorName);
    setValue('email', docItem.email);
    setValue('departmentId', docItem.departmentId);
    setValue('specialization', docItem.specialization);
    setValue('qualification', docItem.qualification);
    setValue('consultationFee', docItem.consultationFee);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingDoc(null);
    reset({
      uid: `doc_${Date.now()}`,
      doctorName: '',
      email: '',
      departmentId: departments?.[0]?.departmentId || '',
      specialization: '',
      qualification: '',
      consultationFee: 500
    });
    setShowForm(true);
  };

  const onSubmit = async (values: DoctorFormValues) => {
    await saveDoctorMutation.mutateAsync({
      hospitalId,
      docObj: {
        ...values,
        hospitalId
      }
    });
    setShowForm(false);
    reset();
  };

  const handleDelete = async (uid: string) => {
    if (confirm('Are you sure you want to remove this doctor from the hospital registry?')) {
      await deleteDoctorMutation.mutateAsync({ hospitalId, uid });
    }
  };

  const filtered = doctors?.filter((docObj) => {
    const matchesSearch =
    docObj.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    docObj.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept ? docObj.departmentId === selectedDept : true;
    return matchesSearch && matchesDept;
  }) || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("hospital.clinician_registry")}
        description={t("hospital.verify_active_medical_consultants_shifts_schedules_consultations_fees_and_attendance_thresholds")} />
      

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder={t("hospital.search_doctors_specialties")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-transparent rounded-xl text-xs font-bold text-slate-750 dark:border-slate-800 focus:outline-none" />
            
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs font-bold text-slate-650 dark:border-slate-800 dark:text-slate-350 focus:outline-none">
            
            <option value="">{t("hospital.all_departments")}</option>
            {departments?.map((d) =>
            <option key={d.departmentId} value={d.departmentId}>
                {d.departmentName}
              </option>
            )}
          </select>
        </div>

        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto rounded-xl bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs px-4 py-2.5 flex items-center justify-center gap-2 cursor-pointer transition">
          
          <Plus className="h-4 w-4" />
          <span>{t("hospital.add_doctor")}</span>
        </button>
      </div>

      {/* Form modal */}
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
            className="relative z-10 w-full max-w-md rounded-2xl border border-slate-250 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">
                  {editingDoc ? 'Modify Clinician Profile' : 'Configure New Clinician'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.doctor_id_uid")}</label>
                  <Input
                  type="text"
                  disabled={!!editingDoc}
                  {...register('uid')}
                  className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50" />
                
                  {errors.uid && <p className="text-red-500 mt-1 font-bold">{errors.uid.message}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.full_name")}</label>
                  <Input
                  type="text"
                  {...register('doctorName')}
                  placeholder={t("hospital.eg_dr_satish_nair")}
                  className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
                
                  {errors.doctorName && <p className="text-red-500 mt-1 font-bold">{errors.doctorName.message}</p>}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.email_address")}</label>
                  <Input
                  type="email"
                  {...register('email')}
                  className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
                
                  {errors.email && <p className="text-red-500 mt-1 font-bold">{errors.email.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.department")}</label>
                    <select
                    {...register('departmentId')}
                    className="w-full border border-slate-200 bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none">
                    
                      {departments?.map((d) =>
                    <option key={d.departmentId} value={d.departmentId}>
                          {d.departmentName}
                        </option>
                    )}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.consult_fee")}</label>
                    <Input
                    type="number"
                    {...register('consultationFee', { valueAsNumber: true })}
                    className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
                  
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.specialization")}</label>
                    <Input
                    type="text"
                    {...register('specialization')}
                    placeholder={t("hospital.eg_cardiosurgeon")}
                    className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
                  
                    {errors.specialization && <p className="text-red-500 mt-1 font-bold">{errors.specialization.message}</p>}
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.qualification")}</label>
                    <Input
                    type="text"
                    {...register('qualification')}
                    placeholder={t("hospital.eg_mbbs_mch")}
                    className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
                  
                    {errors.qualification && <p className="text-red-500 mt-1 font-bold">{errors.qualification.message}</p>}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 transition">{t("hospital.cancel")}


                </button>
                  <button
                  type="submit"
                  disabled={saveDoctorMutation.isPending}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-white font-bold hover:bg-blue-750 transition">
                  
                    {saveDoctorMutation.isPending ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        }
      </AnimatePresence>

      {/* Grid of Doctor profiles */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((docObj) =>
        <motion.div
          key={docObj.uid}
          layout
          className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          
            <div>
              <div className="flex justify-between items-start">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 font-extrabold text-sm uppercase">
                  {docObj.doctorName.slice(0, 2)}
                </div>
                <div className="flex gap-1.5">
                  <button
                  onClick={() => handleEdit(docObj)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition">
                  
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                  onClick={() => handleDelete(docObj.uid)}
                  className="p-1.5 text-red-500 hover:text-red-750 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition">
                  
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">
                  {docObj.doctorName}
                </h3>
                <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">{docObj.specialization}</p>
                <p className="text-[10px] text-slate-400 font-semibold">{docObj.qualification}</p>
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>{t("hospital.department")}</span>
                  <span className="text-slate-850 dark:text-slate-350">{docObj.departmentName}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>{t("hospital.shift_availability")}</span>
                  <span className="text-slate-850 dark:text-slate-350">{docObj.workingHours}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>{t("hospital.consultation_fee")}</span>
                  <span className="text-blue-600 dark:text-blue-400">₹{docObj.consultationFee}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-between items-center">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 flex items-center gap-1">
                <UserCheck className="h-3 w-3" />{t("hospital.present")}

            </span>
              <span className="text-[9px] text-slate-400 font-bold">{t("hospital.attendance_present")}</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>);

}