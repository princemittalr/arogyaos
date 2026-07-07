export class OperationsConfigurationService {
  private static instance: OperationsConfigurationService;
  private constructor() {}
  public static getInstance(): OperationsConfigurationService {
    if (!OperationsConfigurationService.instance) {
      OperationsConfigurationService.instance = new OperationsConfigurationService();
    }
    return OperationsConfigurationService.instance;
  }
  public async getGlobalConfig(): Promise<Record<string, unknown>> { return {}; }
}
