import { useQuery, useMutation } from '@tanstack/react-query';
import type { StockForecastInput, StockForecastResult } from '../services/stockForecast.service';
import type { PatientForecastInput, PatientForecastResult } from '../services/patientForecast.service';
import type { ResourceRedistributionInput, ResourceRedistributionResult } from '../services/resource.service';
import type { HealthScoreInput, HealthScoreResult } from '../services/healthScore.service';
import type { DoctorSummaryInput, DoctorSummaryResult } from '../services/doctorSummary.service';
import type { DistrictSummaryInput, DistrictSummaryResult } from '../services/districtSummary.service';
import type { ChatInput, ChatResult } from '../services/chat.service';

export type ArrayWithMode<T> = T[] & { mode: 'live' | 'demo' | 'fallback' };

// ─── Stock Forecast ─────────────────────────────────────────────────────────
export function useStockForecast(inventory: StockForecastInput[], enabled = true) {
  return useQuery<ArrayWithMode<StockForecastResult>, Error>({
    queryKey: ['ai', 'stock-forecast', inventory],
    queryFn: async () => {
      const res = await fetch('/api/ai/stock-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inventory),
      });
      if (!res.ok) throw new Error('Stock forecast request failed');
      const data = await res.json();
      const predictions = (data.predictions || []) as ArrayWithMode<StockForecastResult>;
      Object.defineProperty(predictions, 'mode', {
        value: data.mode || 'fallback',
        writable: true,
        enumerable: true,
      });
      return predictions;
    },
    enabled: enabled && inventory.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// ─── Patient Forecast ────────────────────────────────────────────────────────
export function usePatientForecast(input: PatientForecastInput, enabled = true) {
  return useQuery<ArrayWithMode<PatientForecastResult>, Error>({
    queryKey: ['ai', 'patient-forecast', input],
    queryFn: async () => {
      const res = await fetch('/api/ai/patient-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('Patient forecast request failed');
      const data = await res.json();
      const forecasts = (data.forecasts || []) as ArrayWithMode<PatientForecastResult>;
      Object.defineProperty(forecasts, 'mode', {
        value: data.mode || 'fallback',
        writable: true,
        enumerable: true,
      });
      return forecasts;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// ─── Resource Redistribution ──────────────────────────────────────────────────
export function useResourceRedistribution(input: ResourceRedistributionInput, enabled = true) {
  return useQuery<ArrayWithMode<ResourceRedistributionResult>, Error>({
    queryKey: ['ai', 'resource-redistribution', input],
    queryFn: async () => {
      const res = await fetch('/api/ai/resource-redistribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('Resource redistribution request failed');
      const data = await res.json();
      const recommendations = (data.recommendations || []) as ArrayWithMode<ResourceRedistributionResult>;
      Object.defineProperty(recommendations, 'mode', {
        value: data.mode || 'fallback',
        writable: true,
        enumerable: true,
      });
      return recommendations;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// ─── Hospital Health Score ────────────────────────────────────────────────────
export function useHealthScore(input: HealthScoreInput, enabled = true) {
  return useQuery<HealthScoreResult, Error>({
    queryKey: ['ai', 'health-score', input],
    queryFn: async () => {
      const res = await fetch('/api/ai/health-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('Health score request failed');
      return res.json();
    },
    enabled,
    staleTime: 3 * 60 * 1000,
    retry: 2,
  });
}

// ─── Doctor Summary ───────────────────────────────────────────────────────────
export function useDoctorSummaryMutation() {
  return useMutation<DoctorSummaryResult, Error, DoctorSummaryInput>({
    mutationFn: async (input: DoctorSummaryInput) => {
      const res = await fetch('/api/ai/doctor-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('Doctor summary request failed');
      return res.json();
    },
    retry: 1,
  });
}

// ─── District Summary ─────────────────────────────────────────────────────────
export function useDistrictAISummary(input: DistrictSummaryInput, enabled = true) {
  return useQuery<DistrictSummaryResult, Error>({
    queryKey: ['ai', 'district-summary', input],
    queryFn: async () => {
      const res = await fetch('/api/ai/district-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('District summary request failed');
      return res.json();
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export function useAIChatMutation() {
  return useMutation<ChatResult, Error, ChatInput>({
    mutationFn: async (input: ChatInput) => {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('AI chat request failed');
      return res.json();
    },
    retry: 1,
  });
}
