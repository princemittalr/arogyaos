import { PrescriptionStatus } from '../types';

export const PRESCRIPTION_STATUS: Record<string, PrescriptionStatus> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  SUSPENDED: 'Suspended',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
} as const;

export const PRESCRIPTION_STATUSES = Object.values(PRESCRIPTION_STATUS);

export const FORMULATION_TYPES = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'syrup', label: 'Syrup' },
  { value: 'injection', label: 'Injection' },
  { value: 'inhaler', label: 'Inhaler' },
  { value: 'ointment', label: 'Ointment' },
] as const;

export const DOSE_UNITS = [
  { value: 'pill', label: 'Pill(s)' },
  { value: 'ml', label: 'mL' },
  { value: 'mg', label: 'mg' },
  { value: 'drop', label: 'Drop(s)' },
  { value: 'puff', label: 'Puff(s)' },
] as const;

export const TIMING_OPTIONS = [
  { value: 'before-meal', label: 'Before Meal' },
  { value: 'after-meal', label: 'After Meal' },
  { value: 'with-meal', label: 'With Meal' },
  { value: 'empty-stomach', label: 'On Empty Stomach' },
] as const;

export const RECURRENCE_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'alternate-days', label: 'Alternate Days' },
] as const;
