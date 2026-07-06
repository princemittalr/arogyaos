'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StockTrendChartProps {
  data: Array<{ month: string; stock: number; dispensed: number }>;
  stockLabel: string;
  dispensedLabel: string;
}

export function StockTrendChart({ data, stockLabel, dispensedLabel }: StockTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="dispGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: 'var(--color-bg, #fff)', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
          itemStyle={{ color: '#334155' }} />
        
        <Area type="monotone" dataKey="stock" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#stockGrad)" name={stockLabel} />
        <Area type="monotone" dataKey="dispensed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#dispGrad)" name={dispensedLabel} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default StockTrendChart;
