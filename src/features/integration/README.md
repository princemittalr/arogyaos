# Enterprise Integration Platform, APIs & Developer Ecosystem

Module 19 of ArogyaOS

## Architecture
The Integration Platform Module serves as the command center for mapping ArogyaOS to the external world. It provides structural definitions and orchestration logic for `APIs`, `Webhooks`, `Event Catalogs`, and `Schema Registries`.

**Crucially, this module is entirely metadata-driven.** It does not spin up REST/gRPC servers, run API gateways, manage actual Kafka message brokers, or execute webhook delivery payloads. Instead, it defines the rigid configuration structures (such as `TransformationRules` and `DataContracts`) that dedicated runtime bridges read from the database to actually execute the data flow. 

## Folder Structure
- `types/` - Core domain abstractions (`API`, `IntegrationConnector`, `SDK`, `Workflow`).
- `core/` - Caching layer (`IntegrationCache`), offline resilience loops, constants, and custom `IntegrationError` traces.
- `utils/` - Strict Zod schema boundaries ensuring APIs and Webhooks adhere to platform specs.
- `repositories/` - Data access interfaces hiding the NoSQL/SQL topology.
- `services/` - Pure orchestration logic managing metadata mapping operations (e.g. `SchemaRegistryService`).
- `hooks/` - Front-end React Query bridges empowering the dashboards.
- `components/` - Enterprise IT semantic dashboards (WCAG 2.2 AA compliant).

## Workflows
- **API Governance**: Define, version, and deprecate internal/external endpoints systematically via `APIService` without risking runtime breakages.
- **Developer Ecosystem**: Structure developer boundaries via `DeveloperApplication` quotas and rate limits securely.
- **Event Catalogs & Webhooks**: Track domain events logically, mapping them to outbound subscriptions to give IT admins a visual map of the data mesh.

## Extension Guide
If deploying alongside an AWS API Gateway, the gateway's deployment pipeline should read from the `APIRepository` to physically generate the routes. If integrating with Epic (EHR), a dedicated microservice must handle the FHIR/HL7 transmission and hit this module's `useSynchronization` hooks to update the `IntegrationDashboard` with the metadata results.
