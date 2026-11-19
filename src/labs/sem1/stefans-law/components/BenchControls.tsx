import React, { useState } from 'react';
import { Power, Sliders, Sparkles, PlusCircle, Gauge, Flame, Check } from 'lucide-react';
import { Toggle } from '../../../../components/ui/Toggle';
import type { FilamentState } from '../physicsEngine';

interface BenchControlsProps {
  powerOn: boolean;
  setPowerOn: (v: boolean) => void;
  sliderPct: number;
  setSliderPct: (v: number) => void;
  noiseOn: boolean;
  setNoiseOn: (v: boolean) => void;
  filamentState: FilamentState;
  onRecordReading: () => void;
  onSetDraperPoint: () => void;
  recordedCount: number;
}

export function BenchControls({
  powerOn,
  setPowerOn,
  sliderPct,
  setSliderPct,
  noiseOn,
  setNoiseOn,
  filamentState,
  onRecordReading,
  onSetDraperPoint,
  recordedCount,
}: BenchControlsProps) {
  const [justRecorded, setJustRecorded] = useState(false);

  const handleRecord = () => {
    if (!powerOn || filamentState.I <= 0) return;
    onRecordReading();
    setJustRecorded(true);
    setTimeout(() => setJustRecorded(false), 1200);
  };

  const isDraperZone = filamentState.T >= 770 && filamentState.T <= 830 && powerOn;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-md">
      {/* Left Col: Master Toggles & Main Rheostat Slider (7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          {/* Power Supply Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPowerOn(!powerOn)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-sm
                ${powerOn
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600'
                  : 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
                }
              `}
            >
              <Power size={15} />
              {powerOn ? '6V DC Supply: ON' : '6V DC Supply: OFF'}
            </button>
            <span className={`text-xs ${powerOn ? 'text-emerald-400 font-medium' : 'text-[var(--text-muted)]'}`}>
              {powerOn ? 'Circuit Energized' : 'Circuit Open'}
            </span>
          </div>

          {/* Realistic Noise Toggle */}
          <div className="flex items-center gap-2">
            <Toggle
              checked={noiseOn}
              onChange={setNoiseOn}
              color="orange"
              label="Lab Noise (±1.5%)"
              description="Realistic meter fluctuations"
            />
          </div>
        </div>

        {/* Rheostat Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-[var(--text)] flex items-center gap-2">
              <Sliders size={16} className="text-[var(--accent)]" />
              Variable Rheostat Slider (Current Adjustment)
            </span>
            <span className="font-mono text-sm px-2.5 py-0.5 rounded-md bg-[var(--bg)] border border-[var(--border)] font-bold text-[var(--accent)]">
              {sliderPct.toFixed(1)}%
            </span>
          </div>

          <div className="relative pt-1">
            <input
              type="range"
              min={0}
              max={100}
              step={0.5}
              value={sliderPct}
              disabled={!powerOn}
              onChange={(e) => setSliderPct(parseFloat(e.target.value))}
              className="
                w-full h-2.5 bg-slate-700/60 rounded-lg appearance-none cursor-pointer
                accent-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed
              "
            />
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                disabled={!powerOn}
                onClick={() => setSliderPct(Math.max(0, sliderPct - 5))}
                className="px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--border)] disabled:opacity-40"
              >
                −5%
              </button>
              <button
                disabled={!powerOn}
                onClick={() => setSliderPct(Math.max(0, sliderPct - 1))}
                className="px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--border)] disabled:opacity-40"
              >
                −1%
              </button>
              <button
                disabled={!powerOn}
                onClick={() => setSliderPct(Math.min(100, sliderPct + 1))}
                className="px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--border)] disabled:opacity-40"
              >
                +1%
              </button>
              <button
                disabled={!powerOn}
                onClick={() => setSliderPct(Math.min(100, sliderPct + 5))}
                className="px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--border)] disabled:opacity-40"
              >
                +5%
              </button>
            </div>

            {/* Quick Draper Point Pinpoint */}
            <button
              disabled={!powerOn}
              onClick={onSetDraperPoint}
              className={`
                flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors
                ${isDraperZone
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]'
                }
              `}
              title="Set rheostat slider directly to dull red glow Draper Point (~800 K)"
            >
              <Flame size={12} className="text-amber-400" />
              Set Just-Glow Point (800 K)
            </button>
          </div>
        </div>

        {/* Draper Point Indicator Alert */}
        {isDraperZone && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 animate-fadeIn">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Draper Point Active (~800 K): Filament just glows dull-red! Use this reading for R_g.
            </span>
          </div>
        )}
      </div>

      {/* Right Col: Live Telemetry & Record Button (5 cols) */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-4 lg:border-l lg:border-[var(--border)] lg:pl-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            <Gauge size={14} /> Live Bench Telemetry
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Voltmeter (V)</span>
              <p className="font-mono tabular-nums text-base md:text-lg font-bold text-[var(--text)] mt-0.5">
                {powerOn ? `${filamentState.V.toFixed(3)} V` : '0.000 V'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Ammeter (I)</span>
              <p className="font-mono tabular-nums text-base md:text-lg font-bold text-[#38bdf8] mt-0.5">
                {powerOn ? `${filamentState.I.toFixed(3)} A` : '0.000 A'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Resistance (Rₜ)</span>
              <p className="font-mono tabular-nums text-sm md:text-base font-semibold text-[var(--text)] mt-0.5">
                {powerOn && filamentState.I > 0 ? `${filamentState.Rt.toFixed(2)} Ω` : '---'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Power P = V·I</span>
              <p className="font-mono tabular-nums text-sm md:text-base font-semibold text-emerald-400 mt-0.5">
                {powerOn ? `${filamentState.P.toFixed(3)} W` : '0.000 W'}
              </p>
            </div>
          </div>

          {/* Temperature Badge */}
          <div className="mt-3 p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">Filament Temp (T):</span>
            <span
              className="font-mono tabular-nums font-bold px-2 py-0.5 rounded text-xs flex items-center gap-1.5"
              style={{
                backgroundColor: filamentState.bulbColor,
                color: filamentState.T > 1800 ? '#000000' : '#ffffff',
              }}
            >
              {powerOn ? `${Math.round(filamentState.T)} K` : '300 K (Cold)'}
            </span>
          </div>
        </div>

        {/* Primary Record Button */}
        <div>
          <button
            onClick={handleRecord}
            disabled={!powerOn || filamentState.I <= 0}
            className={`
              w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md
              ${justRecorded
                ? 'bg-emerald-500 text-white scale-[0.98]'
                : powerOn && filamentState.I > 0
                  ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 cursor-pointer shadow-[var(--accent)]/20'
                  : 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed opacity-60'
              }
            `}
          >
            {justRecorded ? (
              <>
                <Check size={18} />
                Reading Recorded into Table!
              </>
            ) : (
              <>
                <PlusCircle size={18} />
                Record Reading ({recordedCount} captured)
              </>
            )}
          </button>
          <p className="text-[11px] text-center text-[var(--text-muted)] mt-1.5">
            Captures current V and I into Observation Table for active math verification
          </p>
        </div>
      </div>
    </div>
  );
}
