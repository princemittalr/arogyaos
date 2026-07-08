'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuth } from '@/providers/AuthProvider';
import {
  useFamilyMembers,
  useAddFamilyMemberMutation,
  useRemoveFamilyMemberMutation } from
'@/features/citizen/hooks/useCitizen';
import { PageHeader, LoadingState, EmptyState } from '@/features/shared';
import { componentStyles } from '@/design-system/components';
import { cn } from '@/utils/cn';
import { icons } from '@/design-system/icons';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';


const memberSchema = zod.object({
  fullName: zod.string().min(2, 'Name must be at least 2 characters.'),
  relation: zod.string().min(1, 'Please select relation type.'),
  age: zod.number().min(0, 'Please enter a valid age.')
});

type MemberFormValues = zod.infer<typeof memberSchema>;

export default function CitizenFamilyPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const uid = user?.uid || '';

  const [showAddForm, setShowAddForm] = useState(false);

  // Queries & Mutations
  const { data: members, isLoading } = useFamilyMembers(uid);
  const addMutation = useAddFamilyMemberMutation();
  const removeMutation = useRemoveFamilyMemberMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      fullName: '',
      relation: '',
      age: 0
    }
  });

  const onSubmit = async (values: MemberFormValues) => {
    await addMutation.mutateAsync({
      uid,
      member: values
    });
    reset();
    setShowAddForm(false);
  };

  const handleRemove = async (fullName: string) => {
    if (confirm(`Are you sure you want to remove ${fullName}?`)) {
      await removeMutation.mutateAsync({
        uid,
        fullName
      });
    }
  };

  if (isLoading) {
    return <LoadingState variant="table" rows={4} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8">
      
      <PageHeader
        title={t("citizen.family_members_summary")}
        description={t("citizen.link_and_access_unified_medical_health_cards_of_your_family_relations")}
        actions={
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`${componentStyles.button.base} ${componentStyles.button.primary} px-4 py-2.5 flex items-center gap-1.5`}>
          
            <Plus className="h-4 w-4" />
            <span>{t("citizen.add_member")}</span>
          </button>
        } />
      

      {/* Add Member Drawer Form */}
      {showAddForm &&
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-50">{t("citizen.link_family_relation")}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">{t("citizen.full_name")}</label>
                <Input
                type="text"
                placeholder={t("citizen.eg_rahul_sharma")}
                {...register('fullName')}
                className={cn(componentStyles.input.base, errors.fullName ? 'border-red-500' : '')} />
              
                {errors.fullName && <p className="text-[10px] text-red-500 font-bold">{errors.fullName.message}</p>}
              </div>

              {/* Relation */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">{t("citizen.relationship")}</label>
                <select
                {...register('relation')}
                className={cn(componentStyles.input.base, errors.relation ? 'border-red-500' : '')}>
                
                  <option value="">{t("citizen.select_relationship")}</option>
                  <option value="Spouse">{t("citizen.spouse")}</option>
                  <option value="Child">{t("citizen.child")}</option>
                  <option value="Parent">{t("citizen.parent")}</option>
                  <option value="Sibling">{t("citizen.sibling")}</option>
                  <option value="Other">{t("citizen.other")}</option>
                </select>
                {errors.relation && <p className="text-[10px] text-red-500 font-bold">{errors.relation.message}</p>}
              </div>

              {/* Age */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">{t("citizen.age")}</label>
                <Input
                type="number"
                {...register('age', { valueAsNumber: true })}
                className={cn(componentStyles.input.base, errors.age ? 'border-red-500' : '')} />
              
                {errors.age && <p className="text-[10px] text-red-500 font-bold">{errors.age.message}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className={`${componentStyles.button.base} ${componentStyles.button.outline} px-4 py-2`}>{t("citizen.cancel")}


            </button>
              <button
              type="submit"
              disabled={addMutation.isPending}
              className={`${componentStyles.button.base} ${componentStyles.button.primary} px-4 py-2`}>
              
                {addMutation.isPending ? 'Linking...' : 'Link Account'}
              </button>
            </div>
          </form>
        </motion.div>
      }

      {/* Linked Members Grid */}
      {members && members.length > 0 ?
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m, idx) =>
        <motion.div
          key={idx}
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 flex justify-between items-start">
          
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                    <icons.User className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 dark:text-slate-50">{m.fullName}</h5>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{m.relation}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("citizen.age")}{m.age}{t("citizen.years")}</p>
              </div>

              <button
            onClick={() => handleRemove(m.fullName)}
            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition">
            
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </motion.div>
        )}
        </div> :

      <EmptyState
        title={t("citizen.no_linked_family_members")}
        description={t("citizen.link_medical_identity_cards_of_family_relations_to_schedule_diagnostic_visits_on_their_behalf")}
        icon={icons.Users || icons.Home}
        action={{
          label: t("citizen.link_member"),
          onClick: () => setShowAddForm(true)
        }} />

      }
    </motion.div>);

}