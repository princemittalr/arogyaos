'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useDistrictDoctorAttendance } from '@/features/district/hooks/useDistrict';
import { PageHeader, LoadingState } from '@/features/shared';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

const mockAttendanceTrends = [
  { name: 'Monday', present: 88 },
  { name: 'Tuesday', present: 92 },
  { name: 'Wednesday', present: 85 },
  { name: 'Thursday', present: 94 },
  { name: 'Friday', present: 89 },
  { name: 'Saturday', present: 78 },
  { name: 'Sunday', present: 74 },
];

export default function DistrictDoctorAttendancePage() {
  const { user } = useAuth();
  const districtId = user?.uid || 'dist_central_delhi';

  const { data: attendance, isLoading } = useDistrictDoctorAttendance(districtId);

  if (isLoading) {
    return <LoadingState variant="chart" />;
  }

  const stats = attendance || {
    present: 0,
    absent: 0,
    onLeave: 0,
    departments: [],
  };

  const totalStaff = stats.present + stats.absent + stats.onLeave;
  const attendanceRate = totalStaff ? Math.round((stats.present / totalStaff) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctor Attendance & Duty Logs"
        description="Verify active clinical duty rotas, department presence parameters, and weekly logs."
      />

      {/* Top row metrics cards */}
      <div className="grid gap-4 md:grid-cols-4 text-xs font-bold">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-400">Attendance Ratio</p>
          <p className="text-2xl font-extrabold mt-1.5 text-slate-900 dark:text-slate-50">{attendanceRate}%</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-400">On-Duty Doctors</p>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mt-1.5">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-2xl font-extrabold">{stats.present} present</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-400">Absent Doctors</p>
          <div className="flex items-center gap-1.5 text-red-500 mt-1.5">
            <AlertCircle className="h-5 w-5" />
            <span className="text-2xl font-extrabold">{stats.absent} absent</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-400">On Leave</p>
          <div className="flex items-center gap-1.5 text-amber-500 mt-1.5">
            <Calendar className="h-5 w-5" />
            <span className="text-2xl font-extrabold">{stats.onLeave} leave</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Department Breakdowns */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50">
            Department-wise Clinical Roster
          </h3>

          <div className="space-y-3.5 text-xs font-bold text-slate-700 dark:text-slate-350">
            {stats.departments.map((dept, idx) => {
              const pct = dept.total ? Math.round((dept.present / dept.total) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-bold text-slate-850 dark:text-slate-100">
                    <span>{dept.name}</span>
                    <span>{dept.present} / {dept.total} Present ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div style={{ width: `${pct}%` }} className="h-full bg-blue-500 rounded-full" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Attendance trends chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-50">
            Clinical Duty Presence Timeline
          </h3>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockAttendanceTrends}>
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
          </div>
        </div>
      </div>
    </div>
  );
}
