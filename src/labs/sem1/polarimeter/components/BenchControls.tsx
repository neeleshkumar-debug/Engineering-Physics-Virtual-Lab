import React from 'react';
import {
  RotateCw,
  Power,
  Sparkles,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Ruler,
  Sliders,
  Eye,
  Radio,
} from 'lucide-react';
import type {
  TubeLengthOption,
  SolutionType,
  PolarimeterBenchState,
} from '../types';
import {
  LAB_SOLUTIONS,
  formatVernierAngle,
  normalizeAngularMismatch,
} from '../physicsEngine';

interface BenchControlsProps {
  benchState: PolarimeterBenchState;
  lampOn: boolean;
  setLampOn: (on: boolean) => void;
  analyzerAngleDeg: number;
  setAnalyzerAngleDeg: (deg: number) => void;
  tubeLengthDm: TubeLengthOption;
  setTubeLengthDm: (l: TubeLengthOption) => void;
  selectedSolution: SolutionType;
  setSelectedSolution: (s: SolutionType) => void;
  noiseOn: boolean;
  setNoiseOn: (on: boolean) => void;
  onRecordReading: () => void;
  onAutoMatch: () => void;
  onResetBench: () => void;
  recordedCount: number;
}

export function BenchControls({
  benchState,
  lampOn,
  setLampOn,
  analyzerAngleDeg,
  setAnalyzerAngleDeg,
  tubeLengthDm,
  setTubeLengthDm,
  selectedSolution,
  setSelectedSolution,
  noiseOn,
  setNoiseOn,
  onRecordReading,
  onAutoMatch,
  onResetBench,
  recordedCount,
}: BenchControlsProps) {
  // Nudge analyzer angle by step (e.g. ±0.05°, ±0.5°, ±1.0°)
  const handleNudge = (stepDeg: number) => {
    let next = analyzerAngleDeg + stepDeg;
    if (next < 0) next += 360;
    if (next >= 360) next -= 360;
    setAnalyzerAngleDeg(parseFloat(next.toFixed(2)));
  };

  const vernier = formatVernierAngle(analyzerAngleDeg);
  const mismatch = normalizeAngularMismatch(
    analyzerAngleDeg,
    benchState.theoreticalMatchAngleDeg
  );

  return (
    <div className="space-y-6">
      {/* ── Top Bar: Lamp Toggle + Bench Status ───────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLampOn(!lampOn)}
            className={`
              flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all
              ${lampOn
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
                : 'bg-[var(--bg)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text)]'
              }
            `}
          >
            <Power size={14} className={lampOn ? 'text-amber-400' : 'text-slate-400'} />
            <span>Sodium Lamp ({lampOn ? '589.3nm ON' : 'OFF'})</span>
          </button>

          <button
            onClick={() => setNoiseOn(!noiseOn)}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all
              ${noiseOn
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                : 'bg-[var(--bg)] text-[var(--text-muted)] border border-[var(--border)] hover:text-[var(--text)]'
              }
            `}
            title="Toggle realistic human setting error (±0.10°)"
          >
            <Radio size={13} />
            <span>Realistic Noise: {noiseOn ? '±0.10° ON' : 'Ideal OFF'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[var(--text-muted)]">Recorded Observations:</span>
          <span className="font-mono font-bold text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-0.5 rounded border border-[var(--accent)]/20 tabular-nums">
            {recordedCount}
          </span>
          <button
            onClick={onResetBench}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)] transition-colors ml-2"
            title="Reset bench to default water zero"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ── Main Controls Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel 1: Solution & Tube Length Selection */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
          <div className="flex items-center gap-2 text-[var(--accent)] font-semibold text-xs tracking-wider uppercase">
            <FlaskConical size={15} />
            <h3>Solution & Tube Geometry</h3>
          </div>

          {/* Tube Length (L) */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-muted)] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Ruler size={13} />
                Polarimeter Tube Length (L)
              </span>
              <span className="font-mono tabular-nums text-[var(--text)] font-semibold">
                {tubeLengthDm.toFixed(1)} dm ({Math.round(tubeLengthDm * 10)} cm)
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([1.0, 2.0, 2.2] as TubeLengthOption[]).map((len) => (
                <button
                  key={len}
                  onClick={() => setTubeLengthDm(len)}
                  className={`
                    py-2 rounded-lg text-xs font-medium border text-center transition-all
                    ${tubeLengthDm === len
                      ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)] font-bold'
                      : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--text)]'
                    }
                  `}
                >
                  <div className="font-mono tabular-nums">{len.toFixed(1)} dm</div>
                  <div className="text-[10px] opacity-75">{Math.round(len * 10)} cm</div>
                </button>
              ))}
            </div>
          </div>

          {/* Solution Selector */}
          <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
            <label className="text-xs font-medium text-[var(--text-muted)] flex items-center justify-between">
              <span>Solution / Concentration (c)</span>
              <span className="font-mono tabular-nums text-emerald-400 font-semibold text-[11px]">
                {benchState.concentration_g_cm3.toFixed(3)} g/cm³
              </span>
            </label>
            <div className="space-y-1.5">
              {LAB_SOLUTIONS.map((sol) => {
                const isSelected = selectedSolution === sol.id;
                return (
                  <button
                    key={sol.id}
                    onClick={() => setSelectedSolution(sol.id)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs border text-left transition-all
                      ${isSelected
                        ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--text)] font-semibold shadow-sm'
                        : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--text)]'
                      }
                    `}
                  >
                    <div>
                      <div className="text-xs">{sol.shortLabel}</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono tabular-nums">
                        {sol.id === 'water'
                          ? 'Reference Zero θ₀ (c = 0.00)'
                          : sol.isUnknown
                          ? 'Sample X (Concentration Unknown)'
                          : `${sol.concentration_g_cm3} g/cm³ (${sol.percentage} g / 100 mL)`}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={15} className="text-[var(--accent)] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel 2: Analyzer Angular Rotation & Vernier Controls */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
              <Sliders size={15} />
              <h3>Analyzer Angular Rotation (φ)</h3>
            </div>
            {/* Auto Match Helper */}
            <button
              onClick={onAutoMatch}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
              title="Snap analyzer angle to the exact equal-brightness match point"
            >
              <Sparkles size={13} />
              <span>Find Equal Brightness Point</span>
            </button>
          </div>

          {/* Current Angle Readout Banner */}
          <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Observed Analyzer Angle (θ)</p>
              <p className="text-2xl md:text-3xl font-bold font-mono tabular-nums text-[var(--text)] mt-0.5">
                {analyzerAngleDeg.toFixed(2)}°
              </p>
              <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
                Vernier: <span className="text-cyan-400 font-semibold">{vernier.formatted}</span>
              </p>
            </div>

            {/* Mismatch & Half-Shade Visual Indicator */}
            <div className="text-right">
              <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">Field Status</p>
              {benchState.isEqualBrightness ? (
                <div className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs mt-1 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  <CheckCircle2 size={14} />
                  <span>Equal Illumination (Balanced)</span>
                </div>
              ) : (
                <div className="text-xs font-mono mt-1 text-[var(--text-muted)]">
                  Offset: <span className="text-amber-400 font-bold tabular-nums">{mismatch > 0 ? `+${mismatch.toFixed(2)}°` : `${mismatch.toFixed(2)}°`}</span>
                  <div className="text-[10px] text-slate-400">
                    {mismatch > 0 ? 'Left brighter ➔ turn CCW' : 'Right brighter ➔ turn CW'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>0.00°</span>
              <span className="font-mono font-semibold text-[var(--text)]">Analyzer Dial: {analyzerAngleDeg.toFixed(2)}°</span>
              <span>180.00° / 360.00°</span>
            </div>
            <input
              type="range"
              min={0}
              max={180}
              step={0.05}
              value={analyzerAngleDeg > 180 ? analyzerAngleDeg - 180 : analyzerAngleDeg}
              onChange={(e) => setAnalyzerAngleDeg(parseFloat(parseFloat(e.target.value).toFixed(2)))}
              className="w-full accent-[var(--accent)] cursor-pointer h-2 bg-[var(--bg)] rounded-lg appearance-none"
            />
          </div>

          {/* Precision Nudge Buttons */}
          <div className="space-y-2">
            <span className="text-[11px] text-[var(--text-muted)] font-medium">Precision Fine Nudge (Least Count = 0.05°):</span>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--bg)] p-0.5">
                <button
                  onClick={() => handleNudge(-1.0)}
                  className="px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded transition-colors font-mono tabular-nums"
                  title="Step -1.0°"
                >
                  -1.0°
                </button>
                <button
                  onClick={() => handleNudge(-0.5)}
                  className="px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded transition-colors font-mono tabular-nums"
                  title="Step -0.5°"
                >
                  -0.5°
                </button>
                <button
                  onClick={() => handleNudge(-0.05)}
                  className="px-2.5 py-1.5 text-xs text-[var(--text)] hover:text-cyan-400 hover:bg-[var(--surface)] rounded transition-colors font-mono font-bold tabular-nums"
                  title="Fine step -0.05° (Least Count)"
                >
                  -0.05°
                </button>
              </div>

              <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--bg)] p-0.5">
                <button
                  onClick={() => handleNudge(+0.05)}
                  className="px-2.5 py-1.5 text-xs text-[var(--text)] hover:text-cyan-400 hover:bg-[var(--surface)] rounded transition-colors font-mono font-bold tabular-nums"
                  title="Fine step +0.05° (Least Count)"
                >
                  +0.05°
                </button>
                <button
                  onClick={() => handleNudge(+0.5)}
                  className="px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded transition-colors font-mono tabular-nums"
                  title="Step +0.5°"
                >
                  +0.5°
                </button>
                <button
                  onClick={() => handleNudge(+1.0)}
                  className="px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded transition-colors font-mono tabular-nums"
                  title="Step +1.0°"
                >
                  +1.0°
                </button>
              </div>

              {/* Record Analyzer Reading Button */}
              <button
                onClick={onRecordReading}
                disabled={!lampOn}
                className={`
                  ml-auto flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md
                  ${lampOn
                    ? 'bg-[var(--accent)] hover:opacity-90 text-white cursor-pointer active:scale-95'
                    : 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed opacity-50'
                  }
                `}
              >
                <Plus size={15} />
                <span>Record Reading (θ = {analyzerAngleDeg.toFixed(2)}°)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
