'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AttendanceTrendChartProps {
  data: Array<{ name: string; present: number }>;
}

export function AttendanceTrendChart({ data }: AttendanceTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
        <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={[0, 100]} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 'bold',
          }}
        />
        <Area type="monotone" dataKey="present" stroke="#10b981" fillOpacity={1} fill="url(#colorAtt)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default AttendanceTrendChart;
