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
import { TrendingUp, CheckCircle2, AlertCircle, Info, Sparkles, Layers } from 'lucide-react';
import type { NewtonsRingsObsRow, LensRadiusOption } from '../types';
import {
  computeNewtonsRingsRegression,
  SODIUM_D_LINE_NM,
} from '../physicsEngine';

interface NewtonsRingsGraphProps {
  rows: NewtonsRingsObsRow[];
  radiusOfCurvatureCm: LensRadiusOption;
}

interface PlotPoint {
  n: number;
  dnSq: number;
  dn: number;
  fitY?: number;
}

export function NewtonsRingsGraph({ rows, radiusOfCurvatureCm }: NewtonsRingsGraphProps) {
  const { points, regressionResult } = useMemo(() => {
    if (rows.length === 0) {
      return {
        points: [] as PlotPoint[],
        regressionResult: null,
      };
    }

    const pts: PlotPoint[] = rows.map((r) => {
      const parsedSq = parseFloat(r.diameterSq_student_cm2);
      const dnSqVal =
        Number.isFinite(parsedSq) && parsedSq > 0 ? parsedSq : r.diameterSq_ref_cm2;

      return {
        n: r.ringOrder,
        dnSq: parseFloat(dnSqVal.toFixed(4)),
        dn: r.diameter_ref_cm,
      };
    }).sort((a, b) => a.n - b.n);

    const regPoints = pts.map((p) => ({ n: p.n, dnSq: p.dnSq }));
    const reg = computeNewtonsRingsRegression(regPoints, radiusOfCurvatureCm, SODIUM_D_LINE_NM);

    // Compute fitted Y coordinates for straight line
    if (regPoints.length >= 2) {
      pts.forEach((pt) => {
        pt.fitY = parseFloat((reg.slope * pt.n + reg.intercept).toFixed(4));
      });
    }

    return {
      points: pts,
      regressionResult: reg,
    };
  }, [rows, radiusOfCurvatureCm]);

  const isVerified =
    regressionResult &&
    regressionResult.r2 >= 0.98 &&
    regressionResult.percentageError <= 2.0;

  return (
    <div className="p-4 md:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-6">
      {/* ── Header & Summary Cards ──────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-amber-400" />
            <h3 className="text-base font-semibold text-[var(--text)] tracking-tight">
              Linear Calibration Plot: Diameter Squared (D_n²) vs. Ring Order (n)
            </h3>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Theoretical relation: <span className="font-mono text-[var(--text)]">D_n² = 4λR · n + D_0²</span> &bull; Slope m = 4λR yields wavelength λ = m / (4R).
          </p>
        </div>

        {regressionResult && regressionResult.pointsCount >= 2 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs font-mono">
            <span className="text-[var(--text-muted)]">Graph Derived λ =</span>
            <strong className="text-emerald-400 font-bold tabular-nums">
              {regressionResult.calculatedLambdaNm.toFixed(1)} nm
            </strong>
            <span className="text-[var(--text-muted)]">({(regressionResult.calculatedLambdaNm * 10).toFixed(0)} &Aring;)</span>
          </div>
        )}
      </div>

      {/* ── Key Mathematical Statistics Pills ─────────────────────────────── */}
      {regressionResult && regressionResult.pointsCount >= 2 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          {/* Slope */}
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
            <div className="text-[var(--text-muted)] text-[10px] uppercase font-sans">
              Slope (m = 4λR)
            </div>
            <div className="text-sm font-bold text-sky-400 tabular-nums">
              {regressionResult.slope.toFixed(6)} cm²
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">
              Δ(D_n²) / Δn
            </div>
          </div>

          {/* Contact Intercept */}
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
            <div className="text-[var(--text-muted)] text-[10px] uppercase font-sans">
              Intercept (c = D₀²)
            </div>
            <div className="text-sm font-bold text-amber-400 tabular-nums">
              {regressionResult.intercept.toFixed(6)} cm²
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">
              Central contact offset
            </div>
          </div>

          {/* Derived Wavelength */}
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
            <div className="text-[var(--text-muted)] text-[10px] uppercase font-sans">
              Derived Wavelength (λ)
            </div>
            <div className="text-sm font-bold text-emerald-400 tabular-nums">
              {regressionResult.calculatedLambdaNm.toFixed(1)} nm
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">
              λ = m / (4 · {radiusOfCurvatureCm})
            </div>
          </div>

          {/* R^2 Correlation */}
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
            <div className="text-[var(--text-muted)] text-[10px] uppercase font-sans">
              Fit Quality (R²)
            </div>
            <div className={`text-sm font-bold tabular-nums ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
              {regressionResult.r2.toFixed(5)}
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">
              Error: {regressionResult.percentageError.toFixed(2)}%
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[var(--bg)] border border-dashed border-[var(--border)] flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <Info size={16} className="text-sky-400 shrink-0" />
          <span>
            Log at least 2 distinct ring orders in the Observation Table to generate the linear regression line and derive wavelength &lambda;.
          </span>
        </div>
      )}

      {/* ── Recharts Linear Plot ──────────────────────────────────────────── */}
      <div className="h-72 w-full">
        {points.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={points}
              margin={{ top: 15, right: 25, bottom: 25, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />

              <XAxis
                dataKey="n"
                name="Ring Order (n)"
                domain={[0, 'auto']}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{
                  value: 'Ring Order (n)',
                  position: 'insideBottom',
                  offset: -15,
                  fill: '#94a3b8',
                  fontSize: 11,
                }}
              />

              <YAxis
                dataKey="dnSq"
                name="D_n² (cm²)"
                domain={[0, 'auto']}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{
                  value: 'Diameter Squared D_n² (cm²)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: -5,
                  fill: '#94a3b8',
                  fontSize: 11,
                }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as PlotPoint;
                    return (
                      <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] shadow-xl text-xs space-y-1 font-mono">
                        <div className="font-semibold text-amber-400">Ring Order n = {data.n}</div>
                        <div className="text-[var(--text)]">Measured D_n²: {data.dnSq.toFixed(4)} cm²</div>
                        <div className="text-sky-400">Diameter D_n: {data.dn.toFixed(3)} cm</div>
                        {data.fitY !== undefined && (
                          <div className="text-emerald-400">Regression Fit: {data.fitY.toFixed(4)} cm²</div>
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

              {/* Data points */}
              <Scatter
                name="Measured (n, D_n²)"
                dataKey="dnSq"
                fill="#f59e0b"
                line={false}
              />

              {/* Linear Fit Line */}
              {regressionResult && regressionResult.pointsCount >= 2 && (
                <Line
                  name={`Fit Line (Slope = ${regressionResult.slope.toFixed(5)})`}
                  dataKey="fitY"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-xl">
            No observation data to plot. Log readings or click &quot;Load Sample Readings&quot;.
          </div>
        )}
      </div>

      {/* ── Active Verification Banner ────────────────────────────────────── */}
      {isVerified && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-emerald-200">Experimental Verification Successful!</strong>
            <div>
              Linear fit confirmed with R² = {regressionResult.r2.toFixed(5)} &bull; Experimental wavelength{' '}
              <strong className="text-white">{regressionResult.calculatedLambdaNm.toFixed(1)} nm</strong> matches standard sodium D lines (589.3 nm) within{' '}
              {regressionResult.percentageError.toFixed(2)}% error (well within the 2% laboratory tolerance).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
