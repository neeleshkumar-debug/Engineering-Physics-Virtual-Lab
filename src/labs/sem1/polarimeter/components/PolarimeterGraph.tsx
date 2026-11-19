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
import { TrendingUp, CheckCircle2, AlertCircle, Info, RotateCw } from 'lucide-react';
import type { PolarimeterObsRow } from '../types';
import {
  linearRegressionDeltaThetaVsC,
  SUCROSE_SPECIFIC_ROTATION,
} from '../physicsEngine';

interface PolarimeterGraphProps {
  rows: PolarimeterObsRow[];
  tubeLengthDm: number;
}

interface GraphDataPoint {
  c: number; // concentration in g/cm³
  deltaTheta: number; // observed or student-calculated optical rotation in deg
  solutionName: string;
  fitDeltaTheta?: number;
  isUnknown?: boolean;
}

export function PolarimeterGraph({ rows, tubeLengthDm }: PolarimeterGraphProps) {
  const { plotData, regression, unknownSample } = useMemo(() => {
    // Collect calibration points
    const validPoints: { c: number; deltaTheta: number; name: string; isUnknown?: boolean }[] = [];
    let unknownPt: { c: number; deltaTheta: number; name: string } | null = null;

    rows.forEach((r) => {
      // Use student's calculated delta theta if valid, else reference
      const parsed = parseFloat(r.deltaTheta_student);
      const delta = Number.isFinite(parsed) && parsed >= 0 ? parsed : r.deltaTheta_ref;

      if (r.solutionName.toLowerCase().includes('unknown')) {
        unknownPt = { c: r.concentration_g_cm3, deltaTheta: delta, name: r.solutionName };
      } else {
        validPoints.push({
          c: r.concentration_g_cm3,
          deltaTheta: delta,
          name: r.solutionName,
        });
      }
    });

    // Ensure points are sorted by concentration
    validPoints.sort((a, b) => a.c - b.c);

    const regressionResult = linearRegressionDeltaThetaVsC(
      validPoints.map((p) => ({ c: p.c, deltaTheta: p.deltaTheta })),
      tubeLengthDm
    );

    // Build data points for Recharts with regression line overlay
    const data: GraphDataPoint[] = validPoints.map((p) => ({
      c: p.c,
      deltaTheta: parseFloat(p.deltaTheta.toFixed(2)),
      solutionName: p.name,
      fitDeltaTheta:
        regressionResult.slope > 0
          ? parseFloat((regressionResult.slope * p.c + regressionResult.intercept).toFixed(2))
          : undefined,
    }));

    // If unknown point exists, add it to data
    if (unknownPt) {
      data.push({
        c: (unknownPt as { c: number; deltaTheta: number; name: string }).c,
        deltaTheta: parseFloat((unknownPt as { c: number; deltaTheta: number; name: string }).deltaTheta.toFixed(2)),
        solutionName: (unknownPt as { c: number; deltaTheta: number; name: string }).name,
        isUnknown: true,
      });
    }

    return {
      plotData: data,
      regression: regressionResult,
      unknownSample: unknownPt,
    };
  }, [rows, tubeLengthDm]);

  const hasEnoughPoints = plotData.filter((p) => !p.isUnknown).length >= 2;

  // Unknown sample concentration estimated from slope
  const estimatedUnknownC =
    unknownSample && regression && regression.slope > 0
      ? (unknownSample as { c: number; deltaTheta: number; name: string }).deltaTheta / regression.slope
      : null;

  return (
    <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
      {/* ── Graph Header & Regression Equation ────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
            <TrendingUp size={16} className="text-[var(--accent)]" />
            <span>Calibration Curve: Optical Rotation (Δθ) vs. Sugar Concentration (c)</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Verification of linear Biot&apos;s law: Δθ = (S · L) · c. The specific rotation is given by S = slope / L.
          </p>
        </div>

        {hasEnoughPoints && regression && (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs font-mono">
              <span className="text-[var(--text-muted)]">Fit: </span>
              <span className="text-[var(--accent)] font-semibold">
                Δθ = {regression.slope.toFixed(2)}·c {regression.intercept >= 0 ? `+ ${regression.intercept.toFixed(2)}` : `- ${Math.abs(regression.intercept).toFixed(2)}`}
              </span>
              <span className="text-[var(--text-muted)] ml-2">R² = </span>
              <span className="text-emerald-400 font-bold">{regression.r2.toFixed(4)}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Recharts Canvas Container ─────────────────────────────────────── */}
      <div className="h-80 w-full">
        {plotData.length < 2 ? (
          <div className="h-full flex flex-col items-center justify-center rounded-xl bg-[var(--bg)] border border-dashed border-[var(--border)] text-[var(--text-muted)] p-6 text-center">
            <RotateCw size={28} className="text-[var(--border)] mb-2" />
            <p className="text-sm font-medium">Insufficient Data for Calibration Curve</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm">
              Record at least two sugar concentrations or click &quot;Load Sample Lab Readings&quot; in the Observation Table to plot the line.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={plotData}
              margin={{ top: 15, right: 25, bottom: 25, left: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="c"
                type="number"
                domain={[0, 'auto']}
                unit=" g/cm³"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={{ stroke: '#334155' }}
                label={{
                  value: 'Sugar Concentration c (g/cm³)',
                  position: 'insideBottom',
                  offset: -12,
                  fill: '#94a3b8',
                  fontSize: 11,
                }}
              />
              <YAxis
                dataKey="deltaTheta"
                type="number"
                domain={[0, 'auto']}
                unit="°"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={{ stroke: '#334155' }}
                label={{
                  value: 'Optical Rotation Δθ (°)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  fill: '#94a3b8',
                  fontSize: 11,
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as GraphDataPoint;
                    return (
                      <div className="p-3 rounded-lg bg-[#0f172a] border border-[#334155] text-xs shadow-xl space-y-1">
                        <div className="font-semibold text-white">{data.solutionName}</div>
                        <div className="text-[var(--text-muted)] font-mono">
                          Concentration: <span className="text-emerald-400 font-bold">{data.c.toFixed(3)} g/cm³</span>
                        </div>
                        <div className="text-[var(--text-muted)] font-mono">
                          Observed Δθ: <span className="text-cyan-400 font-bold">{data.deltaTheta.toFixed(2)}°</span>
                        </div>
                        {data.fitDeltaTheta !== undefined && (
                          <div className="text-[var(--text-muted)] font-mono text-[10px]">
                            Fitted line Δθ: <span className="text-amber-400">{data.fitDeltaTheta.toFixed(2)}°</span>
                          </div>
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
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              />
              {/* Regression fit line */}
              <Line
                name="Biot Linear Fit line (Δθ = S·L·c)"
                dataKey="fitDeltaTheta"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                activeDot={false}
              />
              {/* Observed data scatter points */}
              <Scatter
                name="Recorded Lab Observations (Δθ)"
                dataKey="deltaTheta"
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth={1}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Derived Results Telemetry Grid ─────────────────────────────────── */}
      {hasEnoughPoints && regression && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-[var(--border)]">
          <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
              Graph Slope (Δθ / c)
            </span>
            <div className="text-xl font-bold font-mono text-[var(--text)] mt-1 tabular-nums">
              {regression.slope.toFixed(2)} <span className="text-xs text-[var(--text-muted)] font-normal">°/(g/cm³)</span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              Proportionality factor $m = S \cdot L$
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
              Derived Specific Rotation (S)
            </span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
              {regression.specificRotation !== null ? `${regression.specificRotation.toFixed(2)}°` : '—'}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              Calculated from S = slope / L (L = {tubeLengthDm} dm)
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
              Correlation Coefficient (R²)
            </span>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
              {regression.r2.toFixed(4)}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              {regression.r2 >= 0.999 ? 'Excellent linearity (R² > 0.999)' : 'Good linear fit'}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
              Unknown Sample Estimation
            </span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
              {estimatedUnknownC !== null ? `${(estimatedUnknownC * 100).toFixed(1)}%` : '—'}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              {estimatedUnknownC !== null
                ? `c ≈ ${estimatedUnknownC.toFixed(3)} g/cm³`
                : 'Select Unknown Sample on bench'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
