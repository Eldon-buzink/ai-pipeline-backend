'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AgentStatus {
  status: 'active' | 'idle' | 'error';
  lastSeen: number;
  currentTask: string | null;
}

interface Agent {
  id: string;
  name: string;
  port: number;
}

const AGENTS: Record<string, Agent> = {
  tyler: { id: 'tyler', name: 'Tyler', port: 18789 },
  orion: { id: 'orion', name: 'Orion', port: 18790 },
  carly: { id: 'carly', name: 'Carly', port: 18791 },
  axel: { id: 'axel', name: 'Axel', port: 18792 },
};

function parseHealthResponse(data: any): AgentStatus {
  // Normalize gateway health endpoint response
  const status = data.status || data.state || 'idle';
  const lastSeen = data.lastSeen || data.timestamp || Date.now();
  const currentTask = data.currentTask || data.task || null;

  return {
    status: ['active', 'idle', 'error'].includes(status) ? status : 'idle',
    lastSeen: typeof lastSeen === 'number' ? lastSeen : Date.now(),
    currentTask: currentTask ? String(currentTask) : null,
  };
}

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params?.id as string;
  const agent = AGENTS[agentId];
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    if (!agent) {
      setError('Agent not found');
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`http://localhost:${agent.port}/health`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const normalizedStatus = parseHealthResponse(data);
        
        setStatus(normalizedStatus);
        setError(null);

        // Check for staleness (> 1 hour)
        const age = Date.now() - normalizedStatus.lastSeen;
        setIsStale(age > 60 * 60 * 1000);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch status';
        
        // Set error status
        setStatus({
          status: 'error',
          lastSeen: Date.now(),
          currentTask: null,
        });
        setError(errorMsg);
        setIsStale(false);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchStatus();

    // Poll every 10 seconds
    const interval = setInterval(() => {
      fetchStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, [agent]);

  if (!agent) {
    return (
      <div className="flex-1 flex flex-col w-full bg-[var(--color-bg-primary)] overflow-y-auto">
        <header className="sticky top-0 flex flex-col gap-4 p-[var(--spacing-xl)] border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] bg-opacity-95 backdrop-blur-sm">
          <nav className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
            <Link href="/" className="hover:text-[var(--color-text-primary)]">
              Home
            </Link>
            <span>/</span>
            <Link href="/agents" className="hover:text-[var(--color-text-primary)]">
              Agents
            </Link>
            <span>/</span>
            <span className="text-[var(--color-text-primary)]">Not Found</span>
          </nav>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Agent Not Found
          </h1>
        </header>
        <div className="flex-1 p-[var(--spacing-xl)]">
          <p className="text-[var(--color-text-secondary)]">
            The agent "{agentId}" does not exist.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 rounded-lg bg-[var(--color-accent-primary)] text-white hover:opacity-80 transition-opacity"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const statusColor =
    status?.status === 'active'
      ? 'bg-green-500'
      : status?.status === 'idle'
        ? 'bg-yellow-500'
        : 'bg-red-500';

  return (
    <div className="flex-1 flex flex-col w-full bg-[var(--color-bg-primary)] overflow-y-auto">
      {/* Page Header */}
      <header className="sticky top-0 flex flex-col gap-4 p-[var(--spacing-xl)] border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] bg-opacity-95 backdrop-blur-sm">
        <nav className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
          <Link href="/" className="hover:text-[var(--color-text-primary)]">
            Home
          </Link>
          <span>/</span>
          <Link href="/agents" className="hover:text-[var(--color-text-primary)]">
            Agents
          </Link>
          <span>/</span>
          <span className="text-[var(--color-text-primary)]">{agent.name}</span>
        </nav>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          {agent.name}
        </h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-[var(--spacing-xl)]">
        {/* Status Card */}
        <div className="mb-6 p-6 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Status
              </h2>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-block w-3 h-3 rounded-full ${statusColor}`}
                />
                <span className="capitalize text-[var(--color-text-secondary)]">
                  {loading ? 'Loading...' : status?.status || 'Unknown'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--color-text-secondary)] mb-1">
                Port
              </p>
              <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                {agent.port}
              </p>
            </div>
          </div>

          {/* Last Seen */}
          {status?.lastSeen && (
            <div
              className={`p-3 rounded mb-4 ${
                isStale
                  ? 'bg-amber-500 bg-opacity-10 border border-amber-600'
                  : 'bg-[var(--color-bg-primary)] border border-[var(--color-border)]'
              }`}
            >
              <p className="text-xs text-[var(--color-text-secondary)] mb-1">
                Last Seen
              </p>
              <p
                className={`text-sm font-medium ${
                  isStale
                    ? 'text-amber-600'
                    : 'text-[var(--color-text-primary)]'
                }`}
              >
                {new Date(status.lastSeen).toLocaleString()}
                {isStale && ' (stale — >1h ago)'}
              </p>
            </div>
          )}

          {/* Current Task */}
          {status?.currentTask && (
            <div className="p-3 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-secondary)] mb-1">
                Current Task
              </p>
              <p className="text-sm text-[var(--color-text-primary)]">
                {status.currentTask}
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded bg-red-500 bg-opacity-10 border border-red-500 mt-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="p-6 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-secondary)]">Agent ID</span>
              <span className="font-mono text-[var(--color-text-primary)]">
                {agent.id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-secondary)]">Gateway Port</span>
              <span className="font-mono text-[var(--color-text-primary)]">
                {agent.port}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--color-text-secondary)]">
                Health Endpoint
              </span>
              <span className="font-mono text-xs text-[var(--color-text-primary)]">
                localhost:{agent.port}/health
              </span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <Link
            href="/"
            className="inline-block px-4 py-2 rounded-lg bg-[var(--color-accent-primary)] text-white hover:opacity-80 transition-opacity"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
