import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { StockForecastService } from '@/features/ai/services/stockForecast.service';
import { guardAiRoute } from '@/lib/ai-guard';

// Pharmacy-level staff and admins can request stock forecasts
const ALLOWED_ROLES = ['pharmacist', 'hospital_admin', 'district_admin', 'super_admin'] as const;

export async function POST(req: NextRequest) {
  const guardResult = await guardAiRoute(req, [...ALLOWED_ROLES], z.any());
  if (guardResult instanceof NextResponse) return guardResult;

  const [, body] = guardResult;

  try {
    const result = await StockForecastService.getForecast(
      body as Parameters<typeof StockForecastService.getForecast>[0]
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
  }
}
