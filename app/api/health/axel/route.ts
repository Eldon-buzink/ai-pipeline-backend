import { NextResponse } from 'next/server';

interface HealthResponse {
  status: 'active' | 'idle' | 'error';
  lastSeen: number;
  currentTask: string | null;
}

function parseHealthResponse(data: any): HealthResponse {
  const status = data.status || data.state || 'idle';
  const lastSeen = data.lastSeen || data.timestamp || Date.now();
  const currentTask = data.currentTask || data.task || null;

  return {
    status: ['active', 'idle', 'error'].includes(status) ? status : 'idle',
    lastSeen: typeof lastSeen === 'number' ? lastSeen : Date.now(),
    currentTask: currentTask ? String(currentTask) : null,
  };
}

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      'http://localhost:18792/health',
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        {
          status: 'error',
          lastSeen: Date.now(),
          currentTask: null,
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    const normalizedStatus = parseHealthResponse(data);

    return NextResponse.json(normalizedStatus);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        lastSeen: Date.now(),
        currentTask: null,
      },
      { status: 200 }
    );
  }
}
