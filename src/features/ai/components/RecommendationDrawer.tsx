import React from 'react';
import { X, ArrowRightLeft, Sparkles } from 'lucide-react';

interface RecommendationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sourceName: string;
  targetName: string;
  itemName: string;
  quantity: number;
  expectedImpact: string;
  reason: string;
  onApprove?: () => void;
  onReject?: () => void;
  isPending?: boolean;
}

export function RecommendationDrawer({
  isOpen,
  onClose,
  title,
  sourceName,
  targetName,
  itemName,
  quantity,
  expectedImpact,
  reason,
  onApprove,
  onReject,
  isPending = false,
}: RecommendationDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay background */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between">
          
          <div className="p-6 space-y-6 overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <span className="text-[9px] font-black uppercase text-blue-500 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                  <Sparkles className="h-3 w-3" /> AI Proposal
                </span>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-50 mt-2">{title}</h3>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-650 p-1.5 rounded-lg border border-slate-100 dark:border-slate-850">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-4 text-xs font-bold">
              <div>
                <p className="text-[10px] text-slate-450 uppercase mb-1">Transfer Route</p>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-150 dark:border-slate-850 flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-350">
                  <div className="space-y-0.5">
                    <p className="text-[8px] text-slate-400 uppercase font-semibold">Source Facility</p>
                    <p className="text-slate-900 dark:text-slate-50">{sourceName}</p>
                  </div>
                  <ArrowRightLeft className="h-4 w-4 text-blue-500 shrink-0" />
                  <div className="space-y-0.5 text-right">
                    <p className="text-[8px] text-slate-400 uppercase font-semibold">Target Facility</p>
                    <p className="text-slate-900 dark:text-slate-50">{targetName}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-150 dark:border-slate-850">
                  <p className="text-[9px] text-slate-400">Item Name</p>
                  <p className="text-xs font-black text-slate-900 dark:text-slate-50 mt-1">{itemName}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-150 dark:border-slate-850">
                  <p className="text-[9px] text-slate-400">Transfer Quantity</p>
                  <p className="text-xs font-black text-slate-900 dark:text-slate-50 mt-1">{quantity} units</p>
                </div>
              </div>

              <div className="space-y-1 bg-blue-50/25 dark:bg-blue-950/5 p-4 rounded-xl border border-blue-100/50 dark:border-blue-950/15">
                <p className="text-[9px] text-blue-500 uppercase font-semibold">Expected Impact</p>
                <p className="text-[10px] text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">{expectedImpact}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-slate-450 uppercase mb-1">Reasoning & Analysis</p>
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{reason}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-6 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/10 flex gap-3">
            {onReject && (
              <button
                onClick={onReject}
                disabled={isPending}
                className="flex-1 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-650 hover:border-red-200 py-3 text-[11px] font-extrabold text-slate-650 transition disabled:opacity-50"
              >
                Reject Route
              </button>
            )}
            {onApprove && (
              <button
                onClick={onApprove}
                disabled={isPending}
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-750 text-white py-3 text-[11px] font-extrabold transition disabled:opacity-50"
              >
                {isPending ? 'Executing...' : 'Approve Transfer'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default RecommendationDrawer;
