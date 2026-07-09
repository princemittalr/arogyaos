import { isDemoUserId } from '@/config/demoAccounts';

export const laboratoryMockData = {
  orders: [
    { id: 'ORD-1001', patient: 'Rohan Sharma', test: 'Complete Blood Count (CBC)', doctor: 'Dr. Neha', priority: 'Routine', status: 'Pending', orderedTime: '2 hours ago' },
    { id: 'ORD-1002', patient: 'Priya Patel', test: 'Lipid Profile', doctor: 'Dr. Amit', priority: 'Urgent', status: 'Sample Collected', orderedTime: '1 hour ago' },
    { id: 'ORD-1003', patient: 'Amit Kumar', test: 'HbA1c', doctor: 'Dr. Vivek', priority: 'Routine', status: 'Processing', orderedTime: '3 hours ago' },
    { id: 'ORD-1004', patient: 'Sunita Verma', test: 'Thyroid Panel', doctor: 'Dr. Neha', priority: 'Routine', status: 'Completed', orderedTime: '5 hours ago' },
  ],
  samples: [
    { id: 'SMP-2001', barcode: '1234567890', patient: 'Priya Patel', type: 'Blood', status: 'Collected', time: '1 hour ago', collector: 'Tech. Suresh' },
    { id: 'SMP-2002', barcode: '1234567891', patient: 'Rohan Sharma', type: 'Blood', status: 'Pending', time: '-', collector: '-' },
    { id: 'SMP-2003', barcode: '1234567892', patient: 'Amit Kumar', type: 'Blood', status: 'Processing', time: '2.5 hours ago', collector: 'Tech. Suresh' },
  ],
  processing: [
    { id: 'PRC-3001', sampleId: 'SMP-2003', test: 'HbA1c', status: 'In Progress', machine: 'Analyzer A1', priority: 'Routine' },
    { id: 'PRC-3002', sampleId: 'SMP-2001', test: 'Lipid Profile', status: 'Waiting', machine: 'Analyzer B2', priority: 'Urgent' },
  ],
  results: [
    { id: 'RES-4001', patient: 'Amit Kumar', test: 'HbA1c', value: '7.2', referenceRange: '4.0 - 5.6', remarks: 'High', status: 'Draft' },
  ],
  reports: [
    { id: 'REP-5001', patient: 'Sunita Verma', test: 'Thyroid Panel', date: '2023-10-27', status: 'Completed', signedBy: 'Dr. Pathologist' },
    { id: 'REP-5002', patient: 'Rahul Bose', test: 'Liver Function Test', date: '2023-10-26', status: 'Completed', signedBy: 'Dr. Pathologist' },
  ],
  qc: [
    { id: 'QC-6001', machine: 'Analyzer A1', type: 'Daily QC', status: 'Passed', lastRun: '08:00 AM' },
    { id: 'QC-6002', machine: 'Analyzer B2', type: 'Weekly Calibration', status: 'Warning', lastRun: 'Yesterday' },
  ],
  equipment: [
    { id: 'EQ-7001', name: 'Analyzer A1', status: 'Active', temperature: '4°C', lastMaintenance: '2023-09-15' },
    { id: 'EQ-7002', name: 'Analyzer B2', status: 'Maintenance Due', temperature: '4°C', lastMaintenance: '2023-08-01' },
    { id: 'EQ-7003', name: 'Centrifuge 1', status: 'Active', temperature: 'N/A', lastMaintenance: '2023-10-01' },
  ],
  inventory: [
    { id: 'INV-8001', item: 'CBC Reagent Pack', stock: 45, unit: 'packs', expiry: '2024-05-12', status: 'Adequate' },
    { id: 'INV-8002', item: 'Lipid Assay Kit', stock: 5, unit: 'kits', expiry: '2023-11-30', status: 'Low Stock' },
    { id: 'INV-8003', item: 'Test Tubes (EDTA)', stock: 500, unit: 'pcs', expiry: '2025-01-01', status: 'Adequate' },
  ],
  patients: [
    { id: 'PAT-9001', name: 'Rohan Sharma', age: '45', gender: 'M', lastVisit: 'Today', pendingTests: 1 },
    { id: 'PAT-9002', name: 'Priya Patel', age: '32', gender: 'F', lastVisit: 'Today', pendingTests: 1 },
    { id: 'PAT-9003', name: 'Sunita Verma', age: '58', gender: 'F', lastVisit: 'Yesterday', pendingTests: 0 },
  ],
  analytics: [
    { id: 'AN-1', metric: 'Orders Today', value: 45, trend: '+5%' },
    { id: 'AN-2', metric: 'Average TAT', value: '4.2 hrs', trend: '-10%' },
  ],
  sync: [
    { id: 'SYNC-1', type: 'Report Upload', target: 'State Health Vault', status: 'Pending', retries: 0 },
  ],
  profile: [
    { id: 'PROF-1', name: 'Lab Tech Demo', designation: 'Senior Technician', assignedLab: 'Central District Lab', shift: 'Morning (08:00 - 16:00)' },
  ],
  settings: [],
};

export class LaboratoryMockService {
  static async getModuleData(workerId: string, module: keyof typeof laboratoryMockData) {
    if (await isDemoUserId(workerId)) {
      return laboratoryMockData[module] || [];
    }
    return [];
  }
}
