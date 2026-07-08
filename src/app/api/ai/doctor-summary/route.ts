import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { DoctorSummaryService } from '@/features/ai/services/doctorSummary.service';
import { guardAiRoute } from '@/lib/ai-guard';

// Only doctors and above can access clinical note summarization
const ALLOWED_ROLES = ['doctor', 'hospital_admin', 'district_admin', 'super_admin'] as const;

export async function POST(req: NextRequest) {
  const guardResult = await guardAiRoute(req, [...ALLOWED_ROLES], z.any());
  if (guardResult instanceof NextResponse) return guardResult;

  const [, body] = guardResult;

  try {
    const result = await DoctorSummaryService.getSummary(
      body as Parameters<typeof DoctorSummaryService.getSummary>[0]
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
  }
}
