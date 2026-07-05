import { NextRequest, NextResponse } from 'next/server';
import { DistrictSummaryService } from '@/features/ai/services/districtSummary.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await DistrictSummaryService.getSummary(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'District summary compilation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
