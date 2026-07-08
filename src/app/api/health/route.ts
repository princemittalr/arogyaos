import { NextResponse } from 'next/server';
import { db } from '@/firebase/client';
import { doc, getDoc } from 'firebase/firestore';

export async function GET() {
  try {
    // Ping Firestore to verify database connectivity
    const pingRef = doc(db, '_system', 'health');
    await getDoc(pingRef);
    
    return NextResponse.json(
      {
        status: 'ok',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        timestamp: new Date().toISOString(),
        services: {
          database: 'healthy',
          api: 'healthy'
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        services: {
          database: 'unreachable',
          api: 'healthy'
        }
      },
      { status: 503 }
    );
  }
}
