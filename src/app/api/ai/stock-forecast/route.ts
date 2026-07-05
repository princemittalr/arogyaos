import { NextRequest, NextResponse } from 'next/server';
import { StockForecastService } from '@/features/ai/services/stockForecast.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await StockForecastService.getForecast(body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Forecast calculation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
