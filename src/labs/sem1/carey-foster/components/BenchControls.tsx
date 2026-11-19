import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Activity,
  CheckCircle2,
  Eye,
  Info,
} from 'lucide-react';
import type {
  CareyFosterBenchState,
  ExperimentPart,
  GapConfig,
  WireSpecimen,
} from '../types';
import { WIRE_SPECIMENS_LIST } from '../physicsEngine';

interface BenchControlsProps {
  benchState: CareyFosterBenchState;
  part: ExperimentPart;
  setPart: (part: ExperimentPart) => void;
  gapConfig: GapConfig;
  setGapConfig: (config: GapConfig) => void;
  resistanceX: number;
  setResistanceX: (x: number) => void;
  jockeyPos: number;
  setJockeyPos: (pos: number) => void;
  activeSpecimen: WireSpecimen;
  setActiveSpecimen: (specimen: WireSpecimen) => void;
  noiseOn: boolean;
  setNoiseOn: (noise: boolean) => void;
  onRecordNullLength: () => void;
  recordedA_Count: number;
  recordedB_Count: number;
  hasRecordedL1: boolean;
  hasRecordedL2: boolean;
}

const RESISTANCE_STEPS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

export function BenchControls({
  benchState,
  part,
  setPart,
  gapConfig,
  setGapConfig,
  resistanceX,
  setResistanceX,
  jockeyPos,
  setJockeyPos,
  activeSpecimen,
  setActiveSpecimen,
  noiseOn,
  setNoiseOn,
  onRecordNullLength,
  recordedA_Count,
  recordedB_Count,
  hasRecordedL1,
  hasRecordedL2,
}: BenchControlsProps) {
  const [showScrewGaugeModal, setShowScrewGaugeModal] = useState<boolean>(false);

  const isNormal = gapConfig === 'normal';
  const isPartA = part === 'partA';

  const handleNudge = (delta: number) => {
    const next = Math.max(0, Math.min(100, jockeyPos + delta));
    setJockeyPos(parseFloat(next.toFixed(1)));
  };

  const handleSnapToNull = () => {
    setJockeyPos(parseFloat(benchState.nullPointCm.toFixed(1)));
  };

  return (
    <div className="space-y-4">
      {/* ── Control Panel Header & Mode Selectors ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Experiment Part Selector */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
          <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers size={14} className="text-[var(--accent)]" />
              Experiment Stage
            </span>
            <span className="font-mono text-[11px] text-[var(--text-muted)] lowercase">
              {isPartA ? `${recordedA_Count} calibration rows` : `${recordedB_Count} specimen rows`}
            </span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setPart('partA')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-0.5 border ${
                isPartA
                  ? 'bg-sky-500/15 border-sky-500 text-sky-400 shadow-sm'
                  : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <span>Part A: Calibration</span>
              <span className="text-[10px] font-normal opacity-80">
                Copper Strip &bull; Find ρ_w
              </span>
            </button>

            <button
              onClick={() => setPart('partB')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-0.5 border ${
                !isPartA
                  ? 'bg-violet-500/15 border-violet-500 text-violet-400 shadow-sm'
                  : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <span>Part B: Unknown Wire</span>
              <span className="text-[10px] font-normal opacity-80">
                Wire Y &bull; Find Y and ρ
              </span>
            </button>
          </div>
        </div>

        {/* Gap Interchange Toggle */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
          <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ArrowLeftRight size={14} className="text-amber-400" />
              Gap Configuration (Eliminates α, β)
            </span>
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              {isNormal ? 'l₁ Reading' : 'l₂ Reading'}
            </span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setGapConfig('normal')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-0.5 border ${
                isNormal
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                  : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <div className="flex items-center gap-1">
                <span>Normal Position</span>
                {hasRecordedL1 && <CheckCircle2 size={11} className="text-emerald-400" />}
              </div>
              <span className="text-[10px] font-normal opacity-80 truncate">
                Left: Box X | Right: {isPartA ? 'Cu Strip' : 'Wire Y'}
              </span>
            </button>

            <button
              onClick={() => setGapConfig('interchanged')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-0.5 border ${
                !isNormal
                  ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                  : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <div className="flex items-center gap-1">
                <span>Interchanged Position</span>
                {hasRecordedL2 && <CheckCircle2 size={11} className="text-emerald-400" />}
              </div>
              <span className="text-[10px] font-normal opacity-80 truncate">
                Left: {isPartA ? 'Cu Strip' : 'Wire Y'} | Right: Box X
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Resistance Box X & Specimen Selection ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fractional Resistance Box X */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
              <Sliders size={14} className="text-cyan-400" />
              Standard Resistance Box (X)
            </span>
            <span className="font-mono text-xs font-bold text-cyan-400 tabular-nums">
              {resistanceX.toFixed(1)} Ω
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {RESISTANCE_STEPS.map((step) => (
              <button
                key={step}
                onClick={() => setResistanceX(step)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium tabular-nums transition-all border ${
                  Math.abs(resistanceX - step) < 0.01
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {step.toFixed(1)} Ω
              </button>
            ))}
          </div>
        </div>

        {/* Wire Specimen Selector (Part B active) & Screw Gauge Trigger */}
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={14} className="text-emerald-400" />
              Unknown Specimen Wire (Y)
            </span>
            <button
              onClick={() => setShowScrewGaugeModal(true)}
              className="text-[11px] font-medium text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              <Eye size={12} />
              <span>Screw Gauge Micro-View</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {WIRE_SPECIMENS_LIST.map((spec) => (
              <button
                key={spec.id}
                onClick={() => setActiveSpecimen(spec)}
                className={`p-2 rounded-lg text-left text-xs transition-all border ${
                  activeSpecimen.id === spec.id
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                    : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                <div className="font-semibold text-[var(--text)] truncate">{spec.name}</div>
                <div className="text-[10px] text-[var(--text-muted)] font-mono tabular-nums">
                  L={spec.lengthCm}cm &bull; d={spec.diameterMm}mm
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Jockey Position Slider & Fine Nudge Controls ───────────────────── */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">
              Sliding Jockey Position (0.0 – 100.0 cm)
            </span>
            <span className="px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-xs font-mono font-bold text-[var(--accent)] tabular-nums">
              {jockeyPos.toFixed(1)} cm
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Find Null Point Helper */}
            <button
              onClick={handleSnapToNull}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all flex items-center gap-1"
              title="Snap jockey directly to the balanced null point"
            >
              <Sparkles size={12} className="text-amber-400" />
              <span>Find Null Point</span>
            </button>

            {/* Realistic Noise Toggle */}
            <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={noiseOn}
                onChange={(e) => setNoiseOn(e.target.checked)}
                className="rounded accent-[var(--accent)]"
              />
              <span>Realistic Noise (&plusmn;0.2 cm)</span>
            </label>
          </div>
        </div>

        {/* Range Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[var(--text-muted)]">0.0</span>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={jockeyPos}
            onChange={(e) => setJockeyPos(parseFloat(e.target.value))}
            className="flex-1 accent-[var(--accent)] cursor-pointer"
          />
          <span className="text-xs font-mono text-[var(--text-muted)]">100.0</span>
        </div>

        {/* Fine Nudge Buttons & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleNudge(-1.0)}
              className="px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              -1.0 cm
            </button>
            <button
              onClick={() => handleNudge(-0.1)}
              className="p-1 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              title="Nudge left 0.1 cm"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => handleNudge(0.1)}
              className="p-1 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              title="Nudge right 0.1 cm"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => handleNudge(1.0)}
              className="px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] text-xs font-mono text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              +1.0 cm
            </button>
          </div>

          {/* Record Null Length Button */}
          <button
            onClick={onRecordNullLength}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-sm ${
              benchState.isAtNull
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-[var(--accent)] hover:opacity-90 text-white'
            }`}
          >
            <CheckCircle2 size={14} />
            <span>
              Record Null Length ({isNormal ? (isPartA ? 'l₁' : 'l₁\'') : (isPartA ? 'l₂' : 'l₂\'')} = {jockeyPos.toFixed(1)} cm)
            </span>
          </button>
        </div>
      </div>

      {/* ── Screw Gauge Micro-View Modal ───────────────────────────────────── */}
      {showScrewGaugeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-md w-full rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2 text-[var(--text)] font-semibold text-sm">
                <Eye size={16} className="text-emerald-400" />
                <span>Screw Gauge Micro-View: {activeSpecimen.name}</span>
              </div>
              <button
                onClick={() => setShowScrewGaugeModal(false)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] px-2 py-1 rounded bg-[var(--bg)]"
              >
                Close ✕
              </button>
            </div>

            {/* Graphic Representation */}
            <div className="p-4 rounded-xl bg-black/40 border border-[var(--border)] flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-full h-16 relative flex items-center justify-center">
                {/* Barrel */}
                <div className="w-32 h-10 bg-slate-700 rounded-l border border-slate-500 relative flex items-center">
                  <div className="w-full h-0.5 bg-yellow-400/80 absolute" />
                  <span className="text-[9px] font-mono text-yellow-300 absolute left-2 top-0.5">
                    MSR: {activeSpecimen.screwGauge.msrMm} mm
                  </span>
                </div>
                {/* Thimble */}
                <div className="w-24 h-12 bg-slate-800 rounded-r border-y border-r border-slate-500 relative flex items-center justify-center">
                  <span className="text-[9px] font-mono text-cyan-300">
                    CSR: {activeSpecimen.screwGauge.csrDiv} div
                  </span>
                </div>
                {/* Clamped Wire */}
                <div
                  className="w-2 bg-amber-600 absolute left-14 h-8 rounded-sm shadow-sm"
                  title="Clamped Specimen Wire"
                />
              </div>

              <div className="text-[11px] font-mono text-[var(--text-muted)]">
                Specimen Wire clamped firmly between anvil and spindle
              </div>
            </div>

            {/* Formula & Reading Details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[var(--border)]">
                <span className="text-[var(--text-muted)]">Pitch of Screw:</span>
                <span className="font-mono text-[var(--text)] font-semibold tabular-nums">
                  {activeSpecimen.screwGauge.pitchMm} mm
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border)]">
                <span className="text-[var(--text-muted)]">Total Circular Divisions:</span>
                <span className="font-mono text-[var(--text)] font-semibold tabular-nums">
                  {activeSpecimen.screwGauge.divisions} divisions
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border)]">
                <span className="text-[var(--text-muted)]">Least Count (LC):</span>
                <span className="font-mono text-emerald-400 font-semibold tabular-nums">
                  {activeSpecimen.screwGauge.leastCountMm} mm (0.001 cm)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border)]">
                <span className="text-[var(--text-muted)]">Main Scale Reading (MSR):</span>
                <span className="font-mono text-cyan-400 font-semibold tabular-nums">
                  {activeSpecimen.screwGauge.msrMm} mm
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[var(--border)]">
                <span className="text-[var(--text-muted)]">Circular Scale Reading (CSR):</span>
                <span className="font-mono text-cyan-400 font-semibold tabular-nums">
                  {activeSpecimen.screwGauge.csrDiv} div
                </span>
              </div>
              <div className="flex justify-between py-1.5 bg-[var(--bg)] px-2.5 rounded-lg border border-[var(--border)]">
                <span className="font-semibold text-[var(--text)]">Observed Diameter (d):</span>
                <span className="font-mono text-[var(--accent)] font-bold tabular-nums">
                  d = {activeSpecimen.diameterMm.toFixed(2)} mm
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Use this observed diameter <span className="font-mono text-[var(--text)]">d = {activeSpecimen.diameterMm} mm</span> and wire length{' '}
              <span className="font-mono text-[var(--text)]">L = {activeSpecimen.lengthCm} cm</span> in the Observation Table to calculate
              specific resistance <span className="font-mono text-[var(--text)]">ρ</span>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
