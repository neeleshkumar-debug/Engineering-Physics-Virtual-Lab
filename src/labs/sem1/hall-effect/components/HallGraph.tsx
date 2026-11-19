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
import { TrendingUp, CheckCircle2, AlertCircle, Info, Magnet, Zap } from 'lucide-react';
import type { HallEffectObsRow } from '../types';
import {
  computeHallRegression,
  DEFAULT_THICKNESS_MM,
  DEFAULT_CARRIER_DENSITY_M3,
} from '../physicsEngine';

interface HallGraphProps {
  rows: HallEffectObsRow[];
}

interface PlotPoint {
  x: number;
  y: number;
  sNo: number;
  currentI: number;
  bTesla: number;
  type: string;
  fitY?: number;
}

export function HallGraph({ rows }: HallGraphProps) {
  const [plotMode, setPlotMode] = useState<'Vh_vs_B' | 'Vh_vs_I'>('Vh_vs_B');

  // Extract points based on selected plot mode
  const { points, constantParam } = useMemo(() => {
    if (rows.length === 0) return { points: [] as PlotPoint[], constantParam: 1 };

    if (plotMode === 'Vh_vs_B') {
      // Find most common current I among observations
      const currentCounts: Record<number, number> = {};
      rows.forEach((r) => {
        currentCounts[r.currentI_mA] = (currentCounts[r.currentI_mA] || 0) + 1;
      });
      let modeI = rows[0].currentI_mA;
      let maxCount = 0;
      Object.entries(currentCounts).forEach(([curr, count]) => {
        if (count > maxCount) {
          maxCount = count;
          modeI = parseFloat(curr);
        }
      });

      const pts: PlotPoint[] = rows
        .filter((r) => Math.abs(r.currentI_mA - modeI) < 0.2)
        .map((r, idx) => ({
          x: parseFloat(r.magneticFieldB_T.toFixed(3)),
          y: parseFloat(r.hallVoltage_mV.toFixed(2)),
          sNo: idx + 1,
          currentI: r.currentI_mA,
          bTesla: r.magneticFieldB_T,
          type: r.specimenType,
        }))
        .sort((a, b) => a.x - b.x);

      return { points: pts, constantParam: modeI };
    } else {
      // Find most common B among observations
      const bCounts: Record<number, number> = {};
      rows.forEach((r) => {
        bCounts[r.magneticFieldB_T] = (bCounts[r.magneticFieldB_T] || 0) + 1;
      });
      let modeB = rows[0].magneticFieldB_T;
      let maxCount = 0;
      Object.entries(bCounts).forEach(([bStr, count]) => {
        if (count > maxCount) {
          maxCount = count;
          modeB = parseFloat(bStr);
        }
      });

      const pts: PlotPoint[] = rows
        .filter((r) => Math.abs(r.magneticFieldB_T - modeB) < 0.05)
        .map((r, idx) => ({
          x: parseFloat(r.currentI_mA.toFixed(2)),
          y: parseFloat(r.hallVoltage_mV.toFixed(2)),
          sNo: idx + 1,
          currentI: r.currentI_mA,
          bTesla: r.magneticFieldB_T,
          type: r.specimenType,
        }))
        .sort((a, b) => a.x - b.x);

      return { points: pts, constantParam: modeB };
    }
  }, [rows, plotMode]);

  // Compute linear regression on extracted points
  const regression = useMemo(() => {
    if (points.length < 2) return null;
    return computeHallRegression(points, plotMode, constantParam, DEFAULT_THICKNESS_MM);
  }, [points, plotMode, constantParam]);

  // Augment points with fitted line points
  const chartData = useMemo(() => {
    if (!regression || points.length === 0) return points;

    return points.map((p) => ({
      ...p,
      fitY: parseFloat((regression.slope * p.x + regression.intercept).toFixed(2)),
    }));
  }, [points, regression]);

  return (
    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
        <div>
          <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
            <TrendingUp size={16} className="text-[var(--accent)]" />
            <span>Hall Effect Linear Regression Plot</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {plotMode === 'Vh_vs_B'
              ? `Plotting V_H vs Magnetic Field B at constant current I = ${constantParam.toFixed(1)} mA`
              : `Plotting V_H vs Current I at constant field B = ${constantParam.toFixed(2)} T`}
          </p>
        </div>

        {/* Plot Mode Switcher */}
        <div className="flex items-center gap-1 bg-[var(--bg)] p-1 rounded-xl border border-[var(--border)] text-xs">
          <button
            onClick={() => setPlotMode('Vh_vs_B')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-colors ${
              plotMode === 'Vh_vs_B'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <Magnet size={13} />
            <span>V_H vs B</span>
          </button>
          <button
            onClick={() => setPlotMode('Vh_vs_I')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-colors ${
              plotMode === 'Vh_vs_I'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <Zap size={13} />
            <span>V_H vs I</span>
          </button>
        </div>
      </div>

      {/* Regression Results Summary Cards */}
      {regression && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
              Slope (m)
            </span>
            <span className="font-mono tabular-nums font-semibold text-sm text-[var(--accent)]">
              {regression.slope.toFixed(2)}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] block">
              {plotMode === 'Vh_vs_B' ? 'mV / Tesla' : 'mV / mA'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg)] border border-emerald-500/30">
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
              Extracted |R_H|
            </span>
            <span className="font-mono tabular-nums font-semibold text-sm text-emerald-400">
              {(Math.abs(regression.extractedRH_m3_per_C) * 1e3).toFixed(2)} × 10⁻³
            </span>
            <span className="text-[10px] text-[var(--text-muted)] block">m³/C</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
              Carrier Density (n)
            </span>
            <span className="font-mono tabular-nums font-semibold text-sm text-cyan-400">
              {(regression.extractedCarrierDensity_m3 / 1e21).toFixed(2)} × 10²¹
            </span>
            <span className="text-[10px] text-[var(--text-muted)] block">m⁻³</span>
          </div>

          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
              Carrier Type & Fit R²
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-xs px-2 py-0.5 rounded font-mono font-medium ${
                  regression.carrierType === 'n-type'
                    ? 'bg-indigo-500/15 text-indigo-300'
                    : 'bg-emerald-500/15 text-emerald-300'
                }`}
              >
                {regression.carrierType}
              </span>
              <span className="font-mono tabular-nums text-xs text-[var(--text-muted)]">
                R² = {regression.r2.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Canvas Area */}
      <div className="h-72 sm:h-80 w-full pt-2">
        {points.length < 2 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-xl p-6">
            <TrendingUp size={28} className="text-[var(--text-muted)] mb-2 opacity-40" />
            <p className="font-medium text-[var(--text)]">Insufficient Data Points</p>
            <p className="max-w-md mt-1">
              Log at least 2 readings varying {plotMode === 'Vh_vs_B' ? 'magnetic field B' : 'current I'} to generate the linear regression line and extract the Hall coefficient.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />

              <XAxis
                dataKey="x"
                type="number"
                domain={['auto', 'auto']}
                name={plotMode === 'Vh_vs_B' ? 'Magnetic Field B' : 'Sample Current I'}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border)"
                label={{
                  value: plotMode === 'Vh_vs_B' ? 'Magnetic Flux Density B (Tesla)' : 'Sample Current I (mA)',
                  position: 'insideBottom',
                  offset: -12,
                  fill: 'var(--text-muted)',
                  fontSize: 12,
                }}
              />

              <YAxis
                dataKey="y"
                type="number"
                domain={['auto', 'auto']}
                name="Hall Voltage VH"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border)"
                label={{
                  value: 'Hall Voltage V_H (mV)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 5,
                  fill: 'var(--text-muted)',
                  fontSize: 12,
                }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as PlotPoint;
                    return (
                      <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs space-y-1 shadow-lg">
                        <p className="font-semibold text-[var(--text)]">
                          Observation #{data.sNo} ({data.type})
                        </p>
                        <p className="text-emerald-400 font-mono tabular-nums">
                          {plotMode === 'Vh_vs_B'
                            ? `B = ${data.x.toFixed(3)} T`
                            : `I = ${data.x.toFixed(2)} mA`}
                        </p>
                        <p className="text-indigo-400 font-mono tabular-nums">
                          V_H = {data.y.toFixed(2)} mV
                        </p>
                        {data.fitY !== undefined && (
                          <p className="text-[var(--text-muted)] font-mono tabular-nums text-[11px] pt-1 border-t border-[var(--border)]">
                            Fitted Line = {data.fitY.toFixed(2)} mV
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: '12px', color: 'var(--text-muted)' }}
              />

              <Scatter
                name="Recorded Points"
                dataKey="y"
                fill="var(--accent)"
                stroke="#fff"
                strokeWidth={1.5}
              />

              {regression && (
                <Line
                  name={`Best-Fit Line (Slope m = ${regression.slope.toFixed(2)})`}
                  dataKey="fitY"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Educational Footer */}
      <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-start gap-2.5 text-xs text-[var(--text-muted)] leading-relaxed">
        <Info size={15} className="text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-[var(--text)]">Extraction of Physical Properties:</strong> The slope of the line directly determines the Hall coefficient <span className="font-mono">R_H = (Slope · t) / {plotMode === 'Vh_vs_B' ? 'I' : 'B'}</span>. The sign of the slope reveals the carrier polarity (negative for electrons in n-type Ge, positive for holes in p-type Ge).
        </div>
      </div>
    </div>
  );
}
