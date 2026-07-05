import { NextRequest, NextResponse } from 'next/server';
import { PatientForecastService } from '@/features/ai/services/patientForecast.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await PatientForecastService.getForecast(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Patient forecast failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
