import { NextRequest, NextResponse } from 'next/server';
import { ResourceRedistributionService } from '@/features/ai/services/resource.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await ResourceRedistributionService.getRecommendations(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Resource recommendation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
