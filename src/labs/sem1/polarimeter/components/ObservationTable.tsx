import React, { useState } from 'react';
import {
  CheckCircle,
  HelpCircle,
  Trash2,
  Sparkles,
  Download,
  RotateCcw,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import type { PolarimeterObsRow } from '../types';
import type { CellStatus } from '../../../../types/lab';
import {
  verifyPolarimeterStudentMath,
  SUCROSE_SPECIFIC_ROTATION,
} from '../physicsEngine';

interface ObservationTableProps {
  rows: PolarimeterObsRow[];
  setRows: React.Dispatch<React.SetStateAction<PolarimeterObsRow[]>>;
  tubeLengthDm: number;
  waterZeroDeg: number;
  onLoadSampleReadings: () => void;
  canRecord: boolean;
}

export function ObservationTable({
  rows,
  setRows,
  tubeLengthDm,
  waterZeroDeg,
  onLoadSampleReadings,
  canRecord,
}: ObservationTableProps) {
  const [activeHint, setActiveHint] = useState<{
    rowId: number;
    col: string;
    message: string;
  } | null>(null);

  // Handle cell edit
  const handleCellChange = (
    rowId: number,
    field: 'deltaTheta_student' | 'specificRotation_student',
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const key = field.replace('_student', '') as keyof PolarimeterObsRow['cellStatus'];
        return {
          ...row,
          [field]: value,
          cellStatus: {
            ...row.cellStatus,
            [key]: 'idle',
          },
        };
      })
    );
  };

  // Delete row
  const handleDeleteRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Clear all observations
  const handleClearAll = () => {
    if (rows.length === 0) return;
    if (window.confirm('Clear all recorded polarimeter observations?')) {
      setRows([]);
    }
  };

  // Verify student math with 2% tolerance
  const handleVerifyMath = () => {
    setRows((prev) =>
      prev.map((row) => {
        const result = verifyPolarimeterStudentMath(row, 0.02);
        return {
          ...row,
          verified: result.allCorrect,
          cellStatus: {
            deltaTheta: result.deltaTheta.correct ? 'correct' : 'wrong',
            specificRotation: result.specificRotation.correct ? 'correct' : 'wrong',
          },
        };
      })
    );
  };

  // Auto-calculate for practice mode
  const handleAutoCalculate = () => {
    setRows((prev) =>
      prev.map((row) => {
        const deltaStr = row.deltaTheta_ref.toFixed(2);
        const sStr =
          row.concentration_g_cm3 > 0 ? row.specificRotation_ref.toFixed(1) : '-';
        return {
          ...row,
          deltaTheta_student: deltaStr,
          specificRotation_student: sStr,
          verified: true,
          cellStatus: {
            deltaTheta: 'correct',
            specificRotation: 'correct',
          },
        };
      })
    );
  };

  // Export observations to CSV
  const handleExportCSV = () => {
    if (rows.length === 0) return;
    const headers = [
      'Trial',
      'Solution',
      'Concentration_c_g_per_cm3',
      'Tube_Length_L_dm',
      'Water_Zero_theta0_deg',
      'Observed_Angle_theta_deg',
      'Optical_Rotation_DeltaTheta_deg',
      'Specific_Rotation_S_deg_per_dm_g_cm3',
    ];

    const csvRows = rows.map((r, i) => [
      i + 1,
      `"${r.solutionName}"`,
      r.concentration_g_cm3.toFixed(3),
      r.tubeLength_dm.toFixed(1),
      r.referenceAngle_deg.toFixed(2),
      r.observedAngle_deg.toFixed(2),
      r.deltaTheta_student || r.deltaTheta_ref.toFixed(2),
      r.specificRotation_student || (r.concentration_g_cm3 > 0 ? r.specificRotation_ref.toFixed(1) : 'N/A'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'half_shade_polarimeter_observations.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cell status styling helper
  const getCellClass = (status: CellStatus) => {
    if (status === 'correct') {
      return 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-semibold focus:border-emerald-500';
    }
    if (status === 'wrong') {
      return 'bg-rose-500/10 border-rose-500/40 text-rose-400 font-semibold focus:border-rose-500';
    }
    return 'bg-[var(--bg)] border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]';
  };

  // Calculate Mean S from verified student values (or fallback to reference)
  const sugarRows = rows.filter((r) => r.concentration_g_cm3 > 0);
  const calculatedSList = sugarRows
    .map((r) => parseFloat(r.specificRotation_student))
    .filter((v) => Number.isFinite(v) && v > 0);

  const meanS =
    calculatedSList.length > 0
      ? calculatedSList.reduce((a, b) => a + b, 0) / calculatedSList.length
      : sugarRows.length > 0
      ? sugarRows.reduce((a, b) => a + b.specificRotation_ref, 0) / sugarRows.length
      : null;

  const percentError =
    meanS !== null
      ? (Math.abs(meanS - SUCROSE_SPECIFIC_ROTATION) / SUCROSE_SPECIFIC_ROTATION) * 100
      : null;

  return (
    <div className="space-y-6">
      {/* ── Table Action Header ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
            <RotateCw size={16} className="text-[var(--accent)]" />
            <span>Observation Table: Optical Rotation vs. Concentration</span>
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Active Learning: Raw readings are recorded directly from the bench. Calculate Δθ and S manually, then verify your math (2% tolerance).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleVerifyMath}
            disabled={rows.length === 0}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all
              ${rows.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                : 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed opacity-50'
              }
            `}
            title="Verify hand calculations with 2% tolerance"
          >
            <CheckCircle2 size={13} />
            <span>Verify My Math</span>
          </button>

          <button
            onClick={handleAutoCalculate}
            disabled={rows.length === 0}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
              ${rows.length > 0
                ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30 hover:bg-[var(--accent)]/20'
                : 'bg-[var(--bg)] text-[var(--text-muted)] border-[var(--border)] cursor-not-allowed opacity-50'
              }
            `}
            title="Auto-fill calculated values for practice mode"
          >
            <Sparkles size={13} />
            <span>Auto-Calculate</span>
          </button>

          <button
            onClick={onLoadSampleReadings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)]/40 transition-colors"
            title="Load calibrated 5-point observations from college lab manual"
          >
            <Download size={13} />
            <span>Load Sample Lab Readings</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={rows.length === 0}
            className={`
              flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)] transition-colors
              ${rows.length === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[var(--bg)]'}
            `}
            title="Download CSV spreadsheet"
          >
            <span>CSV</span>
          </button>

          <button
            onClick={handleClearAll}
            disabled={rows.length === 0}
            className={`
              flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:bg-rose-500/10 transition-colors
              ${rows.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}
            `}
            title="Clear all rows"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* ── Active Hint Banner ────────────────────────────────────────────── */}
      {activeHint && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Info size={14} className="shrink-0 text-amber-400" />
            <span>{activeHint.message}</span>
          </div>
          <button
            onClick={() => setActiveHint(null)}
            className="text-[11px] font-bold opacity-75 hover:opacity-100 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Observation Table ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)]">
                <th className="py-3 px-3 font-semibold text-center w-12">#</th>
                <th className="py-3 px-3 font-semibold">Solution / Sample</th>
                <th className="py-3 px-3 font-semibold text-right">
                  <div>Concentration (c)</div>
                  <div className="text-[10px] font-normal opacity-75">g/cm³ (g/mL)</div>
                </th>
                <th className="py-3 px-3 font-semibold text-right">
                  <div>Tube Length (L)</div>
                  <div className="text-[10px] font-normal opacity-75">dm</div>
                </th>
                <th className="py-3 px-3 font-semibold text-right">
                  <div>Water Zero (θ₀)</div>
                  <div className="text-[10px] font-normal opacity-75">deg (°)</div>
                </th>
                <th className="py-3 px-3 font-semibold text-right">
                  <div>Observed (θ)</div>
                  <div className="text-[10px] font-normal opacity-75">deg (°)</div>
                </th>
                <th className="py-3 px-3 font-semibold text-right bg-emerald-500/5 min-w-[130px]">
                  <div className="text-emerald-400 font-bold">Δθ = |θ - θ₀|</div>
                  <div className="text-[10px] font-normal opacity-75">deg (student)</div>
                </th>
                <th className="py-3 px-3 font-semibold text-right bg-cyan-500/5 min-w-[150px]">
                  <div className="text-cyan-400 font-bold">S = Δθ / (L · c)</div>
                  <div className="text-[10px] font-normal opacity-75">deg·dm⁻¹·(g/cm³)⁻¹</div>
                </th>
                <th className="py-3 px-2 font-semibold text-center w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-mono tabular-nums">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-[var(--text-muted)] font-sans">
                    <RotateCw size={24} className="mx-auto text-[var(--border)] mb-2" />
                    <p className="text-sm font-medium">No observations recorded yet</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Set equal illumination on the Virtual Bench and click{' '}
                      <span className="text-[var(--accent)] font-semibold">&quot;Record Reading&quot;</span>, or click{' '}
                      <button
                        onClick={onLoadSampleReadings}
                        className="text-[var(--accent)] underline hover:opacity-80"
                      >
                        &quot;Load Sample Lab Readings&quot;
                      </button>
                      .
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={row.id} className="hover:bg-[var(--bg)]/40 transition-colors">
                    <td className="py-2.5 px-3 text-center text-[var(--text-muted)] font-semibold">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-[var(--text)] font-medium">
                      {row.solutionName}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[var(--text-muted)]">
                      {row.concentration_g_cm3.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[var(--text-muted)]">
                      {row.tubeLength_dm.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[var(--text-muted)]">
                      {row.referenceAngle_deg.toFixed(2)}°
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[var(--text)]">
                      {row.observedAngle_deg.toFixed(2)}°
                    </td>

                    {/* Student Calculated Δθ */}
                    <td className="py-2 px-3 text-right bg-emerald-500/5">
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="text"
                          placeholder={row.deltaTheta_ref.toFixed(2)}
                          value={row.deltaTheta_student}
                          onChange={(e) => handleCellChange(row.id, 'deltaTheta_student', e.target.value)}
                          className={`
                            w-24 px-2 py-1 text-right text-xs rounded border outline-none font-mono tabular-nums transition-colors
                            ${getCellClass(row.cellStatus.deltaTheta)}
                          `}
                        />
                        <button
                          onClick={() =>
                            setActiveHint({
                              rowId: row.id,
                              col: 'deltaTheta',
                              message: `Row ${index + 1}: Δθ = |θ - θ₀| = |${row.observedAngle_deg.toFixed(2)}° - ${row.referenceAngle_deg.toFixed(2)}°| = ${row.deltaTheta_ref.toFixed(2)}°`,
                            })
                          }
                          className="text-[var(--text-muted)] hover:text-amber-400 p-0.5"
                          title="Formula hint"
                        >
                          <HelpCircle size={12} />
                        </button>
                      </div>
                    </td>

                    {/* Student Calculated Specific Rotation S */}
                    <td className="py-2 px-3 text-right bg-cyan-500/5">
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="text"
                          placeholder={
                            row.concentration_g_cm3 > 0 ? row.specificRotation_ref.toFixed(1) : '-'
                          }
                          value={row.specificRotation_student}
                          onChange={(e) =>
                            handleCellChange(row.id, 'specificRotation_student', e.target.value)
                          }
                          className={`
                            w-24 px-2 py-1 text-right text-xs rounded border outline-none font-mono tabular-nums transition-colors
                            ${getCellClass(row.cellStatus.specificRotation)}
                          `}
                        />
                        <button
                          onClick={() =>
                            setActiveHint({
                              rowId: row.id,
                              col: 'specificRotation',
                              message:
                                row.concentration_g_cm3 > 0
                                  ? `Row ${index + 1}: S = Δθ / (L · c) = ${row.deltaTheta_ref.toFixed(2)} / (${row.tubeLength_dm} · ${row.concentration_g_cm3}) = ${row.specificRotation_ref.toFixed(1)}° dm⁻¹ (g/cm³)⁻¹`
                                  : 'Distilled water has zero solute (S is not applicable).',
                            })
                          }
                          className="text-[var(--text-muted)] hover:text-amber-400 p-0.5"
                          title="Formula hint"
                        >
                          <HelpCircle size={12} />
                        </button>
                      </div>
                    </td>

                    {/* Delete action */}
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="text-[var(--text-muted)] hover:text-rose-400 p-1 transition-colors"
                        title="Remove row"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Summary & Lab Manual Verification Telemetry ───────────────────── */}
      {meanS !== null && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
              Mean Specific Rotation (S_calc)
            </span>
            <div className="text-2xl font-bold font-mono text-[var(--text)] mt-1 tabular-nums">
              {meanS.toFixed(2)}° <span className="text-xs text-[var(--text-muted)] font-normal">dm⁻¹(g/cm³)⁻¹</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Averaged across {sugarRows.length} sugar solution trials
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
              Standard Reference Sucrose (20°C, Na D-Line)
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
              +{SUCROSE_SPECIFIC_ROTATION.toFixed(1)}° <span className="text-xs text-[var(--text-muted)] font-normal">dm⁻¹(g/cm³)⁻¹</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              Literature specific rotatory power for pure sucrose
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
              Percentage Experimental Discrepancy
            </span>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
              {percentError !== null ? `${percentError.toFixed(2)}%` : '—'}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] mt-1">
              {percentError !== null && percentError <= 2.0
                ? '★ Within laboratory tolerance (≤ 2.0%)'
                : 'Check angle alignment on virtual bench'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
