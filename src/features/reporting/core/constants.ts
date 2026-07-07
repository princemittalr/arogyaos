export const REPORT_TYPES = [
  'Tabular',
  'Summary',
  'Matrix',
  'Chart',
  'Dashboard'
] as const;

export const DASHBOARD_TYPES = [
  'Clinical',
  'Operational',
  'Financial',
  'Executive',
  'PublicHealth'
] as const;

export const WIDGET_TYPES = [
  'Chart',
  'Table',
  'KPI',
  'Text',
  'Filter'
] as const;

export const CHART_TYPES = [
  'Bar',
  'Line',
  'Pie',
  'Doughnut',
  'Scatter',
  'Heatmap',
  'Gauge'
] as const;

export const EXPORT_FORMATS = [
  'PDF',
  'CSV',
  'Excel',
  'JSON',
  'HTML'
] as const;

export const SCHEDULE_TYPES = [
  'Daily',
  'Weekly',
  'Monthly',
  'Quarterly',
  'Custom'
] as const;

export const REFRESH_TYPES = [
  'Realtime',
  'Hourly',
  'Daily',
  'Manual'
] as const;

export const AGGREGATION_TYPES = [
  'Sum',
  'Average',
  'Count',
  'Min',
  'Max',
  'DistinctCount'
] as const;

export const METRIC_TYPES = [
  'Absolute',
  'Percentage',
  'Ratio',
  'Currency'
] as const;

export const KPI_CATEGORIES = [
  'Clinical',
  'Operational',
  'Financial',
  'PublicHealth',
  'AIGovernance'
] as const;

export const SCORECARD_TYPES = [
  'Balanced',
  'Performance',
  'Quality',
  'Compliance'
] as const;

export const BENCHMARK_TYPES = [
  'Internal',
  'External',
  'Industry',
  'Target'
] as const;

export const TREND_TYPES = [
  'Upward',
  'Downward',
  'Stable',
  'Volatile'
] as const;

export const DATA_QUALITY_STATES = [
  'Valid',
  'Warning',
  'Critical',
  'Unknown'
] as const;
