export const MODALITIES = [
  { code: 'XR', name: 'X-Ray' },
  { code: 'MR', name: 'Magnetic Resonance Imaging (MRI)' },
  { code: 'CT', name: 'Computed Tomography (CT)' },
  { code: 'US', name: 'Ultrasound (US)' },
  { code: 'PET', name: 'Positron Emission Tomography (PET)' },
  { code: 'MG', name: 'Mammography (MG)' },
  { code: 'NM', name: 'Nuclear Medicine (NM)' },
  { code: 'OT', name: 'Other' },
] as const;

export const BODY_SITES = [
  'Chest',
  'Abdomen',
  'Pelvis',
  'Brain/Head',
  'Spine',
  'Knee',
  'Shoulder',
  'Cardiac',
  'Breast',
  'Extremity',
  'Other',
] as const;

export interface StudyTemplate {
  modality: string;
  bodySite: string;
  defaultFindings: string;
  defaultImpression: string;
}

export const IMAGING_TEMPLATES: Record<string, StudyTemplate> = {
  'Chest X-Ray': {
    modality: 'XR',
    bodySite: 'Chest',
    defaultFindings: 'The lungs are clear. There is no pleural effusion or pneumothorax. Cardiomediastinal contour is normal. Bony structures and soft tissues are intact.',
    defaultImpression: 'No active cardiopulmonary disease.',
  },
  'Brain MRI': {
    modality: 'MR',
    bodySite: 'Brain/Head',
    defaultFindings: 'Brain parenchyma shows normal signal intensity without evidence of acute infarction, hemorrhage, or mass effect. Ventricles and sulci are within normal limits for age. No abnormal extra-axial fluid collections.',
    defaultImpression: 'Normal Brain MRI.',
  },
  'CT Abdomen': {
    modality: 'CT',
    bodySite: 'Abdomen',
    defaultFindings: 'Liver, spleen, pancreas, kidneys, and adrenal glands are unremarkable. No free fluid or air in the peritoneum. Bowel loops are normal in caliber. No lymphadenopathy.',
    defaultImpression: 'Unremarkable CT scan of the abdomen.',
  },
};
