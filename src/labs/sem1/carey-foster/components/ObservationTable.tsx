import React, { useState } from 'react';
import {
  CheckCircle,
  HelpCircle,
  Trash2,
  Sparkles,
  Download,
  RotateCcw,
  Info,
  Scale,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import type {
  PartARow,
  PartBRow,
  ScrewGaugeStudentState,
  WireSpecimen,
} from '../types';
import type { CellStatus } from '../../../../types/lab';
import {
  verifyPartARow,
  verifyPartBRow,
  verifyScrewGaugeAndRho,
  SAMPLE_PART_A_ROWS,
  SAMPLE_PART_B_ROWS,
  DEFAULT_RHO_W,
} from '../physicsEngine';

interface ObservationTableProps {
  partARows: PartARow[];
  setPartARows: React.Dispatch<React.SetStateAction<PartARow[]>>;
  partBRows: PartBRow[];
  setPartBRows: React.Dispatch<React.SetStateAction<PartBRow[]>>;
  activeSpecimen: WireSpecimen;
  screwGaugeState: ScrewGaugeStudentState;
  setScrewGaugeState: React.Dispatch<React.SetStateAction<ScrewGaugeStudentState>>;
}

export function ObservationTable({
  partARows,
  setPartARows,
  partBRows,
  setPartBRows,
  activeSpecimen,
  screwGaugeState,
  setScrewGaugeState,
}: ObservationTableProps) {
  const [activeHint, setActiveHint] = useState<{
    rowId: number;
    col: string;
    message: string;
  } | null>(null);

  // Mean rho_w from Table 1
  const validRhoWList = partARows
    .map((r) => parseFloat(r.rho_w_student))
    .filter((v) => Number.isFinite(v) && v > 0);
  const meanRhoW =
    validRhoWList.length > 0
      ? validRhoWList.reduce((a, b) => a + b, 0) / validRhoWList.length
      : DEFAULT_RHO_W;

  // Mean Y from Table 2
  const validYList = partBRows
    .map((r) => parseFloat(r.y_student))
    .filter((v) => Number.isFinite(v) && v > 0);
  const meanY =
    validYList.length > 0
      ? validYList.reduce((a, b) => a + b, 0) / validYList.length
      : activeSpecimen.nominalResistanceOhm;

  // ── Handlers for Table 1 (Part A) ─────────────────────────────────────────
  const handlePartACellChange = (
    rowId: number,
    field: 'diff_student' | 'rho_w_student',
    value: string
  ) => {
    setPartARows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const key = field.replace('_student', '') as 'diff' | 'rho_w';
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

  const handleDeletePartARow = (id: number) => {
    setPartARows((prev) => prev.filter((r) => r.id !== id));
  };

  // ── Handlers for Table 2 (Part B) ─────────────────────────────────────────
  const handlePartBCellChange = (
    rowId: number,
    field: 'diff_student' | 'y_student',
    value: string
  ) => {
    setPartBRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const key = field.replace('_student', '') as 'diff' | 'y';
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

  const handleDeletePartBRow = (id: number) => {
    setPartBRows((prev) => prev.filter((r) => r.id !== id));
  };

  // ── Verify Math for All Tables (2% tolerance) ─────────────────────────────
  const handleVerifyMath = () => {
    // 1. Verify Part A rows
    setPartARows((prev) =>
      prev.map((row) => {
        const res = verifyPartARow(row);
        return {
          ...row,
          verified: true,
          cellStatus: {
            diff: res.diff.correct ? 'correct' : 'wrong',
            rho_w: res.rho_w.correct ? 'correct' : 'wrong',
          },
        };
      })
    );

    // 2. Verify Part B rows
    setPartBRows((prev) =>
      prev.map((row) => {
        const res = verifyPartBRow(row, meanRhoW);
        return {
          ...row,
          verified: true,
          cellStatus: {
            diff: res.diff.correct ? 'correct' : 'wrong',
            y: res.y.correct ? 'correct' : 'wrong',
          },
        };
      })
    );

    // 3. Verify Screw Gauge State
    const sgRes = verifyScrewGaugeAndRho(screwGaugeState, activeSpecimen, meanY);
    setScrewGaugeState((prev) => ({
      ...prev,
      verified: true,
      cellStatus: {
        diameter: sgRes.diameter.correct ? 'correct' : 'wrong',
        radius: sgRes.radius.correct ? 'correct' : 'wrong',
        length: sgRes.length.correct ? 'correct' : 'wrong',
        rho: sgRes.rho.correct ? 'correct' : 'wrong',
      },
    }));
  };

  // ── Auto-Calculate Practice Mode ──────────────────────────────────────────
  const handleAutoCalculate = () => {
    setPartARows((prev) =>
      prev.map((row) => ({
        ...row,
        diff_student: row.diff_ref_cm.toFixed(2),
        rho_w_student: row.rho_w_ref.toFixed(4),
        verified: true,
        cellStatus: { diff: 'correct', rho_w: 'correct' },
      }))
    );

    setPartBRows((prev) =>
      prev.map((row) => ({
        ...row,
        diff_student: row.diff_ref_cm.toFixed(2),
        y_student: row.y_ref_ohm.toFixed(3),
        verified: true,
        cellStatus: { diff: 'correct', y: 'correct' },
      }))
    );

    const calcRhoMicro = (activeSpecimen.resistivityOhmM * 1e6).toFixed(2);
    setScrewGaugeState({
      msr_mm: activeSpecimen.screwGauge.msrMm.toFixed(1),
      csr_div: activeSpecimen.screwGauge.csrDiv.toString(),
      zeroError_mm: '0.0',
      diameter_student_mm: activeSpecimen.diameterMm.toFixed(2),
      radius_student_cm: (activeSpecimen.diameterMm / 20.0).toFixed(4),
      length_student_cm: activeSpecimen.lengthCm.toFixed(1),
      rho_student_ohm_m: calcRhoMicro,
      verified: true,
      cellStatus: {
        diameter: 'correct',
        radius: 'correct',
        length: 'correct',
        rho: 'correct',
      },
    });
  };

  // ── Load Sample Lab Data ──────────────────────────────────────────────────
  const handleLoadSampleData = () => {
    setPartARows(SAMPLE_PART_A_ROWS);
    const sampleB = SAMPLE_PART_B_ROWS[activeSpecimen.id] || SAMPLE_PART_B_ROWS.constantan;
    setPartBRows(sampleB);

    const calcRhoMicro = (activeSpecimen.resistivityOhmM * 1e6).toFixed(2);
    setScrewGaugeState({
      msr_mm: activeSpecimen.screwGauge.msrMm.toFixed(1),
      csr_div: activeSpecimen.screwGauge.csrDiv.toString(),
      zeroError_mm: '0.0',
      diameter_student_mm: activeSpecimen.diameterMm.toFixed(2),
      radius_student_cm: (activeSpecimen.diameterMm / 20.0).toFixed(4),
      length_student_cm: activeSpecimen.lengthCm.toFixed(1),
      rho_student_ohm_m: calcRhoMicro,
      verified: true,
      cellStatus: {
        diameter: 'correct',
        radius: 'correct',
        length: 'correct',
        rho: 'correct',
      },
    });
  };

  // ── Clear All Tables ──────────────────────────────────────────────────────
  const handleClearAll = () => {
    if (window.confirm('Clear all recorded observation rows from both tables?')) {
      setPartARows([]);
      setPartBRows([]);
      setScrewGaugeState({
        msr_mm: '',
        csr_div: '',
        zeroError_mm: '',
        diameter_student_mm: '',
        radius_student_cm: '',
        length_student_cm: '',
        rho_student_ohm_m: '',
        verified: false,
        cellStatus: { diameter: 'idle', radius: 'idle', length: 'idle', rho: 'idle' },
      });
    }
  };

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    let csv = 'CAREY FOSTER BRIDGE EXPERIMENT OBSERVATIONS\n\n';
    csv += 'TABLE 1: Resistance per Unit Length (rho_w) of Bridge Wire\n';
    csv += 'S.No,X (Ohm),l1 (cm),l2 (cm),Difference (l2-l1) (cm),rho_w (Ohm/cm)\n';
    partARows.forEach((r, idx) => {
      csv += `${idx + 1},${r.resistanceX_ohm},${r.l1_cm},${r.l2_cm},${r.diff_student || r.diff_ref_cm},${r.rho_w_student || r.rho_w_ref}\n`;
    });

    csv += '\nTABLE 2: Unknown Resistance Y and Specific Resistance\n';
    csv += `Specimen: ${activeSpecimen.name}, Wire Length L: ${activeSpecimen.lengthCm} cm, Wire Diameter d: ${activeSpecimen.diameterMm} mm\n`;
    csv += 'S.No,X (Ohm),l1_prime (cm),l2_prime (cm),Difference (l2_prime-l1_prime) (cm),Y (Ohm)\n';
    partBRows.forEach((r, idx) => {
      csv += `${idx + 1},${r.resistanceX_ohm},${r.l1_cm},${r.l2_cm},${r.diff_student || r.diff_ref_cm},${r.y_student || r.y_ref_ohm}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `carey_foster_bridge_observations_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getCellClasses = (status: CellStatus) => {
    const base =
      'w-full text-center font-mono tabular-nums text-xs py-1 px-1.5 rounded transition-all outline-none border ';
    switch (status) {
      case 'correct':
        return (
          base +
          'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 font-semibold'
        );
      case 'wrong':
        return (
          base +
          'bg-rose-500/15 border-rose-500/50 text-rose-400 font-semibold'
        );
      case 'idle':
      default:
        return (
          base +
          'bg-[var(--bg)] border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] focus:border-[var(--accent)]'
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Toolbar: Actions & Hints ───────────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Scale size={16} className="text-[var(--accent)]" />
          <h3 className="text-sm font-semibold text-[var(--text)]">
            Laboratory Observation Tables &amp; Active Student Math
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleVerifyMath}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
          >
            <CheckCircle size={14} />
            <span>Verify My Math (2% Tol)</span>
          </button>

          <button
            onClick={handleAutoCalculate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)] transition-all"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>Auto-Calculate (Practice)</span>
          </button>

          <button
            onClick={handleLoadSampleData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)] transition-all"
          >
            <RotateCcw size={14} className="text-cyan-400" />
            <span>Load Sample Data</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)] transition-all"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          {(partARows.length > 0 || partBRows.length > 0) && (
            <button
              onClick={handleClearAll}
              className="p-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Clear all rows"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── TABLE 1: Determination of Resistance per Unit Length (ρ_w) ───────── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <span>Table 1: Resistance per Unit Length of Bridge Wire (ρ_w)</span>
            </h4>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Part A: Standard box X in outer left gap, thick copper strip (0.00 Ω) in outer right gap, then interchanged.
            </p>
          </div>

          <div className="px-3 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs font-mono text-[var(--text-muted)]">
            Mean ρ_w ={' '}
            <strong className="text-sky-400 font-bold tabular-nums">
              {meanRhoW.toFixed(4)} Ω/cm
            </strong>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]/60 text-[var(--text-muted)] font-mono">
                <th className="py-2.5 px-3 w-12 text-center">S.No</th>
                <th className="py-2.5 px-3">Resistance X (Ω)</th>
                <th className="py-2.5 px-3">Null Length l₁ (cm)</th>
                <th className="py-2.5 px-3">Interchanged l₂ (cm)</th>
                <th className="py-2.5 px-3 w-36 text-center">
                  Diff (l₂ - l₁) (cm)
                  <span className="block text-[10px] font-normal text-amber-400/80">Student Entry</span>
                </th>
                <th className="py-2.5 px-3 w-40 text-center">
                  ρ_w = X / (l₂ - l₁) (Ω/cm)
                  <span className="block text-[10px] font-normal text-amber-400/80">Student Entry</span>
                </th>
                <th className="py-2.5 px-2 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-mono tabular-nums">
              {partARows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[var(--text-muted)]">
                    No calibration observations recorded yet. Go to <strong className="text-[var(--text)]">Virtual Bench &rarr; Part A</strong>,
                    set resistance X, and click <strong className="text-[var(--text)]">Record Null Length</strong> for both Normal (l₁) and Interchanged (l₂).
                  </td>
                </tr>
              ) : (
                partARows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-[var(--bg)]/40 transition-colors">
                    <td className="py-2 px-3 text-center text-[var(--text-muted)]">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-cyan-400">{row.resistanceX_ohm.toFixed(1)}</td>
                    <td className="py-2 px-3 text-[var(--text)]">{row.l1_cm.toFixed(2)}</td>
                    <td className="py-2 px-3 text-[var(--text)]">{row.l2_cm.toFixed(2)}</td>

                    {/* Student Difference */}
                    <td className="py-2 px-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={row.diff_student}
                          placeholder={row.diff_ref_cm.toFixed(2)}
                          onChange={(e) => handlePartACellChange(row.id, 'diff_student', e.target.value)}
                          className={getCellClasses(row.cellStatus.diff)}
                        />
                        {row.cellStatus.diff === 'wrong' && (
                          <button
                            onClick={() =>
                              setActiveHint({
                                rowId: row.id,
                                col: 'diffA',
                                message: `Hint: Difference (l2 - l1) = ${row.l2_cm.toFixed(2)} - ${row.l1_cm.toFixed(2)} = ${row.diff_ref_cm.toFixed(2)} cm.`,
                              })
                            }
                            className="absolute right-1 top-1.5 text-rose-400 hover:opacity-80"
                            title="View hint"
                          >
                            <HelpCircle size={12} />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Student rho_w */}
                    <td className="py-2 px-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={row.rho_w_student}
                          placeholder={row.rho_w_ref.toFixed(4)}
                          onChange={(e) => handlePartACellChange(row.id, 'rho_w_student', e.target.value)}
                          className={getCellClasses(row.cellStatus.rho_w)}
                        />
                        {row.cellStatus.rho_w === 'wrong' && (
                          <button
                            onClick={() =>
                              setActiveHint({
                                rowId: row.id,
                                col: 'rho_w',
                                message: `Hint: rho_w = X / (l2 - l1) = ${row.resistanceX_ohm.toFixed(2)} / ${row.diff_ref_cm.toFixed(2)} ≈ ${row.rho_w_ref.toFixed(4)} Ω/cm.`,
                              })
                            }
                            className="absolute right-1 top-1.5 text-rose-400 hover:opacity-80"
                            title="View hint"
                          >
                            <HelpCircle size={12} />
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => handleDeletePartARow(row.id)}
                        className="p-1 rounded text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete row"
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

      {/* ── TABLE 2: Determination of Unknown Resistance Y ──────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
              <span>Table 2: Unknown Resistance (Y) — {activeSpecimen.name}</span>
            </h4>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Part B: Standard box X in outer left gap, unknown wire Y in outer right gap, then interchanged.
            </p>
          </div>

          <div className="px-3 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs font-mono text-[var(--text-muted)]">
            Mean Y ={' '}
            <strong className="text-violet-400 font-bold tabular-nums">
              {meanY.toFixed(3)} Ω
            </strong>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]/60 text-[var(--text-muted)] font-mono">
                <th className="py-2.5 px-3 w-12 text-center">S.No</th>
                <th className="py-2.5 px-3">Resistance X (Ω)</th>
                <th className="py-2.5 px-3">Null Length l₁&apos; (cm)</th>
                <th className="py-2.5 px-3">Interchanged l₂&apos; (cm)</th>
                <th className="py-2.5 px-3 w-36 text-center">
                  Diff (l₂&apos; - l₁&apos;) (cm)
                  <span className="block text-[10px] font-normal text-amber-400/80">Student Entry</span>
                </th>
                <th className="py-2.5 px-3 w-40 text-center">
                  Y = X - ρ_w(l₂&apos; - l₁&apos;) (Ω)
                  <span className="block text-[10px] font-normal text-amber-400/80">Student Entry</span>
                </th>
                <th className="py-2.5 px-2 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-mono tabular-nums">
              {partBRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[var(--text-muted)]">
                    No specimen observations recorded yet. Go to <strong className="text-[var(--text)]">Virtual Bench &rarr; Part B</strong>,
                    select an unknown wire, and record null points l₁&apos; and l₂&apos;.
                  </td>
                </tr>
              ) : (
                partBRows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-[var(--bg)]/40 transition-colors">
                    <td className="py-2 px-3 text-center text-[var(--text-muted)]">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-cyan-400">{row.resistanceX_ohm.toFixed(1)}</td>
                    <td className="py-2 px-3 text-[var(--text)]">{row.l1_cm.toFixed(2)}</td>
                    <td className="py-2 px-3 text-[var(--text)]">{row.l2_cm.toFixed(2)}</td>

                    {/* Student Difference */}
                    <td className="py-2 px-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={row.diff_student}
                          placeholder={row.diff_ref_cm.toFixed(2)}
                          onChange={(e) => handlePartBCellChange(row.id, 'diff_student', e.target.value)}
                          className={getCellClasses(row.cellStatus.diff)}
                        />
                        {row.cellStatus.diff === 'wrong' && (
                          <button
                            onClick={() =>
                              setActiveHint({
                                rowId: row.id,
                                col: 'diffB',
                                message: `Hint: Difference (l2' - l1') = ${row.l2_cm.toFixed(2)} - ${row.l1_cm.toFixed(2)} = ${row.diff_ref_cm.toFixed(2)} cm.`,
                              })
                            }
                            className="absolute right-1 top-1.5 text-rose-400 hover:opacity-80"
                            title="View hint"
                          >
                            <HelpCircle size={12} />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Student Y */}
                    <td className="py-2 px-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={row.y_student}
                          placeholder={row.y_ref_ohm.toFixed(3)}
                          onChange={(e) => handlePartBCellChange(row.id, 'y_student', e.target.value)}
                          className={getCellClasses(row.cellStatus.y)}
                        />
                        {row.cellStatus.y === 'wrong' && (
                          <button
                            onClick={() =>
                              setActiveHint({
                                rowId: row.id,
                                col: 'y',
                                message: `Hint: Y = X - rho_w * (l2' - l1') = ${row.resistanceX_ohm.toFixed(2)} - (${meanRhoW.toFixed(4)} * ${row.diff_ref_cm.toFixed(2)}) ≈ ${row.y_ref_ohm.toFixed(3)} Ω.`,
                              })
                            }
                            className="absolute right-1 top-1.5 text-rose-400 hover:opacity-80"
                            title="View hint"
                          >
                            <HelpCircle size={12} />
                          </button>
                        )}
                      </div>
                    </td>

                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => handleDeletePartBRow(row.id)}
                        className="p-1 rounded text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete row"
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

      {/* ── Screw Gauge & Specific Resistance (ρ) Summary Card ────────────── */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-400" />
            <h4 className="text-sm font-semibold text-[var(--text)]">
              Micrometer Screw Gauge &amp; Specific Resistance (ρ) Evaluation
            </h4>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-medium">
            Active Specimen: {activeSpecimen.name}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* 1. Wire Diameter d */}
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Mean Diameter d (mm)
            </label>
            <input
              type="text"
              value={screwGaugeState.diameter_student_mm}
              placeholder={activeSpecimen.diameterMm.toFixed(2)}
              onChange={(e) =>
                setScrewGaugeState((prev) => ({
                  ...prev,
                  diameter_student_mm: e.target.value,
                  cellStatus: { ...prev.cellStatus, diameter: 'idle' },
                }))
              }
              className={getCellClasses(screwGaugeState.cellStatus.diameter)}
            />
            <span className="text-[10px] text-[var(--text-muted)] block">
              MSR: {activeSpecimen.screwGauge.msrMm} mm + CSR: {activeSpecimen.screwGauge.csrDiv} div
            </span>
          </div>

          {/* 2. Wire Radius r (cm) */}
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Radius r (cm)
            </label>
            <input
              type="text"
              value={screwGaugeState.radius_student_cm}
              placeholder={(activeSpecimen.diameterMm / 20.0).toFixed(4)}
              onChange={(e) =>
                setScrewGaugeState((prev) => ({
                  ...prev,
                  radius_student_cm: e.target.value,
                  cellStatus: { ...prev.cellStatus, radius: 'idle' },
                }))
              }
              className={getCellClasses(screwGaugeState.cellStatus.radius)}
            />
            <span className="text-[10px] text-[var(--text-muted)] block">
              r = (d / 2) in cm = (d_mm / 20)
            </span>
          </div>

          {/* 3. Wire Length L (cm) */}
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Wire Length L (cm)
            </label>
            <input
              type="text"
              value={screwGaugeState.length_student_cm}
              placeholder={activeSpecimen.lengthCm.toFixed(1)}
              onChange={(e) =>
                setScrewGaugeState((prev) => ({
                  ...prev,
                  length_student_cm: e.target.value,
                  cellStatus: { ...prev.cellStatus, length: 'idle' },
                }))
              }
              className={getCellClasses(screwGaugeState.cellStatus.length)}
            />
            <span className="text-[10px] text-[var(--text-muted)] block">
              Nominal: {activeSpecimen.lengthCm} cm
            </span>
          </div>

          {/* 4. Calculated Specific Resistance rho */}
          <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Resistivity ρ (10⁻⁶ Ω·m)
            </label>
            <input
              type="text"
              value={screwGaugeState.rho_student_ohm_m}
              placeholder={(activeSpecimen.resistivityOhmM * 1e6).toFixed(2)}
              onChange={(e) =>
                setScrewGaugeState((prev) => ({
                  ...prev,
                  rho_student_ohm_m: e.target.value,
                  cellStatus: { ...prev.cellStatus, rho: 'idle' },
                }))
              }
              className={getCellClasses(screwGaugeState.cellStatus.rho)}
            />
            <span className="text-[10px] text-[var(--text-muted)] block">
              ρ = (Y · π · r²) / L
            </span>
          </div>
        </div>
      </div>

      {/* ── Active Hint Banner ──────────────────────────────────────────────── */}
      {activeHint && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Info size={14} className="shrink-0" />
            <span>{activeHint.message}</span>
          </div>
          <button
            onClick={() => setActiveHint(null)}
            className="text-[10px] underline hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Formula Cheat Sheet Footer ───────────────────────────────────────── */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2 text-[var(--text)] font-semibold">
          <Info size={14} className="text-[var(--accent)]" />
          <span>Carey Foster Bridge Governing Equations Cheat Sheet</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] font-mono text-[11px]">
            <div className="text-sky-400 font-semibold mb-0.5">Wire Calibration (Part A):</div>
            <div>ρ_w = X / (l₂ - l₁) [Ω/cm]</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] font-mono text-[11px]">
            <div className="text-violet-400 font-semibold mb-0.5">Unknown Resistance (Part B):</div>
            <div>Y = X - ρ_w · (l₂&apos; - l₁&apos;) [Ω]</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] font-mono text-[11px]">
            <div className="text-emerald-400 font-semibold mb-0.5">Specific Resistance:</div>
            <div>ρ = (Y · π · r²) / L [Ω·m]</div>
          </div>
        </div>
      </div>
    </div>
  );
}
