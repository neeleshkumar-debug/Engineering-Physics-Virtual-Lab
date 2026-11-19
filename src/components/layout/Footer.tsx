import React from 'react';
import { FlaskConical } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-6 px-4 md:px-6 transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Branding & Tagline */}
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <FlaskConical size={14} className="text-[var(--accent)] shrink-0" />
          <span className="font-semibold text-[var(--text)]">Engineering Physics Virtual Lab</span>
          <span className="hidden sm:inline text-[var(--border)]">•</span>
          <span className="hidden sm:inline">B.Tech Practicals</span>
        </div>

        {/* Center / Right: The user's requested subtle credit */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
          <span className="font-medium text-[var(--text)] tracking-tight">
            Built by Neelesh
          </span>
          <span className="text-[var(--text-muted)] font-normal italic">
            — visualize the labs you missed.
          </span>
        </div>
      </div>
    </footer>
  );
}
