import { isDemoUserId } from '@/config/demoAccounts';

export const ashaMockData = {
  families: [
    { id: 'f1', name: 'Sharma Household', members: 5, address: 'Plot 4, Sector A', riskLevel: 'low', nextVisit: '2023-11-01' },
    { id: 'f2', name: 'Patel Household', members: 3, address: 'House 12, Village Road', riskLevel: 'high', nextVisit: '2023-10-15', tags: ['pregnant', 'tb'] },
    { id: 'f3', name: 'Reddy Family', members: 6, address: 'Block C, Lane 2', riskLevel: 'medium', nextVisit: '2023-10-20' },
  ],
  visits: [
    { id: 'v1', familyId: 'f2', date: '2023-10-15', type: 'routine', status: 'pending' },
    { id: 'v2', familyId: 'f1', date: '2023-10-10', type: 'follow-up', status: 'completed' },
  ],
  pregnancy: [
    { id: 'p1', name: 'Anjali Patel', edd: '2024-03-15', trimester: 2, ancVisits: 3, riskStatus: 'high_risk' },
  ],
  maternal: [
    { id: 'm1', name: 'Sunita Sharma', type: 'PNC', lastVitals: 'BP 120/80', nutrition: 'Iron & Folic Acid' },
  ],
  'child-health': [
    { id: 'c1', name: 'Rohan Reddy', age: '14 months', nextVaccine: 'MMR Dose 1', status: 'due' },
    { id: 'c2', name: 'Priya Patel', age: '2 months', nextVaccine: 'Pentavalent 1', status: 'completed' },
  ],
  'high-risk': [
    { id: 'hr1', name: 'Rajesh Patel', condition: 'Tuberculosis', adherence: '85%', nextFollowUp: '2023-10-18' },
    { id: 'hr2', name: 'Kavita Sharma', condition: 'Severe Hypertension', adherence: '60%', nextFollowUp: '2023-10-16' },
  ],
  chronic: [
    { id: 'ch1', name: 'Mohan Reddy', condition: 'Diabetes Type 2', lastBloodSugar: '145 mg/dL', nextRefill: '2023-10-25' },
  ],
  surveys: [
    { id: 's1', title: 'Monsoon Sanitation Drive', status: 'pending', deadline: '2023-10-31' },
    { id: 's2', title: 'Nutrition Assessment', status: 'completed', deadline: '2023-09-30' },
  ],
  medicine: [
    { id: 'med1', name: 'Iron Folic Acid', stock: 150, unit: 'tablets' },
    { id: 'med2', name: 'ORS Packets', stock: 45, unit: 'sachets' },
    { id: 'med3', name: 'Paracetamol', stock: 10, unit: 'strips' },
  ],
  referrals: [
    { id: 'ref1', patient: 'Anjali Patel', target: 'District Hospital', reason: 'High Risk Pregnancy', status: 'pending' },
    { id: 'ref2', patient: 'Rajesh Patel', target: 'TB Clinic Center', reason: 'DOTS Initiation', status: 'accepted' },
  ],
  education: [
    { id: 'edu1', topic: 'Dengue Prevention', date: '2023-10-22', location: 'Community Hall', expectedAttendees: 40 },
  ],
  alerts: [
    { id: 'al1', type: 'warning', title: 'Dengue Outbreak Risk', description: 'Increased mosquito breeding reported in Sector A.' },
    { id: 'al2', type: 'info', title: 'Polio Drive', description: 'National polio drive starts next week. Prepare list of children under 5.' },
  ],
  reports: [
    { id: 'rep1', month: 'September 2023', householdsVisited: 45, vaccinesAdministered: 12, referralsMade: 3 },
  ],
  sync: [
    { id: 'sync1', type: 'visit_record', target: 'f3', timestamp: '10 mins ago', status: 'pending' },
  ],
  profile: [
    { id: 'prof1', name: 'ASHA Demo User', village: 'Rampur', supervisor: 'Dr. Neha', joined: '2020-05-10', rating: '4.8/5' }
  ],
  settings: []
};

export class AshaMockService {
  static async getModuleData(workerId: string, module: keyof typeof ashaMockData) {
    if (await isDemoUserId(workerId)) {
      return ashaMockData[module] || [];
    }
    return [];
  }
}
