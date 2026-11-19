// ─── LabCard: individual experiment card on the home grid ─────────────────────
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import {
  Flame, CircleDot, Layers, Magnet, GitBranch,
  FlaskConical, Cpu, Zap, RotateCw,
} from 'lucide-react';
import { StatusBadge, CategoryBadge, DifficultyBadge } from '../ui/Badge';
import type { LabMeta } from '../../types/lab';

// Icon map — add new icons here as experiments expand
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Flame, CircleDot, Layers, Magnet, GitBranch, FlaskConical, Cpu, Zap, RotateCw,
};

interface LabCardProps {
  lab: LabMeta;
}

export function LabCard({ lab }: LabCardProps) {
  const Icon = ICON_MAP[lab.icon] ?? FlaskConical;
  const isLive = lab.status === 'live';

  const CardContent = (
    <div
      className={`
        relative flex flex-col justify-between h-full p-5 rounded-xl border transition-all duration-200
        bg-[var(--surface)] border-[var(--border)]
        ${isLive
          ? 'hover:border-[var(--accent)]/50 cursor-pointer group'
          : 'opacity-70 cursor-default'
        }
      `}
    >
      <div>
        {/* Top row: icon + status */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-[var(--border)]
            ${isLive ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-[var(--bg)] text-[var(--text-muted)]'}
          `}>
            <Icon size={20} />
          </div>
          <StatusBadge status={lab.status} />
        </div>

        {/* Title & Short Description */}
        <div className="mb-4">
          <h3 className="font-semibold text-[var(--text)] text-sm leading-snug mb-1.5">{lab.title}</h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2 min-h-[2.5rem]">{lab.shortDesc}</p>
        </div>
      </div>

      {/* Card Bottom Area: Category, Difficulty & Action Footer */}
      <div className="space-y-3.5 mt-auto">
        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={lab.category} />
          <DifficultyBadge difficulty={lab.difficulty} />
        </div>

        {/* Footer: time + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono tabular-nums">
            <Clock size={12} />
            {lab.estimatedTime}
          </div>
          {isLive ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)] group-hover:gap-1.5 transition-all">
              Start Lab <ArrowRight size={12} />
            </span>
          ) : (
            <span className="text-xs text-[var(--text-muted)]">Coming Soon</span>
          )}
        </div>
      </div>
    </div>
  );

  if (isLive) {
    return <Link to={`/lab/${lab.slug}`} className="block h-full">{CardContent}</Link>;
  }

  return <div className="h-full">{CardContent}</div>;
}
