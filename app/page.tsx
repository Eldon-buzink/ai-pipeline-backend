'use client';

import Link from 'next/link';
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
  status: AgentStatus | null;
  loading: boolean;
  error: string | null;
}

const AGENT_CONFIGS = [
  { id: 'tyler', name: 'Tyler', port: 18789 },
  { id: 'orion', name: 'Orion', port: 18790 },
  { id: 'carly', name: 'Carly', port: 18791 },
  { id: 'axel', name: 'Axel', port: 18792 },
];

function isStale(lastSeen: number): boolean {
  return Date.now() - lastSeen > 60 * 60 * 1000; // > 1 hour
}

export default function Home() {
  const [agents, setAgents] = useState<Agent[]>(
    AGENT_CONFIGS.map((config) => ({
      ...config,
      status: null,
      loading: true,
      error: null,
    }))
  );

  useEffect(() => {
    const fetchAllStatuses = async () => {
      const promises = agents.map(async (agent) => {
        try {
          const response = await fetch(`/api/health/${agent.id}`, {
            signal: AbortSignal.timeout(5000),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();

          return {
            ...agent,
            status: data,
            loading: false,
            error: null,
          };
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Connection failed';
          return {
            ...agent,
            status: {
              status: 'error' as const,
              lastSeen: Date.now(),
              currentTask: null,
            },
            loading: false,
            error: errorMsg,
          };
        }
      });

      const results = await Promise.all(promises);
      setAgents(results);
    };

    // Initial fetch
    fetchAllStatuses();

    // Poll every 10 seconds
    const interval = setInterval(fetchAllStatuses, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col w-full bg-[var(--color-bg-primary)] overflow-y-auto">
      {/* Page Header */}
      <header className="sticky top-0 flex flex-col gap-4 p-[var(--spacing-xl)] border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] bg-opacity-95 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
            <span>Home</span>
            <span>/</span>
            <span className="text-[var(--color-text-primary)]">Dashboard</span>
          </nav>
        </div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Dashboard
        </h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-[var(--spacing-xl)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Agent Status Cards */}
          {agents.map((agent) => {
            const statusColor =
              agent.status?.status === 'active'
                ? 'bg-green-500'
                : agent.status?.status === 'idle'
                  ? 'bg-yellow-500'
                  : 'bg-red-500';

            const stale = agent.status && isStale(agent.status.lastSeen);

            return (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className={`flex flex-col gap-3 p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                  stale
                    ? 'bg-[var(--color-bg-surface)] border-amber-600 hover:shadow-md hover:border-amber-500'
                    : 'bg-[var(--color-bg-surface)] border-[var(--color-border)] hover:border-[var(--color-text-secondary)] hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[var(--color-text-primary)]">
                    {agent.name}
                  </h3>
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${statusColor}`}
                  />
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Port: {agent.port}
                </p>
                {agent.status && (
                  <>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Status: <span className="capitalize font-medium">{agent.status.status}</span>
                    </p>
                    {stale && (
                      <p className="text-xs text-amber-600 font-medium">
                        ⚠️ Last seen &gt;1h ago
                      </p>
                    )}
                  </>
                )}
                {agent.loading && (
                  <p className="text-xs text-[var(--color-text-secondary)] italic">
                    Loading...
                  </p>
                )}
                {agent.error && (
                  <p className="text-xs text-red-500">
                    Error: {agent.error}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
