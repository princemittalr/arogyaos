export interface StockForecastResult {
  medicineId: string;
  medicineName: string;
  expectedShortageDate: string; // YYYY-MM-DD
  confidenceScore: number; // 0 to 1
  recommendedRefillQuantity: number;
  reasoning: string;
}

export interface PatientFlowForecast {
  date: string;
  predictedInflow: number;
  confidenceInterval: [number, number];
  reasoning: string;
}

export class AiService {
  static async getStockForecast(
    hospitalId: string,
    medicineId: string
  ): Promise<StockForecastResult> {
    console.log('AiService.getStockForecast placeholder triggered', { hospitalId, medicineId });
    return {
      medicineId,
      medicineName: 'Amoxicillin 500mg',
      expectedShortageDate: '2026-07-20',
      confidenceScore: 0.89,
      recommendedRefillQuantity: 1200,
      reasoning: 'Increased usage trends observed during early monsoon season matching historical records.',
    };
  }

  static async forecastPatientInflow(hospitalId: string): Promise<PatientFlowForecast[]> {
    console.log('AiService.forecastPatientInflow placeholder triggered for:', hospitalId);
    return [];
  }

  static async summarizeVoiceNotes(audioBlob: Blob): Promise<string> {
    console.log('AiService.summarizeVoiceNotes placeholder triggered with file size:', audioBlob.size);
    return 'Patient presents with symptoms of acute rhinopharyngitis. Lungs clear, throat congested. Advised steam inhalation and paracetamol 500mg as needed.';
  }
}
export default AiService;
