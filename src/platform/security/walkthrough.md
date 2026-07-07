# Walkthrough & Architectural Justifications

## Design Decisions and Boundaries

### Why Authentication & Cryptography are External
Executing authentication flows (OAuth, OIDC) or cryptography (hashing, symmetric encryption) in the core UI is fundamentally unsafe and computationally incorrect for a React application. By mapping only the **Encryption Configuration** (e.g., mandating AES-256 for PHI storage) in the frontend, the physical network layers handle token issuance and secure data transposition dynamically while remaining entirely agnostic to the UI logic.

### Why Compliance is Metadata-Driven
Hardcoding HIPAA or SOC2 rules directly into business logic breaks scalability. Defining these frameworks as strict `ComplianceFramework` and `DataClassification` JSON objects (validated flawlessly by Zod) empowers IT administrators to dynamically remap clinical data boundaries, shift access matrices, and adjust organizational risks without deploying new UI code.

## Phase Overview
- **Phase 1**: Secured the domain via exacting models (`RolePolicy`, `PrivacyRule`, `ThreatModel`) using comprehensive, zero-any TypeScript constants and Zod schemas.
- **Phase 2**: Assembled the Service layer to route and orchestrate compliance and access mappings without entangling physically with Auth0 or external LDAP servers.
- **Phase 3**: Connected precise React Query hooks to expose security boundaries safely into the front-end memory spaces with built-in cache invalidation loops.
- **Phase 4**: Constructed highly structured, accessible (WCAG 2.2 AA) visual panels for IT personnel to define security stances, manage clinical consent constraints, and track organizational risks centrally.
- **Phase 5**: Sealed the framework via `SecurityOfflineService` to enable safe metadata edits during network degradation, accompanied by deterministic `SecurityAudit` tracing for enterprise compliance standards.
