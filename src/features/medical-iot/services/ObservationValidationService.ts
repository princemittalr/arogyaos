import { Observation } from '../types';

export class ObservationValidationService {
  async validateRange(observation: Observation): Promise<boolean> {
    throw new Error('Not implemented');
  }

  async validateTimestamp(observation: Observation): Promise<boolean> {
    throw new Error('Not implemented');
  }

  async validateQuality(observation: Observation): Promise<boolean> {
    throw new Error('Not implemented');
  }

  async validateConfidence(observation: Observation): Promise<boolean> {
    throw new Error('Not implemented');
  }
}
