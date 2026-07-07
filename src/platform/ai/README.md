# Platform Phase 7: Enterprise AI, Automation & Decision Intelligence Platform

Global architectural AI configuration & automation schema layer for ArogyaOS.

## Overview
This platform layer operates as the declarative control plane governing how external AI models, agents, predictions, and workflows map onto the federated clinical domains of ArogyaOS.

## Architecture
**Constraint Warning**: This module exclusively administers **Metadata Configuration**. It does **not** invoke the OpenAI SDK, manage LangChain runtimes, execute token inferences, embed queries into vector databases, or run live websocket-based prompt streams. ArogyaOS strictly abstracts *AI capability boundaries* within the UI while mandating backend physical infrastructure compute layers to perform the actual model operations based on these configurations.

## Folder Structure
- `types/` - Exacting types for schema limits (`AIAgent`, `PromptTemplate`, `FeatureStoreMetadata`).
- `core/` - Global AI platform constants, strict offline queuing structures, and validation utilities.
- `utils/` - Zero-trust Zod schemas validating all agent automation parameters.
- `repositories/` - Boundary definitions mapping AI orchestration payloads.
- `services/` - Orchestrators defining the behavior and boundaries of decision trees and workflows.
- `hooks/` - Abstracted React Query hooks linking automation bounds to the administrative frontend.
- `components/` - WCAG 2.2 AA compliant IT dashboards permitting live mapping of AI endpoints.

## Extension Guidelines
To execute physical vector embeddings or dynamic text inferences, establish separate back-end asynchronous compute workers. Those worker nodes must poll this platform's configuration boundaries (e.g., retrieving an `AgentTask` configuration map or checking a `GovernancePolicy` constraint) before processing inference requests.
