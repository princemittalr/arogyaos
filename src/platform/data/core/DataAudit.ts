export class DataAudit {
  private static instance: DataAudit;

  private constructor() {}

  public static getInstance(): DataAudit {
    if (!DataAudit.instance) DataAudit.instance = new DataAudit();
    return DataAudit.instance;
  }

  private logEvent(action: string, metadata: Record<string, unknown>): void {
    console.log(`[Audit] ${action}`, metadata);
  }

  public logMasterDataUpdated(id: string, diff: Record<string, unknown>): void {
    this.logEvent('masterdata:updated', { id, diff });
  }

  public logReferenceDataUpdated(id: string, diff: Record<string, unknown>): void {
    this.logEvent('referencedata:updated', { id, diff });
  }

  public logCatalogUpdated(id: string, diff: Record<string, unknown>): void {
    this.logEvent('catalog:updated', { id, diff });
  }

  public logDatasetUpdated(id: string, diff: Record<string, unknown>): void {
    this.logEvent('dataset:updated', { id, diff });
  }

  public logLineageUpdated(id: string, diff: Record<string, unknown>): void {
    this.logEvent('lineage:updated', { id, diff });
  }

  public logGovernanceUpdated(id: string, diff: Record<string, unknown>): void {
    this.logEvent('governance:updated', { id, diff });
  }

  public logQualityUpdated(id: string, diff: Record<string, unknown>): void {
    this.logEvent('quality:updated', { id, diff });
  }

  public logAnalyticsUpdated(id: string, diff: Record<string, unknown>): void {
    this.logEvent('analytics:updated', { id, diff });
  }

  public logConfigurationUpdated(id: string, diff: Record<string, unknown>): void {
    this.logEvent('configuration:updated', { id, diff });
  }
}
