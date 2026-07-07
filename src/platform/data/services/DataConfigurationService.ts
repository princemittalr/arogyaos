export class DataConfigurationService {
  private static instance: DataConfigurationService;
  private constructor() {}
  public static getInstance(): DataConfigurationService {
    if (!DataConfigurationService.instance) {
      DataConfigurationService.instance = new DataConfigurationService();
    }
    return DataConfigurationService.instance;
  }
  public async getGlobalConfig(): Promise<Record<string, unknown>> { return {}; }
}
