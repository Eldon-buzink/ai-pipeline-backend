export default function AgentsPage() {
  return (
    <div className="flex-1 flex flex-col w-full bg-[var(--color-bg-primary)] overflow-y-auto">
      {/* Page Header */}
      <header className="sticky top-0 flex flex-col gap-4 p-[var(--spacing-xl)] border-b border-[var(--color-border)] bg-[var(--color-bg-surface)] bg-opacity-95 backdrop-blur-sm">
        <nav className="flex items-center gap-1 text-sm text-[var(--color-text-secondary)]">
          <span>Home</span>
          <span>/</span>
          <span className="text-[var(--color-text-primary)]">Agents</span>
        </nav>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Agents</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-[var(--spacing-xl)]">
        <p className="text-[var(--color-text-secondary)] mb-4">
          Agents page — verify layout offset is correct on this route too.
        </p>
        <div className="p-4 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
          <h2 className="font-semibold text-[var(--color-text-primary)] mb-2">Sidebar + Content Offset</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Content area maintains ml-[var(--sidebar-width-collapsed)] offset across all routes.
          </p>
        </div>
      </div>
    </div>
  );
}
