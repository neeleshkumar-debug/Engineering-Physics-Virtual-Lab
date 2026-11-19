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
import { TrendingUp, CheckCircle2, AlertCircle, Info, Zap } from 'lucide-react';
import type { FourProbeObsRow } from '../types';
import {
  computeFourProbeRegression,
  EG_GE_TARGET,
  SLOPE_FACTOR,
} from '../physicsEngine';

interface BandGapGraphProps {
  rows: FourProbeObsRow[];
}

interface PlotPoint {
  x: number; // 1000 / T (K^-1)
  y: number; // log10(ρ)
  sNo: number;
  tempC: number;
  rho: number;
  fitY?: number;
}

export function BandGapGraph({ rows }: BandGapGraphProps) {
  // Extract valid points from observations
  const points: PlotPoint[] = useMemo(() => {
    const valid: PlotPoint[] = [];

    rows.forEach((r, idx) => {
      // Prefer student value if validly entered, otherwise fallback to bench baseline
      const studentX = parseFloat(r.invT_student);
      const studentY = parseFloat(r.logRho_student);

      const x = isFinite(studentX) && studentX > 0 ? studentX : r.invT;
      const y = isFinite(studentY) ? studentY : r.log10Rho;

      if (isFinite(x) && isFinite(y) && x > 0) {
        valid.push({
          x: parseFloat(x.toFixed(4)),
          y: parseFloat(y.toFixed(4)),
          sNo: idx + 1,
          tempC: r.tempC,
          rho: r.rho > 0 ? r.rho : Math.pow(10, y),
        });
      }
    });

    // Sort by 1000/T ascending for smooth line plotting
    return valid.sort((a, b) => a.x - b.x);
  }, [rows]);

  // Compute best-fit linear regression
  const regression = useMemo(() => {
    if (points.length < 2) return null;
    return computeFourProbeRegression(points);
  }, [points]);

  // Augment points with fitted line points
  const chartData = useMemo(() => {
    if (!regression || points.length === 0) return points;

    return points.map((p) => ({
      ...p,
      fitY: parseFloat((regression.slope * p.x + regression.intercept).toFixed(4)),
    }));
  }, [points, regression]);

  return (
    <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
      {/* Header and Telemetry Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
            <TrendingUp size={16} className="text-[var(--accent)]" />
            <span>Energy Band Gap Fit: log₁₀(ρ) versus 1000/T</span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Linear Arrhenius plot: Slope <span className="font-mono">m</span> determines band gap <span className="font-mono">E_g</span>.
          </p>
        </div>

        {/* Verification Status Badge */}
        {regression ? (
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold border ${
              regression.verified
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {regression.verified ? (
              <>
                <CheckCircle2 size={14} />
                <span>Verified: Germanium E_g within 0.60–0.74 eV</span>
              </>
            ) : (
              <>
                <AlertCircle size={14} />
                <span>Notice: Additional temperature points required</span>
              </>
            )}
          </div>
        ) : (
          <div className="text-xs text-[var(--text-muted)]">
            Capture ≥2 points across temperatures to compute regression fit.
          </div>
        )}
      </div>

      {/* Regression Results Summary Cards */}
      {regression && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
              Slope (m)
            </span>
            <span className="font-mono tabular-nums font-semibold text-sm text-[var(--accent)]">
              {regression.slope.toFixed(4)}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] block">
              Δlog₁₀(ρ) / Δ(1000/T)
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg)] border border-emerald-500/30">
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
              Experimental E_g
            </span>
            <span className="font-mono tabular-nums font-semibold text-sm text-emerald-400">
              {regression.eg_eV.toFixed(3)} eV
            </span>
            <span className="text-[10px] text-[var(--text-muted)] block">
              Standard: 0.670 eV
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
              Percentage Error
            </span>
            <span className="font-mono tabular-nums font-semibold text-sm text-[var(--text)]">
              {regression.percentError.toFixed(2)} %
            </span>
            <span className="text-[10px] text-[var(--text-muted)] block">
              Relative to 0.67 eV
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
              Fit Quality (R²)
            </span>
            <span className="font-mono tabular-nums font-semibold text-sm text-cyan-400">
              {regression.r2.toFixed(4)}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] block">
              Linear correlation
            </span>
          </div>
        </div>
      )}

      {/* Recharts Canvas */}
      <div className="w-full h-[360px] sm:h-[400px]">
        {points.length < 2 ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)] text-xs">
            <Zap size={24} className="text-amber-400 opacity-60" />
            <p className="font-medium text-sm text-[var(--text)]">Insufficient Data Points</p>
            <p className="text-center max-w-sm">
              The Four-Probe band gap regression requires at least two observation readings at different temperatures to compute the slope and energy band gap.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 15, right: 25, bottom: 25, left: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />

              <XAxis
                dataKey="x"
                type="number"
                domain={['auto', 'auto']}
                name="1000 / T"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border)"
                label={{
                  value: '1000 / T (K⁻¹)',
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
                name="log10(ρ)"
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                stroke="var(--border)"
                label={{
                  value: 'log₁₀(ρ [Ω·cm])',
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
                      <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs space-y-1">
                        <p className="font-semibold text-[var(--text)]">
                          Observation #{data.sNo} ({data.tempC.toFixed(1)} °C)
                        </p>
                        <p className="text-indigo-400 font-mono tabular-nums">
                          1000 / T = {data.x.toFixed(3)} K⁻¹
                        </p>
                        <p className="text-amber-400 font-mono tabular-nums">
                          log₁₀(ρ) = {data.y.toFixed(4)}
                        </p>
                        <p className="text-emerald-400 font-mono tabular-nums">
                          ρ = {data.rho.toFixed(3)} Ω·cm
                        </p>
                        {data.fitY !== undefined && (
                          <p className="text-[var(--text-muted)] font-mono tabular-nums text-[11px] pt-1 border-t border-[var(--border)]">
                            Fit Line = {data.fitY.toFixed(4)}
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

              {/* Observed Points Scatter */}
              <Scatter
                name="Observed Readings (log₁₀ρ vs 1000/T)"
                dataKey="y"
                fill="var(--accent)"
                stroke="#fff"
                strokeWidth={1.5}
              />

              {/* Best Fit Linear Regression Line */}
              {regression && (
                <Line
                  name={`Best-Fit Line (Slope m = ${regression.slope.toFixed(3)})`}
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

      {/* Physics Takeaway Box */}
      <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-2 text-xs text-[var(--text-muted)] leading-relaxed">
        <div className="flex items-center gap-2 font-semibold text-[var(--text)]">
          <Info size={15} className="text-indigo-400" />
          <span>Understanding the Slope & Energy Band Gap</span>
        </div>
        <p>
          In the intrinsic conduction region of Germanium (<span className="font-mono text-[var(--text)]">T &gt; 40 °C</span>),
          valence electrons gain sufficient thermal energy (<span className="font-mono text-[var(--text)]">k_B·T</span>) to cross the forbidden band gap into the conduction band.
          Because carrier density grows exponentially, the electrical resistivity drops, giving a positive slope when plotted against <span className="font-mono text-[var(--text)]">1000/T</span>:
        </p>
        <p className="font-mono text-center text-xs md:text-sm text-emerald-400 font-semibold p-2 rounded bg-[var(--surface)] border border-[var(--border)]">
          E_g = 2 · 2.3026 · k_B · 1000 · Slope = 2 · (2.3026) · (8.617 × 10⁻⁵) · 1000 · Slope ≈ 0.3969 · Slope &nbsp; (eV)
        </p>
      </div>
    </div>
  );
}
