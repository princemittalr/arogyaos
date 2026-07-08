import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { DistrictSummaryService } from '@/features/ai/services/districtSummary.service';
import { guardAiRoute } from '@/lib/ai-guard';

// Only district-level and above can access district summaries
const ALLOWED_ROLES = ['district_admin', 'super_admin'] as const;

export async function POST(req: NextRequest) {
  const guardResult = await guardAiRoute(req, [...ALLOWED_ROLES], z.any());
  if (guardResult instanceof NextResponse) return guardResult;

  const [, body] = guardResult;

  try {
    const result = await DistrictSummaryService.getSummary(
      body as Parameters<typeof DistrictSummaryService.getSummary>[0]
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
  }
}
