import React, { useState } from 'react';
import { Flame, CheckCircle, RefreshCw } from 'lucide-react';
import { computeRg, computeR0, R0_DEFAULT } from '../physicsEngine';

interface RgTableProps {
  currentV: number;
  currentI: number;
  sessionR0: number;
  onUpdateR0: (newR0: number) => void;
}

export function RgTable({ currentV, currentI, sessionR0, onUpdateR0 }: RgTableProps) {
  // Table 1 values: increasing and decreasing current at just glowing
  const [vInc, setVInc] = useState<string>('0.74');
  const [iInc, setIInc] = useState<string>('0.14');
  const [vDec, setVDec] = useState<string>('0.72');
  const [iDec, setIDec] = useState<string>('0.13');

  const rg1 = computeRg(parseFloat(vInc) || 0, parseFloat(iInc) || 0);
  const rg2 = computeRg(parseFloat(vDec) || 0, parseFloat(iDec) || 0);
  const meanRg = rg1 > 0 && rg2 > 0 ? (rg1 + rg2) / 2 : rg1 || rg2;
  const calculatedR0 = computeR0(meanRg);

  const captureInc = () => {
    if (currentV > 0 && currentI > 0) {
      setVInc(currentV.toFixed(3));
      setIInc(currentI.toFixed(3));
    }
  };

  const captureDec = () => {
    if (currentV > 0 && currentI > 0) {
      setVDec(currentV.toFixed(3));
      setIDec(currentI.toFixed(3));
    }
  };

  const handleApplyR0 = () => {
    if (calculatedR0 > 0.5 && calculatedR0 < 5.0) {
      onUpdateR0(parseFloat(calculatedR0.toFixed(3)));
    }
  };

  const handleResetDefault = () => {
    onUpdateR0(R0_DEFAULT);
  };

  return (
    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
            <Flame size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text)]">
              Table 1: Determination of Glowing Resistance (R_g) & Cold Resistance (R₀)
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              At Draper Point (~800 K, dull red glow), measure V_g and I_g to deduce R₀ = R_g / 3.9
            </p>
          </div>
        </div>

        {/* Current Active R0 indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
          <span className="text-xs text-[var(--text-muted)]">Active Cold Resistance:</span>
          <span className="font-mono font-bold text-xs text-[var(--accent)]">
            R₀ = {sessionR0.toFixed(3)} Ω
          </span>
        </div>
      </div>

      {/* Table 1 Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)]">
              <th className="py-2.5 px-3 font-semibold">Condition</th>
              <th className="py-2.5 px-3 font-semibold">V_g (Volts)</th>
              <th className="py-2.5 px-3 font-semibold">I_g (Ampere)</th>
              <th className="py-2.5 px-3 font-semibold">R_g = V_g / I_g (Ω)</th>
              <th className="py-2.5 px-3 font-semibold text-right">Quick Capture</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] text-[var(--text)]">
            <tr>
              <td className="py-2.5 px-3 font-medium">1. Current Increasing (Just Glowing)</td>
              <td className="py-2.5 px-3">
                <input
                  type="number"
                  step="0.01"
                  value={vInc}
                  onChange={(e) => setVInc(e.target.value)}
                  className="w-24 px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] font-mono tabular-nums text-xs"
                />
              </td>
              <td className="py-2.5 px-3">
                <input
                  type="number"
                  step="0.01"
                  value={iInc}
                  onChange={(e) => setIInc(e.target.value)}
                  className="w-24 px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] font-mono tabular-nums text-xs"
                />
              </td>
              <td className="py-2.5 px-3 font-mono tabular-nums font-semibold text-emerald-400">
                {rg1 > 0 ? `${rg1.toFixed(3)} Ω` : '---'}
              </td>
              <td className="py-2.5 px-3 text-right">
                <button
                  onClick={captureInc}
                  className="px-2.5 py-1 rounded bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--border)] text-[11px]"
                  title="Capture current bench V & I"
                >
                  Capture Live
                </button>
              </td>
            </tr>

            <tr>
              <td className="py-2.5 px-3 font-medium">2. Current Decreasing (Just Extinguishing)</td>
              <td className="py-2.5 px-3">
                <input
                  type="number"
                  step="0.01"
                  value={vDec}
                  onChange={(e) => setVDec(e.target.value)}
                  className="w-24 px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] font-mono tabular-nums text-xs"
                />
              </td>
              <td className="py-2.5 px-3">
                <input
                  type="number"
                  step="0.01"
                  value={iDec}
                  onChange={(e) => setIDec(e.target.value)}
                  className="w-24 px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] font-mono tabular-nums text-xs"
                />
              </td>
              <td className="py-2.5 px-3 font-mono tabular-nums font-semibold text-emerald-400">
                {rg2 > 0 ? `${rg2.toFixed(3)} Ω` : '---'}
              </td>
              <td className="py-2.5 px-3 text-right">
                <button
                  onClick={captureDec}
                  className="px-2.5 py-1 rounded bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--border)] text-[11px]"
                  title="Capture current bench V & I"
                >
                  Capture Live
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Result summary & actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border)] text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span>
            Mean <strong className="text-[var(--text)]">R_g</strong> ={' '}
            <span className="font-mono tabular-nums">{meanRg > 0 ? `${meanRg.toFixed(3)} Ω` : '---'}</span>
          </span>
          <span>
            Cold Resistance <strong className="text-[var(--text)]">R₀ = R_g / 3.9</strong> ={' '}
            <strong className="text-emerald-400 font-mono tabular-nums">
              {calculatedR0 > 0 ? `${calculatedR0.toFixed(3)} Ω` : '---'}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleApplyR0}
            disabled={calculatedR0 <= 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 text-xs font-semibold disabled:opacity-50"
          >
            <CheckCircle size={13} />
            Apply Deduced R₀ ({calculatedR0.toFixed(2)} Ω)
          </button>
          <button
            onClick={handleResetDefault}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] text-xs"
            title="Reset to calibrated default 1.400 Ω"
          >
            <RefreshCw size={12} />
            Reset ({R0_DEFAULT} Ω)
          </button>
        </div>
      </div>
    </div>
  );
}
