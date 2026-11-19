// ─── LabGrid: filtered grid of lab cards ──────────────────────────────────────
import React from 'react'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { FlaskConical } from 'lucide-react';
import { LabCard } from './LabCard';
import { labsRegistry } from '../../data/labsRegistry';
import type { FilterState } from '../layout/Sidebar';

interface LabGridProps {
  filters: FilterState;
  searchQuery?: string;
}

export function LabGrid({ filters, searchQuery = '' }: LabGridProps) {
  const q = searchQuery.toLowerCase().trim();
  const filtered = labsRegistry.filter((lab) => {
    if (q && !lab.title.toLowerCase().includes(q) && !lab.shortDesc.toLowerCase().includes(q) && !lab.category.toLowerCase().includes(q)) return false;
    if (filters.year     !== null && lab.year       !== filters.year)     return false;
    if (filters.semester !== null && lab.semester   !== filters.semester) return false;
    if (filters.category !== null && lab.category   !== filters.category) return false;
    if (filters.showOnlyLive && lab.status !== 'live') return false;
    return true;
  });

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-[var(--text-muted)]">
        <FlaskConical size={48} className="opacity-30" />
        <p className="text-sm">No experiments match your filters.</p>
      </div>
    );
  }

  // Group by semester for nicer layout
  const bySemester: Record<number, typeof filtered> = {};
  filtered.forEach((lab) => {
    if (!bySemester[lab.semester]) bySemester[lab.semester] = [];
    bySemester[lab.semester].push(lab);
  });

  const semesterKeys = Object.keys(bySemester).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-10">
      {semesterKeys.map((sem) => {
        const labs = bySemester[sem];
        const year = Math.ceil(sem / 2);
        return (
          <section key={sem}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--border)] text-xs font-medium text-[var(--text-muted)]">
                <span>Year {year}</span>
                <span className="w-px h-3 bg-[var(--text-muted)]/30" />
                <span>Semester {sem}</span>
                <span className="w-px h-3 bg-[var(--text-muted)]/30" />
                <span>{labs.length} experiment{labs.length > 1 ? 's' : ''}</span>
              </div>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {labs.map((lab) => (
                <LabCard key={lab.slug} lab={lab} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
