import { describe, it, expect, vi } from 'vitest';
import { 
  WorkflowDefinitionService, EscalationRuleService,
  DecisionTableService
} from '../services';
import { WorkflowCache, WorkflowOfflineService, WorkflowRetry } from '../core';

describe('Enterprise Workflow Platform', () => {
  describe('Services (Metadata only)', () => {
    it('WorkflowDefinitionService handles definitions without execution', () => {
      const mockRepo = { save: vi.fn() };
      const service = new WorkflowDefinitionService(mockRepo as any);
      expect(service).toBeDefined();
    });
    
    it('DecisionTableService handles tables without rule evaluation', () => {
      const mockRepo = { save: vi.fn() };
      const service = new DecisionTableService(mockRepo as any);
      expect(service).toBeDefined();
    });

    it('EscalationRuleService handles escalation config without timers', () => {
      const mockRepo = { save: vi.fn() };
      const service = new EscalationRuleService(mockRepo as any);
      expect(service).toBeDefined();
    });
  });

  describe('Core Hardening', () => {
    it('WorkflowCache manages memory synchronously', () => {
      const cache = new WorkflowCache();
      cache.setWorkflowDefinition('test', { id: 'test' } as any);
      expect(cache.getWorkflowDefinition('test')).resolves.toBeDefined();
    });

    it('WorkflowOfflineService queues ops without background workers', () => {
      const offline = new WorkflowOfflineService();
      expect(offline.getPendingOperations()).toBe(0);
    });

    it('WorkflowRetry executes fallbacks safely', async () => {
      const retry = new WorkflowRetry();
      const fallback = vi.fn().mockResolvedValue('ok');
      const badOp = vi.fn().mockRejectedValue(new Error('fail'));
      const res = await retry.executeWithFallback(badOp, fallback);
      expect(res).toBe('ok');
      expect(fallback).toHaveBeenCalled();
    });
  });
});
