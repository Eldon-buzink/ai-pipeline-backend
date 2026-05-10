import { NextRequest, NextResponse } from 'next/server';

// Gateway health endpoints configuration
const GATEWAYS = {
  tyler: { port: 18789 },
  orion: { port: 18790 },
  carly: { port: 18791 },
  axel: { port: 18792 },
};

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agent');

  if (!agentId || !GATEWAYS[agentId as keyof typeof GATEWAYS]) {
    return NextResponse.json(
      { error: 'Invalid or missing agent parameter' },
      { status: 400 }
    );
  }

  const gateway = GATEWAYS[agentId as keyof typeof GATEWAYS];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `http://localhost:${gateway.port}/health`,
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
    // Return error status instead of throwing
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
