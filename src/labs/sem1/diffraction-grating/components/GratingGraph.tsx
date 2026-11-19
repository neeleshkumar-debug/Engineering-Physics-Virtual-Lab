import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp, CheckCircle2, AlertCircle, Info, Layers, Sparkles } from 'lucide-react';
import type { DiffractionObsRow } from '../types';
import {
  computeGratingRegression,
  lpiToGratingElementNm,
  MERCURY_LINES_LIST,
} from '../physicsEngine';

interface GratingGraphProps {
  rows: DiffractionObsRow[];
  gratingLPI: number;
}

interface PlotPoint {
  x: number; // wavelength in nm or n*lambda
  y: number; // sin(theta)
  colorName: string;
  order: number;
  lambda: number;
  thetaDeg: number;
  fitY?: number;
}

export function GratingGraph({ rows, gratingLPI }: GratingGraphProps) {
  const [plotMode, setPlotMode] = useState<'sin_vs_lambda' | 'sin_vs_order'>('sin_vs_lambda');

  // Extract valid points from observation rows
  const { points, regressionResult } = useMemo(() => {
    if (rows.length === 0) {
      return {
        points: [] as PlotPoint[],
        regressionResult: null,
      };
    }

    if (plotMode === 'sin_vs_lambda') {
      // Filter 1st order rows by default (or scale by order: y = sin(theta)/n vs lambda)
      const pts: PlotPoint[] = rows.map((r) => {
        // Use student's calculated sin(theta) if valid, else reference
        const parsedSin = parseFloat(r.sinTheta_student);
        const yVal = Number.isFinite(parsedSin) && parsedSin > 0 ? parsedSin : r.sinTheta_ref;

        return {
          x: r.lambda_ref_nm,
          y: parseFloat(yVal.toFixed(4)),
          colorName: r.colorName,
          order: r.order,
          lambda: r.lambda_ref_nm,
          thetaDeg: r.theta_ref,
        };
      }).sort((a, b) => a.x - b.x);

      // Regression: x in cm (n * lambda / 1e7), y = sin(theta)
      const regPoints = rows.map((r) => {
        const parsedSin = parseFloat(r.sinTheta_student);
        const yVal = Number.isFinite(parsedSin) && parsedSin > 0 ? parsedSin : r.sinTheta_ref;
        const x_cm = (r.order * r.lambda_ref_nm) / 1e7;
        return { x: x_cm, y: yVal };
      });

      const reg = computeGratingRegression(regPoints, gratingLPI);

      // Compute fitY for visualization
      if (reg.pointsCount >= 2 && pts.length > 0) {
        // Line equation: y = (slope / 1e7) * lambda + intercept
        const slopePerNm = reg.slope / 1e7;
        pts.forEach((pt) => {
          pt.fitY = parseFloat((slopePerNm * pt.x + reg.intercept).toFixed(4));
        });
      }

      return { points: pts, regressionResult: reg };
    } else {
      // sin(theta) vs order n (e.g., across 1st and 2nd orders)
      const pts: PlotPoint[] = rows.map((r) => {
        const parsedSin = parseFloat(r.sinTheta_student);
        const yVal = Number.isFinite(parsedSin) && parsedSin > 0 ? parsedSin : r.sinTheta_ref;

        return {
          x: r.order,
          y: parseFloat(yVal.toFixed(4)),
          colorName: r.colorName,
          order: r.order,
          lambda: r.lambda_ref_nm,
          thetaDeg: r.theta_ref,
        };
      }).sort((a, b) => a.x - b.x);

      const regPoints = pts.map((p) => ({ x: p.x, y: p.y }));
      const reg = computeGratingRegression(regPoints, gratingLPI);

      if (reg.pointsCount >= 2 && pts.length > 0) {
        pts.forEach((pt) => {
          pt.fitY = parseFloat((reg.slope * pt.x + reg.intercept).toFixed(4));
        });
      }

      return { points: pts, regressionResult: reg };
    }
  }, [rows, plotMode, gratingLPI]);

  return (
    <div className="p-4 md:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-6">
      {/* ── Header & Plot Mode Toggles ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            <h2 className="text-base font-semibold text-[var(--text)] tracking-tight">
              Diffraction Grating Verification Plot
            </h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Verification of linear proportionality $(a+b)\sin\theta = n\lambda$ and determination of grating ruling density $N$.
          </p>
        </div>

        {/* Toggle Plot Modes */}
        <div className="flex items-center p-1 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs">
          <button
            onClick={() => setPlotMode('sin_vs_lambda')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              plotMode === 'sin_vs_lambda'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            sin(θ) vs. Wavelength λ
          </button>
          <button
            onClick={() => setPlotMode('sin_vs_order')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              plotMode === 'sin_vs_order'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            sin(θ) vs. Order n
          </button>
        </div>
      </div>

      {/* ── Regression Metrics Dashboard ─────────────────────────────────── */}
      {regressionResult && regressionResult.pointsCount >= 2 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* R² Value */}
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
            <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">
              Goodness of Fit (R²)
            </div>
            <div className="text-base font-bold font-mono tabular-nums text-emerald-400">
              {regressionResult.r2.toFixed(5)}
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">Target: R² &gt; 0.999</div>
          </div>

          {/* Experimental N */}
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
            <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">
              Experimental N (LPI)
            </div>
            <div className="text-base font-bold font-mono tabular-nums text-cyan-400">
              {regressionResult.experimentalLPI.toLocaleString()} LPI
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">Nominal: {gratingLPI.toLocaleString()} LPI</div>
          </div>

          {/* Percentage Error */}
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
            <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">
              Percentage Error
            </div>
            <div
              className={`text-base font-bold font-mono tabular-nums ${
                regressionResult.percentError <= 2.0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {regressionResult.percentError.toFixed(2)}%
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">Tolerance: &le; 2.0%</div>
          </div>

          {/* Status Badge */}
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
            <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)] tracking-wider">
              Verification State
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              {regressionResult.verified ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">Verified</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} className="text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">Needs More Points</span>
                </>
              )}
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">{points.length} data points</div>
          </div>
        </div>
      )}

      {/* ── Recharts Canvas ──────────────────────────────────────────────── */}
      {points.length < 2 ? (
        <div className="p-8 text-center rounded-xl bg-[var(--bg)] border border-dashed border-[var(--border)] space-y-2">
          <Info size={24} className="mx-auto text-[var(--text-muted)]" />
          <div className="text-xs font-medium text-[var(--text-muted)]">
            Log at least 2 spectral line observations to plot the linear dispersion regression curve.
          </div>
        </div>
      ) : (
        <div className="w-full h-80 rounded-xl bg-[var(--bg)] p-3 border border-[var(--border)]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={{ top: 10, right: 25, bottom: 25, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
              <XAxis
                dataKey="x"
                name={plotMode === 'sin_vs_lambda' ? 'Wavelength λ' : 'Order n'}
                unit={plotMode === 'sin_vs_lambda' ? ' nm' : ''}
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                label={{
                  value:
                    plotMode === 'sin_vs_lambda'
                      ? 'Wavelength λ (nm)'
                      : 'Diffraction Order (n)',
                  position: 'insideBottom',
                  offset: -14,
                  fill: '#94a3b8',
                  fontSize: 11,
                }}
              />
              <YAxis
                dataKey="y"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                domain={['auto', 'auto']}
                label={{
                  value: 'sin(θ)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#94a3b8',
                  fontSize: 11,
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as PlotPoint;
                    return (
                      <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs space-y-1 shadow-lg font-mono">
                        <div className="font-sans font-bold text-[var(--text)]">{data.colorName}</div>
                        <div className="text-[var(--text-muted)]">
                          Wavelength: <strong className="text-[var(--text)]">{data.lambda} nm</strong>
                        </div>
                        <div className="text-[var(--text-muted)]">
                          Diffraction Angle: <strong className="text-sky-400">{data.thetaDeg.toFixed(2)}°</strong>
                        </div>
                        <div className="text-[var(--text-muted)]">
                          sin(θ): <strong className="text-emerald-400">{data.y}</strong>
                        </div>
                        {data.fitY !== undefined && (
                          <div className="text-[var(--text-muted)]">
                            Linear Fit: <strong className="text-amber-400">{data.fitY}</strong>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend verticalAlign="top" height={32} wrapperStyle={{ fontSize: '11px' }} />

              {/* Measured Points */}
              <Scatter
                name="Experimental Observations (sin θ)"
                dataKey="y"
                fill="#38bdf8"
                stroke="#0284c7"
                strokeWidth={1.5}
              />

              {/* Best-Fit Regression Line */}
              <Line
                name="Linear Regression Fit"
                type="linear"
                dataKey="fitY"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
