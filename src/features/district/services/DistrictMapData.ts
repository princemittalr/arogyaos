import { isDemoUserId } from '@/config/demoAccounts';

export interface DistrictFacilityNode {
  id: string;
  name: string;
  type: 'phc' | 'chc' | 'hospital' | 'medical_college';
  lat: number;
  lng: number;
  status: 'green' | 'yellow' | 'red';
  bedsOccupied: number;
  bedsTotal: number;
  doctorsPresent: number;
  doctorsTotal: number;
  nursesPresent: number;
  nursesTotal: number;
  medicineStock: string;
  pendingAmbulances: number;
  criticalPatients: number;
  openAlerts: string[];
  aiRecommendation: string;
  lastUpdated: string;
}

export const districtMapData: DistrictFacilityNode[] = [
  {
    id: 'fac_1',
    name: 'District Hospital (Central)',
    type: 'hospital',
    lat: 28.6139,
    lng: 77.2090,
    status: 'red',
    bedsOccupied: 480,
    bedsTotal: 500,
    doctorsPresent: 45,
    doctorsTotal: 50,
    nursesPresent: 120,
    nursesTotal: 130,
    medicineStock: 'Critical Shortage (O2, Remdesivir)',
    pendingAmbulances: 4,
    criticalPatients: 56,
    openAlerts: ['ICU capacity at 98%', 'Oxygen stock < 12 hours'],
    aiRecommendation: 'Divert incoming non-critical ambulances to West Block CHC.',
    lastUpdated: '2 mins ago'
  },
  {
    id: 'fac_2',
    name: 'West Block CHC',
    type: 'chc',
    lat: 28.6250,
    lng: 77.1800,
    status: 'yellow',
    bedsOccupied: 80,
    bedsTotal: 100,
    doctorsPresent: 12,
    doctorsTotal: 15,
    nursesPresent: 30,
    nursesTotal: 35,
    medicineStock: 'Adequate',
    pendingAmbulances: 1,
    criticalPatients: 5,
    openAlerts: ['Staff shortage in Night Shift'],
    aiRecommendation: 'Prepare for diverted patients from District Hospital.',
    lastUpdated: '5 mins ago'
  },
  {
    id: 'fac_3',
    name: 'Metro PHC',
    type: 'phc',
    lat: 28.6000,
    lng: 77.2200,
    status: 'green',
    bedsOccupied: 12,
    bedsTotal: 30,
    doctorsPresent: 4,
    doctorsTotal: 5,
    nursesPresent: 8,
    nursesTotal: 10,
    medicineStock: 'Adequate',
    pendingAmbulances: 0,
    criticalPatients: 0,
    openAlerts: [],
    aiRecommendation: 'Operations normal. Routine monitoring advised.',
    lastUpdated: '10 mins ago'
  },
  {
    id: 'fac_4',
    name: 'North PHC',
    type: 'phc',
    lat: 28.6400,
    lng: 77.2100,
    status: 'yellow',
    bedsOccupied: 25,
    bedsTotal: 30,
    doctorsPresent: 3,
    doctorsTotal: 5,
    nursesPresent: 7,
    nursesTotal: 10,
    medicineStock: 'Low Stock (Antibiotics)',
    pendingAmbulances: 0,
    criticalPatients: 1,
    openAlerts: ['Antibiotic stock < 3 days'],
    aiRecommendation: 'Initiate inter-facility transfer of Antibiotics from East PHC.',
    lastUpdated: '15 mins ago'
  },
  {
    id: 'fac_5',
    name: 'East PHC',
    type: 'phc',
    lat: 28.6100,
    lng: 77.2500,
    status: 'green',
    bedsOccupied: 10,
    bedsTotal: 30,
    doctorsPresent: 5,
    doctorsTotal: 5,
    nursesPresent: 10,
    nursesTotal: 10,
    medicineStock: 'Surplus',
    pendingAmbulances: 0,
    criticalPatients: 0,
    openAlerts: [],
    aiRecommendation: 'Excess antibiotic inventory detected. Ready for redistribution.',
    lastUpdated: '1 hour ago'
  }
];

export class DistrictMapService {
  static async getFacilities(userId: string): Promise<DistrictFacilityNode[]> {
    if (await isDemoUserId(userId)) {
      return districtMapData;
    }
    return [];
  }
}
