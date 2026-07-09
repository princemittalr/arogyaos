import { isDemoUserId } from '@/config/demoAccounts';

export const nurseMockData = {
  patients: [
    { id: '1', name: 'Rohan Sharma', room: '101A', status: 'Stable', lastVitals: '1h ago', nextMed: 'In 30m', diagnosis: 'Post-op appendectomy' },
    { id: '2', name: 'Priya Patel', room: '102B', status: 'Critical', lastVitals: '10m ago', nextMed: 'Now', diagnosis: 'Severe pneumonia' },
    { id: '3', name: 'Amit Kumar', room: '105A', status: 'Discharging', lastVitals: '4h ago', nextMed: 'Completed', diagnosis: 'Fractured femur' },
    { id: '4', name: 'Sanjay Singh', room: '106A', status: 'Stable', lastVitals: '2h ago', nextMed: 'In 2h', diagnosis: 'Dengue fever' },
    { id: '5', name: 'Neha Gupta', room: '107C', status: 'Stable', lastVitals: '1h ago', nextMed: 'In 4h', diagnosis: 'Viral gastroenteritis' },
    { id: '6', name: 'Vikram Joshi', room: '108B', status: 'Critical', lastVitals: '15m ago', nextMed: 'In 1h', diagnosis: 'Myocardial infarction' },
    { id: '7', name: 'Kavita Reddy', room: '109A', status: 'Stable', lastVitals: '3h ago', nextMed: 'Completed', diagnosis: 'Asthma exacerbation' },
    { id: '8', name: 'Arjun Das', room: '110A', status: 'Discharging', lastVitals: '5h ago', nextMed: 'Completed', diagnosis: 'Cellulitis' },
    { id: '9', name: 'Sunita Verma', room: '111B', status: 'Stable', lastVitals: '2h ago', nextMed: 'In 1h', diagnosis: 'Typhoid fever' },
    { id: '10', name: 'Rajiv Menon', room: '112C', status: 'Critical', lastVitals: '5m ago', nextMed: 'Now', diagnosis: 'Sepsis' },
    { id: '11', name: 'Anjali Desai', room: '114A', status: 'Stable', lastVitals: '4h ago', nextMed: 'In 6h', diagnosis: 'UTI' },
    { id: '12', name: 'Rahul Bose', room: '115B', status: 'Discharging', lastVitals: '6h ago', nextMed: 'Completed', diagnosis: 'Malaria' },
  ],
  ward: [
    { id: 'w1', title: 'Ward 3B Status', totalBeds: 24, occupied: 20, available: 4, criticalPatients: 3, nurseOnDuty: 4 },
  ],
  beds: [
    { id: 'b1', number: '103A', status: 'Available', type: 'ICU', lastCleaned: '2h ago' },
    { id: 'b2', number: '104B', status: 'Available', type: 'General', lastCleaned: '1h ago' },
    { id: 'b3', number: '113A', status: 'Available', type: 'General', lastCleaned: '4h ago' },
    { id: 'b4', number: '116C', status: 'Available', type: 'Semi-Private', lastCleaned: '30m ago' },
  ],
  vitals: [
    { id: 'v1', patient: 'Rohan Sharma', bp: '120/80', heartRate: 72, temp: '98.6°F', spO2: 98, time: '1h ago' },
    { id: 'v2', patient: 'Priya Patel', bp: '90/60', heartRate: 110, temp: '101.2°F', spO2: 92, time: '10m ago' },
  ],
  medications: [
    { id: 'm1', patient: 'Rohan Sharma', drug: 'Paracetamol 500mg', route: 'Oral', dueTime: '10:00 AM', status: 'Pending' },
    { id: 'm2', patient: 'Priya Patel', drug: 'Ceftriaxone 1g', route: 'IV', dueTime: '09:30 AM', status: 'Pending' },
    { id: 'm3', patient: 'Vikram Joshi', drug: 'Aspirin 75mg', route: 'Oral', dueTime: '11:00 AM', status: 'Pending' },
    { id: 'm4', patient: 'Rajiv Menon', drug: 'Norepinephrine', route: 'IV', dueTime: '09:00 AM', status: 'Pending' },
    { id: 'm5', patient: 'Sanjay Singh', drug: 'IV Fluids', route: 'IV', dueTime: '12:00 PM', status: 'Pending' },
    { id: 'm6', patient: 'Neha Gupta', drug: 'Ondansetron 4mg', route: 'IV', dueTime: '01:00 PM', status: 'Pending' },
    { id: 'm7', patient: 'Sunita Verma', drug: 'Azithromycin 500mg', route: 'Oral', dueTime: '10:30 AM', status: 'Pending' },
    { id: 'm8', patient: 'Anjali Desai', drug: 'Ciprofloxacin 500mg', route: 'Oral', dueTime: '02:00 PM', status: 'Pending' },
  ],
  notes: [
    { id: 'n1', patient: 'Amit Kumar', note: 'Patient mobilizing well, clear for discharge.', author: 'Nurse Sarah', time: '4h ago' },
    { id: 'n2', patient: 'Priya Patel', note: 'SpO2 dropping, physician notified.', author: 'Nurse Sarah', time: '15m ago' },
  ],
  emergency: [
    { id: 'e1', type: 'Code Blue', patient: 'Rajiv Menon', room: '112C', time: '2m ago', status: 'Active' },
  ],
};

export class NurseMockService {
  static async getModuleData(workerId: string, module: keyof typeof nurseMockData) {
    if (await isDemoUserId(workerId)) {
      return nurseMockData[module] || [];
    }
    return [];
  }
}
