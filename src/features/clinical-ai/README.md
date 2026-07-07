# Enterprise AI Clinical Decision Support System (CDSS)

Module 15 of ArogyaOS

## Architecture
The CDSS Module is a highly secure, metadata-driven orchestration engine. It strictly isolates the ArogyaOS UI from directly executing inference or streaming responses from external AI providers. Instead, the module manages the deterministic lifecycle of `ClinicalDecisions`, enforcing a rigorous Human-in-the-Loop review process via the `HumanReviewService`. The entire stack is purely abstract and strictly typed with Zod validation.

## Folder Structure
- `types/` - Core interfaces (ClinicalRecommendation, HumanReview, InferenceRequest)
- `core/` - Constants, Errors, Events, and Hardening (Cache, Offline, Retry, Audit, Observability)
- `utils/` - Zod Schemas ensuring immutable metadata constraints
- `repositories/` - Data access layer abstractions
- `services/` - Orchestration logic (InferenceOrchestratorService, ClinicalSafetyService)
- `hooks/` - React Query abstractions
- `components/` - Enterprise UI Dashboards for Doctors and Executives
- `pages/` - View composition

## Workflows
- **Clinical Decision Workflow**: Doctor creates a `ClinicalDecision` context -> Provider orchestrates metadata -> Returns abstract `ClinicalRecommendation`.
- **Human Review Workflow**: Any recommendation exceeding severity thresholds triggers a mandatory `HumanReview` before acceptance.
- **Explainability**: Inference outputs are stored alongside `ClinicalExplanation` metadata, guaranteeing clinical rationale and confidence mappings independent of the LLM provider.

## Hardening & Integration
- **Cache**: Pre-computes Knowledge Base entries and Provider Capabilities.
- **Offline**: Captures vital Human Reviews and Guideline changes when disconnected, syncing securely on reconnection.
- **Timeline**: Publishes absolute state machines (e.g. `HumanReviewCompleted`) to the global Health Vault Timeline.

## Extension Guide
To integrate specific AI providers (e.g., Azure OpenAI, Vertex AI), implement a discrete background worker service that listens to the `inference:started` event published by the `ClinicalAIEventBus`. The background worker should perform the actual HTTP SDK call and respond by saving metadata back to the DB, ensuring the frontend CDSS abstraction layer remains fundamentally air-gapped from direct LLM streaming APIs.
