import { NextRequest, NextResponse } from 'next/server';
import { DoctorSummaryService } from '@/features/ai/services/doctorSummary.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await DoctorSummaryService.getSummary(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Notes transcription summary failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
