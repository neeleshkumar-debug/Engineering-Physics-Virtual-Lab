// ─── Sidebar: Year / Semester / Category filters ───────────────────────────────
import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import type { LabCategory } from '../../types/lab';

export interface FilterState {
  year: number | null;
  semester: number | null;
  category: LabCategory | null;
  showOnlyLive: boolean;
}

interface SidebarProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

const CATEGORIES: LabCategory[] = ['Optics', 'Thermal', 'Electricity', 'Mechanics', 'Modern Physics'];

const categoryDot: Record<LabCategory, string> = {
  Thermal:          'bg-orange-400',
  Optics:           'bg-purple-400',
  Electricity:      'bg-blue-400',
  Mechanics:        'bg-green-400',
  'Modern Physics': 'bg-pink-400',
};

export function Sidebar({ filters, onChange }: SidebarProps) {
  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  return (
    <aside className="w-full lg:w-56 shrink-0 space-y-6 p-4 lg:p-0">
      {/* Header */}
      <div className="flex items-center gap-2 text-[var(--text-muted)]">
        <Filter size={14} />
        <span className="text-xs font-semibold uppercase tracking-widest">Filters</span>
        {(filters.year || filters.semester || filters.category || filters.showOnlyLive) && (
          <button
            onClick={() => onChange({ year: null, semester: null, category: null, showOnlyLive: false })}
            className="ml-auto text-xs text-[var(--accent)] hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Year filter */}
      <FilterSection title="Year">
        {[1, 2, 3, 4].map((y) => (
          <FilterChip
            key={y}
            label={`${y}${['st','nd','rd','th'][y-1]} Year`}
            active={filters.year === y}
            onClick={() => set({ year: filters.year === y ? null : y, semester: null })}
          />
        ))}
      </FilterSection>

      {/* Semester filter */}
      {filters.year !== null && (
        <FilterSection title="Semester">
          {[1, 2].map((offset) => {
            const sem = (filters.year! - 1) * 2 + offset;
            return (
              <FilterChip
                key={sem}
                label={`Semester ${sem}`}
                active={filters.semester === sem}
                onClick={() => set({ semester: filters.semester === sem ? null : sem })}
              />
            );
          })}
        </FilterSection>
      )}

      {/* Category filter */}
      <FilterSection title="Category">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => set({ category: filters.category === cat ? null : cat })}
            className={`
              flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors
              ${filters.category === cat
                ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]'
              }
            `}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${categoryDot[cat]}`} />
            {cat}
          </button>
        ))}
      </FilterSection>

      {/* Live only toggle */}
      <FilterSection title="Status">
        <button
          onClick={() => set({ showOnlyLive: !filters.showOnlyLive })}
          className={`
            flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors
            ${filters.showOnlyLive
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]'
            }
          `}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          Available Now
        </button>
      </FilterSection>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2 hover:text-[var(--text)] transition-colors"
      >
        {title}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-0' : '-rotate-90'}`} />
      </button>
      {open && <div className="space-y-1">{children}</div>}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-2.5 py-1.5 rounded-md text-sm transition-colors
        ${active
          ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--border)]'
        }
      `}
    >
      {label}
    </button>
  );
}
