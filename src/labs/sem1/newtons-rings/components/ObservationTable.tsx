import React, { useState } from 'react';
import {
  CheckCircle,
  HelpCircle,
  Trash2,
  Sparkles,
  Download,
  RotateCcw,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Calculator,
} from 'lucide-react';
import type { NewtonsRingsObsRow, LensRadiusOption } from '../types';
import type { CellStatus } from '../../../../types/lab';
import {
  verifyNewtonsRingsObservation,
  getSampleNewtonsRingsObservations,
  computeWavelengthFromDifferenceNm,
  SODIUM_D_LINE_NM,
} from '../physicsEngine';

interface ObservationTableProps {
  rows: NewtonsRingsObsRow[];
  setRows: React.Dispatch<React.SetStateAction<NewtonsRingsObsRow[]>>;
  radiusOfCurvatureCm: LensRadiusOption;
  pStep: number;
  setPStep: (p: number) => void;
  canRecord: boolean;
}

export function ObservationTable({
  rows,
  setRows,
  radiusOfCurvatureCm,
  pStep,
  setPStep,
  canRecord,
}: ObservationTableProps) {
  const [activeHint, setActiveHint] = useState<{
    col: string;
    message: string;
  } | null>(null);

  // Update a single cell in a row
  const handleCellChange = (
    rowId: number,
    field: keyof NewtonsRingsObsRow,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const updated = { ...row, [field]: value };

        let key: keyof NewtonsRingsObsRow['cellStatus'] | null = null;
        if (field === 'diameter_student_cm') key = 'diameter';
        if (field === 'diameterSq_student_cm2') key = 'diameterSq';
        if (field === 'diffSq_student_student_cm2') key = 'diffSq';
        if (field === 'lambda_student_nm') key = 'lambda';

        if (key && row.cellStatus) {
          updated.cellStatus = {
            ...row.cellStatus,
            [key]: 'idle',
          };
        }
        return updated;
      })
    );
  };

  // Delete row
  const handleDeleteRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Clear all
  const handleClearAll = () => {
    if (rows.length === 0) return;
    if (window.confirm('Clear all recorded observations from the table?')) {
      setRows([]);
    }
  };

  // Load sample AKTU lab observations
  const handleLoadSampleData = () => {
    const samples = getSampleNewtonsRingsObservations(radiusOfCurvatureCm, 5.0);
    setRows(samples);
  };

  // Verify student math with 2% tolerance
  const handleVerifyMath = () => {
    setRows((prev) =>
      prev.map((row) => {
        const higherPairedRow = prev.find((r) => r.ringOrder === row.ringOrder + pStep);
        const pairedData = higherPairedRow
          ? { diameterSq_ref_cm2: higherPairedRow.diameterSq_ref_cm2 }
          : undefined;

        const studentInputs = {
          diameter: row.diameter_student_cm,
          diameterSq: row.diameterSq_student_cm2,
          diffSq: row.diffSq_student_student_cm2,
          lambda: row.lambda_student_nm,
        };

        const result = verifyNewtonsRingsObservation(
          row.xL_cm,
          row.xR_cm,
          radiusOfCurvatureCm,
          higherPairedRow ? pStep : undefined,
          pairedData,
          studentInputs
        );

        const newStatus: Record<string, CellStatus> = {
          diameter: result.diameter.correct ? 'correct' : 'wrong',
          diameterSq: result.diameterSq.correct ? 'correct' : 'wrong',
          diffSq: result.diffSq ? (result.diffSq.correct ? 'correct' : 'wrong') : 'idle',
          lambda: result.lambda ? (result.lambda.correct ? 'correct' : 'wrong') : 'idle',
        };

        return {
          ...row,
          verified: true,
          cellStatus: newStatus as NewtonsRingsObsRow['cellStatus'],
        };
      })
    );
  };

  // Auto-Calculate Practice Mode
  const handleAutoCalculate = () => {
    setRows((prev) =>
      prev.map((row) => {
        const higherPairedRow = prev.find((r) => r.ringOrder === row.ringOrder + pStep);
        let diffSqVal = '';
        let lambdaVal = '';

        if (higherPairedRow) {
          const diffSq = higherPairedRow.diameterSq_ref_cm2 - row.diameterSq_ref_cm2;
          const lambdaNm = computeWavelengthFromDifferenceNm(diffSq, pStep, radiusOfCurvatureCm);
          diffSqVal = diffSq.toFixed(4);
          lambdaVal = lambdaNm.toFixed(1);
        }

        return {
          ...row,
          diameter_student_cm: row.diameter_ref_cm.toFixed(3),
          diameterSq_student_cm2: row.diameterSq_ref_cm2.toFixed(4),
          diffSq_student_student_cm2: diffSqVal,
          lambda_student_nm: lambdaVal,
          verified: true,
          cellStatus: {
            diameter: 'correct',
            diameterSq: 'correct',
            diffSq: higherPairedRow ? 'correct' : 'idle',
            lambda: higherPairedRow ? 'correct' : 'idle',
          },
        };
      })
    );
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (rows.length === 0) return;
    const headers = [
      'S.No',
      'Ring_Order_n',
      'Left_Reading_xL_cm',
      'Right_Reading_xR_cm',
      'Diameter_Dn_cm',
      'Diameter_Squared_Dn2_cm2',
      'Paired_Order_n_plus_p',
      'Diff_Dn_plus_p2_minus_Dn2_cm2',
      'Calculated_Lambda_nm',
      'Standard_Lambda_nm',
    ];

    const csvRows = rows.map((r, idx) => {
      const higherPairedRow = rows.find((hr) => hr.ringOrder === r.ringOrder + pStep);
      const diffSq = higherPairedRow
        ? (higherPairedRow.diameterSq_ref_cm2 - r.diameterSq_ref_cm2).toFixed(4)
        : '';
      const lambdaNm = higherPairedRow
        ? computeWavelengthFromDifferenceNm(parseFloat(diffSq), pStep, radiusOfCurvatureCm).toFixed(1)
        : '';

      return [
        idx + 1,
        r.ringOrder,
        r.xL_cm.toFixed(3),
        r.xR_cm.toFixed(3),
        r.diameter_student_cm || r.diameter_ref_cm.toFixed(3),
        r.diameterSq_student_cm2 || r.diameterSq_ref_cm2.toFixed(4),
        higherPairedRow ? r.ringOrder + pStep : '',
        r.diffSq_student_student_cm2 || diffSq,
        r.lambda_student_nm || lambdaNm,
        SODIUM_D_LINE_NM,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `newtons_rings_observations_R${radiusOfCurvatureCm}cm.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCellClassName = (status?: CellStatus) => {
    if (status === 'correct') {
      return 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-medium';
    }
    if (status === 'wrong') {
      return 'bg-rose-500/10 border-rose-500/50 text-rose-300 font-medium';
    }
    return 'bg-[var(--bg)] border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)]';
  };

  return (
    <div className="p-4 md:p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-4">
      {/* ── Table Action Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div>
          <h3 className="text-sm md:text-base font-bold text-[var(--text)] tracking-tight">
            Newton&apos;s Rings Observation Table & Active Calculations
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Traveling Microscope Least Count = 0.001 cm &bull; Lens Radius R = {radiusOfCurvatureCm} cm &bull; Difference Step p = {pStep}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Step p selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs">
            <span className="text-[var(--text-muted)]">Step p:</span>
            {[2, 4, 6].map((pVal) => (
              <button
                key={pVal}
                onClick={() => setPStep(pVal)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono tabular-nums transition-all ${
                  pStep === pVal
                    ? 'bg-[var(--accent)] text-white font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                p = {pVal}
              </button>
            ))}
          </div>

          {/* Load Sample Readings */}
          <button
            onClick={handleLoadSampleData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)] transition-all"
            title="Load standard AKTU laboratory experimental readings (n = 16 to 2)"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>Load Sample Readings</span>
          </button>

          {/* Verify Math */}
          <button
            onClick={handleVerifyMath}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all disabled:opacity-40"
            title="Check all student calculated values against theoretical reference within 2% tolerance"
          >
            <CheckCircle size={13} />
            <span>Verify My Math (2%)</span>
          </button>

          {/* Auto Calculate Practice Mode */}
          <button
            onClick={handleAutoCalculate}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)] transition-all disabled:opacity-40"
            title="Fill in calculations automatically for study and verification"
          >
            <Calculator size={13} className="text-indigo-400" />
            <span>Auto-Calculate</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)] transition-all disabled:opacity-40"
            title="Export observations table to CSV spreadsheet"
          >
            <Download size={13} />
            <span>CSV</span>
          </button>

          {/* Clear All */}
          {rows.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
              title="Clear all rows"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Active Hint Popup ─────────────────────────────────────────────── */}
      {activeHint && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-300">
          <Info size={16} className="shrink-0 mt-0.5 text-amber-400" />
          <div className="flex-1">
            <strong className="font-semibold">{activeHint.col}:</strong> {activeHint.message}
          </div>
          <button
            onClick={() => setActiveHint(null)}
            className="text-amber-400/80 hover:text-amber-300 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Observation Table ─────────────────────────────────────────────── */}
      {rows.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-[var(--bg)] border border-dashed border-[var(--border)] space-y-3">
          <AlertTriangle size={28} className="mx-auto text-amber-400" />
          <div className="text-sm font-medium text-[var(--text)]">No Newton&apos;s Rings Readings Logged Yet</div>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            Switch to the <strong>Virtual Bench</strong> tab to align the traveling microscope crosshair on dark rings and record readings,
            or click <strong>&quot;Load Sample Readings&quot;</strong> above to explore pre-recorded AKTU college data.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-xs text-left border-collapse font-mono tabular-nums">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Ring Order (n)</th>
                <th className="py-2.5 px-3">Left x_L (cm)</th>
                <th className="py-2.5 px-3">Right x_R (cm)</th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <span>Diameter D_n (cm)</span>
                    <button
                      onClick={() =>
                        setActiveHint({
                          col: 'Ring Diameter D_n',
                          message: 'D_n = |x_R - x_L| (in cm). Subtract left crosshair reading from right reading.',
                        })
                      }
                      title="Formula info"
                    >
                      <HelpCircle size={11} className="text-[var(--text-muted)] hover:text-sky-400" />
                    </button>
                  </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <span>D_n² (cm²)</span>
                    <button
                      onClick={() =>
                        setActiveHint({
                          col: 'D_n²',
                          message: 'D_n² = (D_n)². Square the measured diameter in cm to obtain cm².',
                        })
                      }
                      title="Formula info"
                    >
                      <HelpCircle size={11} className="text-[var(--text-muted)] hover:text-sky-400" />
                    </button>
                  </div>
                </th>
                <th className="py-2.5 px-3">Paired (n+p)</th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <span>D_{'{n+p}'}² - D_n² (cm²)</span>
                    <button
                      onClick={() =>
                        setActiveHint({
                          col: 'Difference Formula',
                          message: 'Subtract D_n² from D_{n+p}². This completely eliminates central spot contact error D_0²!',
                        })
                      }
                      title="Formula info"
                    >
                      <HelpCircle size={11} className="text-[var(--text-muted)] hover:text-sky-400" />
                    </button>
                  </div>
                </th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <span>Calc λ (nm)</span>
                    <button
                      onClick={() =>
                        setActiveHint({
                          col: 'Wavelength Formula',
                          message: 'λ = (D_{n+p}² - D_n²) / (4 · p · R) in cm. Multiply by 10⁷ to get nm (Target: 589.3 nm).',
                        })
                      }
                      title="Formula info"
                    >
                      <HelpCircle size={11} className="text-[var(--text-muted)] hover:text-sky-400" />
                    </button>
                  </div>
                </th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map((row, idx) => {
                const higherPairedRow = rows.find((r) => r.ringOrder === row.ringOrder + pStep);

                return (
                  <tr key={row.id} className="hover:bg-[var(--bg)]/50 transition-colors">
                    {/* Index */}
                    <td className="py-2 px-3 text-[var(--text-muted)]">{idx + 1}</td>

                    {/* Ring Order n */}
                    <td className="py-2 px-3 font-semibold text-[var(--text)]">
                      Ring #{row.ringOrder}
                    </td>

                    {/* Left Reading x_L */}
                    <td className="py-2 px-3 font-mono text-sky-400">
                      {row.xL_cm.toFixed(3)}
                    </td>

                    {/* Right Reading x_R */}
                    <td className="py-2 px-3 font-mono text-emerald-400">
                      {row.xR_cm.toFixed(3)}
                    </td>

                    {/* Student: Diameter D_n */}
                    <td className="py-2 px-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={row.diameter_student_cm}
                          onChange={(e) =>
                            handleCellChange(row.id, 'diameter_student_cm', e.target.value)
                          }
                          placeholder={row.diameter_ref_cm.toFixed(3)}
                          className={`w-20 px-2 py-1 text-xs rounded border text-right font-mono tabular-nums transition-all ${getCellClassName(
                            row.cellStatus?.diameter
                          )}`}
                        />
                        {row.cellStatus?.diameter === 'correct' && (
                          <CheckCircle2 size={12} className="absolute right-1 top-2 text-emerald-400" />
                        )}
                        {row.cellStatus?.diameter === 'wrong' && (
                          <XCircle size={12} className="absolute right-1 top-2 text-rose-400" />
                        )}
                      </div>
                    </td>

                    {/* Student: D_n² */}
                    <td className="py-2 px-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={row.diameterSq_student_cm2}
                          onChange={(e) =>
                            handleCellChange(row.id, 'diameterSq_student_cm2', e.target.value)
                          }
                          placeholder={row.diameterSq_ref_cm2.toFixed(4)}
                          className={`w-24 px-2 py-1 text-xs rounded border text-right font-mono tabular-nums transition-all ${getCellClassName(
                            row.cellStatus?.diameterSq
                          )}`}
                        />
                        {row.cellStatus?.diameterSq === 'correct' && (
                          <CheckCircle2 size={12} className="absolute right-1 top-2 text-emerald-400" />
                        )}
                        {row.cellStatus?.diameterSq === 'wrong' && (
                          <XCircle size={12} className="absolute right-1 top-2 text-rose-400" />
                        )}
                      </div>
                    </td>

                    {/* Paired order n + p */}
                    <td className="py-2 px-3 text-[var(--text-muted)] font-mono">
                      {higherPairedRow ? `#${higherPairedRow.ringOrder}` : '—'}
                    </td>

                    {/* Student: Difference D_{n+p}² - D_n² */}
                    <td className="py-2 px-3">
                      {higherPairedRow ? (
                        <div className="relative">
                          <input
                            type="text"
                            value={row.diffSq_student_student_cm2}
                            onChange={(e) =>
                              handleCellChange(row.id, 'diffSq_student_student_cm2', e.target.value)
                            }
                            placeholder={(
                              higherPairedRow.diameterSq_ref_cm2 - row.diameterSq_ref_cm2
                            ).toFixed(4)}
                            className={`w-24 px-2 py-1 text-xs rounded border text-right font-mono tabular-nums transition-all ${getCellClassName(
                              row.cellStatus?.diffSq
                            )}`}
                          />
                          {row.cellStatus?.diffSq === 'correct' && (
                            <CheckCircle2 size={12} className="absolute right-1 top-2 text-emerald-400" />
                          )}
                          {row.cellStatus?.diffSq === 'wrong' && (
                            <XCircle size={12} className="absolute right-1 top-2 text-rose-400" />
                          )}
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>

                    {/* Student: Calculated Lambda (nm) */}
                    <td className="py-2 px-3">
                      {higherPairedRow ? (
                        <div className="relative">
                          <input
                            type="text"
                            value={row.lambda_student_nm}
                            onChange={(e) =>
                              handleCellChange(row.id, 'lambda_student_nm', e.target.value)
                            }
                            placeholder={SODIUM_D_LINE_NM.toFixed(1)}
                            className={`w-20 px-2 py-1 text-xs rounded border text-right font-mono tabular-nums transition-all ${getCellClassName(
                              row.cellStatus?.lambda
                            )}`}
                          />
                          {row.cellStatus?.lambda === 'correct' && (
                            <CheckCircle2 size={12} className="absolute right-1 top-2 text-emerald-400" />
                          )}
                          {row.cellStatus?.lambda === 'wrong' && (
                            <XCircle size={12} className="absolute right-1 top-2 text-rose-400" />
                          )}
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>

                    {/* Delete action */}
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="text-[var(--text-muted)] hover:text-rose-400 transition-colors"
                        title="Delete reading"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
