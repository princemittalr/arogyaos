import { NextRequest, NextResponse } from 'next/server';
import { HealthScoreService } from '@/features/ai/services/healthScore.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await HealthScoreService.calculateScore(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Health score calculation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
