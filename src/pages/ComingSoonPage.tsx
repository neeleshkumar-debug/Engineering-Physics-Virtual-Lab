// ─── Coming Soon placeholder for unbuilt experiments ─────────────────────────
import React from 'react'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, Wrench } from 'lucide-react';
import { getLabBySlug } from '../data/labsRegistry';
import { CategoryBadge, DifficultyBadge } from '../components/ui/Badge';

interface ComingSoonPageProps {
  slug: string;
}

export function ComingSoonPage({ slug }: ComingSoonPageProps) {
  const lab = getLabBySlug(slug);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="w-20 h-20 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center mb-6">
        <Wrench size={36} className="text-[var(--accent)]" />
      </div>

      <h1 className="text-2xl font-bold text-[var(--text)] mb-2">
        {lab?.title ?? slug}
      </h1>

      <p className="text-[var(--text-muted)] max-w-md mb-6 leading-relaxed">
        {lab?.shortDesc ?? 'This experiment is under construction and will be available soon.'}
      </p>

      {lab && (
        <div className="flex items-center gap-3 mb-8">
          <CategoryBadge category={lab.category} />
          <DifficultyBadge difficulty={lab.difficulty} />
          <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Clock size={12} /> {lab.estimatedTime}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-sm text-[var(--accent)] mb-8">
        <Clock size={14} />
        Coming in a future update
      </div>

      <Link
        to="/"
        className="flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
      >
        <ArrowLeft size={15} />
        Back to All Experiments
      </Link>
    </div>
  );
}
