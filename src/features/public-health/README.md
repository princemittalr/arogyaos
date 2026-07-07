# Enterprise Public Health, Epidemiology & Disease Surveillance

Module 14 of ArogyaOS

## Architecture
The Public Health Module manages national-scale disease tracking and outbreak management. It is strictly metadata-driven and intentionally decouples geographic visualization (Map SDKs, Heatmaps) and Machine Learning (AI Forecasting) from logistical decision-making. The system heavily leverages Zod for deeply nested epidemiological payloads (Vaccination Coverage, Demographics, Risk Assessments).

## Folder Structure
- `types/` - Core interfaces (DiseaseCase, Outbreak, ContactTracingCase, DiseaseForecast)
- `core/` - Constants, Errors, Events, and Hardening (Cache, Offline, Retry, Audit, Observability)
- `utils/` - Zod Schemas
- `repositories/` - Data access layer abstractions
- `services/` - Orchestration logic (OutbreakDetectionService, ContactTracingService, ForecastingService)
- `hooks/` - React Query abstraction
- `components/` - Structural UI shells for multiple epidemiological actors (Researchers, Executives, Field Workers)
- `pages/` - View composition

## Workflows
- **Disease Reporting Workflow**: Facility -> DiseaseReport -> DiseaseCase -> Investigation.
- **Outbreak Management**: DiseaseCase -> Cluster Detection -> Outbreak -> Contact Tracing.
- **Forecast Metadata Architecture**: Risk scaling and disease forecasts are resolved purely via abstract historical arrays and numerical thresholds, without relying on proprietary ML dependencies.

## Hardening & Integration
- **Cache**: Pre-computes fast retrieval of active outbreaks and national population analytics.
- **Offline**: Captures vital contact tracing linkages and screening metrics when field agents lose connectivity, syncing transparently upon reconnection.
- **Timeline**: Publishes immutable state transitions (e.g. `OutbreakDetected`) to Health Vault.

## Extension Guide
To integrate third-party ML forecasting SDKs or Heatmaps, create a separate UI package that strictly consumes the `useForecasting` or `usePopulationAnalytics` hooks from this module, ensuring business rules stay secure inside the `arogyaOS` core domain.
