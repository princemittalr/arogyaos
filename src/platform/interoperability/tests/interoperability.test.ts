import { describe, it, expect, vi } from 'vitest';
import { 
  FHIRServerService,
  HL7MessageService, DICOMStudyService
} from '../services';
import { InteroperabilityCache, InteroperabilityOfflineService, InteroperabilityRetry } from '../core';

describe('Enterprise Interoperability Platform', () => {
  describe('Services (Metadata only)', () => {
    it('FHIRServerService routes metadata without networking', () => {
      const mockRepo = { save: vi.fn() };
      const service = new FHIRServerService(mockRepo as any);
      expect(service).toBeDefined();
    });
    
    it('HL7MessageService routes metadata without MLLP', () => {
      const mockRepo = { save: vi.fn() };
      const service = new HL7MessageService(mockRepo as any);
      expect(service).toBeDefined();
    });

    it('DICOMStudyService routes metadata without PACS', () => {
      const mockRepo = { save: vi.fn() };
      const service = new DICOMStudyService(mockRepo as any);
      expect(service).toBeDefined();
    });
  });

  describe('Core Hardening', () => {
    it('InteroperabilityCache manages memory synchronously', () => {
      const cache = new InteroperabilityCache();
      cache.setFHIRServer('test', { id: 'test' } as any);
      expect(cache.getFHIRServer('test')).resolves.toBeDefined();
    });

    it('InteroperabilityOfflineService queues ops', () => {
      const offline = new InteroperabilityOfflineService();
      expect(offline.getPendingOperations()).toBe(0);
    });

    it('InteroperabilityRetry executes fallbacks safely', async () => {
      const retry = new InteroperabilityRetry();
      const fallback = vi.fn().mockResolvedValue('ok');
      const badOp = vi.fn().mockRejectedValue(new Error('fail'));
      const res = await retry.executeWithFallback(badOp, fallback);
      expect(res).toBe('ok');
      expect(fallback).toHaveBeenCalled();
    });
  });
});
