'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import * as zod from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/providers/AuthProvider';
import {
  useDoctorQueue,
  useSaveConsultationMutation } from
'@/features/doctor/hooks/useDoctor';
import { PageHeader, LoadingState } from '@/features/shared';
import {
  Plus,
  Trash2,
  Sparkles,
  Volume2,
  Loader2,
  AlertTriangle,
  ArrowLeft } from
'lucide-react';
import Link from 'next/link';
import { Input, Textarea } from '@/components/ui/input';


interface ConsultationPageProps {
  params: Promise<{appointmentId: string;}>;
}

const medicineOptions = [
{ id: 'med_para', name: 'Paracetamol 650mg', category: 'Analgesics' },
{ id: 'med_amox', name: 'Amoxicillin 500mg', category: 'Antibiotics' },
{ id: 'med_ator', name: 'Atorvastatin 10mg', category: 'Cardiovascular' },
{ id: 'med_metf', name: 'Metformin 500mg', category: 'Antidiabetics' },
{ id: 'med_pant', name: 'Pantoprazole 40mg', category: 'Gastrointestinal' }];


const consultationSchema = zod.object({
  symptoms: zod.string().min(3, 'Symptoms description is required'),
  diagnosis: zod.string().min(3, 'Diagnosis is required'),
  clinicalNotes: zod.string(),
  medicines: zod.array(
    zod.object({
      medicineId: zod.string().min(1, 'Medicine is required'),
      name: zod.string().min(1, 'Medicine name is required'),
      dosage: zod.string().min(1, 'Dosage is required'),
      frequency: zod.string().min(1, 'Frequency is required'),
      duration: zod.number().min(1, 'Duration must be at least 1 day')
    })
  ),
  labTests: zod.array(zod.string()),
  followUpDate: zod.string()
});

type ConsultationFormValues = zod.infer<typeof consultationSchema>;

export default function ConsultationPage({ params }: ConsultationPageProps) {const { t } = useLanguage();
  const resolvedParams = React.use(params);
  const appointmentId = resolvedParams.appointmentId;

  const router = useRouter();
  const { user } = useAuth();
  const doctorId = user?.uid || 'doc_arav_mehta';

  // State for simulated AI dictation
  const [isRecording, setIsRecording] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  // Queries
  const { data: queue, isLoading: queueLoading } = useDoctorQueue(doctorId);
  const saveMutation = useSaveConsultationMutation();

  const appointment = queue?.find((a) => a.appointmentId === appointmentId);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ConsultationFormValues>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      symptoms: '',
      diagnosis: '',
      clinicalNotes: '',
      medicines: [],
      labTests: [],
      followUpDate: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medicines'
  });

  if (queueLoading) {
    return <LoadingState variant="card" />;
  }

  if (!appointment) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50">{t("doctor.appointment_not_found")}</h3>
        <p className="text-xs text-slate-500 mt-1">{t("doctor.this_appointment_token_does_not_match_your_active_patient_queue")}</p>
        <Link href="/dashboard/doctor" className="mt-4 inline-block text-xs font-bold text-blue-600 underline">{t("doctor.back_to_desk")}

        </Link>
      </div>);

  }

  // Simulated voice dictation
  const handleSimulateRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setValue('symptoms', 'Patient reports recurring chest heaviness during light exercise over the past 2 weeks, occasionally radiating to left arm. Non-productive cough.');
      setValue('diagnosis', 'Suspected Stable Angina / Coronary Artery Insufficiency');
      setValue('clinicalNotes', 'Advised cardiac referral panel. Restrict heavy physical exertion. Keep sublingual Glyceryl Trinitrate (GTN) spray handy.');
    }, 2500);
  };

  // Simulated AI consultation summary
  const handleSimulateAISummary = () => {
    setIsGeneratingSummary(true);
    setTimeout(() => {
      setIsGeneratingSummary(false);
      setAiSummary('AI Copilot clinical summary recommendation: Patient exhibits cardiovascular indicators aligned with early micro-vascular ischaemia. Consider prescribing Atorvastatin 10mg alongside a referral for an Electrocardiogram (ECG) & Lipid Panel.');
    }, 2000);
  };

  const onSubmit = async (values: ConsultationFormValues) => {
    await saveMutation.mutateAsync({
      appointmentId,
      data: {
        doctorId,
        patientId: appointment.patientId,
        symptoms: values.symptoms,
        diagnosis: values.diagnosis,
        clinicalNotes: values.clinicalNotes,
        medicines: values.medicines,
        labTests: values.labTests,
        followUpDate: values.followUpDate || undefined
      }
    });
    router.push('/dashboard/doctor');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/doctor"
          className="rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-900 text-slate-650 dark:text-slate-300 transition">
          
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <PageHeader
            title={`Consultation Desk - ${appointment.patientName}`}
            description={`Token #${appointment.tokenNumber} • Outpatient check-in details`} />
          
        </div>
      </div>

      {/* Patient demographics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-150 dark:border-slate-850 text-xs font-bold text-slate-650 dark:text-slate-400">
        <p>{t("doctor.age")}{appointment.patientAge}{t("doctor.years")}</p>
        <p className="capitalize">{t("doctor.gender")}{appointment.patientGender}</p>
        <p>{t("doctor.blood_group")}{appointment.patientBloodGroup || 'O+'}</p>
        <p>{t("doctor.allergies")}{appointment.patientAllergies?.join(', ') || 'None'}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        {/* Left Form Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 border-b border-slate-100 dark:border-slate-850 pb-3">{t("doctor.emr_chart_record")}

            </h3>

            {/* AI Dictation Trigger */}
            <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-150 dark:border-blue-900/30 dark:bg-blue-950/10">
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1">
                  <Volume2 className="h-4 w-4" />{t("doctor.voice_dictation_transcriber")}
                </h4>
                <p className="text-[10px] text-slate-550 dark:text-slate-400">{t("doctor.transcribe_voice_consultations_to_notes_instantly")}</p>
              </div>
              <button
                type="button"
                onClick={handleSimulateRecording}
                disabled={isRecording}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-3 py-2 text-xs font-bold transition flex items-center gap-1.5">
                
                {isRecording ?
                <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />{t("doctor.recording")}
                </> :

                'Simulate Dictation'
                }
              </button>
            </div>

            {/* Symptoms */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">{t("doctor.chief_symptoms")}</label>
              <Textarea
                {...register('symptoms')}
                rows={3}
                placeholder={t("doctor.describe_current_medical_complaints")}
                className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none" />
              
              {errors.symptoms &&
              <p className="text-[10px] text-red-500 font-semibold">{errors.symptoms.message}</p>
              }
            </div>

            {/* Diagnosis */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">{t("doctor.clinical_diagnosis")}</label>
              <Textarea
                {...register('diagnosis')}
                rows={2}
                placeholder={t("doctor.identify_suspected_illness_or_pathology")}
                className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none" />
              
              {errors.diagnosis &&
              <p className="text-[10px] text-red-500 font-semibold">{errors.diagnosis.message}</p>
              }
            </div>

            {/* Clinical Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">{t("doctor.clinical_action_notes")}</label>
              <Textarea
                {...register('clinicalNotes')}
                rows={3}
                placeholder={t("doctor.lifestyle_recommendations_warning_flags_or_dosage_rationale")}
                className="w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-xs text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none" />
              
            </div>
          </div>

          {/* Prescription Builder */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 uppercase tracking-wider">{t("doctor.prescription_builder")}</h3>
              <button
                type="button"
                onClick={() => append({ medicineId: '', name: '', dosage: '1-0-1', frequency: 'After Meals', duration: 5 })}
                className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 px-3 py-1.5 text-[10px] font-bold transition flex items-center gap-1">
                
                <Plus className="h-3.5 w-3.5" />{t("doctor.add_medicine")}
              </button>
            </div>

            {fields.map((field, idx) =>
            <div key={field.id} className="grid gap-3 md:grid-cols-5 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-150 dark:border-slate-850 items-end">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400">{t("doctor.medicine_choice")}</label>
                  <select
                  {...register(`medicines.${idx}.medicineId` as const)}
                  onChange={(e) => {
                    const selected = medicineOptions.find((m) => m.id === e.target.value);
                    if (selected) {
                      setValue(`medicines.${idx}.name` as const, selected.name);
                      setValue(`medicines.${idx}.medicineId` as const, selected.id);
                    }
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-2.5 py-1.5 text-[10px] font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300 focus:outline-none">
                  
                    <option value="">{t("doctor.select_medicine")}</option>
                    {medicineOptions.map((opt) =>
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                  )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">{t("doctor.dosage_pattern")}</label>
                  <Input
                  type="text"
                  {...register(`medicines.${idx}.dosage` as const)}
                  placeholder="1-0-1"
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-2.5 py-1.5 text-[10px] font-bold text-slate-700 dark:border-slate-800 dark:text-slate-350 focus:outline-none" />
                
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">{t("doctor.duration_days")}</label>
                  <Input
                  type="number"
                  {...register(`medicines.${idx}.duration` as const, { valueAsNumber: true })}
                  className="w-full rounded-lg border border-slate-200 bg-transparent px-2.5 py-1.5 text-[10px] font-bold text-slate-700 dark:border-slate-800 dark:text-slate-350 focus:outline-none" />
                
                </div>

                <button
                type="button"
                onClick={() => remove(idx)}
                className="rounded-lg bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 hover:bg-red-100 p-2 text-center flex items-center justify-center font-bold">
                
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Form Column: AI recommendations, lab tests, followups */}
        <div className="space-y-6">
          {/* AI Clinical Assistant Widget */}
          <div className="rounded-2xl border border-blue-150 bg-blue-50/50 p-5 dark:border-blue-900/30 dark:bg-blue-950/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Sparkles className="h-5 w-5" />
                <h4 className="font-extrabold text-xs uppercase tracking-wider">{t("doctor.clinical_prescribing_assist")}</h4>
              </div>
              <button
                type="button"
                onClick={handleSimulateAISummary}
                disabled={isGeneratingSummary}
                className="text-[9px] font-black uppercase text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
                
                {isGeneratingSummary ?
                <>
                    <Loader2 className="h-3 w-3 animate-spin" />{t("doctor.suggesting")}
                </> :

                'Suggest Plan'
                }
              </button>
            </div>

            {aiSummary ?
            <div className="space-y-3">
                <p className="text-[11px] font-semibold text-slate-650 dark:text-slate-350 leading-relaxed bg-white/70 dark:bg-slate-900/40 p-3 rounded-xl border border-blue-100 dark:border-blue-900/20">
                  {aiSummary}
                </p>
                <button
                type="button"
                onClick={() => {
                  append({ medicineId: 'med_ator', name: 'Atorvastatin 10mg', dosage: '0-0-1', frequency: 'Before Sleep', duration: 10 });
                  setValue('labTests', ['Electrocardiogram (ECG)', 'Lipid Profile']);
                }}
                className="text-[10px] font-extrabold text-blue-650 dark:text-blue-400 hover:underline flex items-center gap-1">{t("doctor.apply_ai_recommendation_plan")}


              </button>
              </div> :

            <p className="text-[10px] text-slate-450 leading-relaxed">{t("doctor.click_suggest_plan_to_analyze_patient_chart_allergies_and_clinical_data_using_gemini_clinical_intelligence")}

            </p>
            }
          </div>

          {/* Lab Test Recommendations */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-50 uppercase tracking-wider">{t("doctor.lab_recommendations")}</h4>
            <div className="space-y-2.5">
              {['Electrocardiogram (ECG)', 'Complete Blood Count (CBC)', 'Lipid Profile', 'Thyroid Profile (T3 T4 TSH)'].map((test) =>
              <label key={test} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Input
                  type="checkbox"
                  value={test}
                  {...register('labTests')}
                  className="rounded border-slate-200 text-blue-600 focus:ring-blue-500" />
                
                  <span>{test}</span>
                </label>
              )}
            </div>
          </div>

          {/* Follow-up Planner */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-50 uppercase tracking-wider">{t("doctor.follow_up_scheduling")}</h4>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block uppercase">{t("doctor.re_visit_date")}</label>
              <Input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...register('followUpDate')}
                className="w-full rounded-xl border border-slate-200 bg-transparent px-3.5 py-2 text-xs text-slate-800 dark:border-slate-800 dark:text-slate-100 focus:outline-none" />
              
            </div>
          </div>

          {/* Submit panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <button
              type="submit"
              disabled={isSubmitting || saveMutation.isPending}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5">
              
              {isSubmitting || saveMutation.isPending ?
              <>
                  <Loader2 className="h-4 w-4 animate-spin" />{t("doctor.saving_consultation")}
              </> :

              'Commit Consultation & Lock EMR'
              }
            </button>
            <Link
              href="/dashboard/doctor"
              className="w-full text-center rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-850 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 py-2.5 text-xs font-bold block transition">{t("doctor.cancel")}


            </Link>
          </div>
        </div>
      </form>
    </div>);

}