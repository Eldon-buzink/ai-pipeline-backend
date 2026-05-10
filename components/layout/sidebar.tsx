"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Mock navigation items - replace with actual nav structure
const NAV_ITEMS = [
  { id: "home", label: "Dashboard", href: "/", icon: "🏠" },
  { id: "agents", label: "Agents", href: "/agents", icon: "🤖" },
  { id: "gateway", label: "Gateway", href: "/gateway", icon: "⚙️" },
  { id: "settings", label: "Settings", href: "/settings", icon: "🔧" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isPinned, setIsPinned] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Load pinned state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("openclaw-sidebar-pinned");
    if (stored) setIsPinned(JSON.parse(stored));
  }, []);

  // Persist pinned state
  const handlePin = () => {
    const newState = !isPinned;
    setIsPinned(newState);
    localStorage.setItem("openclaw-sidebar-pinned", JSON.stringify(newState));
  };

  const isExpanded = isPinned || isHovering;
  const sidebarWidth = isExpanded ? "200px" : "48px";

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col bg-[var(--color-bg-primary)] border-r border-[var(--color-border)] overflow-hidden z-50 transition-all duration-300 ease-out"
      style={{ width: sidebarWidth }}
      onMouseEnter={() => !isPinned && setIsHovering(true)}
      onMouseLeave={() => !isPinned && setIsHovering(false)}
    >
      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col gap-[var(--spacing-md)] p-[var(--spacing-md)] overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative flex items-center h-10 px-[var(--spacing-sm)] rounded transition-all duration-200 group ${
                isActive
                  ? "bg-[var(--color-bg-surface)]"
                  : "hover:bg-[var(--color-bg-surface)] hover:bg-opacity-40"
              }`}
              title={item.label}
            >
              {/* Icon */}
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-lg">
                {item.icon}
              </span>

              {/* Label (visible when expanded) */}
              {isExpanded && (
                <span className="ml-[var(--spacing-sm)] text-sm font-normal text-[var(--color-text-primary)] truncate">
                  {item.label}
                </span>
              )}

              {/* Active indicator left border */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--color-accent-signal)] rounded-r" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="h-px bg-[var(--color-border)] mx-[var(--spacing-md)]" />

      {/* Pin Toggle */}
      <div className="p-[var(--spacing-md)]">
        <button
          onClick={handlePin}
          className={`w-full flex items-center justify-center h-10 rounded transition-all duration-200 ${
            isPinned
              ? "text-[var(--color-accent-signal)]"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
          title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
          aria-pressed={isPinned}
        >
          <span className="text-lg">{isPinned ? "📌" : "📍"}</span>
        </button>
      </div>
    </aside>
  );
}
