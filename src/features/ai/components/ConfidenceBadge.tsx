import React from 'react';

interface ConfidenceBadgeProps {
  confidence: number;
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  let badgeColor = 'bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400';
  if (confidence >= 85) {
    badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450';
  } else if (confidence >= 70) {
    badgeColor = 'bg-amber-50 text-amber-650 dark:bg-amber-950/20 dark:text-amber-400';
  }

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase ${badgeColor}`}>
      {confidence}% Confidence
    </span>
  );
}

export default ConfidenceBadge;
