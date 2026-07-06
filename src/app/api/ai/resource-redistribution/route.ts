import { NextRequest, NextResponse } from 'next/server';
import { ResourceRedistributionService } from '@/features/ai/services/resource.service';
import { guardAiRoute } from '@/lib/ai-guard';

// Only district-level and above can trigger resource redistribution
const ALLOWED_ROLES = ['district_admin', 'super_admin'] as const;

export async function POST(req: NextRequest) {
  const guardResult = await guardAiRoute(req, [...ALLOWED_ROLES]);
  if (guardResult instanceof NextResponse) return guardResult;

  const [, body] = guardResult;

  try {
    const result = await ResourceRedistributionService.getRecommendations(
      body as Parameters<typeof ResourceRedistributionService.getRecommendations>[0]
    );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
  }
}
