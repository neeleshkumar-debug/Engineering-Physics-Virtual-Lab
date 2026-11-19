import React from 'react';
import {
  Power,
  RotateCcw,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Target,
  Sparkles,
  Layers,
  Volume2,
  VolumeX,
  Compass,
  ArrowLeftCircle,
  ArrowRightCircle,
} from 'lucide-react';
import type { GratingBenchState, GratingLPI } from '../types';
import {
  MERCURY_LINES,
  MERCURY_LINES_LIST,
  computeDiffractionAngleDeg,
  decimalDegToDMS,
} from '../physicsEngine';

interface BenchControlsProps {
  benchState: GratingBenchState;
  lampOn: boolean;
  setLampOn: (val: boolean) => void;
  telescopeAngleDeg: number;
  setTelescopeAngleDeg: (deg: number) => void;
  gratingLPI: GratingLPI;
  setGratingLPI: (lpi: GratingLPI) => void;
  selectedOrder: 0 | 1 | 2 | 'all';
  setSelectedOrder: (order: 0 | 1 | 2 | 'all') => void;
  noiseOn: boolean;
  setNoiseOn: (val: boolean) => void;
  slitWidthMm: number;
  setSlitWidthMm: (w: number) => void;
  onRecordLeftReading: () => void;
  onRecordRightReading: () => void;
  recordedCount: number;
}

export function BenchControls({
  benchState,
  lampOn,
  setLampOn,
  telescopeAngleDeg,
  setTelescopeAngleDeg,
  gratingLPI,
  setGratingLPI,
  selectedOrder,
  setSelectedOrder,
  noiseOn,
  setNoiseOn,
  slitWidthMm,
  setSlitWidthMm,
  onRecordLeftReading,
  onRecordRightReading,
  recordedCount,
}: BenchControlsProps) {
  const dms = decimalDegToDMS(benchState.apparentAngleDeg);

  // Fine adjust handlers
  const adjustAngle = (delta: number) => {
    const next = Math.max(-45, Math.min(45, telescopeAngleDeg + delta));
    setTelescopeAngleDeg(parseFloat(next.toFixed(4)));
  };

  // Quick snap helper
  const handleSnapToLine = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;

    if (val === 'center') {
      setTelescopeAngleDeg(0);
      return;
    }

    const [orderStr, lineId] = val.split(':');
    const order = parseInt(orderStr, 10);
    const line = MERCURY_LINES_LIST.find((l) => l.id === lineId);
    if (line) {
      const angle = computeDiffractionAngleDeg(line.wavelengthNm, order, benchState.gratingElementNm);
      if (angle !== null) {
        setTelescopeAngleDeg(parseFloat(angle.toFixed(3)));
      }
    }
  };

  // Auto-center onto active nearby line if present
  const handleAutoCenter = () => {
    if (benchState.activeLineNearby && benchState.currentOrder !== null) {
      if (benchState.currentOrder === 0) {
        setTelescopeAngleDeg(0);
        return;
      }
      const targetDeg = computeDiffractionAngleDeg(
        benchState.activeLineNearby.wavelengthNm,
        benchState.currentOrder,
        benchState.gratingElementNm
      );
      if (targetDeg !== null) {
        setTelescopeAngleDeg(parseFloat(targetDeg.toFixed(3)));
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Main Controls Container ────────────────────────────────────────── */}
      <div className="p-4 md:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-5">
        {/* Top Control Bar: Power, Grating LPI, Order Filter, Noise */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
          {/* Lamp Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLampOn(!lampOn)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                lampOn
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              <Power size={14} />
              <span>{lampOn ? 'Hg LAMP: ON' : 'Hg LAMP: OFF'}</span>
            </button>

            <span className="text-xs text-[var(--text-muted)] hidden sm:inline">
              High-Pressure Mercury Arc Lamp (AAS151)
            </span>
          </div>

          {/* Grating LPI & Order Selector */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Grating LPI */}
            <div className="flex items-center gap-1.5 bg-[var(--bg)] border border-[var(--border)] px-2.5 py-1 rounded-lg">
              <Layers size={13} className="text-cyan-400" />
              <label htmlFor="grating-lpi-select" className="text-[var(--text-muted)]">Grating:</label>
              <select
                id="grating-lpi-select"
                aria-label="Grating lines per inch"
                value={gratingLPI}
                onChange={(e) => setGratingLPI(Number(e.target.value) as GratingLPI)}
                className="bg-transparent text-[var(--text)] font-semibold font-mono text-xs focus:outline-none"
              >
                <option value={15000} className="bg-[var(--surface)] text-[var(--text)]">15,000 LPI (Standard)</option>
                <option value={6000} className="bg-[var(--surface)] text-[var(--text)]">6,000 LPI (Coarse)</option>
              </select>
            </div>

            {/* Order Filter */}
            <div className="flex items-center gap-1.5 bg-[var(--bg)] border border-[var(--border)] px-2.5 py-1 rounded-lg">
              <span className="text-[var(--text-muted)]">Order:</span>
              <select
                aria-label="Diffraction order filter"
                value={selectedOrder}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedOrder(val === 'all' ? 'all' : (Number(val) as 0 | 1 | 2));
                }}
                className="bg-transparent text-[var(--text)] font-semibold font-mono text-xs focus:outline-none"
              >
                <option value="all" className="bg-[var(--surface)] text-[var(--text)]">All Orders (0, ±1, ±2)</option>
                <option value={1} className="bg-[var(--surface)] text-[var(--text)]">1st Order (n = ±1)</option>
                <option value={2} className="bg-[var(--surface)] text-[var(--text)]">2nd Order (n = ±2)</option>
                <option value={0} className="bg-[var(--surface)] text-[var(--text)]">Central Slit (n = 0)</option>
              </select>
            </div>

            {/* Vernier Reading Noise Toggle */}
            <button
              onClick={() => setNoiseOn(!noiseOn)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                noiseOn
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text)]'
              }`}
              title="Toggle ±1 arcminute realistic vernier reading fluctuation"
            >
              {noiseOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span>{noiseOn ? 'Noise: ±1\' ON' : 'Noise: OFF'}</span>
            </button>
          </div>
        </div>

        {/* ── Telescope Angular Angle Slider & Readout ─────────────────────── */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Compass size={16} className="text-[var(--accent)]" />
              <label htmlFor="telescope-angle-slider" className="text-xs font-semibold uppercase tracking-wider text-[var(--text)]">
                Spectrometer Telescope Arm Angle (θ)
              </label>
            </div>

            {/* Vernier Live Digital Display */}
            <div className="flex items-center gap-2 font-mono tabular-nums">
              <div className="px-3 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm font-bold text-sky-400 shadow-inner">
                {dms.formatted}
              </div>
              <div className="text-xs text-[var(--text-muted)] hidden sm:inline">
                ({telescopeAngleDeg >= 0 ? `+${telescopeAngleDeg.toFixed(3)}°` : `${telescopeAngleDeg.toFixed(3)}°`})
              </div>
            </div>
          </div>

          {/* Range Slider */}
          <div className="relative flex items-center">
            <input
              id="telescope-angle-slider"
              type="range"
              min="-45"
              max="45"
              step="0.01"
              value={telescopeAngleDeg}
              onChange={(e) => setTelescopeAngleDeg(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-[var(--bg)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)] border border-[var(--border)]"
            />
          </div>

          {/* Scale labels */}
          <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)] px-1">
            <span>Left 2nd Order (-45°)</span>
            <span>Left 1st (-20°)</span>
            <span className="font-bold text-[var(--text)]">0° (Direct Slit)</span>
            <span>Right 1st (+20°)</span>
            <span>Right 2nd (+45°)</span>
          </div>
        </div>

        {/* ── Fine-Tuning & Alignment Row ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Fine Tuning Buttons */}
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-[var(--text-muted)] font-medium">Fine Rotation:</span>
            <div className="flex items-center gap-1 font-mono text-xs">
              <button
                onClick={() => adjustAngle(-0.05)}
                className="px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)] active:scale-95"
                title="Rotate -0.05° counter-clockwise"
              >
                -0.05°
              </button>
              <button
                onClick={() => adjustAngle(-1 / 60)}
                className="px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)] active:scale-95"
                title="Rotate -1 arcminute (-0.0167°)"
              >
                -1&apos;
              </button>
              <button
                onClick={() => setTelescopeAngleDeg(0)}
                className="px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)] active:scale-95 text-[11px]"
                title="Reset to central 0° slit"
              >
                <RotateCcw size={12} />
              </button>
              <button
                onClick={() => adjustAngle(1 / 60)}
                className="px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)] active:scale-95"
                title="Rotate +1 arcminute (+0.0167°)"
              >
                +1&apos;
              </button>
              <button
                onClick={() => adjustAngle(0.05)}
                className="px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)] active:scale-95"
                title="Rotate +0.05° clockwise"
              >
                +0.05°
              </button>
            </div>
          </div>

          {/* Quick Snap Dropdown & Auto-Center */}
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Target size={14} className="text-emerald-400" />
              <span>Snap Helper:</span>
            </div>

            <div className="flex items-center gap-1.5 flex-1 justify-end">
              <select
                aria-label="Snap to spectral line"
                onChange={handleSnapToLine}
                defaultValue=""
                className="max-w-[190px] px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none"
              >
                <option value="" disabled>Select Spectral Line...</option>
                <option value="center">Central Slit (0° 00&apos;)</option>
                <optgroup label="Left 1st Order (n = -1)">
                  <option value="-1:violet">Violet (404.7 nm) ~ -13° 50&apos;</option>
                  <option value="-1:blue">Blue (435.8 nm) ~ -14° 55&apos;</option>
                  <option value="-1:green">Green (546.1 nm) ~ -18° 49&apos;</option>
                  <option value="-1:yellow1">Yellow-1 (577.0 nm) ~ -19° 55&apos;</option>
                  <option value="-1:yellow2">Yellow-2 (579.1 nm) ~ -20° 00&apos;</option>
                </optgroup>
                <optgroup label="Right 1st Order (n = +1)">
                  <option value="1:violet">Violet (404.7 nm) ~ +13° 50&apos;</option>
                  <option value="1:blue">Blue (435.8 nm) ~ +14° 55&apos;</option>
                  <option value="1:green">Green (546.1 nm) ~ +18° 49&apos;</option>
                  <option value="1:yellow1">Yellow-1 (577.0 nm) ~ +19° 55&apos;</option>
                  <option value="1:yellow2">Yellow-2 (579.1 nm) ~ +20° 00&apos;</option>
                </optgroup>
                <optgroup label="Right 2nd Order (n = +2)">
                  <option value="2:violet">Violet-2 ~ +28° 33&apos;</option>
                  <option value="2:blue">Blue-2 ~ +30° 59&apos;</option>
                  <option value="2:green">Green-2 ~ +40° 10&apos;</option>
                  <option value="2:yellow1">Yellow-1 (2nd) ~ +42° 58&apos;</option>
                  <option value="2:yellow2">Yellow-2 (2nd) ~ +43° 09&apos;</option>
                </optgroup>
              </select>

              {benchState.activeLineNearby && (
                <button
                  onClick={handleAutoCenter}
                  className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-medium flex items-center gap-1 active:scale-95"
                  title="Lock vertical crosshair onto nearest line center"
                >
                  <Sparkles size={11} />
                  <span>Align</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Slit Width & Action Buttons Row ──────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Slit Width slider */}
          <div className="flex items-center gap-2.5 bg-[var(--bg)] border border-[var(--border)] px-3 py-1.5 rounded-xl text-xs">
            <Sliders size={13} className="text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)]">Collimator Slit:</span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={slitWidthMm}
              onChange={(e) => setSlitWidthMm(parseFloat(e.target.value))}
              className="w-20 h-1.5 bg-[var(--surface)] rounded accent-[var(--accent)] cursor-pointer"
            />
            <span className="font-mono text-[var(--text)] font-semibold w-9 text-right tabular-nums">
              {slitWidthMm.toFixed(2)} mm
            </span>
          </div>

          {/* Dual Record Buttons: Left vs Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRecordLeftReading}
              disabled={!lampOn}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Record current telescope angle as Left reading (θ_L)"
            >
              <ArrowLeftCircle size={15} />
              <span>Record Left (θ_L)</span>
            </button>

            <button
              onClick={onRecordRightReading}
              disabled={!lampOn}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Record current telescope angle as Right reading (θ_R)"
            >
              <ArrowRightCircle size={15} />
              <span>Record Right (θ_R)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
