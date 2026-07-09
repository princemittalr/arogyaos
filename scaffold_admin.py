import os

routes = [
    ('platform', 'Platform Overview', 'Globe', 'Executive overview of entire platform.', 'nodes', ['Node', 'Type', 'Users', 'Uptime', 'Status']),
    ('users', 'Users', 'Users', 'Manage platform users and access.', 'logs', ['Time', 'User', 'Module', 'Action', 'Status']),
    ('organizations', 'Healthcare Organizations', 'Building2', 'Manage verified organizations.', 'nodes', ['Organization', 'Type', 'Members', 'Uptime', 'Status']),
    ('roles', 'Role Management', 'ShieldCheck', 'Configure role-based access control.', 'logs', ['Time', 'Admin', 'Module', 'Change', 'Status']),
    ('hospitals', 'Hospitals', 'Building2', 'Statewide hospital management.', 'nodes', ['Hospital', 'Type', 'Patients', 'Uptime', 'Status']),
    ('phcs', 'PHCs', 'MapPin', 'Primary Health Center management.', 'nodes', ['PHC', 'Type', 'Patients', 'Uptime', 'Status']),
    ('chcs', 'CHCs', 'MapPin', 'Community Health Center management.', 'nodes', ['CHC', 'Type', 'Patients', 'Uptime', 'Status']),
    ('districts', 'Districts', 'Map', 'District-level healthcare management.', 'nodes', ['District', 'Type', 'Facilities', 'Uptime', 'Status']),
    ('states', 'States', 'Map', 'State-level health management.', 'nodes', ['State', 'Type', 'Districts', 'Uptime', 'Status']),
    ('ai', 'AI Management', 'Bot', 'Manage Gemini integrations and forecasting.', 'logs', ['Time', 'User', 'Module', 'Inference', 'Status']),
    ('health', 'System Health', 'Activity', 'Realtime platform health monitoring.', 'nodes', ['Component', 'Type', 'Load', 'Uptime', 'Status']),
    ('api', 'API Monitoring', 'Terminal', 'Monitor API health, latency, and requests.', 'nodes', ['Endpoint', 'Method', 'Requests', 'Latency', 'Status']),
    ('audit', 'Audit Logs', 'ClipboardList', 'Detailed timeline of all system actions.', 'logs', ['Time', 'User', 'Module', 'Action', 'Status']),
    ('security', 'Security Center', 'Shield', 'Authentication and threat detection.', 'logs', ['Time', 'User', 'Module', 'Event', 'Status']),
    ('notifications', 'Notifications', 'Bell', 'Platform-wide notifications and alerts.', 'logs', ['Time', 'Recipient', 'Module', 'Message', 'Status']),
    ('analytics', 'Analytics', 'BarChart2', 'Executive platform analytics.', 'nodes', ['Metric', 'Type', 'Value', 'Change', 'Status']),
    ('reports', 'Reports', 'FileText', 'Export and schedule system reports.', 'logs', ['Time', 'User', 'Module', 'Report Type', 'Status']),
    ('database', 'Database Monitoring', 'Database', 'Realtime Firestore metrics and indexes.', 'nodes', ['Collection', 'Type', 'Reads', 'Writes', 'Status']),
    ('storage', 'Storage', 'HardDrive', 'File storage and bucket utilization.', 'nodes', ['Bucket', 'Type', 'Usage', 'Objects', 'Status']),
    ('backups', 'Backups', 'Save', 'Manage system backups and restoration.', 'logs', ['Time', 'User', 'Module', 'Backup Name', 'Status']),
    ('settings', 'Platform Settings', 'Settings', 'Global platform configuration.', 'nodes', []),
    ('features', 'Feature Flags', 'ToggleRight', 'Enable/disable experimental modules.', 'nodes', ['Feature', 'Category', 'Users', 'Rollout', 'Status']),
    ('sync', 'Offline Sync', 'RefreshCw', 'Monitor offline data synchronization queues.', 'nodes', ['Queue', 'Type', 'Pending', 'Errors', 'Status']),
    ('profile', 'Profile', 'UserCircle', 'Manage your Administrator profile.', 'nodes', []),
    ('preferences', 'Preferences', 'Sliders', 'Customize your administrative experience.', 'nodes', [])
]

os.makedirs('src/app/dashboard/(admin)/admin', exist_ok=True)

# Dashboard (page.tsx)
dashboard_content = """'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { PageHeader, LoadingState, EmptyState } from '@/features/shared';
import { icons } from '@/design-system/icons';
import { isDemoUser } from '@/config/demoAccounts';
import { useAdminModuleData } from '@/features/admin/hooks/useAdminModuleData';
import Link from 'next/link';
import { cn } from '@/utils/cn';

const MetricCard = ({ label, value, subtext, icon: Icon, color = 'blue' }: any) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
          {subtext && <p className="mt-1 text-xs font-medium text-slate-500">{subtext}</p>}
        </div>
        <div className={cn('rounded-xl p-3', colors[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const isDemo = isDemoUser(user?.email);
  const { data, isLoading } = useAdminModuleData(user?.email);

  if (isLoading) return <LoadingState />;

  if (!isDemo || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Enterprise Command Center" description="Global platform administration and monitoring." />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <EmptyState 
            icon={icons.ShieldAlert}
            title="Awaiting System Connection"
            description="Your account is not connected to any active clusters. Contact DevOps."
          />
        </div>
      </div>
    );
  }

  const { metrics, nodes } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader title="Enterprise Command Center" description="Global platform administration and realtime observability." />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-400 text-xs font-bold shrink-0">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" /> CLUSTER ONLINE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Users" value={metrics.totalUsers.toLocaleString()} subtext={`${metrics.activeSessions} active sessions`} icon={icons.Users} color="blue" />
        <MetricCard label="API Health" value={`${metrics.apiHealth}%`} subtext={`Database Load: ${metrics.databaseLoad}%`} icon={icons.Terminal} color="emerald" />
        <MetricCard label="Total Hospitals" value={metrics.totalHospitals} subtext={`Across ${metrics.totalStates} states`} icon={icons.Building2} color="indigo" />
        <MetricCard label="Storage" value={metrics.storageUsed} subtext="Bucket utilization" icon={icons.HardDrive} color="amber" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Platform Overview', desc: 'System topology', icon: icons.Globe, href: '/dashboard/admin/platform', color: 'text-indigo-600' },
          { label: 'Security Center', desc: 'Threat detection', icon: icons.Shield, href: '/dashboard/admin/security', color: 'text-red-600' },
          { label: 'Audit Logs', desc: 'System trails', icon: icons.ClipboardList, href: '/dashboard/admin/audit', color: 'text-amber-600' },
          { label: 'Database Health', desc: 'Performance', icon: icons.Database, href: '/dashboard/admin/database', color: 'text-blue-600' }
        ].map((item) => (
          <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 transition text-center">
            <item.icon className={cn('h-6 w-6', item.color)} />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.label}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
"""

with open('src/app/dashboard/(admin)/admin/page.tsx', 'w') as f:
    f.write(dashboard_content)

# Templates for the 25 modules
template = """'use client';

import React from 'react';
import {{ useAuth }} from '@/providers/AuthProvider';
import {{ PageHeader, EmptyState }} from '@/features/shared';
import {{ icons }} from '@/design-system/icons';
import {{ isDemoUser }} from '@/config/demoAccounts';
import {{ useAdminModuleData }} from '@/features/admin/hooks/useAdminModuleData';

export default function {ModuleName}Page() {{
  const {{ user }} = useAuth();
  const isDemo = isDemoUser(user?.email);
  const {{ data, isLoading }} = useAdminModuleData(user?.email);

  if (!isDemo || !data) {{
    return (
      <div className="space-y-6">
        <PageHeader 
          title="{Title}" 
          description="{Desc}" 
        />
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <EmptyState 
            icon={{icons.{Icon} || icons.ShieldAlert}}
            title="No Data Available"
            description="This module requires active system integration. Contact DevOps."
          />
        </div>
      </div>
    );
  }}

  const {{ {DataVar} }} = data;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="{Title}" 
        description="{Desc}" 
      />
      {Content}
    </div>
  );
}}
"""

table_template = """
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <h2 className="font-bold text-slate-800 dark:text-slate-100">{Title} Feed</h2>
          <button className="px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400">Export Log</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
{Headers}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {{ {DataVar}.map((item: any, i: number) => (
                <tr key={{i}} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{{item.name || item.timestamp || '{Title} Item ' + i}}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{{item.type || item.user || 'System'}}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{{item.users || item.module || 'N/A'}}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{{item.uptime || item.action || 'N/A'}}</td>
                  <td className="px-4 py-3">
                    <span className={{`px-2 py-1 text-xs font-semibold rounded-lg ${{
                      item.status === 'optimal' || item.status === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' :
                      item.status === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30' :
                      item.status === 'critical' || item.status === 'failed' ? 'bg-red-50 text-red-600 dark:bg-red-900/30' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800'
                    }}`}}>
                      {{item.status || 'Active'}}
                    </span>
                  </td>
                </tr>
              ))}}
            </tbody>
          </table>
        </div>
      </div>
"""

cards_template = """
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {{ {DataVar}.map((item: any, i: number) => (
          <div key={{i}} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600">
                <icons.{Icon} className="h-5 w-5" />
              </div>
              <span className={{`px-2 py-1 text-[10px] font-bold uppercase rounded ${{
                item.status === 'optimal' || item.status === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                item.status === 'warning' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                item.status === 'critical' || item.status === 'failed' ? 'bg-red-50 text-red-600 border border-red-200' :
                'bg-slate-50 text-slate-600 border border-slate-200'
              }}`}}>
                {{item.status || 'Active'}}
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{{item.name || item.action || '{Title}'}}</h3>
            <p className="text-sm text-slate-500 mb-4">{{item.type || item.module || 'System Module'}}</p>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                <span className="block text-xs text-slate-400">Metric 1</span>
                <span className="font-semibold">{{item.users || item.user || 'N/A'}}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                <span className="block text-xs text-slate-400">Metric 2</span>
                <span className="font-semibold">{{item.uptime || item.timestamp || 'N/A'}}</span>
              </div>
            </div>
          </div>
        ))}}
      </div>
"""

for route, title, icon, desc, data_var, headers in routes:
    module_name = ''.join(word.capitalize() for word in route.split('-'))
    
    if len(headers) > 0:
        if route in ['platform', 'health', 'analytics', 'database']:
            content_str = cards_template.format(DataVar=data_var, Title=title, Icon=icon)
        else:
            headers_str = '\n'.join(f'                <th className="px-4 py-3">{h}</th>' for h in headers)
            content_str = table_template.format(DataVar=data_var, Headers=headers_str, Title=title)
    else:
        # Profile/Settings dummy
        content_str = f"""
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-400">
              AD
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Super Administrator</h2>
              <p className="text-slate-500">Platform Architect</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <div className="font-medium">{{{'{'}user?.email || 'admin.demo@gmail.com'{'}'}}}</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-500 uppercase">Role Permissions</label>
              <div className="font-medium">God Mode (Level 0)</div>
            </div>
          </div>
        </div>
        """

    content = template.format(ModuleName=module_name, Title=title, Desc=desc, Icon=icon, DataVar=data_var, Content=content_str)
    
    os.makedirs(f'src/app/dashboard/(admin)/admin/{route}', exist_ok=True)
    with open(f'src/app/dashboard/(admin)/admin/{route}/page.tsx', 'w') as f:
        f.write(content)
