export type WorkflowType = 'Sequential' | 'Parallel' | 'Conditional' | 'Saga';
export type TriggerType = 'Manual' | 'Event' | 'Schedule' | 'API';
export type ConditionType = 'Expression' | 'StateCheck' | 'DataValidation';
export type ExecutionState = 'Pending' | 'Running' | 'Suspended' | 'Completed' | 'Failed' | 'Cancelled';
export type WorkflowStatus = 'Active' | 'Inactive' | 'Draft' | 'Deprecated';
export type IntegrationType = 'Synchronous' | 'Asynchronous' | 'FireAndForget';
export type PriorityLevel = 'Critical' | 'High' | 'Normal' | 'Low';
export type RetryPolicy = 'None' | 'ExponentialBackoff' | 'FixedInterval';
export type EventCategory = 'System' | 'Domain' | 'Integration' | 'Audit';

export interface PlatformEvent {
  id: string;
  sourceModule: string;
  targetModule?: string;
  eventType: string;
  category: EventCategory;
  payload: Record<string, unknown>;
  timestamp: string;
  correlationId: string;
}

export interface CrossModuleWorkflow {
  id: string;
  name: string;
  description: string;
  type: WorkflowType;
  status: WorkflowStatus;
  version: string;
  modules: string[];
}

export interface WorkflowStep {
  id: string;
  workflowId: string;
  moduleId: string;
  actionId: string;
  order: number;
  isCompensatingAction: boolean;
}

export interface WorkflowContext {
  executionId: string;
  workflowId: string;
  state: Record<string, unknown>;
  history: WorkflowHistory[];
}

export interface WorkflowState {
  currentStepId: string;
  status: ExecutionState;
  data: Record<string, unknown>;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: ExecutionState;
  priority: PriorityLevel;
  startedAt: string;
  completedAt?: string;
}

export interface WorkflowHistory {
  id: string;
  executionId: string;
  stepId: string;
  status: ExecutionState;
  timestamp: string;
  error?: string;
}

export interface WorkflowTrigger {
  id: string;
  workflowId: string;
  type: TriggerType;
  config: Record<string, unknown>;
}

export interface WorkflowCondition {
  id: string;
  stepId: string;
  type: ConditionType;
  expression: string;
}

export interface WorkflowAction {
  id: string;
  moduleId: string;
  name: string;
  payloadTemplate: Record<string, unknown>;
  retryPolicy: RetryPolicy;
}

export interface WorkflowResult {
  executionId: string;
  success: boolean;
  output: Record<string, unknown>;
  durationMs: number;
}

export interface IntegrationContext {
  sourceModule: string;
  targetModule: string;
  type: IntegrationType;
  timeoutMs: number;
}

export interface CrossModuleReference {
  sourceId: string;
  targetId: string;
  targetModule: string;
  referenceType: string;
}

export interface ModuleDependency {
  moduleId: string;
  dependsOn: string[];
  isOptional: boolean;
}

export interface ModuleRegistry {
  id: string;
  name: string;
  version: string;
  status: 'Active' | 'Inactive';
  dependencies: ModuleDependency[];
}

export interface WorkflowDefinition {
  workflow: CrossModuleWorkflow;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
}

export interface WorkflowExecutionResult {
  execution: WorkflowExecution;
  history: WorkflowHistory[];
  finalResult: WorkflowResult;
}

export interface EventSubscription {
  id: string;
  moduleId: string;
  eventPattern: string;
  handlerId: string;
}

export interface IntegrationRule {
  id: string;
  sourceModule: string;
  targetModule: string;
  condition: string;
  transformationId: string;
}
