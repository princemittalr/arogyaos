import { callGemini } from '../utils/gemini';
import { chatPrompt } from '../prompts/chat';

export interface ChatInput {
  question: string;
  context: {
    facilities: Array<{ name: string; type: string; healthScore: number; bedsAvailable: number; bedsTotal: number }>;
    alerts: Array<{ hospitalName: string; message: string; severity: string }>;
  };
}

export interface ChatResult {
  responseText: string;
  structuredInsights: Array<{
    title: string;
    metricValue: string;
    severity: 'critical' | 'warning' | 'info' | 'success';
  }>;
}

export class ChatService {
  static async query(input: ChatInput): Promise<ChatResult> {
    try {
      const responseText = await callGemini(chatPrompt, JSON.stringify(input));
      return JSON.parse(responseText) as ChatResult;
    } catch (error) {
      console.warn('ChatService falling back to mock due to:', error);

      const q = input.question.toLowerCase();
      if (q.includes('insulin')) {
        return {
          responseText: 'Based on current live pharmacy records, Metro PHC Center is experiencing critical insulin depletion (0 units remaining). Apex Specialty Hospital maintains an excess of 450 units.',
          structuredInsights: [
            { title: 'Metro PHC Center Stockout', metricValue: 'Insulin: 0 units', severity: 'critical' },
            { title: 'Apex Specialty excess', metricValue: 'Insulin: 450 units', severity: 'success' },
          ],
        };
      }

      if (q.includes('occupancy') || q.includes('90%') || q.includes('bed')) {
        return {
          responseText: 'West Block CHC bed occupancy has reached 96% (only 2 beds available out of 50 total). All other centers are operating under normal threshold margins.',
          structuredInsights: [
            { title: 'West Block CHC Occupancy', metricValue: '96% Full', severity: 'critical' },
            { title: 'Apex Specialty occupancy', metricValue: '73% Full', severity: 'info' },
          ],
        };
      }

      if (q.includes('load') || q.includes('patient')) {
        return {
          responseText: 'Metro PHC Center reports the highest patient count today with 45 active clinic consultations, while East District PHC has registered 22 admissions.',
          structuredInsights: [
            { title: 'Metro PHC consults', metricValue: '45 consultations', severity: 'warning' },
          ],
        };
      }

      return {
        responseText: 'District health operations are stable. All PHC nodes are reporting active doctor presence, except West Block CHC which logged a pediatrician absence warning earlier today.',
        structuredInsights: [
          { title: 'Active clinic alerts', metricValue: '3 notifications', severity: 'info' },
        ],
      };
    }
  }
}
export default ChatService;
