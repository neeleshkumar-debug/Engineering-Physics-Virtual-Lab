import React, { useMemo } from 'react';
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
import { TrendingUp, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import type { PartARow } from '../types';
import { computeLinearRegression, DEFAULT_RHO_W } from '../physicsEngine';

interface CareyFosterGraphProps {
  rows: PartARow[];
}

interface PlotPoint {
  x: number; // Resistance X (Ohm)
  y: number; // Difference (l2 - l1) in cm
  l1: number;
  l2: number;
  fitY?: number;
}

export function CareyFosterGraph({ rows }: CareyFosterGraphProps) {
  const { points, regressionResult, deducedRhoW } = useMemo(() => {
    if (rows.length === 0) {
      return {
        points: [] as PlotPoint[],
        regressionResult: null,
        deducedRhoW: null,
      };
    }

    const pts: PlotPoint[] = rows.map((r) => {
      const parsedDiff = parseFloat(r.diff_student);
      const diffVal =
        Number.isFinite(parsedDiff) && parsedDiff > 0 ? parsedDiff : r.diff_ref_cm;

      return {
        x: r.resistanceX_ohm,
        y: parseFloat(diffVal.toFixed(2)),
        l1: r.l1_cm,
        l2: r.l2_cm,
      };
    }).sort((a, b) => a.x - b.x);

    const regPoints = pts.map((p) => ({ x: p.x, y: p.y }));
    const reg = computeLinearRegression(regPoints);

    // Compute fitted Y coordinates for regression line
    if (regPoints.length >= 2) {
      pts.forEach((pt) => {
        pt.fitY = parseFloat((reg.slope * pt.x + reg.intercept).toFixed(2));
      });
    }

    const rhoW = reg.slope > 0 ? parseFloat((1.0 / reg.slope).toFixed(5)) : null;

    return {
      points: pts,
      regressionResult: reg,
      deducedRhoW: rhoW,
    };
  }, [rows]);

  const isVerified =
    regressionResult &&
    regressionResult.r2 >= 0.98 &&
    deducedRhoW &&
    Math.abs(deducedRhoW - DEFAULT_RHO_W) / DEFAULT_RHO_W <= 0.05;

  return (
    <div className="p-4 md:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-6">
      {/* ── Header & Regression Summary Cards ──────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-sky-400" />
            <h3 className="text-base font-semibold text-[var(--text)] tracking-tight">
              Bridge Calibration Plot: (l₂ - l₁) vs. Resistance X
            </h3>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Theoretical relation: <span className="font-mono text-[var(--text)]">(l₂ - l₁) = (1 / ρ_w) · X</span> &bull; Slope yields wire resistance per unit length.
          </p>
        </div>

        {deducedRhoW && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs font-mono">
            <span className="text-[var(--text-muted)]">Graph deduced ρ_w =</span>
            <strong className="text-emerald-400 font-bold tabular-nums">
              {deducedRhoW.toFixed(4)} Ω/cm
            </strong>
          </div>
        )}
      </div>

      {/* Regression Telemetry Banner */}
      {regressionResult && points.length >= 2 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
            <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
              Slope (m = 1/ρ_w)
            </div>
            <div className="text-sm font-bold text-sky-400 font-mono tabular-nums mt-0.5">
              {regressionResult.slope.toFixed(2)} cm/Ω
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
              Ideal: {(1 / DEFAULT_RHO_W).toFixed(2)} cm/Ω
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
            <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
              Intercept (c)
            </div>
            <div className="text-sm font-bold text-cyan-400 font-mono tabular-nums mt-0.5">
              {regressionResult.intercept.toFixed(2)} cm
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
              Ideal: 0.00 cm
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
            <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
              Coefficient of Det. (R²)
            </div>
            <div className="text-sm font-bold text-amber-400 font-mono tabular-nums mt-0.5">
              {regressionResult.r2.toFixed(4)}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
              Target: R² &gt; 0.99
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex flex-col justify-between">
            <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">
              Verification Status
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isVerified ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">Verified</span>
                </>
              ) : (
                <>
                  <AlertCircle size={16} className="text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">Validating</span>
                </>
              )}
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">{points.length} data points</div>
          </div>
        </div>
      )}

      {/* ── Recharts Chart ─────────────────────────────────────────────────── */}
      {points.length < 2 ? (
        <div className="p-8 text-center rounded-xl bg-[var(--bg)] border border-dashed border-[var(--border)] space-y-2">
          <Info size={24} className="mx-auto text-[var(--text-muted)]" />
          <div className="text-xs font-medium text-[var(--text-muted)]">
            Record at least 2 calibration readings in Table 1 to render the (l₂ - l₁) vs. X linear graph.
          </div>
        </div>
      ) : (
        <div className="w-full h-80 rounded-xl bg-[var(--bg)] p-3 border border-[var(--border)]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={{ top: 10, right: 25, bottom: 25, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
              <XAxis
                dataKey="x"
                name="Resistance X"
                unit=" Ω"
                stroke="#64748b"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                label={{
                  value: 'Resistance in Box X (Ω)',
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
                  value: 'Difference (l₂ - l₁) (cm)',
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
                        <div className="font-sans font-bold text-cyan-400">
                          Resistance X = {data.x.toFixed(2)} Ω
                        </div>
                        <div className="text-[var(--text-muted)]">
                          l₁ (Normal): <strong className="text-[var(--text)]">{data.l1.toFixed(2)} cm</strong>
                        </div>
                        <div className="text-[var(--text-muted)]">
                          l₂ (Interchanged): <strong className="text-[var(--text)]">{data.l2.toFixed(2)} cm</strong>
                        </div>
                        <div className="text-[var(--text-muted)]">
                          (l₂ - l₁): <strong className="text-emerald-400">{data.y.toFixed(2)} cm</strong>
                        </div>
                        {data.fitY !== undefined && (
                          <div className="text-[var(--text-muted)]">
                            Linear Fit: <strong className="text-amber-400">{data.fitY.toFixed(2)} cm</strong>
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
                name="Experimental Observations (l₂ - l₁)"
                dataKey="y"
                fill="#38bdf8"
                stroke="#0284c7"
                strokeWidth={1.5}
              />

              {/* Best-Fit Regression Line */}
              <Line
                name="Best-Fit Linear Regression Line"
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
