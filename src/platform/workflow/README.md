# Enterprise Workflow, BPM & Process Orchestration Platform

## Platform Architecture
The Workflow Platform acts as the singular administrative control plane for governing business process orchestration and decision matrices across the ArogyaOS ecosystem. It implements absolute decoupling: this platform provides **Zero Workflow Execution**, **Zero Polling Loops**, and **Zero BPMN Runtimes**. It is strictly a **Metadata Management Engine**. 

Physical BPM engines (like Camunda, Temporal, Zeebe, or Airflow) and Task Queues (like Kafka or BullMQ) must be deployed separately as headless infrastructure nodes. Those nodes synchronize securely against the business rules and definitions managed in this platform.

## Folder Structure
- `/types`: Comprehensive, Zod-backed semantic domain definitions for Workflows, Human Tasks, Decisions, and SLAs.
- `/core`: Workflow Hardening layer. Contains `WorkflowCache`, `WorkflowOfflineService`, and `WorkflowRetry`.
- `/repositories`: Metadata abstraction persistence bridges.
- `/services`: Administrative logic routing schemas and topologies.
- `/hooks`: React Query boundaries connecting the control plane UI.
- `/components`: IT Administration visual workspaces.

## Monitored Domains
- **Workflow Metadata**: Configurations for Definitions, Templates, Categories, and Versions.
- **Task Metadata**: Human, Automated, Approval, and Review Tasks, along with Assignment Rules and Queues.
- **Decision Logic**: Business Rules, Decision Tables, and Decision Trees.
- **Governance & Automation**: Escalation Rules, SLAs, Notifications, Metrics, and Subscriptions.

## Components & Hooks
The frontend relies strictly on decoupled React Query bindings mapping into standardized React workspaces. `DecisionTableWorkspace`, `WorkflowDefinitionWorkspace`, etc. are fully WCAG 2.2 AA compliant.

## Core Services (Cache, Offline, Observability, Audit)
The control plane can manage schema changes even under unstable connectivity environments leveraging the exact deterministic synchronization loop created in prior iterations.

## Extension Guidelines
When extending workflow logic:
1. Define the types and Zod schemas in `types`.
2. Map Repositories and Services.
3. Expose Hooks.
4. Implement the UI without bridging background execution timers or execution loops into the React bundle.
