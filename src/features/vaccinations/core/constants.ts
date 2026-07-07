import { VaccineCategory, VaccinationStatus } from '../types';

export const VACCINE_CATEGORIES: Record<VaccineCategory, string> = {
  childhood: 'Childhood Immunization',
  adult: 'Adult Immunization',
  pregnancy: 'Pregnancy Immunization',
  occupational: 'Occupational Vaccination',
  travel: 'Travel Vaccination',
  booster: 'Booster Doses',
  covid: 'COVID-19 Vaccination',
  influenza: 'Influenza (Flu)',
  hepatitis: 'Hepatitis Prevention',
  hpv: 'HPV Prevention',
};

export const VACCINATION_STATUSES: Record<VaccinationStatus, string> = {
  scheduled: 'Scheduled',
  due: 'Due',
  administered: 'Administered',
  verified: 'Verified',
  delayed: 'Delayed',
  missed: 'Missed',
  cancelled: 'Cancelled',
  refused: 'Refused',
  expired: 'Expired',
};

export interface VaccineDefinition {
  code: string;
  name: string;
  diseaseTargeted: string;
  category: VaccineCategory;
  totalDoses: number;
  recommendedAge?: string;
  manufacturerDefault?: string;
}

export const VACCINE_DEFINITIONS: VaccineDefinition[] = [
  {
    code: 'BCG',
    name: 'BCG (Bacillus Calmette-Guérin)',
    diseaseTargeted: 'Tuberculosis',
    category: 'childhood',
    totalDoses: 1,
    recommendedAge: 'At birth',
    manufacturerDefault: 'Serum Institute of India',
  },
  {
    code: 'HEPB',
    name: 'Hepatitis B Vaccine',
    diseaseTargeted: 'Hepatitis B',
    category: 'hepatitis',
    totalDoses: 3,
    recommendedAge: '0, 1, and 6 months',
    manufacturerDefault: 'GlaxoSmithKline',
  },
  {
    code: 'DPT',
    name: 'DPT (Diphtheria, Pertussis, Tetanus)',
    diseaseTargeted: 'Diphtheria, Pertussis, Tetanus',
    category: 'childhood',
    totalDoses: 3,
    recommendedAge: '6, 10, 14 weeks',
    manufacturerDefault: 'Sanofi Pasteur',
  },
  {
    code: 'MMR',
    name: 'MMR (Measles, Mumps, Rubella)',
    diseaseTargeted: 'Measles, Mumps, Rubella',
    category: 'childhood',
    totalDoses: 2,
    recommendedAge: '9 months, 15 months',
    manufacturerDefault: 'Merck & Co.',
  },
  {
    code: 'HPV',
    name: 'HPV (Human Papillomavirus)',
    diseaseTargeted: 'Cervical Cancer / HPV infection',
    category: 'hpv',
    totalDoses: 2,
    recommendedAge: '9-14 years',
    manufacturerDefault: 'MSD',
  },
  {
    code: 'COVID19',
    name: 'COVID-19 Vaccine (mRNA / Viral Vector)',
    diseaseTargeted: 'COVID-19',
    category: 'covid',
    totalDoses: 2,
    recommendedAge: '18+ years',
    manufacturerDefault: 'AstraZeneca',
  },
  {
    code: 'FLU',
    name: 'Annual Influenza Vaccine',
    diseaseTargeted: 'Influenza',
    category: 'influenza',
    totalDoses: 1,
    recommendedAge: 'Annually',
    manufacturerDefault: 'Abbott',
  },
  {
    code: 'YF',
    name: 'Yellow Fever Vaccine',
    diseaseTargeted: 'Yellow Fever',
    category: 'travel',
    totalDoses: 1,
    recommendedAge: '10 days before travel',
    manufacturerDefault: 'Sanofi Pasteur',
  },
  {
    code: 'TT',
    name: 'Tetanus Toxoid',
    diseaseTargeted: 'Tetanus',
    category: 'pregnancy',
    totalDoses: 2,
    recommendedAge: 'Early in pregnancy',
    manufacturerDefault: 'Biological E',
  },
];
