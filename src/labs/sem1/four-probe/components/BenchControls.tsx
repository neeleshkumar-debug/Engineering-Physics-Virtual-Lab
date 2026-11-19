import React, { useState } from 'react';
import {
  Power,
  Flame,
  Zap,
  Gauge,
  Sliders,
  PlusCircle,
  Check,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Toggle } from '../../../../components/ui/Toggle';
import type { FourProbeBenchState } from '../types';

interface BenchControlsProps {
  benchState: FourProbeBenchState;
  powerOn: boolean;
  setPowerOn: (v: boolean) => void;
  targetTempC: number;
  setTargetTempC: (v: number) => void;
  currentI_mA: number;
  setCurrentI_mA: (v: number) => void;
  voltmeterRange: 'x1' | 'x10';
  setVoltmeterRange: (v: 'x1' | 'x10') => void;
  noiseOn: boolean;
  setNoiseOn: (v: boolean) => void;
  onRecordReading: () => void;
  recordedCount: number;
}

export function BenchControls({
  benchState,
  powerOn,
  setPowerOn,
  targetTempC,
  setTargetTempC,
  currentI_mA,
  setCurrentI_mA,
  voltmeterRange,
  setVoltmeterRange,
  noiseOn,
  setNoiseOn,
  onRecordReading,
  recordedCount,
}: BenchControlsProps) {
  const [justRecorded, setJustRecorded] = useState(false);

  const handleRecord = () => {
    if (!powerOn || benchState.I_mA <= 0) return;
    onRecordReading();
    setJustRecorded(true);
    setTimeout(() => setJustRecorded(false), 1200);
  };

  const tempStepPresets = [30, 45, 60, 75, 90, 110, 130, 150];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
      {/* Left Col: Master Toggles & Sliders (7 cols) */}
      <div className="lg:col-span-7 space-y-5">
        {/* Top Control Bar: Power, Range & Noise */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          {/* Master Power Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPowerOn(!powerOn)}
              className={`
                flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-all
                ${
                  powerOn
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
                }
              `}
            >
              <Power size={14} />
              <span>{powerOn ? 'BENCH POWER ON' : 'BENCH POWER OFF'}</span>
            </button>
          </div>

          {/* Voltmeter Range Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--text-muted)]">DVM Range:</span>
            <div className="inline-flex rounded-lg p-0.5 bg-[var(--bg)] border border-[var(--border)] text-xs">
              <button
                onClick={() => setVoltmeterRange('x1')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  voltmeterRange === 'x1'
                    ? 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                ×1 (199.9 mV)
              </button>
              <button
                onClick={() => setVoltmeterRange('x10')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  voltmeterRange === 'x10'
                    ? 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                ×10 (1999 mV)
              </button>
            </div>
          </div>

          {/* Noise Toggle */}
          <div className="flex items-center gap-2">
            <Toggle
              checked={noiseOn}
              onChange={setNoiseOn}
              label="Instrument Noise (±1.5%)"
            />
          </div>
        </div>

        {/* Oven Temperature Slider & Presets */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text)] flex items-center gap-1.5">
              <Flame size={14} className="text-orange-400" />
              Oven Setpoint
            </span>
            <span className="font-mono tabular-nums font-semibold text-orange-400 text-xs">
              {targetTempC} °C &nbsp;({(targetTempC + 273.15).toFixed(1)} K)
            </span>
          </div>

          <input
            type="range"
            min={30}
            max={160}
            step={1}
            value={targetTempC}
            disabled={!powerOn}
            onChange={(e) => setTargetTempC(parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] accent-orange-500 cursor-pointer disabled:opacity-40"
          />

          {/* Temperature Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] font-medium text-[var(--text-muted)] mr-1">
              Step Presets:
            </span>
            {tempStepPresets.map((step) => (
              <button
                key={step}
                onClick={() => setTargetTempC(step)}
                disabled={!powerOn}
                className={`
                  px-2 py-0.5 rounded text-[11px] font-mono tabular-nums border transition-all
                  ${
                    targetTempC === step
                      ? 'bg-orange-500/15 border-orange-500/40 text-orange-400 font-semibold'
                      : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:border-orange-500/30'
                  }
                  disabled:opacity-40
                `}
              >
                {step}°C
              </button>
            ))}
          </div>
        </div>

        {/* Constant Current Slider & Presets */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--text)] flex items-center gap-1.5">
              <Zap size={14} className="text-cyan-400" />
              Current Source (I)
            </span>
            <span className="font-mono tabular-nums font-semibold text-cyan-400 text-xs">
              {currentI_mA.toFixed(2)} mA
            </span>
          </div>

          <input
            type="range"
            min={1.0}
            max={5.0}
            step={0.1}
            value={currentI_mA}
            disabled={!powerOn}
            onChange={(e) => setCurrentI_mA(parseFloat(e.target.value))}
            className="w-full h-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] accent-cyan-500 cursor-pointer disabled:opacity-40"
          />

          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[11px] font-medium text-[var(--text-muted)] mr-1">
              Current Presets:
            </span>
            {[2.0, 3.0, 4.0].map((val) => (
              <button
                key={val}
                onClick={() => setCurrentI_mA(val)}
                disabled={!powerOn}
                className={`
                  px-2 py-0.5 rounded text-[11px] font-mono tabular-nums border transition-all
                  ${
                    currentI_mA === val
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 font-semibold'
                      : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:border-cyan-500/30'
                  }
                  disabled:opacity-40
                `}
              >
                {val.toFixed(1)} mA
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Col: Live Telemetry & Record Button (5 cols) */}
      <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-4">
        <div>
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
              <Gauge size={14} className="text-[var(--accent)]" />
              <span className="uppercase tracking-wider text-[11px]">Telemetry</span>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-[var(--text-muted)]">
              {benchState.isHeating ? 'Heating...' : 'Stabilized'}
            </span>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-muted)] block uppercase tracking-wider">
                Temperature T
              </span>
              <span className="font-mono tabular-nums font-semibold text-sm text-[var(--text)]">
                {powerOn ? `${benchState.currentTempC.toFixed(1)} °C` : '—'}
              </span>
              <span className="block text-[10px] text-[var(--text-muted)] font-mono tabular-nums">
                {powerOn ? `${benchState.currentTempK.toFixed(1)} K` : '—'}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-muted)] block uppercase tracking-wider">
                1000 / T
              </span>
              <span className="font-mono tabular-nums font-semibold text-sm text-indigo-400">
                {powerOn && benchState.invT > 0 ? `${benchState.invT.toFixed(3)} K⁻¹` : '—'}
              </span>
              <span className="block text-[10px] text-[var(--text-muted)]">
                Abscissa coordinate
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
              <span className="text-[10px] text-[var(--text-muted)] block uppercase tracking-wider">
                Current I
              </span>
              <span className="font-mono tabular-nums font-semibold text-sm text-cyan-400">
                {powerOn ? `${benchState.I_mA.toFixed(2)} mA` : '0.00 mA'}
              </span>
              <span className="block text-[10px] text-[var(--text-muted)]">
                Regulated
              </span>
            </div>

            <div
              className={`p-2.5 rounded-lg bg-[var(--surface)] border ${
                benchState.isOverRange
                  ? 'border-red-500/50 bg-red-500/10'
                  : 'border-[var(--border)]'
              }`}
            >
              <span className="text-[10px] text-[var(--text-muted)] block uppercase tracking-wider flex items-center justify-between">
                <span>Voltage Drop V</span>
                {benchState.isOverRange && (
                  <span className="text-red-400 font-bold">OVERFLOW</span>
                )}
              </span>
              <span
                className={`font-mono tabular-nums font-semibold text-sm ${
                  benchState.isOverRange ? 'text-red-400' : 'text-amber-400'
                }`}
              >
                {powerOn ? `${benchState.V_mV.toFixed(1)} mV` : '0.0 mV'}
              </span>
              <span className="block text-[10px] text-[var(--text-muted)]">
                {benchState.isOverRange ? 'Switch to ×10' : `Range ${voltmeterRange}`}
              </span>
            </div>

            <div className="col-span-2 p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[var(--text-muted)] block uppercase tracking-wider">
                  Resistivity ρ = 0.2266 · (V / I)
                </span>
                <span className="font-mono tabular-nums font-semibold text-sm text-emerald-400">
                  {powerOn && benchState.rho > 0 ? `${benchState.rho.toFixed(3)} Ω·cm` : '—'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[var(--text-muted)] block uppercase tracking-wider">
                  log₁₀(ρ)
                </span>
                <span className="font-mono tabular-nums font-semibold text-sm text-[var(--accent)]">
                  {powerOn && benchState.rho > 0 ? benchState.log10Rho.toFixed(4) : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Record Reading Action Button */}
        <button
          onClick={handleRecord}
          disabled={!powerOn || benchState.I_mA <= 0}
          className={`
            w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-xs uppercase tracking-wider transition-all
            ${
              justRecorded
                ? 'bg-emerald-600 text-white'
                : 'bg-[var(--accent)] hover:opacity-90 text-white disabled:opacity-40 disabled:cursor-not-allowed'
            }
          `}
        >
          {justRecorded ? (
            <>
              <Check size={14} />
              <span>RECORDED TO TABLE</span>
            </>
          ) : (
            <>
              <PlusCircle size={14} />
              <span>RECORD READING ({recordedCount})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
