import { z } from 'zod';
import { ALL_ROLES } from '@/config/roles';

// 1. User Validation Schema
export const userDocSchema = z.object({
  uid: z.string().min(1, 'UID is required'),
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(ALL_ROLES as [string, ...string[]]),
  status: z.enum(['active', 'inactive']),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

// 2. Patient Profile Schema
export const patientProfileSchema = z.object({
  uid: z.string().min(1, 'UID is required'),
  age: z.number().int().nonnegative('Age must be a non-negative integer'),
  gender: z.enum(['male', 'female', 'other']),
  bloodGroup: z.string(),
  allergies: z.array(z.string()),
  emergencyContact: z.string(),
  familyMembers: z.array(
    z.object({
      fullName: z.string().min(2, 'Name must be at least 2 characters'),
      relation: z.string().min(1, 'Relation is required'),
      age: z.number().int().nonnegative('Age must be non-negative'),
    })
  ),
});

// 3. Doctor Profile Schema
export const doctorProfileSchema = z.object({
  uid: z.string().min(1, 'UID is required'),
  hospitalId: z.string(),
  departmentId: z.string(),
  specialization: z.string(),
  qualification: z.string(),
  consultationFee: z.number().nonnegative('Consultation fee must be non-negative'),
  availability: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid start time format (HH:MM)'),
      endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid end time format (HH:MM)'),
    })
  ),
});

// 4. Hospital Profile Schema
export const hospitalProfileSchema = z.object({
  uid: z.string().min(1, 'Owner UID is required'),
  hospitalId: z.string().min(1, 'Hospital ID is required'),
  hospitalName: z.string().min(2, 'Hospital name is required'),
  districtId: z.string(),
  address: z.string(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  emergencyThreshold: z.number().int().nonnegative().optional(),
  generalThreshold: z.number().int().nonnegative().optional(),
});

// 5. District Profile Schema
export const districtProfileSchema = z.object({
  uid: z.string().min(1, 'Owner UID is required'),
  districtId: z.string().min(1, 'District ID is required'),
  districtName: z.string().min(2, 'District name is required'),
  state: z.string(),
});

// 6. Appointment Schema
export const appointmentSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  hospitalId: z.string().min(1, 'Hospital ID is required'),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  appointmentTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](\s?[AP]M)?$/i, 'Invalid time format'),
  status: z.enum(['scheduled', 'checked_in', 'completed', 'cancelled']),
  tokenNumber: z.number().int().positive(),
  createdAt: z.any(),
  diagnosis: z.string().optional(),
  symptoms: z.string().optional(),
  clinicalNotes: z.string().optional(),
});

// 7. Prescription Schema
export const prescriptionSchema = z.object({
  recordId: z.string().min(1, 'Prescription ID is required'),
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  medicines: z.array(
    z.object({
      medicineId: z.string().min(1, 'Medicine ID is required'),
      name: z.string().min(1, 'Medicine name is required'),
      dosage: z.string().min(1, 'Dosage is required'),
      frequency: z.string().min(1, 'Frequency is required'),
      duration: z.number().int().positive('Duration must be at least 1 day'),
    })
  ),
  labTests: z.array(z.string()),
  createdAt: z.any(),
});

// 8. Inventory Item Schema
export const inventoryItemSchema = z.object({
  inventoryId: z.string().min(1, 'Inventory ID is required'),
  hospitalId: z.string().min(1, 'Hospital ID is required'),
  medicineId: z.string().min(1, 'Medicine ID is required'),
  medicineName: z.string().min(1, 'Medicine name is required'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().int().nonnegative('Quantity cannot be negative'),
  minimumStock: z.number().int().nonnegative('Minimum stock cannot be negative'),
  batchNumber: z.string().min(1, 'Batch number is required'),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  supplier: z.string().min(1, 'Supplier is required'),
  status: z.enum(['active', 'inactive']).optional(),
  createdAt: z.any().optional(),
});

// 9. Lab Report Schema
export const labReportSchema = z.object({
  id: z.string().min(1, 'Report ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  reportName: z.string().min(1, 'Report name is required'),
  labName: z.string().min(1, 'Lab name is required'),
  testDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  status: z.string().min(1, 'Status is required'),
  results: z.record(z.string(), z.string()),
});

// 10. Notification Schema
export const notificationSchema = z.object({
  id: z.string().min(1, 'Notification ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  time: z.string().optional(),
  read: z.boolean(),
  type: z.enum(['info', 'success', 'warning', 'error']).optional(),
  createdAt: z.any().optional(),
});

// 11. District Facility Schema
export const districtFacilitySchema = z.object({
  facilityId: z.string().min(1, 'Facility ID is required'),
  name: z.string().min(1, 'Facility name is required'),
  type: z.enum(['hospital', 'phc', 'chc']),
  healthScore: z.number().min(0).max(100),
  status: z.enum(['green', 'yellow', 'red']),
  bedsAvailable: z.number().int().nonnegative(),
  bedsTotal: z.number().int().positive(),
  doctorsPresent: z.number().int().nonnegative(),
  doctorsTotal: z.number().int().positive(),
  patientsCount: z.number().int().nonnegative(),
  lat: z.number(),
  lng: z.number(),
  districtId: z.string().min(1, 'District ID is required'),
});

// 12. AI Recommendation Schema
export const aiRecommendationSchema = z.object({
  recId: z.string().min(1, 'Recommendation ID is required'),
  districtId: z.string().min(1, 'District ID is required'),
  type: z.enum([
    'medicine_shortage',
    'patient_surge',
    'doctor_shortage',
    'bed_shortage',
    'disease_trend',
    'critical_hospital',
    'redistribution',
  ]),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  confidence: z.number().min(0).max(100),
  priority: z.enum(['high', 'medium', 'low']),
  suggestedAction: z.string().min(1, 'Suggested action is required'),
  timestamp: z.string().min(1, 'Timestamp is required'),
  status: z.enum(['pending', 'reviewed']),
});

// 13. Redistribution Proposal Schema
export const redistributionProposalSchema = z.object({
  proposalId: z.string().min(1, 'Proposal ID is required'),
  districtId: z.string().min(1, 'District ID is required'),
  sourceHospitalId: z.string().min(1, 'Source hospital ID is required'),
  sourceHospitalName: z.string().min(1, 'Source hospital name is required'),
  targetHospitalId: z.string().min(1, 'Target hospital ID is required'),
  targetHospitalName: z.string().min(1, 'Target hospital name is required'),
  itemType: z.enum(['medicine', 'equipment', 'staff']),
  itemId: z.string().min(1, 'Item ID is required'),
  itemName: z.string().min(1, 'Item name is required'),
  quantity: z.number().int().positive(),
  expectedImpact: z.string().min(1, 'Expected impact is required'),
  status: z.enum(['pending', 'approved', 'rejected', 'completed']),
  createdAt: z.string().min(1, 'Created at timestamp is required'),
});

// 14. District Alert Schema
export const districtAlertSchema = z.object({
  alertId: z.string().min(1, 'Alert ID is required'),
  districtId: z.string().min(1, 'District ID is required'),
  hospitalName: z.string().min(1, 'Hospital name is required'),
  type: z.enum(['over_capacity', 'medicine_shortage', 'equipment_failure', 'doctor_shortage', 'emergency_cases']),
  message: z.string().min(1, 'Message is required'),
  severity: z.enum(['critical', 'warning', 'info']),
  timestamp: z.string().min(1, 'Timestamp is required'),
});

// Helper validation runner
export function validateDoc<T>(schema: z.Schema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errorDetails = result.error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new Error(`Data Integrity Violation: ${errorDetails}`);
  }
  return result.data;
}
