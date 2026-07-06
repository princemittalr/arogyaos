// AI types definitions
export interface GeminiModelConfig {
  modelName: string;
  temperature: number;
  maxOutputTokens?: number;
}

export * from './validation';
