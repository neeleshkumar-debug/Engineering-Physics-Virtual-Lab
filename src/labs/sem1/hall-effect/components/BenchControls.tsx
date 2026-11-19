import React, { useState } from 'react';
import {
  Power,
  Zap,
  Magnet,
  Layers,
  Sliders,
  PlusCircle,
  Check,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Toggle } from '../../../../components/ui/Toggle';
import type { HallEffectBenchState, SpecimenType } from '../types';

interface BenchControlsProps {
  benchState: HallEffectBenchState;
  powerOn: boolean;
  setPowerOn: (v: boolean) => void;
  specimenType: SpecimenType;
  setSpecimenType: (v: SpecimenType) => void;
  currentI_mA: number;
  setCurrentI_mA: (v: number) => void;
  magneticFieldB_kG: number;
  setMagneticFieldB_kG: (v: number) => void;
  thickness_mm: number;
  setThickness_mm: (v: number) => void;
  noiseOn: boolean;
  setNoiseOn: (v: boolean) => void;
  onRecordReading: () => void;
  recordedCount: number;
}

export function BenchControls({
  benchState,
  powerOn,
  setPowerOn,
  specimenType,
  setSpecimenType,
  currentI_mA,
  setCurrentI_mA,
  magneticFieldB_kG,
  setMagneticFieldB_kG,
  thickness_mm,
  setThickness_mm,
  noiseOn,
  setNoiseOn,
  onRecordReading,
  recordedCount,
}: BenchControlsProps) {
  const [justRecorded, setJustRecorded] = useState(false);

  const handleRecord = () => {
    if (!powerOn || benchState.currentI_mA <= 0 || benchState.magneticFieldB_T <= 0) return;
    onRecordReading();
    setJustRecorded(true);
    setTimeout(() => setJustRecorded(false), 900);
  };

  const handleResetBench = () => {
    setCurrentI_mA(5.0);
    setMagneticFieldB_kG(3.0);
    setThickness_mm(0.5);
    setSpecimenType('n-type');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* ── Column 1: Main Bench Controls (7 Cols) ─────────────────────────── */}
      <div className="lg:col-span-7 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
        {/* Top Control Bar: Master Power, Specimen Selection & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPowerOn(!powerOn)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium text-xs transition-all ${
                powerOn
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'bg-[var(--bg)] text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--border)]'
              }`}
            >
              <Power size={14} className={powerOn ? 'text-emerald-400' : 'text-slate-500'} />
              <span>{powerOn ? 'System ON' : 'System OFF'}</span>
            </button>

            {/* Specimen Type Selector */}
            <div className="flex items-center gap-1 bg-[var(--bg)] p-1 rounded-xl border border-[var(--border)] text-xs">
              <button
                onClick={() => setSpecimenType('n-type')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  specimenType === 'n-type'
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                n-type Germanium
              </button>
              <button
                onClick={() => setSpecimenType('p-type')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  specimenType === 'p-type'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                p-type Germanium
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Lab Noise Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">Lab Noise (±1.5%)</span>
              <Toggle checked={noiseOn} onChange={setNoiseOn} />
            </div>

            <button
              onClick={handleResetBench}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
              title="Reset default parameters"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* Sliders Grid: Current I and Magnetic Field B */}
        <div className="space-y-4">
          {/* Slider 1: Sample Current (I in mA) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
                <Zap size={14} className="text-cyan-400" />
                Sample Current (<span className="font-mono">I</span>)
              </span>
              <span className="font-mono tabular-nums text-sm font-semibold text-cyan-400">
                {currentI_mA.toFixed(1)} mA
              </span>
            </div>

            <input
              type="range"
              min={1.0}
              max={10.0}
              step={0.5}
              value={currentI_mA}
              disabled={!powerOn}
              onChange={(e) => setCurrentI_mA(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer disabled:opacity-40"
            />

            <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
              <span>1.0 mA</span>
              <span>Default: 5.0 mA</span>
              <span>10.0 mA</span>
            </div>
          </div>

          {/* Slider 2: Electromagnet Magnetic Field (B in kG / Tesla) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
                <Magnet size={14} className="text-emerald-400" />
                Magnetic Field (<span className="font-mono">B</span>)
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono tabular-nums text-sm font-semibold text-emerald-400">
                  {magneticFieldB_kG.toFixed(1)} kG
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono tabular-nums">
                  ({(magneticFieldB_kG * 0.1).toFixed(2)} Tesla)
                </span>
              </div>
            </div>

            <input
              type="range"
              min={0.0}
              max={6.0}
              step={0.5}
              value={magneticFieldB_kG}
              disabled={!powerOn}
              onChange={(e) => setMagneticFieldB_kG(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer disabled:opacity-40"
            />

            <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)]">
              <span>0.0 kG (0.0 T)</span>
              <span>2.5 kG (0.25 T)</span>
              <span>6.0 kG (0.6 T)</span>
            </div>
          </div>

          {/* Parameter: Wafer Thickness */}
          <div className="pt-2 flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <Layers size={14} className="text-amber-400" />
              Wafer Thickness (<span className="font-mono">t</span>)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setThickness_mm(0.5)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  thickness_mm === 0.5 ? 'bg-amber-400/20 text-amber-300 font-semibold' : 'text-[var(--text-muted)]'
                }`}
              >
                0.5 mm (Standard)
              </button>
              <button
                onClick={() => setThickness_mm(0.4)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  thickness_mm === 0.4 ? 'bg-amber-400/20 text-amber-300 font-semibold' : 'text-[var(--text-muted)]'
                }`}
              >
                0.4 mm
              </button>
            </div>
          </div>
        </div>

        {/* Action: Record Reading Button */}
        <div className="pt-2">
          <button
            onClick={handleRecord}
            disabled={!powerOn || benchState.currentI_mA <= 0 || benchState.magneticFieldB_T <= 0}
            className={`w-full py-3 px-4 rounded-xl font-medium text-xs md:text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
              justRecorded
                ? 'bg-emerald-600 text-white'
                : powerOn && benchState.currentI_mA > 0 && benchState.magneticFieldB_T > 0
                ? 'bg-[var(--accent)] text-white hover:opacity-95'
                : 'bg-[var(--bg)] text-[var(--text-muted)] border border-[var(--border)] cursor-not-allowed opacity-50'
            }`}
          >
            {justRecorded ? (
              <>
                <Check size={16} />
                <span>Reading Logged to Observation Table!</span>
              </>
            ) : (
              <>
                <PlusCircle size={16} />
                <span>Record Reading to Observation Table</span>
                {recordedCount > 0 && (
                  <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-white/20 font-mono tabular-nums">
                    {recordedCount}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Column 2: Live Instrument Telemetry Cards (5 Cols) ──────────────── */}
      <div className="lg:col-span-5 space-y-3">
        {/* Card 1: Transverse Hall Voltage (VH) */}
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="uppercase tracking-wider text-[10px] font-semibold">
              Transverse Hall Potential (V_H)
            </span>
            <span className="font-mono text-[11px]">AE-208 DVM</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span
              className={`text-2xl md:text-3xl font-bold font-mono tabular-nums ${
                !powerOn
                  ? 'text-slate-500'
                  : benchState.hallVoltage_mV < 0
                  ? 'text-indigo-400'
                  : 'text-emerald-400'
              }`}
            >
              {powerOn ? benchState.hallVoltage_mV.toFixed(2) : '0.00'}
            </span>
            <span className="text-xs font-mono font-medium text-[var(--text-muted)]">
              mV
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] pt-0.5">
            Polarity indicates carrier type:{' '}
            <strong className={benchState.specimenType === 'n-type' ? 'text-indigo-400' : 'text-emerald-400'}>
              {benchState.specimenType === 'n-type' ? 'Negative (Electrons)' : 'Positive (Holes)'}
            </strong>
          </p>
        </div>

        {/* Card 2: Magnetic Field (B) */}
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="uppercase tracking-wider text-[10px] font-semibold">
              Magnetic Flux Density (B)
            </span>
            <span className="font-mono text-[11px]">Gaussmeter</span>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
              {powerOn ? benchState.magneticFieldB_T.toFixed(3) : '0.000'}
            </span>
            <span className="text-xs font-mono font-medium text-[var(--text-muted)]">
              Tesla &nbsp;({powerOn ? benchState.magneticFieldB_kG.toFixed(1) : '0.0'} kG)
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] pt-0.5">
            Electromagnet Coil Current: <span className="font-mono tabular-nums">{powerOn ? benchState.electromagnetCurrent_A.toFixed(2) : '0.00'} A</span>
          </p>
        </div>

        {/* Card 3: Derived Theoretical Parameters Summary */}
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-2 text-xs">
          <span className="uppercase tracking-wider text-[10px] font-semibold text-[var(--text-muted)] block">
            Specimen Constants (Germanium)
          </span>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Expected |R_H|</span>
              <span className="font-mono tabular-nums font-semibold text-xs text-[var(--accent)]">
                ≈ 4.99 × 10⁻³
              </span>
              <span className="text-[9px] text-[var(--text-muted)] block">m³/C</span>
            </div>

            <div className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Carrier Density n</span>
              <span className="font-mono tabular-nums font-semibold text-xs text-cyan-400">
                1.25 × 10²¹
              </span>
              <span className="text-[9px] text-[var(--text-muted)] block">m⁻³</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
