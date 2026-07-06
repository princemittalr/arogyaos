import { NextRequest, NextResponse } from 'next/server';
import { PatientForecastService } from '@/features/ai/services/patientForecast.service';
import { guardAiRoute } from '@/lib/ai-guard';

// Hospital staff and above can request patient inflow forecasts
const ALLOWED_ROLES = ['hospital_admin', 'nurse', 'doctor', 'district_admin', 'super_admin'] as const;

export async function POST(req: NextRequest) {
  const guardResult = await guardAiRoute(req, [...ALLOWED_ROLES]);
  if (guardResult instanceof NextResponse) return guardResult;

  const [, body] = guardResult;

  try {
    const result = await PatientForecastService.getForecast(
      body as Parameters<typeof PatientForecastService.getForecast>[0]
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
  }
}
