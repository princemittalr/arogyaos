import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/features/ai/services/chat.service';
import { guardAiRoute } from '@/lib/ai-guard';

// district_admin and super_admin can query the district chat assistant
const ALLOWED_ROLES = ['district_admin', 'super_admin'] as const;

export async function POST(req: NextRequest) {
  const guardResult = await guardAiRoute(req, [...ALLOWED_ROLES], z.any());
  if (guardResult instanceof NextResponse) return guardResult;

  const [, body] = guardResult;

  try {
    const result = await ChatService.query(body as Parameters<typeof ChatService.query>[0]);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
  }
}
