// ─── Toggle Switch ─────────────────────────────────────────────────────────────
import React from 'react'; // eslint-disable-line @typescript-eslint/no-unused-vars

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  description?: string;
  color?: 'green' | 'blue' | 'orange';
}

const colorMap = {
  green:  'bg-emerald-500',
  blue:   'bg-blue-500',
  orange: 'bg-orange-500',
};

export function Toggle({ checked, onChange, label, description, color = 'green' }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none group">
      <div className="relative shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`
            w-11 h-6 rounded-full transition-colors duration-200
            ${checked ? colorMap[color] : 'bg-[var(--border)]'}
          `}
        />
        <div
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </div>
      {(label || description) && (
        <div>
          {label && (
            <p className="text-sm font-medium text-[var(--text)]">{label}</p>
          )}
          {description && (
            <p className="text-xs text-[var(--text-muted)]">{description}</p>
          )}
        </div>
      )}
    </label>
  );
}
