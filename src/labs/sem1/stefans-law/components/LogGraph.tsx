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
import { TrendingUp, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import type { ObsRow } from '../../../../types/lab';
import { computeLinearRegression } from '../physicsEngine';

interface LogGraphProps {
  rows: ObsRow[];
}

interface PlotPoint {
  x: number; // log10(T)
  y: number; // log10(P)
  sNo: number;
  fitY?: number; // predicted value on best-fit line
}

export function LogGraph({ rows }: LogGraphProps) {
  // Extract valid (logT, logP) pairs from the table
  const points: PlotPoint[] = useMemo(() => {
    const valid: PlotPoint[] = [];

    rows.forEach((r, idx) => {
      const logPVal = parseFloat(r.logP_student);
      const logTVal = parseFloat(r.logT_student);

      if (isFinite(logPVal) && isFinite(logTVal) && logTVal > 0) {
        valid.push({
          x: logTVal,
          y: logPVal,
          sNo: idx + 1,
        });
      }
    });

    // Sort by x (logT) for smooth line rendering
    return valid.sort((a, b) => a.x - b.x);
  }, [rows]);

  // Compute best-fit linear regression
  const regression = useMemo(() => {
    if (points.length < 2) return null;
    return computeLinearRegression(points);
  }, [points]);

  // Augment points with fitted line coordinates
  const chartData = useMemo(() => {
    if (!regression || points.length === 0) return points;

    return points.map((p) => ({
      ...p,
      fitY: parseFloat((regression.slope * p.x + regression.intercept).toFixed(4)),
    }));
  }, [points, regression]);

  // Compute nice domains for X and Y axes
  const xDomain = useMemo(() => {
    if (points.length === 0) return [2.5, 3.5];
    const xs = points.map((p) => p.x);
    const min = Math.min(...xs);
    const max = Math.max(...xs);
    const pad = (max - min) * 0.1 || 0.1;
    return [parseFloat((min - pad).toFixed(2)), parseFloat((max + pad).toFixed(2))];
  }, [points]);

  const yDomain = useMemo(() => {
    if (points.length === 0) return [-2.0, 2.0];
    const ys = points.map((p) => p.y);
    const min = Math.min(...ys);
    const max = Math.max(...ys);
    const pad = (max - min) * 0.1 || 0.2;
    return [parseFloat((min - pad).toFixed(2)), parseFloat((max + pad).toFixed(2))];
  }, [points]);

  return (
    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-6 shadow-sm">
      {/* Header & Verification Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[var(--text)]">
            <TrendingUp size={18} className="text-[var(--accent)]" />
            <h3 className="text-base font-bold tracking-tight">
              Experimental Verification: log₁₀(P) vs log₁₀(T) Plot
            </h3>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Straight-line fit: <span className="font-mono text-[var(--text)]">log₁₀(P) = n · log₁₀(T) + log₁₀(C)</span>.
            Target slope <span className="font-semibold text-emerald-400">n ≈ 4.0</span>.
          </p>
        </div>

        {/* Verification Status Banner */}
        {regression ? (
          <div
            className={`
              flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold
              ${regression.verified
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              }
            `}
          >
            {regression.verified ? (
              <>
                <CheckCircle2 size={16} />
                Stefan's Law Verified (Slope n = {regression.slope.toFixed(2)})
              </>
            ) : (
              <>
                <AlertCircle size={16} />
                Slope n = {regression.slope.toFixed(2)} (Deviates from 4.0)
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text-muted)]">
            <Info size={14} />
            Need ≥ 2 readings with calculated log values to plot best-fit
          </div>
        )}
      </div>

      {/* Regression Statistics Dashboard */}
      {regression && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
          <div>
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Calculated Slope (n)</span>
            <p className="text-lg font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
              {regression.slope.toFixed(4)}
            </p>
            <span className="text-[10px] text-[var(--text-muted)] font-mono tabular-nums">Theoretical: 4.000</span>
          </div>

          <div>
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Intercept log₁₀(C)</span>
            <p className="text-lg font-bold font-mono tabular-nums text-[var(--accent)] mt-0.5">
              {regression.intercept.toFixed(4)}
            </p>
            <span className="text-[10px] text-[var(--text-muted)] font-mono tabular-nums">C = {Math.pow(10, regression.intercept).toExponential(3)}</span>
          </div>

          <div>
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Fit Goodness (R²)</span>
            <p className="text-lg font-bold font-mono tabular-nums text-purple-400 mt-0.5">
              {regression.r2.toFixed(5)}
            </p>
            <span className="text-[10px] text-[var(--text-muted)] font-mono tabular-nums">Ideal: 1.000</span>
          </div>

          <div>
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Experimental Error</span>
            <p className="text-lg font-bold font-mono tabular-nums text-[var(--text)] mt-0.5">
              {(Math.abs(regression.slope - 4.0) / 4.0 * 100).toFixed(2)}%
            </p>
            <span className="text-[10px] text-[var(--text-muted)]">Within acceptable lab margin</span>
          </div>
        </div>
      )}

      {/* Recharts Container */}
      <div className="w-full h-[360px] md:h-[420px] rounded-xl bg-[#0a0d14] border border-[var(--border)] p-2">
        {points.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-[var(--text-muted)] space-y-2">
            <TrendingUp size={36} className="opacity-30" />
            <p className="text-sm font-medium">No valid log₁₀(P) vs log₁₀(T) data points</p>
            <p className="text-xs max-w-sm">
              In Table 2, calculate your values or click <span className="text-[var(--accent)]">"Auto-Calculate (Practice)"</span> to render the scientific plot.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, bottom: 25, left: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
              <XAxis
                dataKey="x"
                type="number"
                domain={xDomain}
                name="log10(T)"
                unit=""
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{
                  value: 'log₁₀(T)  [T in Kelvin]',
                  position: 'insideBottom',
                  offset: -15,
                  fill: '#94a3b8',
                  fontSize: 12,
                }}
              />
              <YAxis
                dataKey="y"
                type="number"
                domain={yDomain}
                name="log10(P)"
                unit=""
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{
                  value: 'log₁₀(P)  [P in Watts]',
                  angle: -90,
                  position: 'insideLeft',
                  offset: -5,
                  fill: '#94a3b8',
                  fontSize: 12,
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as PlotPoint;
                    return (
                      <div className="p-3 rounded-lg bg-[#141926] border border-slate-700 text-xs shadow-xl space-y-1">
                        <p className="font-bold text-[var(--text)]">Observation #{data.sNo}</p>
                        <p className="text-cyan-400 font-mono">log₁₀(T) = {data.x.toFixed(4)}</p>
                        <p className="text-emerald-400 font-mono">log₁₀(P) = {data.y.toFixed(4)}</p>
                        {data.fitY !== undefined && (
                          <p className="text-purple-400 font-mono">Best-Fit y = {data.fitY.toFixed(4)}</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
              />
              {/* Actual Data Points */}
              <Scatter
                name="Experimental Points"
                dataKey="y"
                fill="#38bdf8"
                shape="circle"
              />
              {/* Best Fit Line */}
              {regression && (
                <Line
                  type="linear"
                  dataKey="fitY"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  dot={false}
                  name={`Best-Fit Line (Slope n = ${regression.slope.toFixed(2)})`}
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
