'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { PageHeader, LoadingState, EmptyState } from '@/features/shared';
import { useDistrictProposals, useResolveProposalMutation } from '@/features/district/hooks/useDistrict';
import { icons } from '@/design-system/icons';
import { Sparkles, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export default function RedistributionPage() {
  const { user } = useAuth();
  const districtId = user?.uid || 'dist_central_delhi';
  const { data: proposals, isLoading } = useDistrictProposals(districtId);
  const resolveMutation = useResolveProposalMutation();

  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'emergency'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) return <LoadingState variant="card" />;

  const safeProposals = proposals || [];
  
  // Filter by tab status
  let filtered = safeProposals.filter(p => {
    if (activeTab === 'pending') return p.status === 'pending';
    if (activeTab === 'completed') return p.status === 'approved' || p.status === 'completed';
    if (activeTab === 'emergency') return p.itemType === 'staff' || p.quantity > 500; // Mock emergency logic
    return true;
  });

  // Filter by search query
  if (searchQuery) {
    filtered = filtered.filter(p => 
      p.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sourceHospitalName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.targetHospitalName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const handleApprove = (proposalId: string) => {
    resolveMutation.mutate({ proposalId, action: 'approve', districtId });
  };

  const handleReject = (proposalId: string) => {
    resolveMutation.mutate({ proposalId, action: 'reject', districtId });
  };

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === 'medicine') return <icons.Pill className="h-4 w-4 text-blue-500" />;
    if (type === 'equipment') return <icons.Package className="h-4 w-4 text-amber-500" />;
    if (type === 'staff') return <icons.Users className="h-4 w-4 text-emerald-500" />;
    return <icons.Activity className="h-4 w-4 text-slate-500" />;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader 
        title="Facility Resource Redistribution" 
        description="Approve and track inter-facility transfers for medicines, beds, staff, and ambulances." 
      />

      {safeProposals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <EmptyState 
            icon={icons.ArrowLeftRight}
            title="No Redistribution Requests"
            description="There are currently no active resource redistribution proposals in this district."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controls: Search and Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button 
                onClick={() => setActiveTab('pending')}
                className={cn("px-4 py-1.5 rounded-md text-sm font-semibold transition", activeTab === 'pending' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500')}
              >
                Pending Approvals
              </button>
              <button 
                onClick={() => setActiveTab('emergency')}
                className={cn("px-4 py-1.5 rounded-md text-sm font-semibold transition flex items-center gap-2", activeTab === 'emergency' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600 dark:text-red-400' : 'text-slate-500')}
              >
                <icons.AlertTriangle className="h-3 w-3" /> Emergency Queue
              </button>
              <button 
                onClick={() => setActiveTab('completed')}
                className={cn("px-4 py-1.5 rounded-md text-sm font-semibold transition", activeTab === 'completed' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500')}
              >
                Completed Transfers
              </button>
            </div>
            
            <div className="relative w-full sm:w-64">
              <icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search resources..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {/* AI Info Bar */}
          <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
            <Sparkles className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">AI Recommendations are actively monitoring stock thresholds and bed occupancies. Some proposals below were auto-generated to prevent imminent stock-outs.</p>
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Inbox className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No results found in this view.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map(proposal => (
                <div key={proposal.proposalId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-300 transition-all shadow-sm">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400')}>
                          <TypeIcon type={proposal.itemType} /> {proposal.itemType}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">{proposal.itemName}</h3>
                        <span className="text-sm text-slate-500 font-medium">Qty: {proposal.quantity}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 w-fit px-4 py-2 rounded-lg border border-slate-100 dark:border-slate-850">
                        <div className="flex items-center gap-2">
                          <icons.Building className="h-4 w-4 text-slate-400" />
                          <span>{proposal.sourceHospitalName}</span>
                        </div>
                        <icons.ArrowRight className="h-4 w-4 text-slate-300" />
                        <div className="flex items-center gap-2">
                          <icons.Building2 className="h-4 w-4 text-blue-500" />
                          <span className="text-slate-900 dark:text-slate-100">{proposal.targetHospitalName}</span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <icons.Info className="h-3.5 w-3.5" /> {proposal.expectedImpact}
                      </p>
                    </div>

                    <div className="flex lg:flex-col items-center gap-3">
                      {proposal.status === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleApprove(proposal.proposalId)}
                            disabled={resolveMutation.isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
                          >
                            <icons.Check className="h-4 w-4" /> Approve
                          </button>
                          <button 
                            onClick={() => handleReject(proposal.proposalId)}
                            disabled={resolveMutation.isPending}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-2 rounded-lg text-sm font-semibold transition"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <div className={cn("px-4 py-2 rounded-lg text-sm font-bold capitalize border", 
                          proposal.status === 'approved' || proposal.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400' :
                          'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400'
                        )}>
                          {proposal.status}
                        </div>
                      )}
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
