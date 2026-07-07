# Platform Phase 1: Cross Module Integration

Platform integration layer for ArogyaOS.

## Overview
This platform layer functions as a global metadata orchestrator connecting the 20 isolated domain modules of ArogyaOS. It structurally maps integration workflows (e.g., Appointment → Hospital Operations → Billing) using completely abstract, metadata-driven definitions.

## Architecture
**Constraint Warning**: This module explicitly serves as a **Control Plane**. It does **not** contain an execution runtime, workflow engine, or state machine loop. It does not spin up Kafka, RabbitMQ, or Temporal. Physical execution engines subscribe to this metadata layer to carry out saga transactions. ArogyaOS manages the *definitions and dependencies*, protecting the UI from operational processing bottlenecks.

## Folder Structure
- `types/` - Strict typing for cross-module integrations (`CrossModuleWorkflow`, `WorkflowStep`, `ModuleRegistry`).
- `core/` - Event definitions, strict integration constants, custom platform errors, and enterprise hardening logic.
- `utils/` - Zod schema validations for structural integrity before broadcasting configurations.
- `repositories/` - Data access interfaces concealing schema interactions.
- `services/` - Metadata lifecycle managers for workflows and integration rules.
- `hooks/` - Abstracted React Query access points.
- `components/` - Accessible WCAG 2.2 AA workspaces for Enterprise IT to visually configure workflows.

## Events and Triggers
The module defines the structural taxonomy for platform events (`workflow:started`, `workflow:completed`, `cross_module:event_published`). These abstract payloads ensure deterministic interactions across disconnected micro-frontends without tightly coupling business logic.

## Extension Guidelines
To execute the workflows defined by this module, deploy an independent saga execution cluster (e.g., Temporal or Camunda) alongside ArogyaOS. Configure the execution cluster to poll the `ModuleRegistry` and `CrossModuleWorkflow` metadata definitions emitted by this module, and translate them into physical routing instructions.
