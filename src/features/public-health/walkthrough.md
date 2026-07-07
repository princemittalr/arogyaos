# Walkthrough: Public Health & Epidemiology Lifecycle

## 1. Disease Report & Case Investigation
A local clinic submits a `DiseaseReport` via `useDiseaseReporting`. The `DiseaseCaseService` creates an index `DiseaseCase`. If criteria are met, an `Investigation` is launched.

## 2. Outbreak Detection
The `OutbreakDetectionService` monitors active `DiseaseCases`. If geographical thresholds are exceeded, an `Outbreak` is declared and an `OutbreakCluster` is established.

## 3. Contact Tracing
Field epidemiologists use the Offline-capable `ContactTracingBoard` to record `ExposureEvents` and `Contacts` linked to the index case, aggressively containing the cluster.

## 4. Campaigns & Screening
A targeted `PublicHealthCampaign` is created via `CampaignService`. Simultaneously, a `ScreeningProgram` is initiated for vulnerable `DemographicGroups`.

## 5. Population Analytics & Forecasting
As data aggregates, the `PopulationAnalyticsService` compiles district and national `MorbidityStatistics`. The `ForecastingService` yields abstract risk projections for executives.

## 6. Closure & Audit
When the cluster is contained, the `Outbreak` is closed. Every major transition (e.g., `OutbreakDetected`, `CampaignStarted`) is synchronously published to the global `TimelineIntegrationService` and `PublicHealthAudit` ledger.
