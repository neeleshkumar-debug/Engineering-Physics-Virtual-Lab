import React, { useState } from 'react';
import {
  CheckCircle,
  HelpCircle,
  Trash2,
  Sparkles,
  Download,
  Plus,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import type { ObsRow, CellStatus } from '../../../../types/lab';
import {
  verifyObservation,
  computePower,
  computeTemperature,
  computeLogP,
  computeLogT,
} from '../physicsEngine';

interface ObservationTableProps {
  rows: ObsRow[];
  setRows: React.Dispatch<React.SetStateAction<ObsRow[]>>;
  sessionR0: number;
  onRecordCurrent: () => void;
  canRecord: boolean;
}

export function ObservationTable({
  rows,
  setRows,
  sessionR0,
  onRecordCurrent,
  canRecord,
}: ObservationTableProps) {
  const [activeHint, setActiveHint] = useState<{ rowId: number; col: string; message: string } | null>(null);

  // Update a single cell for a row
  const handleCellChange = (rowId: number, field: keyof ObsRow, value: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const updated = { ...row, [field]: value };
        // Reset cell status to idle when edited
        const key = field.replace('_student', '') as keyof ObsRow['cellStatus'];
        if (row.cellStatus && key in row.cellStatus) {
          updated.cellStatus = {
            ...row.cellStatus,
            [key]: 'idle',
          };
        }
        return updated;
      })
    );
  };

  // Delete a single row
  const handleDeleteRow = (id: number) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Clear all rows
  const handleClearAll = () => {
    if (rows.length === 0) return;
    if (window.confirm('Clear all recorded observations from the table?')) {
      setRows([]);
    }
  };

  // Verify student hand-calculations using 2% tolerance
  const handleVerifyMath = () => {
    setRows((prev) =>
      prev.map((row) => {
        const student = {
          Rt: row.Rt_student,
          P: row.P_student,
          RtR0: row.RtR0_student,
          T: row.T_student,
          logP: row.logP_student,
          logT: row.logT_student,
        };

        const result = verifyObservation(row.V, row.I, sessionR0, student);

        const newStatus: Record<string, CellStatus> = {
          Rt: result.Rt.correct ? 'correct' : 'wrong',
          P: result.P.correct ? 'correct' : 'wrong',
          RtR0: result.RtR0.correct ? 'correct' : 'wrong',
          T: result.T.correct ? 'correct' : 'wrong',
          logP: result.logP.correct ? 'correct' : 'wrong',
          logT: result.logT.correct ? 'correct' : 'wrong',
        };

        return {
          ...row,
          verified: true,
          cellStatus: newStatus as ObsRow['cellStatus'],
        };
      })
    );
  };

  // Auto-Calculate Practice Mode (fills in all student columns)
  const handleAutoCalculate = () => {
    setRows((prev) =>
      prev.map((row) => {
        const Rt = row.I > 0 ? row.V / row.I : 0;
        const P = computePower(row.V, row.I);
        const RtR0 = sessionR0 > 0 ? Rt / sessionR0 : 0;
        const T = computeTemperature(Rt, sessionR0);
        const logP = computeLogP(P);
        const logT = computeLogT(T);

        return {
          ...row,
          Rt_student: Rt.toFixed(3),
          P_student: P.toFixed(4),
          RtR0_student: RtR0.toFixed(3),
          T_student: T.toFixed(1),
          logP_student: logP !== null ? logP.toFixed(4) : '',
          logT_student: logT !== null ? logT.toFixed(4) : '',
          verified: true,
          cellStatus: {
            Rt: 'correct',
            P: 'correct',
            RtR0: 'correct',
            T: 'correct',
            logP: 'correct',
            logT: 'correct',
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
      'V (Volts)',
      'I (Ampere)',
      'Rt = V/I (Ohm)',
      'P = V*I (Watts)',
      'Rt / R0',
      'T (Kelvin)',
      'log10(P)',
      'log10(T)',
    ];

    const csvRows = rows.map((r, idx) => [
      idx + 1,
      r.V.toFixed(3),
      r.I.toFixed(3),
      r.Rt_student,
      r.P_student,
      r.RtR0_student,
      r.T_student,
      r.logP_student,
      r.logT_student,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stefans_law_observations_R0_${sessionR0.toFixed(2)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add empty row manually for custom testing
  const handleAddManualRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    setRows((prev) => [
      ...prev,
      {
        id: newId,
        V: 2.0,
        I: 0.25,
        Rt_student: '',
        P_student: '',
        RtR0_student: '',
        T_student: '',
        logP_student: '',
        logT_student: '',
        verified: false,
        cellStatus: {
          Rt: 'idle',
          P: 'idle',
          RtR0: 'idle',
          T: 'idle',
          logP: 'idle',
          logT: 'idle',
        },
      },
    ]);
  };

  const getCellClass = (status: CellStatus | undefined) => {
    if (status === 'correct') {
      return 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-semibold';
    }
    if (status === 'wrong') {
      return 'border-red-500 bg-red-500/10 text-red-400 font-semibold';
    }
    return 'border-[var(--border)] bg-[var(--bg)] text-[var(--text)]';
  };

  const showFormulaHint = (rowId: number, col: string, formula: string) => {
    setActiveHint({ rowId, col, message: formula });
  };

  return (
    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4 shadow-sm">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[var(--text)] tracking-tight">
            Table 2: Main Observation Table & Student Math Checker
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Active Learning Mode: Enter hand-calculated values and verify with 2% tolerance. Active R₀ ={' '}
            <span className="font-semibold text-[var(--accent)]">{sessionR0.toFixed(3)} Ω</span>.
          </p>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRecordCurrent}
            disabled={!canRecord}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 text-xs font-semibold shadow-sm disabled:opacity-50"
          >
            <Plus size={14} />
            Record Live Bench Reading
          </button>

          <button
            onClick={handleVerifyMath}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-sm disabled:opacity-50"
            title="Checks your hand-calculations against physics equations (±2% tolerance)"
          >
            <CheckCircle size={14} />
            Verify My Math
          </button>

          <button
            onClick={handleAutoCalculate}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 text-xs font-semibold shadow-sm disabled:opacity-50"
            title="Auto-calculates all columns for quick practice"
          >
            <Sparkles size={14} />
            Auto-Calculate (Practice)
          </button>

          <button
            onClick={handleExportCSV}
            disabled={rows.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text)] hover:bg-[var(--border)] disabled:opacity-50"
            title="Download CSV"
          >
            <Download size={13} />
            CSV
          </button>

          <button
            onClick={handleClearAll}
            disabled={rows.length === 0}
            className="p-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            title="Clear Table"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Active Formula Hint Banner */}
      {activeHint && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-xs text-red-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-red-400 shrink-0" />
            <span>
              <strong>Formula Hint for {activeHint.col}:</strong> {activeHint.message}
            </span>
          </div>
          <button
            onClick={() => setActiveHint(null)}
            className="text-xs text-red-300 hover:text-white underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-xs text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg)] text-[var(--text-muted)] select-none">
              <th className="py-2.5 px-3 font-semibold text-center w-12">#</th>
              <th className="py-2.5 px-3 font-semibold">V (Volts)</th>
              <th className="py-2.5 px-3 font-semibold">I (Amp)</th>
              <th className="py-2.5 px-3 font-semibold">
                Rₜ = V/I (Ω)
                <button
                  onClick={() => showFormulaHint(0, 'Rt', 'Rt = V / I  (Ohms)')}
                  className="ml-1 text-[var(--text-muted)] hover:text-[var(--accent)]"
                  title="Hint formula"
                >
                  <HelpCircle size={11} className="inline" />
                </button>
              </th>
              <th className="py-2.5 px-3 font-semibold">
                P = V·I (W)
                <button
                  onClick={() => showFormulaHint(0, 'P', 'P = V × I  (Watts)')}
                  className="ml-1 text-[var(--text-muted)] hover:text-[var(--accent)]"
                  title="Hint formula"
                >
                  <HelpCircle size={11} className="inline" />
                </button>
              </th>
              <th className="py-2.5 px-3 font-semibold">
                Rₜ / R₀
                <button
                  onClick={() => showFormulaHint(0, 'Rt/R0', `Rt / R0  (using active R0 = ${sessionR0.toFixed(3)} Ω)`)}
                  className="ml-1 text-[var(--text-muted)] hover:text-[var(--accent)]"
                  title="Hint formula"
                >
                  <HelpCircle size={11} className="inline" />
                </button>
              </th>
              <th className="py-2.5 px-3 font-semibold">
                T (K)
                <button
                  onClick={() => showFormulaHint(0, 'T', 'T = 157.12 × (Rt / R0) + 167.33  (Kelvin)')}
                  className="ml-1 text-[var(--text-muted)] hover:text-[var(--accent)]"
                  title="Hint formula"
                >
                  <HelpCircle size={11} className="inline" />
                </button>
              </th>
              <th className="py-2.5 px-3 font-semibold">
                log₁₀(P)
                <button
                  onClick={() => showFormulaHint(0, 'logP', 'log10(P)  (Base-10 log of Power in Watts)')}
                  className="ml-1 text-[var(--text-muted)] hover:text-[var(--accent)]"
                  title="Hint formula"
                >
                  <HelpCircle size={11} className="inline" />
                </button>
              </th>
              <th className="py-2.5 px-3 font-semibold">
                log₁₀(T)
                <button
                  onClick={() => showFormulaHint(0, 'logT', 'log10(T)  (Base-10 log of absolute temperature in Kelvin)')}
                  className="ml-1 text-[var(--text-muted)] hover:text-[var(--accent)]"
                  title="Hint formula"
                >
                  <HelpCircle size={11} className="inline" />
                </button>
              </th>
              <th className="py-2.5 px-3 font-semibold text-center w-12">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-sm text-[var(--text-muted)]">
                  No readings recorded yet. Switch ON the power supply on the Virtual Bench, adjust the rheostat, and click{' '}
                  <strong className="text-[var(--text)]">"Record Reading"</strong> to capture V & I.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.id} className="hover:bg-[var(--bg)]/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono tabular-nums text-center font-bold text-[var(--text-muted)]">
                    {index + 1}
                  </td>

                  {/* Read-only V captured from bench */}
                  <td className="py-2.5 px-3 font-mono tabular-nums font-semibold text-[var(--text)]">
                    {row.V.toFixed(3)}
                  </td>

                  {/* Read-only I captured from bench */}
                  <td className="py-2.5 px-3 font-mono tabular-nums font-semibold text-[#38bdf8]">
                    {row.I.toFixed(3)}
                  </td>

                  {/* Student Rt */}
                  <td className="py-2.5 px-2">
                    <input
                      type="text"
                      placeholder="e.g. 5.2"
                      value={row.Rt_student}
                      onChange={(e) => handleCellChange(row.id, 'Rt_student', e.target.value)}
                      className={`w-20 px-2 py-1 rounded border text-xs font-mono tabular-nums transition-colors ${getCellClass(
                        row.cellStatus?.Rt
                      )}`}
                    />
                  </td>

                  {/* Student P */}
                  <td className="py-2.5 px-2">
                    <input
                      type="text"
                      placeholder="e.g. 0.85"
                      value={row.P_student}
                      onChange={(e) => handleCellChange(row.id, 'P_student', e.target.value)}
                      className={`w-20 px-2 py-1 rounded border text-xs font-mono tabular-nums transition-colors ${getCellClass(
                        row.cellStatus?.P
                      )}`}
                    />
                  </td>

                  {/* Student Rt/R0 */}
                  <td className="py-2.5 px-2">
                    <input
                      type="text"
                      placeholder="e.g. 3.7"
                      value={row.RtR0_student}
                      onChange={(e) => handleCellChange(row.id, 'RtR0_student', e.target.value)}
                      className={`w-20 px-2 py-1 rounded border text-xs font-mono tabular-nums transition-colors ${getCellClass(
                        row.cellStatus?.RtR0
                      )}`}
                    />
                  </td>

                  {/* Student T */}
                  <td className="py-2.5 px-2">
                    <input
                      type="text"
                      placeholder="e.g. 750"
                      value={row.T_student}
                      onChange={(e) => handleCellChange(row.id, 'T_student', e.target.value)}
                      className={`w-20 px-2 py-1 rounded border text-xs font-mono tabular-nums transition-colors ${getCellClass(
                        row.cellStatus?.T
                      )}`}
                    />
                  </td>

                  {/* Student logP */}
                  <td className="py-2.5 px-2">
                    <input
                      type="text"
                      placeholder="e.g. -0.07"
                      value={row.logP_student}
                      onChange={(e) => handleCellChange(row.id, 'logP_student', e.target.value)}
                      className={`w-20 px-2 py-1 rounded border text-xs font-mono tabular-nums transition-colors ${getCellClass(
                        row.cellStatus?.logP
                      )}`}
                    />
                  </td>

                  {/* Student logT */}
                  <td className="py-2.5 px-2">
                    <input
                      type="text"
                      placeholder="e.g. 2.87"
                      value={row.logT_student}
                      onChange={(e) => handleCellChange(row.id, 'logT_student', e.target.value)}
                      className={`w-20 px-2 py-1 rounded border text-xs font-mono tabular-nums transition-colors ${getCellClass(
                        row.cellStatus?.logT
                      )}`}
                    />
                  </td>

                  {/* Delete row */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleDeleteRow(row.id)}
                      className="p-1 text-[var(--text-muted)] hover:text-red-400 transition-colors"
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

      {/* Active Learning Legend & Manual Row add */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-emerald-500 bg-emerald-500/20" />
            Correct (within 2% tolerance)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded border border-red-500 bg-red-500/20" />
            Check calculation (formula hint on help icon)
          </span>
        </div>

        <button
          onClick={handleAddManualRow}
          className="flex items-center gap-1 text-[var(--accent)] hover:underline"
        >
          <Plus size={13} />
          Add custom row manually
        </button>
      </div>
    </div>
  );
}
