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
  CircleDot,
  Check,
} from 'lucide-react';
import type { LensRadiusOption, NewtonsRingsBenchState } from '../types';
import {
  computeDarkRingRadiusCm,
  SODIUM_D_LINE_NM,
} from '../physicsEngine';

interface BenchControlsProps {
  benchState: NewtonsRingsBenchState;
  lampOn: boolean;
  setLampOn: (val: boolean) => void;
  micrometerPosCm: number;
  setMicrometerPosCm: (val: number) => void;
  radiusOfCurvatureCm: LensRadiusOption;
  setRadiusOfCurvatureCm: (r: LensRadiusOption) => void;
  selectedRing: number;
  setSelectedRing: (n: number) => void;
  noiseOn: boolean;
  setNoiseOn: (val: boolean) => void;
  contactOffsetCm2: number;
  setContactOffsetCm2: (val: number) => void;
  onRecordLeftReading: () => void;
  onRecordRightReading: () => void;
  recordedCount: number;
}

export function BenchControls({
  benchState,
  lampOn,
  setLampOn,
  micrometerPosCm,
  setMicrometerPosCm,
  radiusOfCurvatureCm,
  setRadiusOfCurvatureCm,
  selectedRing,
  setSelectedRing,
  noiseOn,
  setNoiseOn,
  contactOffsetCm2,
  setContactOffsetCm2,
  onRecordLeftReading,
  onRecordRightReading,
  recordedCount,
}: BenchControlsProps) {
  // Fine adjust handlers
  const adjustMicrometer = (delta: number) => {
    const next = Math.max(3.0, Math.min(7.0, micrometerPosCm + delta));
    setMicrometerPosCm(parseFloat(next.toFixed(3)));
  };

  // Quick snap to specific ring and side
  const handleSnapToRing = (order: number, side: 'left' | 'right' | 'center') => {
    if (side === 'center' || order === 0) {
      setMicrometerPosCm(benchState.centerPosCm);
      return;
    }
    const rn = computeDarkRingRadiusCm(
      order,
      SODIUM_D_LINE_NM,
      radiusOfCurvatureCm,
      contactOffsetCm2
    );
    const target = side === 'left' ? benchState.centerPosCm - rn : benchState.centerPosCm + rn;
    setMicrometerPosCm(parseFloat(target.toFixed(3)));
    setSelectedRing(order);
  };

  // Auto-align to nearest dark ring if nearby
  const handleAutoAlign = () => {
    if (benchState.ringUnderCrosshair) {
      setMicrometerPosCm(benchState.ringUnderCrosshair.exactRingPosCm);
      if (benchState.ringUnderCrosshair.order > 0) {
        setSelectedRing(benchState.ringUnderCrosshair.order);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Control Console Bar ── */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-4">
        {/* Row 1: Power, Lens Radius, Noise & Contact Offset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          {/* Left: Lamp Power */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLampOn(!lampOn)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                lampOn
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-[var(--bg)] text-[var(--text-muted)] border border-[var(--border)] hover:bg-[var(--surface)]'
              }`}
            >
              <Power size={14} className={lampOn ? 'text-amber-400' : 'text-[var(--text-muted)]'} />
              <span>{lampOn ? 'SODIUM LAMP ON' : 'LAMP OFF'}</span>
            </button>

            <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
              Monochromatic Yellow &bull; λ = 589.3 nm (5893 &Aring;)
            </span>
          </div>

          {/* Right: R Selector, Noise, Contact Offset */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Lens Radius Curvature Selector */}
            <div className="flex items-center gap-1.5 bg-[var(--bg)] px-2.5 py-1 rounded-lg border border-[var(--border)]">
              <span className="text-[var(--text-muted)]">Lens Radius R:</span>
              <div className="flex items-center gap-1">
                {([90, 100, 120] as LensRadiusOption[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadiusOfCurvatureCm(r)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono tabular-nums transition-all ${
                      radiusOfCurvatureCm === r
                        ? 'bg-[var(--accent)] text-white font-semibold'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {r} cm
                  </button>
                ))}
              </div>
            </div>

            {/* Noise Toggle */}
            <button
              onClick={() => setNoiseOn(!noiseOn)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all ${
                noiseOn
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
              title="Toggle realistic ±0.001 cm micrometer reading jitter"
            >
              {noiseOn ? <Volume2 size={12} /> : <VolumeX size={12} />}
              <span>Noise: {noiseOn ? 'ON' : 'OFF'}</span>
            </button>

            {/* Contact Offset Toggle (D0^2) */}
            <button
              onClick={() => setContactOffsetCm2(contactOffsetCm2 === 0 ? 0.008 : 0)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] transition-all font-mono tabular-nums ${
                contactOffsetCm2 > 0
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
              title="Demonstrates how taking difference D_{n+p}^2 - D_n^2 cancels non-zero central contact offset"
            >
              Contact D₀²: {contactOffsetCm2 > 0 ? '+0.008 cm²' : '0 cm² (Ideal)'}
            </button>
          </div>
        </div>

        {/* Row 2: Micrometer Position Slider & Fine Step Adjusters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sliders size={14} className="text-[var(--accent)]" />
              <span className="font-semibold text-[var(--text)]">Traveling Microscope Micrometer Screw (x)</span>
              <span className="text-[11px] text-[var(--text-muted)]">
                (Center x₀ = 5.000 cm)
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono tabular-nums">
              <span className="text-[var(--text-muted)] text-[11px]">x:</span>
              <span className="text-sm font-bold text-sky-400 bg-[var(--bg)] px-2.5 py-0.5 rounded border border-[var(--border)]">
                {benchState.vernier.formatted}
              </span>
            </div>
          </div>

          {/* Range Slider */}
          <div className="relative flex items-center gap-3">
            <span className="text-[10px] font-mono text-[var(--text-muted)]">3.00 cm</span>
            <input
              type="range"
              min={3.0}
              max={7.0}
              step={0.001}
              value={micrometerPosCm}
              onChange={(e) => setMicrometerPosCm(parseFloat(parseFloat(e.target.value).toFixed(3)))}
              disabled={!lampOn}
              className="flex-1 h-2 bg-[var(--bg)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)] disabled:opacity-50"
            />
            <span className="text-[10px] font-mono text-[var(--text-muted)]">7.00 cm</span>
          </div>

          {/* Fine Step Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-[var(--text-muted)] mr-1">Fine Step:</span>
              <button
                onClick={() => adjustMicrometer(-0.05)}
                disabled={!lampOn}
                className="px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] text-[11px] font-mono text-[var(--text)] hover:bg-[var(--surface)] disabled:opacity-40"
              >
                -0.05
              </button>
              <button
                onClick={() => adjustMicrometer(-0.01)}
                disabled={!lampOn}
                className="px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] text-[11px] font-mono text-[var(--text)] hover:bg-[var(--surface)] disabled:opacity-40"
              >
                -0.01
              </button>
              <button
                onClick={() => adjustMicrometer(-0.001)}
                disabled={!lampOn}
                className="px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] text-[11px] font-mono text-emerald-400 hover:bg-[var(--surface)] disabled:opacity-40"
                title="Move by 1 Least Count (0.001 cm / 0.01 mm)"
              >
                -0.001
              </button>
              <button
                onClick={() => adjustMicrometer(0.001)}
                disabled={!lampOn}
                className="px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] text-[11px] font-mono text-emerald-400 hover:bg-[var(--surface)] disabled:opacity-40"
                title="Move by 1 Least Count (0.001 cm / 0.01 mm)"
              >
                +0.001
              </button>
              <button
                onClick={() => adjustMicrometer(0.01)}
                disabled={!lampOn}
                className="px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] text-[11px] font-mono text-[var(--text)] hover:bg-[var(--surface)] disabled:opacity-40"
              >
                +0.01
              </button>
              <button
                onClick={() => adjustMicrometer(0.05)}
                disabled={!lampOn}
                className="px-2 py-1 rounded bg-[var(--bg)] border border-[var(--border)] text-[11px] font-mono text-[var(--text)] hover:bg-[var(--surface)] disabled:opacity-40"
              >
                +0.05
              </button>
            </div>

            {/* Quick Snap Ring Helper */}
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  if (val === 'center') {
                    handleSnapToRing(0, 'center');
                  } else {
                    const [orderStr, sideStr] = val.split(':');
                    handleSnapToRing(parseInt(orderStr, 10), sideStr as 'left' | 'right');
                  }
                }}
                disabled={!lampOn}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-40"
                defaultValue=""
              >
                <option value="" disabled>Snap to Dark Ring...</option>
                <optgroup label="Left Dark Rings (x_L)">
                  {[16, 14, 12, 10, 8, 6, 4, 2].map((n) => (
                    <option key={`left-${n}`} value={`${n}:left`}>Ring #{n} (Left)</option>
                  ))}
                </optgroup>
                <option value="center">Central Spot (n = 0)</option>
                <optgroup label="Right Dark Rings (x_R)">
                  {[2, 4, 6, 8, 10, 12, 14, 16].map((n) => (
                    <option key={`right-${n}`} value={`${n}:right`}>Ring #{n} (Right)</option>
                  ))}
                </optgroup>
              </select>

              {benchState.ringUnderCrosshair && (
                <button
                  onClick={handleAutoAlign}
                  disabled={!lampOn || benchState.ringUnderCrosshair.isAligned}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-40 transition-all"
                  title="Auto-align vertical crosshair exactly to nearest dark ring minimum"
                >
                  <Target size={12} className="text-emerald-400" />
                  <span>Align Center</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Ring Order Selector & Record Left / Right Readings */}
        <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
          {/* Ring Order selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[var(--text)]">Select Ring Order (n):</span>
            <div className="flex items-center gap-1">
              {[16, 14, 12, 10, 8, 6, 4, 2].map((n) => (
                <button
                  key={n}
                  onClick={() => setSelectedRing(n)}
                  className={`w-7 h-7 rounded text-xs font-mono font-medium transition-all ${
                    selectedRing === n
                      ? 'bg-amber-500 text-black font-bold shadow'
                      : 'bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Action Record Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRecordLeftReading}
              disabled={!lampOn}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all disabled:opacity-40"
              title="Record current traveling microscope reading as x_L for selected ring n"
            >
              <ArrowLeftCircle size={14} />
              <span>Record Left (x_L) for Ring #{selectedRing}</span>
            </button>

            <button
              onClick={onRecordRightReading}
              disabled={!lampOn}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all disabled:opacity-40"
              title="Record current traveling microscope reading as x_R for selected ring n"
            >
              <ArrowRightCircle size={14} />
              <span>Record Right (x_R) for Ring #{selectedRing}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
