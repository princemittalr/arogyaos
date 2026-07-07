export type ReportType = 'Tabular' | 'Summary' | 'Matrix' | 'Chart' | 'Dashboard';
export type DashboardType = 'Clinical' | 'Operational' | 'Financial' | 'Executive' | 'PublicHealth';
export type WidgetType = 'Chart' | 'Table' | 'KPI' | 'Text' | 'Filter';
export type ChartType = 'Bar' | 'Line' | 'Pie' | 'Doughnut' | 'Scatter' | 'Heatmap' | 'Gauge';
export type ExportFormat = 'PDF' | 'CSV' | 'Excel' | 'JSON' | 'HTML';
export type ScheduleType = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Custom';
export type RefreshType = 'Realtime' | 'Hourly' | 'Daily' | 'Manual';
export type AggregationType = 'Sum' | 'Average' | 'Count' | 'Min' | 'Max' | 'DistinctCount';
export type MetricType = 'Absolute' | 'Percentage' | 'Ratio' | 'Currency';
export type KPICategory = 'Clinical' | 'Operational' | 'Financial' | 'PublicHealth' | 'AIGovernance';
export type ScorecardType = 'Balanced' | 'Performance' | 'Quality' | 'Compliance';
export type BenchmarkType = 'Internal' | 'External' | 'Industry' | 'Target';
export type TrendType = 'Upward' | 'Downward' | 'Stable' | 'Volatile';
export type DataQualityState = 'Valid' | 'Warning' | 'Critical' | 'Unknown';

export interface Report {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  categoryId: string;
  templateId?: string;
  status: 'Draft' | 'Published' | 'Archived';
  createdAt: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  layout: Record<string, unknown>;
}

export interface ReportCategory {
  id: string;
  name: string;
  parentId?: string;
}

export interface ReportSection {
  id: string;
  reportId: string;
  title: string;
  order: number;
}

export interface ReportWidget {
  id: string;
  sectionId: string;
  type: WidgetType;
  config: Record<string, unknown>;
}

export interface ReportFilter {
  id: string;
  reportId: string;
  field: string;
  operator: string;
  value: unknown;
}

export interface ReportParameter {
  id: string;
  name: string;
  type: string;
  required: boolean;
}

export interface ReportExecution {
  id: string;
  reportId: string;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  startedAt: string;
  completedAt?: string;
}

export interface ReportSchedule {
  id: string;
  reportId: string;
  type: ScheduleType;
  cronExpression: string;
  nextRunAt: string;
}

export interface ReportExport {
  id: string;
  executionId: string;
  format: ExportFormat;
  url: string;
  expiresAt: string;
}

export interface ReportDistribution {
  id: string;
  scheduleId: string;
  channels: string[];
  recipients: string[];
}

export interface Dashboard {
  id: string;
  name: string;
  type: DashboardType;
  layoutId: string;
  tenantId: string;
  status: 'Active' | 'Inactive';
}

export interface DashboardLayout {
  id: string;
  config: Record<string, unknown>;
}

export interface DashboardWidget {
  id: string;
  dashboardId: string;
  type: WidgetType;
  chartType?: ChartType;
  metricId?: string;
  position: Record<string, unknown>;
}

export interface DashboardFilter {
  id: string;
  dashboardId: string;
  field: string;
  value: unknown;
}

export interface DashboardView {
  id: string;
  dashboardId: string;
  userId: string;
  lastAccessedAt: string;
}

export interface DashboardSnapshot {
  id: string;
  dashboardId: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface MetricDefinition {
  id: string;
  name: string;
  type: MetricType;
  aggregation: AggregationType;
  queryId: string;
}

export interface Metric {
  id: string;
  definitionId: string;
}

export interface MetricValue {
  id: string;
  metricId: string;
  value: number;
  timestamp: string;
  dimensions: Record<string, unknown>;
}

export interface KPIDefinition {
  id: string;
  name: string;
  category: KPICategory;
  metricId: string;
  target: number;
}

export interface KPI {
  id: string;
  definitionId: string;
}

export interface ClinicalKPI extends KPI {
  patientSegment: string;
}

export interface OperationalKPI extends KPI {
  facilityId: string;
}

export interface FinancialKPI extends KPI {
  departmentId: string;
}

export interface PublicHealthKPI extends KPI {
  regionId: string;
}

export interface AIGovernanceKPI extends KPI {
  modelId: string;
}

export interface Scorecard {
  id: string;
  name: string;
  type: ScorecardType;
  kpis: string[];
}

export interface Benchmark {
  id: string;
  type: BenchmarkType;
  metricId: string;
  value: number;
  source: string;
}

export interface TrendAnalysis {
  id: string;
  metricId: string;
  type: TrendType;
  changePercentage: number;
  period: string;
}

export interface Aggregation {
  id: string;
  type: AggregationType;
  field: string;
}

export interface AnalyticsQuery {
  id: string;
  dataSourceId: string;
  statement: string;
}

export interface AnalyticsResult {
  id: string;
  queryId: string;
  data: Record<string, unknown>[];
  executionTimeMs: number;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  status: 'Active' | 'Inactive';
}

export interface DataRefresh {
  id: string;
  dataSourceId: string;
  type: RefreshType;
  lastRefreshedAt: string;
}

export interface DataLineage {
  id: string;
  metricId: string;
  sources: string[];
}

export interface DataQuality {
  id: string;
  dataSourceId: string;
  state: DataQualityState;
  score: number;
  lastCheckedAt: string;
}

export interface ExecutiveInsight {
  id: string;
  title: string;
  description: string;
  kpiId: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface ExecutiveDashboard extends Dashboard {
  insights: string[];
}
