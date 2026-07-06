import { doc, getDoc, getDocs, collection, query, where, writeBatch, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { DistrictProfileDocument } from '@/firebase/types';
import {
  validateDoc,
  districtFacilitySchema,
  aiRecommendationSchema,
  redistributionProposalSchema,
  districtAlertSchema,
} from '@/firebase/validation';

export interface DistrictFacility {
  facilityId: string;
  name: string;
  type: 'hospital' | 'phc' | 'chc';
  healthScore: number;
  status: 'green' | 'yellow' | 'red';
  bedsAvailable: number;
  bedsTotal: number;
  doctorsPresent: number;
  doctorsTotal: number;
  patientsCount: number;
  lat: number;
  lng: number;
  districtId: string;
}

export interface AIRecommendation {
  recId: string;
  districtId: string;
  type: 'medicine_shortage' | 'patient_surge' | 'doctor_shortage' | 'bed_shortage' | 'disease_trend' | 'critical_hospital' | 'redistribution';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  suggestedAction: string;
  timestamp: string;
  status: 'pending' | 'reviewed';
}

export interface RedistributionProposal {
  proposalId: string;
  districtId: string;
  sourceHospitalId: string;
  sourceHospitalName: string;
  targetHospitalId: string;
  targetHospitalName: string;
  itemType: 'medicine' | 'equipment' | 'staff';
  itemId: string;
  itemName: string;
  quantity: number;
  expectedImpact: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
}

export interface DistrictAlert {
  alertId: string;
  districtId: string;
  hospitalName: string;
  type: 'over_capacity' | 'medicine_shortage' | 'equipment_failure' | 'doctor_shortage' | 'emergency_cases';
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
}

export interface DistrictBedStats {
  available: number;
  occupied: number;
  icu: { available: number; total: number };
  emergency: { available: number; total: number };
  private: { available: number; total: number };
  general: { available: number; total: number };
}

export interface DistrictDoctorAttendanceStats {
  present: number;
  absent: number;
  onLeave: number;
  departments: Array<{ name: string; present: number; total: number }>;
}

export class DistrictService {
  static async getProfile(districtId: string): Promise<DistrictProfileDocument> {
    return {
      uid: 'dist_admin_uid',
      districtId,
      districtName: 'Central Delhi',
      state: 'Delhi',
    };
  }

  static async getFacilities(districtId: string): Promise<DistrictFacility[]> {
    await this.ensureSeededData(districtId);
    const q = query(collection(db, 'district_facilities'), where('districtId', '==', districtId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as DistrictFacility);
  }

  static async getRecommendations(districtId: string): Promise<AIRecommendation[]> {
    await this.ensureSeededData(districtId);
    const q = query(collection(db, 'district_recommendations'), where('districtId', '==', districtId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as AIRecommendation);
  }

  static async getRedistributionProposals(districtId: string): Promise<RedistributionProposal[]> {
    await this.ensureSeededData(districtId);
    const q = query(collection(db, 'district_redistributions'), where('districtId', '==', districtId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as RedistributionProposal);
  }

  static async resolveProposal(proposalId: string, action: 'approve' | 'reject'): Promise<void> {
    const docRef = doc(db, 'district_redistributions', proposalId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Proposal not found.');
    }
    const currentProposal = docSnap.data() as RedistributionProposal;
    const updatedProposal = {
      ...currentProposal,
      status: (action === 'approve' ? 'approved' : 'rejected') as 'approved' | 'rejected',
    };

    validateDoc(redistributionProposalSchema, updatedProposal);

    await updateDoc(docRef, {
      status: updatedProposal.status,
    });
  }

  static async resolveRecommendation(recId: string): Promise<void> {
    const docRef = doc(db, 'district_recommendations', recId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error('Recommendation not found.');
    }
    const currentRecommendation = docSnap.data() as AIRecommendation;
    const updatedRecommendation = {
      ...currentRecommendation,
      status: 'reviewed' as const,
    };

    validateDoc(aiRecommendationSchema, updatedRecommendation);

    await updateDoc(docRef, {
      status: updatedRecommendation.status,
    });
  }

  static async getAlerts(districtId: string): Promise<DistrictAlert[]> {
    await this.ensureSeededData(districtId);
    const q = query(collection(db, 'district_alerts'), where('districtId', '==', districtId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as DistrictAlert);
  }

  static async getBedStats(districtId: string): Promise<DistrictBedStats> {
    // Aggregated dynamically from facilities
    const facilities = await this.getFacilities(districtId);
    let available = 0;
    let total = 0;
    facilities.forEach((f) => {
      available += f.bedsAvailable;
      total += f.bedsTotal;
    });

    return {
      available,
      occupied: total - available,
      icu: { available: Math.floor(available * 0.1), total: Math.floor(total * 0.1) },
      emergency: { available: Math.floor(available * 0.15), total: Math.floor(total * 0.15) },
      private: { available: Math.floor(available * 0.25), total: Math.floor(total * 0.25) },
      general: { available: Math.floor(available * 0.5), total: Math.floor(total * 0.5) },
    };
  }

  static async getDoctorAttendanceStats(districtId: string): Promise<DistrictDoctorAttendanceStats> {
    const facilities = await this.getFacilities(districtId);
    let present = 0;
    let total = 0;
    facilities.forEach((f) => {
      present += f.doctorsPresent;
      total += f.doctorsTotal;
    });

    const absent = Math.floor((total - present) * 0.7);
    const onLeave = total - present - absent;

    return {
      present,
      absent,
      onLeave,
      departments: [
        { name: 'Emergency', present: Math.floor(present * 0.2), total: Math.floor(total * 0.2) },
        { name: 'Pediatrics', present: Math.floor(present * 0.25), total: Math.floor(total * 0.25) },
        { name: 'General Medicine', present: Math.floor(present * 0.35), total: Math.floor(total * 0.35) },
        { name: 'ICU', present: Math.floor(present * 0.2), total: Math.floor(total * 0.2) },
      ],
    };
  }

  static async ensureSeededData(districtId: string): Promise<void> {
    const checkQuery = query(collection(db, 'district_facilities'), where('districtId', '==', districtId));
    const checkSnap = await getDocs(checkQuery);
    if (!checkSnap.empty) return;

    const batch = writeBatch(db);

    // 1. Seed Facilities
    const facilities: DistrictFacility[] = [
      {
        facilityId: 'facility_city_gen',
        name: 'City General Hospital',
        type: 'hospital',
        healthScore: 92,
        status: 'green',
        bedsAvailable: 85,
        bedsTotal: 300,
        doctorsPresent: 45,
        doctorsTotal: 50,
        patientsCount: 215,
        lat: 28.6139,
        lng: 77.209,
        districtId,
      },
      {
        facilityId: 'facility_metro_phc',
        name: 'Metro PHC Center',
        type: 'phc',
        healthScore: 68,
        status: 'yellow',
        bedsAvailable: 4,
        bedsTotal: 15,
        doctorsPresent: 2,
        doctorsTotal: 4,
        patientsCount: 45,
        lat: 28.6304,
        lng: 77.2177,
        districtId,
      },
      {
        facilityId: 'facility_chc_west',
        name: 'West Block CHC',
        type: 'chc',
        healthScore: 45,
        status: 'red',
        bedsAvailable: 2,
        bedsTotal: 50,
        doctorsPresent: 3,
        doctorsTotal: 10,
        patientsCount: 78,
        lat: 28.5984,
        lng: 77.1852,
        districtId,
      },
      {
        facilityId: 'facility_apex_hosp',
        name: 'Apex Super Specialty Hospital',
        type: 'hospital',
        healthScore: 95,
        status: 'green',
        bedsAvailable: 120,
        bedsTotal: 450,
        doctorsPresent: 82,
        doctorsTotal: 90,
        patientsCount: 310,
        lat: 28.6253,
        lng: 77.2345,
        districtId,
      },
      {
        facilityId: 'facility_east_phc',
        name: 'East District PHC',
        type: 'phc',
        healthScore: 82,
        status: 'green',
        bedsAvailable: 10,
        bedsTotal: 20,
        doctorsPresent: 3,
        doctorsTotal: 3,
        patientsCount: 22,
        lat: 28.6198,
        lng: 77.2412,
        districtId,
      },
      {
        facilityId: 'facility_north_phc',
        name: 'North Sector PHC',
        type: 'phc',
        healthScore: 71,
        status: 'yellow',
        bedsAvailable: 6,
        bedsTotal: 15,
        doctorsPresent: 2,
        doctorsTotal: 3,
        patientsCount: 31,
        lat: 28.6412,
        lng: 77.2215,
        districtId,
      },
      {
        facilityId: 'facility_chc_south',
        name: 'South Block CHC',
        type: 'chc',
        healthScore: 74,
        status: 'yellow',
        bedsAvailable: 12,
        bedsTotal: 40,
        doctorsPresent: 5,
        doctorsTotal: 7,
        patientsCount: 38,
        lat: 28.5921,
        lng: 77.2042,
        districtId,
      },
      {
        facilityId: 'facility_central_hosp',
        name: 'Central District Hospital',
        type: 'hospital',
        healthScore: 78,
        status: 'yellow',
        bedsAvailable: 28,
        bedsTotal: 200,
        doctorsPresent: 22,
        doctorsTotal: 30,
        patientsCount: 172,
        lat: 28.6325,
        lng: 77.2195,
        districtId,
      },
    ];

    facilities.forEach((f) => {
      validateDoc(districtFacilitySchema, f);
      batch.set(doc(db, 'district_facilities', f.facilityId), f);
    });

    // 2. Seed AI Recommendations
    const recs: AIRecommendation[] = [
      {
        recId: 'rec_med_short',
        districtId,
        type: 'medicine_shortage',
        title: 'Paracetamol Shortage Predicted',
        description: 'West Block CHC is expected to exhaust Paracetamol 650mg stock in 48 hours due to a local viral fever outbreak.',
        confidence: 94,
        priority: 'high',
        suggestedAction: 'Transfer 500 units from Apex Super Specialty Hospital (excess stock: 3,400 units).',
        timestamp: new Date().toISOString(),
        status: 'pending',
      },
      {
        recId: 'rec_surge',
        districtId,
        type: 'patient_surge',
        title: 'Gastroenteritis Patient Surge Warning',
        description: 'East District PHC shows a 45% week-over-week increase in gastrointestinal admissions; water quality anomaly detected.',
        confidence: 88,
        priority: 'medium',
        suggestedAction: 'Dispatch emergency hydration kits and assign 1 additional nurse practitioner.',
        timestamp: new Date().toISOString(),
        status: 'pending',
      },
      {
        recId: 'rec_doc_short',
        districtId,
        type: 'doctor_shortage',
        title: 'Anesthesiologist Shortage Alert',
        description: 'City General Hospital has only 1 active anesthesiologist present due to leave logs. 3 scheduled procedures delayed.',
        confidence: 91,
        priority: 'high',
        suggestedAction: 'Reassign anesthesiologist from Apex Super Specialty on temporary duty shift.',
        timestamp: new Date().toISOString(),
        status: 'pending',
      },
      {
        recId: 'rec_bed_short',
        districtId,
        type: 'bed_shortage',
        title: 'Critical ICU Capacity Limit',
        description: 'West Block CHC ICU occupancy has reached 100%. Emergency ward overflow protocols triggered.',
        confidence: 95,
        priority: 'high',
        suggestedAction: 'Redirect incoming critical cases to City General Hospital.',
        timestamp: new Date().toISOString(),
        status: 'pending',
      },
    ];

    recs.forEach((r) => {
      validateDoc(aiRecommendationSchema, r);
      batch.set(doc(db, 'district_recommendations', r.recId), r);
    });

    // 3. Seed Redistribution Proposals
    const proposals: RedistributionProposal[] = [
      {
        proposalId: 'prop_para_transfer',
        districtId,
        sourceHospitalId: 'facility_apex_hosp',
        sourceHospitalName: 'Apex Super Specialty Hospital',
        targetHospitalId: 'facility_chc_west',
        targetHospitalName: 'West Block CHC',
        itemType: 'medicine',
        itemId: 'med_paracetamol_650mg',
        itemName: 'Paracetamol 650mg',
        quantity: 500,
        expectedImpact: 'Extends West Block CHC stock coverage by 14 days, preventing stock-out.',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        proposalId: 'prop_ppe_transfer',
        districtId,
        sourceHospitalId: 'facility_city_gen',
        sourceHospitalName: 'City General Hospital',
        targetHospitalId: 'facility_metro_phc',
        targetHospitalName: 'Metro PHC Center',
        itemType: 'equipment',
        itemId: 'eq_ppe_kits',
        itemName: 'PPE Protective Coveralls',
        quantity: 150,
        expectedImpact: 'Ensures clinical staff safety during local viral screening runs.',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ];

    proposals.forEach((p) => {
      validateDoc(redistributionProposalSchema, p);
      batch.set(doc(db, 'district_redistributions', p.proposalId), p);
    });

    // 4. Seed Alerts
    const alerts: DistrictAlert[] = [
      {
        alertId: 'alert_capacity',
        districtId,
        hospitalName: 'West Block CHC',
        type: 'over_capacity',
        message: 'Active admissions exceed registered operational bed capacity by 12%.',
        severity: 'critical',
        timestamp: new Date().toISOString(),
      },
      {
        alertId: 'alert_shortage',
        districtId,
        hospitalName: 'Metro PHC Center',
        type: 'medicine_shortage',
        message: 'Oral Rehydration Salts (ORS) formula stock completely depleted.',
        severity: 'critical',
        timestamp: new Date().toISOString(),
      },
      {
        alertId: 'alert_doctors',
        districtId,
        hospitalName: 'West Block CHC',
        type: 'doctor_shortage',
        message: 'No pediatricians present on shift duty today.',
        severity: 'warning',
        timestamp: new Date().toISOString(),
      },
    ];

    alerts.forEach((a) => {
      validateDoc(districtAlertSchema, a);
      batch.set(doc(db, 'district_alerts', a.alertId), a);
    });

    await batch.commit();
  }
}

export default DistrictService;
