import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/features/ai/services/chat.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await ChatService.query(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'AI chat execution failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
