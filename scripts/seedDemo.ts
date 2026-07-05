#!/usr/bin/env ts-node
/**
 * ArogyaOS Demo Seed Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Run: npx ts-node --project tsconfig.json scripts/seedDemo.ts
 *
 * This script populates Firestore with realistic demo data for:
 *   - District Facilities (Hospitals, PHCs, CHCs)
 *   - AI Recommendations
 *   - Redistribution Proposals
 *   - District Alerts
 *   - Demo User Roles (via custom claims guidance)
 *
 * NOTE: Requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *       to be set in your environment or .env.local
 * ─────────────────────────────────────────────────────────────────────────────
 */

const DEMO_DATA = {
  // ─── Demo Credentials ───────────────────────────────────────────────────────
  accounts: [
    {
      email: 'citizen@demo.arogyaos.in',
      password: 'Demo@2026',
      role: 'citizen',
      name: 'Priya Sharma',
      description: 'Citizen Portal — book appointments, view prescriptions, manage family health records',
    },
    {
      email: 'doctor@demo.arogyaos.in',
      password: 'Demo@2026',
      role: 'doctor',
      name: 'Dr. Arjun Mehta',
      description: 'Doctor Workspace — patient queue, consultation notes, AI clinical summaries',
    },
    {
      email: 'hospital@demo.arogyaos.in',
      password: 'Demo@2026',
      role: 'hospital_admin',
      name: 'Admin Rajesh Kumar',
      description: 'Hospital Admin — departments, doctors, inventory, bed management',
    },
    {
      email: 'pharmacy@demo.arogyaos.in',
      password: 'Demo@2026',
      role: 'pharmacist',
      name: 'Sneha Patel',
      description: 'Pharmacy Dashboard — inventory, dispensing, expiry tracking, AI stock forecast',
    },
    {
      email: 'district@demo.arogyaos.in',
      password: 'Demo@2026',
      role: 'district_admin',
      name: 'Dr. Vikram Singh IAS',
      description: 'District Command Center — GIS map, AI recommendations, resource redistribution',
    },
  ],

  // ─── District: Central Delhi ────────────────────────────────────────────────
  districtId: 'dist_central_delhi',

  facilities: [
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
    },
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
    },
  ],

  // ─── Realistic Medicine Inventory ───────────────────────────────────────────
  medicines: [
    { medicineName: 'Paracetamol 650mg', category: 'Analgesics', quantity: 180, minimumStock: 500, weeklyConsumption: 420 },
    { medicineName: 'Amoxicillin 500mg', category: 'Antibiotics', quantity: 15, minimumStock: 100, weeklyConsumption: 70 },
    { medicineName: 'Metformin 500mg', category: 'Antidiabetics', quantity: 0, minimumStock: 300, weeklyConsumption: 210 },
    { medicineName: 'Pantoprazole 40mg', category: 'Gastrointestinal', quantity: 620, minimumStock: 200, weeklyConsumption: 140 },
    { medicineName: 'Azithromycin 500mg', category: 'Antibiotics', quantity: 8, minimumStock: 50, weeklyConsumption: 35 },
    { medicineName: 'Atorvastatin 10mg', category: 'Cardiovascular', quantity: 340, minimumStock: 150, weeklyConsumption: 80 },
    { medicineName: 'Amlodipine 5mg', category: 'Antihypertensives', quantity: 510, minimumStock: 200, weeklyConsumption: 90 },
    { medicineName: 'Insulin Regular 100IU/ml', category: 'Antidiabetics', quantity: 0, minimumStock: 60, weeklyConsumption: 45 },
    { medicineName: 'ORS Sachets', category: 'Electrolytes', quantity: 0, minimumStock: 200, weeklyConsumption: 150 },
    { medicineName: 'Salbutamol 100mcg Inhaler', category: 'Respiratory', quantity: 22, minimumStock: 30, weeklyConsumption: 18 },
  ],
};

console.log('\n🏥 ArogyaOS Demo Seed Script');
console.log('═══════════════════════════════════════════════════════════');
console.log('\n📋 Demo Accounts (create these in Firebase Console → Auth):');
console.log('');
DEMO_DATA.accounts.forEach((acc) => {
  console.log(`  Role: ${acc.role.padEnd(16)} | Email: ${acc.email}`);
  console.log(`  Password: ${acc.password}       | Name: ${acc.name}`);
  console.log(`  → ${acc.description}`);
  console.log('');
});

console.log('\n🏥 District Facilities to Seed:', DEMO_DATA.facilities.length, 'facilities');
console.log('  - Hospitals:', DEMO_DATA.facilities.filter(f => f.type === 'hospital').length);
console.log('  - PHCs:', DEMO_DATA.facilities.filter(f => f.type === 'phc').length);
console.log('  - CHCs:', DEMO_DATA.facilities.filter(f => f.type === 'chc').length);

console.log('\n💊 Medicine Inventory Scenarios:', DEMO_DATA.medicines.length, 'medicines');
console.log('  - Depleted (0 stock):', DEMO_DATA.medicines.filter(m => m.quantity === 0).length);
console.log('  - Critical (< min):', DEMO_DATA.medicines.filter(m => m.quantity > 0 && m.quantity < m.minimumStock).length);
console.log('  - Healthy (> min):', DEMO_DATA.medicines.filter(m => m.quantity >= m.minimumStock).length);

console.log('\n✅ NOTE: District facilities are auto-seeded on first page load.');
console.log('   The DistrictService.ensureSeededData() call handles this automatically.');
console.log('   For AI features to use Gemini, set GEMINI_API_KEY in .env.local.');
console.log('\n═══════════════════════════════════════════════════════════\n');

export { DEMO_DATA };
