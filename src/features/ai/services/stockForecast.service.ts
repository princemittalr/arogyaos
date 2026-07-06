import { executeAiPipeline } from '../utils/gemini';
import { stockForecastPrompt } from '../prompts/stockForecast';
import { stockForecastResultArraySchema } from '../types/validation';

export interface StockForecastInput {
  medicineName: string;
  category: string;
  quantity: number;
  minimumStock: number;
  weeklyConsumption: number;
}

export interface StockForecastResult {
  medicineName: string;
  expectedShortageDate: string;
  confidence: number;
  riskLevel: 'high' | 'medium' | 'low';
  recommendedRefillQuantity: number;
  reasoning: string;
  suggestedAction: string;
}

export class StockForecastService {
  static async getForecast(inventory: StockForecastInput[]): Promise<{ predictions: StockForecastResult[]; mode: 'live' | 'demo' | 'fallback' }> {
    const pipelineResult = await executeAiPipeline({
      systemPrompt: stockForecastPrompt,
      input: inventory,
      schema: stockForecastResultArraySchema,
      mockFallback: (inp) => {
        return inp.map((item) => {
          const daysRemaining = item.weeklyConsumption > 0 ? Math.floor(item.quantity / (item.weeklyConsumption / 7)) : 999;
          const shortageDate = new Date();
          shortageDate.setDate(shortageDate.getDate() + Math.min(daysRemaining, 180));

          let riskLevel: 'high' | 'medium' | 'low' = 'low';
          let confidence = 85;
          if (item.quantity <= item.minimumStock) {
            riskLevel = 'high';
            confidence = 94;
          } else if (item.quantity <= item.minimumStock * 1.5) {
            riskLevel = 'medium';
            confidence = 78;
          }

          return {
            medicineName: item.medicineName,
            expectedShortageDate: shortageDate.toISOString().split('T')[0],
            confidence,
            riskLevel,
            recommendedRefillQuantity: Math.max(item.minimumStock * 3 - item.quantity, 100),
            reasoning: `Consumption velocity is ${item.weeklyConsumption} units per week against safety threshold of ${item.minimumStock}.`,
            suggestedAction: `Initiate a stock request transfer of ${Math.max(item.minimumStock * 3 - item.quantity, 100)} units to maintain standard operations.`,
          };
        });
      },
      endpointName: 'stock-forecast',
    });

    return {
      predictions: pipelineResult.data,
      mode: pipelineResult.mode,
    };
  }
}
export default StockForecastService;
