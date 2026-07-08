'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
  useHospitalLabTests,
  useSaveLabTestMutation,
  useDeleteLabTestMutation } from
'@/features/hospital/hooks/useHospital';
import { PageHeader, LoadingState } from '@/features/shared';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';


const testSchema = zod.object({
  testId: zod.string().min(2, 'Test ID must be at least 2 characters'),
  testName: zod.string().min(2, 'Test name must be at least 2 characters'),
  category: zod.string().min(2, 'Category is required'),
  cost: zod.number().min(0, 'Cost cannot be negative'),
  status: zod.enum(['active', 'inactive'])
});

type TestFormValues = zod.infer<typeof testSchema>;

export default function LaboratoryOverviewPage() {const { t } = useLanguage();
  const hospitalId = 'hosp_city_gen';
  const { data: tests, isLoading } = useHospitalLabTests(hospitalId);
  const saveTestMutation = useSaveLabTestMutation();
  const [showForm, setShowForm] = useState(false);
  const deleteTestMutation = useDeleteLabTestMutation();
  const [editingTest, setEditingTest] = useState<TestFormValues | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      testId: '',
      testName: '',
      category: 'Pathology',
      cost: 500,
      status: 'active'
    }
  });

  if (isLoading) {
    return <LoadingState variant="table" />;
  }

  const handleEdit = (t: TestFormValues) => {
    setEditingTest(t);
    setValue('testId', t.testId);
    setValue('testName', t.testName);
    setValue('category', t.category);
    setValue('cost', t.cost);
    setValue('status', t.status);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingTest(null);
    reset({
      testId: `${hospitalId}_lab_${Date.now()}`,
      testName: '',
      category: 'Pathology',
      cost: 500,
      status: 'active'
    });
    setShowForm(true);
  };

  const onSubmit = async (values: TestFormValues) => {
    await saveTestMutation.mutateAsync({
      test: {
        ...values,
        hospitalId
      }
    });
    setShowForm(false);
    reset();
  };

  const handleDelete = async (testId: string) => {
    if (confirm('Are you sure you want to delete this lab test from catalog?')) {
      await deleteTestMutation.mutateAsync({ hospitalId, testId });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("hospital.laboratory_roster")}
        description={t("hospital.verify_active_clinical_tests_parameters_set_service_pricing_and_check_diagnostic_result_pipelines")} />
      

      {/* Ratios */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("hospital.catalog_size")}</span>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">{tests?.length || 0}</p>
          <span className="text-[10px] text-slate-450 font-semibold block mt-1">{t("hospital.available_diagnostics_procedures")}</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("hospital.pending_diagnostics")}</span>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">8</p>
            <span className="text-[10px] text-slate-450 font-semibold block">{t("hospital.awaiting_pathologist_authorization")}</span>
          </div>
          <AlertCircle className="h-6 w-6 text-amber-500" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("hospital.completed_reports")}</span>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">42</p>
            <span className="text-[10px] text-slate-450 font-semibold block">{t("hospital.uploaded_to_cloud_vaults")}</span>
          </div>
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        </div>
      </div>

      {/* Catalog Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">{t("hospital.test_catalog")}</h3>
          <button
            onClick={handleAddNew}
            className="rounded-xl bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs px-4 py-2.5 flex items-center gap-2 cursor-pointer transition">
            
            <Plus className="h-4 w-4" />
            <span>{t("hospital.add_lab_test")}</span>
          </button>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-450 font-bold">
                <th className="pb-3">{t("hospital.test_code")}</th>
                <th className="pb-3">{t("hospital.test_name")}</th>
                <th className="pb-3">{t("hospital.category")}</th>
                <th className="pb-3">{t("hospital.pricing")}</th>
                <th className="pb-3">{t("hospital.status")}</th>
                <th className="pb-3 text-right">{t("hospital.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {tests?.map((t) =>
              <tr key={t.testId} className="border-b border-slate-50 dark:border-slate-900 text-slate-700 dark:text-slate-350">
                  <td className="py-3.5 font-bold text-slate-900 dark:text-slate-100">{t.testId.split('_').pop()}</td>
                  <td className="py-3.5 font-semibold">{t.testName}</td>
                  <td className="py-3.5">{t.category}</td>
                  <td className="py-3.5 font-bold text-blue-600 dark:text-blue-400">₹{t.cost}</td>
                  <td className="py-3.5">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                  t.status === 'active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-slate-50 text-slate-450'}`
                  }>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(t)} className="p-1 text-slate-550 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(t.testId)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
            
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2.5 mb-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">
                  {editingTest ? 'Modify Lab Test' : 'Add Diagnostics Test'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.test_code")}</label>
                  <Input
                  type="text"
                  disabled={!!editingTest}
                  {...register('testId')}
                  className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100 disabled:opacity-50" />
                
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.test_name")}</label>
                  <Input
                  type="text"
                  {...register('testName')}
                  className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
                
                  {errors.testName && <p className="text-red-500 mt-1 font-bold">{errors.testName.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.category")}</label>
                    <select
                    {...register('category')}
                    className="w-full border border-slate-200 bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none">
                    
                      <option value="Pathology">{t("hospital.pathology")}</option>
                      <option value="Biochemistry">{t("hospital.biochemistry")}</option>
                      <option value="Radiology">{t("hospital.radiology")}</option>
                      <option value="Hematology">{t("hospital.hematology")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.pricing")}</label>
                    <Input
                    type="number"
                    {...register('cost', { valueAsNumber: true })}
                    className="w-full border border-slate-200 bg-transparent rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100" />
                  
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-350 mb-1">{t("hospital.status")}</label>
                  <select
                  {...register('status')}
                  className="w-full border border-slate-200 bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2.5 text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none">
                  
                    <option value="active">{t("hospital.active")}</option>
                    <option value="inactive">{t("hospital.inactive")}</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-slate-500 font-bold hover:bg-slate-50">{t("hospital.cancel")}


                </button>
                  <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-white font-bold hover:bg-blue-750">{t("hospital.save_test")}


                </button>
                </div>
              </form>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

}