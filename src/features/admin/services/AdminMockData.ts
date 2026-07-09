export interface AdminPlatformNode {
  id: string;
  name: string;
  type: string;
  status: 'optimal' | 'warning' | 'critical';
  users: number;
  uptime: string;
}

export interface AdminMetrics {
  totalUsers: number;
  activeSessions: number;
  totalHospitals: number;
  totalDistricts: number;
  totalStates: number;
  apiHealth: number;
  databaseLoad: number;
  storageUsed: string;
}

export interface AdminLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  status: 'success' | 'failed' | 'warning';
}

export interface AdminData {
  nodes: AdminPlatformNode[];
  metrics: AdminMetrics;
  logs: AdminLog[];
}

export class AdminMockService {
  static getMockData(): AdminData {
    return {
      nodes: [
        { id: 'n1', name: 'Database Cluster A', type: 'Primary DB', status: 'optimal', users: 15420, uptime: '99.99%' },
        { id: 'n2', name: 'Auth Service', type: 'Identity', status: 'optimal', users: 45000, uptime: '100%' },
        { id: 'n3', name: 'Storage Bucket', type: 'Storage', status: 'warning', users: 8900, uptime: '99.95%' },
        { id: 'n4', name: 'AI Inference Engine', type: 'ML Model', status: 'optimal', users: 1200, uptime: '99.90%' },
      ],
      metrics: {
        totalUsers: 45210,
        activeSessions: 1245,
        totalHospitals: 340,
        totalDistricts: 112,
        totalStates: 15,
        apiHealth: 99.9,
        databaseLoad: 42,
        storageUsed: '4.2 TB',
      },
      logs: [
        { id: 'l1', timestamp: '2 mins ago', user: 'admin@arogya.gov.in', action: 'Modified Role', module: 'RBAC', status: 'success' },
        { id: 'l2', timestamp: '15 mins ago', user: 'system', action: 'Daily Backup', module: 'Database', status: 'success' },
        { id: 'l3', timestamp: '1 hour ago', user: 'unknown', action: 'Failed Login', module: 'Auth', status: 'failed' },
        { id: 'l4', timestamp: '3 hours ago', user: 'state.officer@delhi.gov.in', action: 'Exported Report', module: 'Analytics', status: 'success' },
      ],
    };
  }
}
