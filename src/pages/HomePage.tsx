// ─── Home Page ─────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { Search, Beaker, GraduationCap, BookOpen } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { LabGrid } from '../components/home/LabGrid';
import type { FilterState } from '../components/layout/Sidebar';
import { labsRegistry } from '../data/labsRegistry';

const DEFAULT_FILTERS: FilterState = {
  year: null,
  semester: null,
  category: null,
  showOnlyLive: false,
};

export function HomePage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');

  const totalCount = labsRegistry.length;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero section */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-b from-[var(--accent)]/5 to-transparent">
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 md:px-6 py-14 md:py-20">
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--text)] mb-4 leading-tight">
            Engineering Physics<br />
            <span className="text-[var(--accent)]">Virtual Lab</span>
          </h1>

          <p className="text-base md:text-lg text-[var(--text-muted)] max-w-2xl mb-8 leading-relaxed">
            Perform missed practicals, verify your own calculations, and plot interactive graphs —
            exactly as your college lab manual specifies. All physics runs locally, zero backend.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 text-sm mb-8">
            {[
              { icon: <Beaker size={16} />,        label: `${totalCount} Experiments` },
              { icon: <GraduationCap size={16} />, label: '1st Year B.Tech' },
              { icon: <BookOpen size={16} />,      label: 'Lab Manual Accurate' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-[var(--text-muted)]">
                <span className="text-[var(--accent)]">{icon}</span>
                {label}
              </div>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search experiments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
                bg-[var(--surface)] border border-[var(--border)]
                text-[var(--text)] placeholder:text-[var(--text-muted)]
                focus:outline-none focus:border-[var(--accent)]/60 focus:ring-2 focus:ring-[var(--accent)]/20
                transition-colors
              "
            />
          </div>
        </div>
      </section>

      {/* Main content: Sidebar + Grid */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar filters={filters} onChange={setFilters} />

          <main className="flex-1 min-w-0">
            <LabGrid filters={filters} searchQuery={search} />
          </main>
        </div>
      </div>
    </div>
  );
}
