'use client';import { useLanguage } from "@/providers/LanguageProvider";

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useDistrictProposals, useResolveProposalMutation } from '@/features/district/hooks/useDistrict';
import { PageHeader, LoadingState } from '@/features/shared';
import { ArrowRightLeft, Check, X, ShieldCheck } from 'lucide-react';
import { toast } from '@/components/ui/toast';

export default function DistrictRedistributionPage() {const { t } = useLanguage();
  const { user } = useAuth();
  const districtId = user?.uid || 'dist_central_delhi';

  const { data: proposals, isLoading } = useDistrictProposals(districtId);
  const resolveMutation = useResolveProposalMutation();

  if (isLoading) {
    return <LoadingState variant="card" />;
  }

  const list = proposals || [];
  const pendingProposals = list.filter((p) => p.status === 'pending');
  const resolvedProposals = list.filter((p) => p.status !== 'pending');

  const handleAction = async (proposalId: string, action: 'approve' | 'reject') => {
    try {
      await resolveMutation.mutateAsync({ proposalId, action, districtId });
    } catch {
      toast.error(t("district.failed_to_update_redistribution_status"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("district.ai_guided_resource_redistribution")}
        description={t("district.verify_and_approve_inventory_transfer_proposals_generated_by_ai_to_preemptively_prevent_stock_outs")} />
      

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Proposals Builder & Active list */}
        <div className="lg:col-span-2 space-y-5">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50">{t("district.pending_redistribution_recommendations")}

          </h3>

          {pendingProposals.length === 0 ?
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("district.all_nodes_well_stocked")}</p>
              <p className="text-xs text-slate-450 mt-1">{t("district.no_pending_redistribution_requests_detected_by_ai_algorithms")}</p>
            </div> :

          <div className="space-y-4">
              {pendingProposals.map((prop) =>
            <div
              key={prop.proposalId}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
              
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
                        {prop.itemType}{t("district.transfer")}
                  </span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-50 mt-2">{prop.itemName}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{t("district.quantity")}{prop.quantity}{t("district.units")}</p>
                    </div>
                  </div>

                  {/* Transfer Route visualizer */}
                  <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-150 dark:border-slate-850 flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-slate-450 uppercase font-semibold">{t("district.transfer_from")}</p>
                      <p className="text-slate-900 dark:text-slate-50">{prop.sourceHospitalName}</p>
                    </div>
                    <ArrowRightLeft className="h-4 w-4 text-blue-500 shrink-0" />
                    <div className="space-y-0.5 text-right">
                      <p className="text-[9px] text-slate-450 uppercase font-semibold">{t("district.transfer_to")}</p>
                      <p className="text-slate-900 dark:text-slate-50">{prop.targetHospitalName}</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{t("district.expected_impact")}
                <span className="text-slate-750 dark:text-slate-200 font-bold">{prop.expectedImpact}</span>
                  </p>

                  {/* Action buttons */}
                  <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                    <button
                  onClick={() => handleAction(prop.proposalId, 'reject')}
                  disabled={resolveMutation.isPending}
                  className="rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-650 hover:border-red-200 px-3.5 py-1.5 text-[10px] font-bold text-slate-650 dark:border-slate-850 dark:text-slate-350 dark:hover:bg-red-950/20 transition flex items-center gap-1">
                  
                      <X className="h-3.5 w-3.5" />{t("district.reject")}
                </button>
                    <button
                  onClick={() => handleAction(prop.proposalId, 'approve')}
                  disabled={resolveMutation.isPending}
                  className="rounded-lg bg-blue-600 hover:bg-blue-750 text-white px-3.5 py-1.5 text-[10px] font-bold transition flex items-center gap-1">
                  
                      <Check className="h-3.5 w-3.5" />{t("district.approve_transfer")}
                </button>
                  </div>
                </div>
            )}
            </div>
          }
        </div>

        {/* Right Column: Historical Audit Log */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50">{t("district.redistribution_activity_logs")}

          </h3>

          {resolvedProposals.length > 0 ?
          <div className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
              {resolvedProposals.map((prop) =>
            <div key={prop.proposalId} className="py-3 space-y-1.5 font-bold text-slate-705">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-slate-900 dark:text-slate-50">{prop.itemName}</p>
                      <p className="text-[9px] text-slate-400">{t("district.qty")}{prop.quantity} &bull; {prop.targetHospitalName}</p>
                    </div>
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-extrabold ${
                prop.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`
                }>
                      {prop.status}
                    </span>
                  </div>
                </div>
            )}
            </div> :

          <p className="text-[10px] text-slate-450 italic py-6 text-center">{t("district.no_transfer_actions_resolved_in_this_shift_cycle")}</p>
          }
        </div>
      </div>
    </div>);

}