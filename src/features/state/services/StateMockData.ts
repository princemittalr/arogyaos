export interface StateDistrictNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'green' | 'yellow' | 'red';
  hospitals: number;
  phcs: number;
  chcs: number;
  doctorsTotal: number;
  doctorsPresent: number;
  bedsTotal: number;
  bedsOccupied: number;
  medicineStock: string;
  diseaseAlerts: string[];
  aiRecommendation: string;
  population: string;
  healthScore: number;
}

export interface StateMetrics {
  totalDistricts: number;
  criticalDistricts: number;
  warningDistricts: number;
  totalHospitals: number;
  totalPHCs: number;
  totalCHCs: number;
  totalBeds: number;
  occupiedBeds: number;
  totalDoctors: number;
  presentDoctors: number;
  vaccinationCoverage: number;
}

export interface StateHospital {
  id: string;
  name: string;
  district: string;
  type: string;
  beds: number;
  occupied: number;
  doctors: number;
  status: 'optimal' | 'warning' | 'critical';
}

export interface StateAlert {
  id: string;
  title: string;
  district: string;
  severity: 'high' | 'medium' | 'low';
  time: string;
  description: string;
}

export interface StateAllocation {
  id: string;
  resource: string;
  from: string;
  to: string;
  quantity: string;
  status: 'pending' | 'approved' | 'completed';
}

export interface StateData {
  districts: StateDistrictNode[];
  metrics: StateMetrics;
  hospitals: StateHospital[];
  alerts: StateAlert[];
  allocations: StateAllocation[];
}

export class StateMockService {
  static getMockData(): StateData {
    const districts: StateDistrictNode[] = [
      {
        id: 'dist_central_delhi', name: 'Central Delhi', lat: 28.6139, lng: 77.2090, status: 'green',
        hospitals: 12, phcs: 25, chcs: 5, doctorsTotal: 1200, doctorsPresent: 1105,
        bedsTotal: 5000, bedsOccupied: 3800, medicineStock: '95%',
        diseaseAlerts: [], aiRecommendation: 'Operations normal. Proceed with routine maintenance of cold chain.',
        population: '2.5M', healthScore: 92
      },
      {
        id: 'dist_south_delhi', name: 'South Delhi', lat: 28.5355, lng: 77.2410, status: 'yellow',
        hospitals: 8, phcs: 18, chcs: 4, doctorsTotal: 850, doctorsPresent: 780,
        bedsTotal: 3200, bedsOccupied: 2900, medicineStock: '75%',
        diseaseAlerts: ['Dengue cases +15% WoW'], aiRecommendation: 'Redistribute IV fluids from Central Delhi to South Delhi CHCs.',
        population: '3.1M', healthScore: 78
      },
      {
        id: 'dist_east_delhi', name: 'East Delhi', lat: 28.6415, lng: 77.2885, status: 'red',
        hospitals: 6, phcs: 15, chcs: 3, doctorsTotal: 600, doctorsPresent: 450,
        bedsTotal: 2800, bedsOccupied: 2750, medicineStock: '45%',
        diseaseAlerts: ['Severe Waterborne Outbreak', 'ICU capacity reached'], aiRecommendation: 'Declare localized emergency. Mobilize 50 extra doctors and 200 PPE kits immediately.',
        population: '1.8M', healthScore: 45
      },
      {
        id: 'dist_north_delhi', name: 'North Delhi', lat: 28.7521, lng: 77.1005, status: 'yellow',
        hospitals: 7, phcs: 14, chcs: 2, doctorsTotal: 700, doctorsPresent: 620,
        bedsTotal: 2500, bedsOccupied: 2000, medicineStock: '80%',
        diseaseAlerts: ['Air quality respiratory cases'], aiRecommendation: 'Increase oxygen cylinder reserves in PHCs.',
        population: '2.2M', healthScore: 81
      }
    ];

    const hospitals: StateHospital[] = [
      { id: 'h1', name: 'Central Govt Hospital', district: 'Central Delhi', type: 'Tertiary', beds: 1500, occupied: 1200, doctors: 450, status: 'optimal' },
      { id: 'h2', name: 'South City Medical College', district: 'South Delhi', type: 'Medical College', beds: 800, occupied: 780, doctors: 200, status: 'warning' },
      { id: 'h3', name: 'East District Hospital', district: 'East Delhi', type: 'District Hospital', beds: 500, occupied: 495, doctors: 80, status: 'critical' },
      { id: 'h4', name: 'North General Hospital', district: 'North Delhi', type: 'General', beds: 600, occupied: 400, doctors: 120, status: 'optimal' },
    ];

    const alerts: StateAlert[] = [
      { id: 'a1', title: 'Dengue Outbreak Warning', district: 'South Delhi', severity: 'medium', time: '2h ago', description: 'Mosquito-borne diseases rising.' },
      { id: 'a2', title: 'Waterborne Disease Spike', district: 'East Delhi', severity: 'high', time: '1h ago', description: 'Cholera cases detected.' },
      { id: 'a3', title: 'Oxygen Stock Low', district: 'East Delhi', severity: 'high', time: '30m ago', description: 'Critical oxygen shortage at District Hospital.' },
    ];

    const allocations: StateAllocation[] = [
      { id: 'al1', resource: 'Paracetamol 500mg', from: 'Central Delhi', to: 'East Delhi', quantity: '10,000 strips', status: 'pending' },
      { id: 'al2', resource: 'IV Fluids', from: 'North Delhi', to: 'South Delhi', quantity: '5,000 units', status: 'approved' },
      { id: 'al3', resource: 'Ambulances', from: 'Central Delhi', to: 'East Delhi', quantity: '15 units', status: 'completed' },
    ];

    const totalHospitals = districts.reduce((acc, d) => acc + d.hospitals, 0);
    const totalPHCs = districts.reduce((acc, d) => acc + d.phcs, 0);
    const totalCHCs = districts.reduce((acc, d) => acc + d.chcs, 0);
    const totalBeds = districts.reduce((acc, d) => acc + d.bedsTotal, 0);
    const occupiedBeds = districts.reduce((acc, d) => acc + d.bedsOccupied, 0);
    const totalDoctors = districts.reduce((acc, d) => acc + d.doctorsTotal, 0);
    const presentDoctors = districts.reduce((acc, d) => acc + d.doctorsPresent, 0);

    return {
      districts,
      hospitals,
      alerts,
      allocations,
      metrics: {
        totalDistricts: districts.length,
        criticalDistricts: districts.filter(d => d.status === 'red').length,
        warningDistricts: districts.filter(d => d.status === 'yellow').length,
        totalHospitals,
        totalPHCs,
        totalCHCs,
        totalBeds,
        occupiedBeds,
        totalDoctors,
        presentDoctors,
        vaccinationCoverage: 88.5
      }
    };
  }
}
