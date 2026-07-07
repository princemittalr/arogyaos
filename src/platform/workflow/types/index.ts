export type WorkflowCategory = 'CLINICAL' | 'ADMINISTRATIVE' | 'FINANCIAL' | 'OPERATIONAL' | 'COMPLIANCE';
export type WorkflowState = 'DRAFT' | 'ACTIVE' | 'DEPRECATED' | 'ARCHIVED';
export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type TaskType = 'HUMAN' | 'AUTOMATED' | 'APPROVAL' | 'REVIEW';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'WAITING' | 'DONE' | 'REJECTED' | 'ESCALATED';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type EscalationLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';

export interface WorkflowDefinition { id: string; name: string; category: WorkflowCategory; version: number; state: WorkflowState; }
export interface WorkflowTemplate { id: string; definitionId: string; layout: Record<string, unknown>; }
export interface WorkflowVersion { id: string; definitionId: string; version: number; publishedAt: string; }
export interface WorkflowStage { id: string; definitionId: string; name: string; order: number; }
export interface WorkflowInstance { id: string; definitionId: string; status: ExecutionStatus; }
export interface WorkflowExecution { id: string; instanceId: string; startTime: string; endTime?: string; status: ExecutionStatus; }
export interface WorkflowContext { executionId: string; variables: Record<string, unknown>; }
export interface WorkflowVariable { name: string; type: string; value: unknown; }
export interface WorkflowParameter { name: string; type: string; required: boolean; }
export interface WorkflowInput { variables: Record<string, unknown>; }
export interface WorkflowOutput { result: Record<string, unknown>; }

export interface WorkflowTask { id: string; executionId: string; type: TaskType; status: TaskStatus; priority: PriorityLevel; }
export interface HumanTask extends WorkflowTask { assigneeId?: string; roleId?: string; }
export interface AutomatedTask extends WorkflowTask { actionRef: string; payload: Record<string, unknown>; }
export interface ApprovalTask extends HumanTask { requiredApprovers: number; approvedBy: string[]; }
export interface ReviewTask extends HumanTask { commentsRequired: boolean; }

export interface AssignmentRule { taskId: string; criteria: Record<string, unknown>; }
export interface RoleAssignment { taskId: string; roleId: string; }
export interface TaskQueue { id: string; name: string; filter: Record<string, unknown>; }
export interface TaskPriority { taskId: string; priority: PriorityLevel; }

export interface EscalationRule { taskId: string; timeoutMs: number; level: EscalationLevel; }
export interface EscalationPolicy { id: string; rules: EscalationRule[]; }
export interface EscalationAction { ruleId: string; action: string; targetId: string; }

export interface SLA { id: string; entityId: string; type: string; }
export interface SLATarget { slaId: string; durationMs: number; metric: string; }
export interface SLABreach { id: string; slaId: string; breachedAt: string; }

export interface BusinessRule { id: string; name: string; expression: string; }
export interface DecisionTable { id: string; rules: BusinessRule[]; }
export interface DecisionTree { id: string; rootNodeId: string; }
export interface ConditionGroup { id: string; operator: 'AND' | 'OR'; conditions: ConditionExpression[]; }
export interface ConditionExpression { field: string; operator: string; value: unknown; }
export interface Transition { fromStageId: string; toStageId: string; condition?: ConditionGroup; }

export interface WorkflowTrigger { id: string; type: string; definitionId: string; }
export interface EventTrigger extends WorkflowTrigger { eventName: string; }
export interface ScheduleTrigger extends WorkflowTrigger { cronExpression: string; }
export interface ManualTrigger extends WorkflowTrigger { allowedRoles: string[]; }

export interface CompensationPolicy { id: string; taskId: string; action: string; }
export interface RollbackPolicy { id: string; executionId: string; strategy: string; }
export interface RetryPolicy { maxAttempts: number; backoffMs: number; }
export interface TimeoutPolicy { durationMs: number; action: string; }

export interface WorkflowAudit { id: string; entityId: string; action: string; timestamp: string; }
export interface WorkflowHistory { executionId: string; events: WorkflowAudit[]; }
export interface WorkflowComment { id: string; taskId: string; text: string; authorId: string; timestamp: string; }
export interface WorkflowAttachment { id: string; taskId: string; fileUrl: string; }

export interface ProcessAnalytics { definitionId: string; avgCompletionTimeMs: number; }
export interface WorkflowMetric { name: string; value: number; unit: string; }
export interface ExecutionStatistics { totalExecutions: number; successRate: number; }

export interface WorkflowNotification { id: string; eventType: string; recipientId: string; message: string; }
export interface WorkflowSubscription { id: string; userId: string; eventTypes: string[]; }

export interface WorkflowGovernance { policyId: string; definitionId: string; }
export interface WorkflowPolicy { id: string; name: string; rules: Record<string, unknown>; }
export interface WorkflowPermission { roleId: string; actions: string[]; }
export interface WorkflowSecurity { definitionId: string; requiredClearance: string; }

export interface WorkflowArchive { id: string; executionId: string; archivedAt: string; }
export interface WorkflowExport { id: string; payload: string; format: string; }
export interface WorkflowImport { id: string; source: string; status: string; }
export interface WorkflowValidation { id: string; definitionId: string; isValid: boolean; errors: string[]; }
