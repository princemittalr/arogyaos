# Enterprise Administration, Identity & System Configuration

Module 18 of ArogyaOS

## Architecture
The Administration Module serves as the strict, metadata-driven configurational backbone of ArogyaOS. It operates purely as an orchestration engine, governing how complex healthcare topologies (`Organizations`, `Tenants`, `Facilities`) and identities (`Users`, `Roles`, `Permissions`) interact securely. 

**Crucially, this module is an execution-free zone for Authentication.** It does not sign JSON Web Tokens (JWTs), negotiate OAuth grants, implement LDAP handshakes, or provide active Active Directory bridging logic. Instead, it defines the rigid Zod-validated payloads that external identity providers (IdPs) pass to ArogyaOS to guarantee comprehensive auditability and RBAC enforcement.

## Folder Structure
- `types/` - Core domain abstractions (`Tenant`, `AccessPolicy`, `Session`, `APIKey`).
- `core/` - Global constants, specific exceptions, Cache layers (`AdministrationCache`), and Offline resilience arrays.
- `utils/` - Secure Zod schemas enforcing precise boundaries on configuration changes.
- `repositories/` - Interfaces dictating secure state access.
- `services/` - Orchestration logic mapping API interactions into pure metadata traces (e.g. `FeatureFlagService`).
- `hooks/` - Abstracted React Query bridge enabling dashboard interaction.
- `components/` - Enterprise IT semantic dashboards (WCAG 2.2 AA compliant).

## Workflows
- **Identity Orchestration**: Maintains synchronized metadata representation of real-world identities, mapping `User` instances to complex `RoleAssignments`.
- **System Configuration**: Controls global `FeatureFlag` rollouts and `ModuleConfiguration` deployments, ensuring safe phased scaling of healthcare applications.
- **Topology Management**: Groups `Hospitals` and `Clinics` logically inside parent `Tenants`, allowing the UI to segment data cleanly at a massive scale.

## Extension Guide
If ArogyaOS is deployed into a hospital running Azure AD, a dedicated microservice must act as the bridge. This microservice will parse Azure's OAuth tokens, validate them physically, and then hit this Administration Module's hooks (e.g., `useSessions`) strictly passing a parsed `Session` metadata JSON to trigger internal audit tracing.
