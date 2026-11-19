// ─── Badge: status indicator ───────────────────────────────────────────────────
import React from 'react'; // eslint-disable-line @typescript-eslint/no-unused-vars
import type { LabStatus, LabCategory, LabDifficulty } from '../../types/lab';

interface StatusBadgeProps {
  status: LabStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Live
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
      Coming Soon
    </span>
  );
}

interface CategoryBadgeProps {
  category: LabCategory;
}

const categoryColors: Record<LabCategory, string> = {
  Thermal:        'bg-orange-500/15 text-orange-400 border-orange-500/30',
  Optics:         'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Electricity:    'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Mechanics:      'bg-green-500/15 text-green-400 border-green-500/30',
  'Modern Physics': 'bg-pink-500/15 text-pink-400 border-pink-500/30',
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${categoryColors[category]}`}
    >
      {category}
    </span>
  );
}

interface DifficultyBadgeProps {
  difficulty: LabDifficulty;
}

const difficultyColors: Record<LabDifficulty, string> = {
  Beginner:     'text-emerald-400',
  Intermediate: 'text-yellow-400',
  Advanced:     'text-red-400',
};

const difficultyDots: Record<LabDifficulty, number> = {
  Beginner: 1, Intermediate: 2, Advanced: 3,
};

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const dots = difficultyDots[difficulty];
  const color = difficultyColors[difficulty];
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${color}`}>
      {[1, 2, 3].map((d) => (
        <span
          key={d}
          className={`w-1.5 h-1.5 rounded-full ${d <= dots ? 'bg-current' : 'bg-current opacity-20'}`}
        />
      ))}
      <span className="ml-0.5">{difficulty}</span>
    </span>
  );
}
