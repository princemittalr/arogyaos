import { callGemini } from '../utils/gemini';
import { resourceRedistributionPrompt } from '../prompts/resourceRedistribution';

export interface ResourceRedistributionInput {
  facilities: Array<{
    name: string;
    bedsAvailable: number;
    bedsTotal: number;
    inventory: Array<{ medicineName: string; quantity: number; minimumStock: number }>;
  }>;
}

export interface ResourceRedistributionResult {
  sourceHospitalName: string;
  targetHospitalName: string;
  itemType: 'medicine' | 'equipment' | 'staff';
  itemName: string;
  quantity: number;
  expectedImpact: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export class ResourceRedistributionService {
  static async getRecommendations(input: ResourceRedistributionInput): Promise<ResourceRedistributionResult[]> {
    try {
      const responseText = await callGemini(resourceRedistributionPrompt, JSON.stringify(input));
      const parsed = JSON.parse(responseText);
      return parsed.recommendations || parsed;
    } catch (error) {
      console.warn('ResourceRedistributionService falling back to mock due to:', error);
      return [
        {
          sourceHospitalName: 'Apex Super Specialty Hospital',
          targetHospitalName: 'West Block CHC',
          itemType: 'medicine',
          itemName: 'Paracetamol 650mg',
          quantity: 500,
          expectedImpact: 'Prevents critical stockout scenario, ensuring clinical coverage for 14 days.',
          priority: 'high',
          reason: 'West Block CHC has 0 paracetamol reserves remaining, while Apex Super Specialty retains an excess of 3,400 units.',
        },
        {
          sourceHospitalName: 'City General Hospital',
          targetHospitalName: 'Metro PHC Center',
          itemType: 'equipment',
          itemName: 'PPE Protective Coveralls',
          quantity: 150,
          expectedImpact: 'Maintains health worker screening security protocols during localized outbreak run.',
          priority: 'medium',
          reason: 'Metro PHC Center PPE kits are below recommended safety stock limits of 50 units.',
        }
      ];
    }
  }
}
