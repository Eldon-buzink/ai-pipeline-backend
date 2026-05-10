export default function Home() {
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
          {[
            { name: "Tyler", status: "active", port: 18789 },
            { name: "Orion", status: "active", port: 18790 },
            { name: "Carly", status: "idle", port: 18791 },
            { name: "Axel", status: "error", port: 18792 },
          ].map((agent) => (
            <div
              key={agent.name}
              className="flex flex-col gap-3 p-4 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-text-secondary)] transition-colors"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[var(--color-text-primary)]">
                  {agent.name}
                </h3>
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    agent.status === "active"
                      ? "bg-green-500"
                      : agent.status === "idle"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Port: {agent.port}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Status: <span className="capitalize">{agent.status}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Layout Verification Notice */}
        <div className="mt-8 p-4 rounded-lg bg-[var(--color-bg-surface)] border-l-2 border-[var(--color-accent-signal)]">
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-2">
            Phase 1: Layout Geometry
          </h2>
          <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
            <li>Sidebar: 48px collapsed (icon-rail only)</li>
            <li>Main content: ml-[48px] offset applied</li>
            <li>Hover sidebar to expand (200px)</li>
            <li>Click pin icon to lock expanded state</li>
            <li>Pin state persists in localStorage</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
