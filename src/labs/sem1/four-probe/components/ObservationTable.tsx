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
  Info,
} from 'lucide-react';
import type { FourProbeObsRow } from '../types';
import type { CellStatus } from '../../../../types/lab';
import {
  verifyFourProbeObservation,
  computeResistivity,
  computeLog10Rho,
  THIN_SLICE_FACTOR,
} from '../physicsEngine';

interface ObservationTableProps {
  rows: FourProbeObsRow[];
  setRows: React.Dispatch<React.SetStateAction<FourProbeObsRow[]>>;
  onRecordCurrent: () => void;
  canRecord: boolean;
}

export function ObservationTable({
  rows,
  setRows,
  onRecordCurrent,
  canRecord,
}: ObservationTableProps) {
  const [activeHint, setActiveHint] = useState<{
    rowId: number;
    col: string;
    message: string;
  } | null>(null);

  // Update a single cell for a row
  const handleCellChange = (
    rowId: number,
    field: keyof FourProbeObsRow,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const updated = { ...row, [field]: value };
        // Reset cell status to idle when edited
        const key = field.replace('_student', '') as keyof FourProbeObsRow['cellStatus'];
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
          tempK: row.tempK_student,
          invT: row.invT_student,
          rho: row.rho_student,
          logRho: row.logRho_student,
        };

        const result = verifyFourProbeObservation(row.tempC, row.I_mA, row.V_mV, student);

        const newStatus: Record<string, CellStatus> = {
          tempK: result.tempK.correct ? 'correct' : 'wrong',
          invT: result.invT.correct ? 'correct' : 'wrong',
          rho: result.rho.correct ? 'correct' : 'wrong',
          logRho: result.logRho.correct ? 'correct' : 'wrong',
        };

        return {
          ...row,
          verified: true,
          cellStatus: newStatus as FourProbeObsRow['cellStatus'],
        };
      })
    );
  };

  // Auto-Calculate Practice Mode (fills in all student columns)
  const handleAutoCalculate = () => {
    setRows((prev) =>
      prev.map((row) => {
        const tempK = row.tempC + 273.15;
        const invT = 1000 / tempK;
        const rho = computeResistivity(row.V_mV, row.I_mA) ?? 0;
        const logRho = computeLog10Rho(rho) ?? 0;

        return {
          ...row,
          tempK_student: tempK.toFixed(2),
          invT_student: invT.toFixed(3),
          rho_student: rho.toFixed(3),
          logRho_student: logRho.toFixed(4),
          verified: true,
          cellStatus: {
            tempK: 'correct',
            invT: 'correct',
            rho: 'correct',
            logRho: 'correct',
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
      'Temp_C',
      'Temp_K',
      '1000_over_T_Kinv',
      'Current_mA',
      'Voltage_mV',
      'Resistivity_Ohm_cm',
      'log10_rho',
    ];

    const csvRows = rows.map((r, idx) => [
      idx + 1,
      r.tempC,
      r.tempK_student || (r.tempC + 273.15).toFixed(2),
      r.invT_student || (1000 / (r.tempC + 273.15)).toFixed(3),
      r.I_mA,
      r.V_mV,
      r.rho_student || (computeResistivity(r.V_mV, r.I_mA)?.toFixed(3) ?? ''),
      r.logRho_student || (computeLog10Rho(computeResistivity(r.V_mV, r.I_mA) ?? 0)?.toFixed(4) ?? ''),
    ]);

    const csvContent = [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'four_probe_energy_band_gap_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add custom manual row
  const handleAddManualRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    const defaultTemp = rows.length > 0 ? rows[rows.length - 1].tempC + 10 : 35;
    const defaultI = 3.0;
    const defaultV = 350.0;
    const tempK = defaultTemp + 273.15;
    const invT = 1000 / tempK;
    const rho = (THIN_SLICE_FACTOR * defaultV) / defaultI;
    const logRho = Math.log10(rho);

    const newRow: FourProbeObsRow = {
      id: newId,
      tempC: defaultTemp,
      tempK,
      invT,
      I_mA: defaultI,
      V_mV: defaultV,
      rho,
      log10Rho: logRho,
      tempK_student: '',
      invT_student: '',
      rho_student: '',
      logRho_student: '',
      verified: false,
      cellStatus: {
        tempK: 'idle',
        invT: 'idle',
        rho: 'idle',
        logRho: 'idle',
      },
    };

    setRows((prev) => [...prev, newRow]);
  };

  // Cell helper for styling
  const getCellClasses = (status?: CellStatus) => {
    const base =
      'w-full text-center px-2 py-1 rounded text-xs font-mono tabular-nums transition-colors border focus:outline-none focus:ring-1 focus:ring-[var(--accent)]';
    if (!status || status === 'idle') {
      return `${base} bg-[var(--surface)] text-[var(--text)] border-[var(--border)]`;
    }
    if (status === 'correct') {
      return `${base} bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-semibold`;
    }
    return `${base} bg-rose-500/15 text-rose-400 border-rose-500/40 font-semibold`;
  };

  return (
    <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
            <span>Observation Table: Temperature Variation of Resistivity</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--bg)] text-[var(--text-muted)] border border-[var(--border)] font-mono tabular-nums font-semibold">
              {rows.length} Readings
            </span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Student Calculations: Enter calculated values (<span className="font-mono">T (K), 1000/T, ρ, log₁₀ρ</span>) and click <strong>Verify My Math</strong>.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={handleVerifyMath}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all disabled:opacity-40"
          >
            <CheckCircle size={14} />
            <span>Verify My Math</span>
          </button>

          <button
            onClick={handleAutoCalculate}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text)] font-semibold transition-all disabled:opacity-40"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span>Auto-Calculate</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text)] font-semibold transition-all disabled:opacity-40"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleAddManualRow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--text)] font-semibold transition-all"
          >
            <Plus size={14} />
            <span>Add Row</span>
          </button>

          {rows.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all"
              title="Clear all rows"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Observation Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--bg)] text-[var(--text-muted)] border-b border-[var(--border)]">
              <th className="py-2 px-2 text-center font-semibold w-10">#</th>
              <th className="py-2 px-2 text-center font-semibold">
                T (°C)
                <span className="block text-[10px] text-[var(--text-muted)] font-normal">Bench</span>
              </th>
              <th className="py-2 px-2 text-center font-semibold text-emerald-400">
                T (K)
                <span className="block text-[10px] text-[var(--text-muted)] font-normal">T_C + 273.15</span>
              </th>
              <th className="py-2 px-2 text-center font-semibold text-indigo-400">
                1000 / T (K⁻¹)
                <span className="block text-[10px] text-[var(--text-muted)] font-normal">Abscissa</span>
              </th>
              <th className="py-2 px-2 text-center font-semibold">
                I (mA)
                <span className="block text-[10px] text-[var(--text-muted)] font-normal">Bench</span>
              </th>
              <th className="py-2 px-2 text-center font-semibold">
                V (mV)
                <span className="block text-[10px] text-[var(--text-muted)] font-normal">Bench</span>
              </th>
              <th className="py-2 px-2 text-center font-semibold text-amber-400">
                ρ (Ω·cm)
                <span className="block text-[10px] text-[var(--text-muted)] font-normal">0.2266 · (V/I)</span>
              </th>
              <th className="py-2 px-2 text-center font-semibold text-[var(--accent)]">
                log₁₀(ρ)
                <span className="block text-[10px] text-[var(--text-muted)] font-normal">Ordinate</span>
              </th>
              <th className="py-2 px-2 text-center font-semibold w-12">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-[var(--text-muted)]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertTriangle size={20} className="text-amber-400 opacity-60" />
                    <p className="font-medium text-xs">No observation readings recorded.</p>
                    <p className="text-[11px]">
                      Capture data from the <strong>Virtual Bench</strong> or click <strong>Add Row</strong>.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-[var(--bg)]/50 transition-colors">
                  <td className="py-2 px-2 text-center font-mono tabular-nums text-[var(--text-muted)]">
                    {idx + 1}
                  </td>

                  {/* Temperature °C (Bench) */}
                  <td className="py-2 px-2 text-center font-mono tabular-nums font-medium text-[var(--text)]">
                    {row.tempC.toFixed(1)}
                  </td>

                  {/* Student Temp K */}
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.tempK_student}
                      placeholder={(row.tempC + 273.15).toFixed(1)}
                      onChange={(e) => handleCellChange(row.id, 'tempK_student', e.target.value)}
                      className={getCellClasses(row.cellStatus.tempK)}
                    />
                  </td>

                  {/* Student 1000/T */}
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.invT_student}
                      placeholder={(1000 / (row.tempC + 273.15)).toFixed(3)}
                      onChange={(e) => handleCellChange(row.id, 'invT_student', e.target.value)}
                      className={getCellClasses(row.cellStatus.invT)}
                    />
                  </td>

                  {/* Current mA (Bench) */}
                  <td className="py-2 px-2 text-center font-mono tabular-nums text-cyan-400">
                    {row.I_mA.toFixed(2)}
                  </td>

                  {/* Voltage mV (Bench) */}
                  <td className="py-2 px-2 text-center font-mono tabular-nums text-amber-400">
                    {row.V_mV.toFixed(1)}
                  </td>

                  {/* Student Resistivity ρ */}
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.rho_student}
                      placeholder="0.2266·V/I"
                      onChange={(e) => handleCellChange(row.id, 'rho_student', e.target.value)}
                      className={getCellClasses(row.cellStatus.rho)}
                    />
                  </td>

                  {/* Student log10(ρ) */}
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.logRho_student}
                      placeholder="log10(ρ)"
                      onChange={(e) => handleCellChange(row.id, 'logRho_student', e.target.value)}
                      className={getCellClasses(row.cellStatus.logRho)}
                    />
                  </td>

                  {/* Delete row */}
                  <td className="py-2 px-2 text-center">
                    <button
                      onClick={() => handleDeleteRow(row.id)}
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

      {/* Formula Cheat Sheet Footer */}
      <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <Info size={14} className="text-[var(--accent)] shrink-0" />
          <span>
            <strong className="text-[var(--text)]">Formulas:</strong> &nbsp;
            <span className="font-mono text-emerald-400">T(K) = T(°C) + 273.15</span> &nbsp;|&nbsp;
            <span className="font-mono text-indigo-400">1000/T</span> &nbsp;|&nbsp;
            <span className="font-mono text-amber-400">ρ = (π·w / ln 2) · (V / I) ≈ 0.2266 · (V / I) Ω·cm</span> &nbsp;|&nbsp;
            <span className="font-mono text-[var(--accent)]">log₁₀(ρ)</span>
          </span>
        </div>
        <span className="text-[11px] text-[var(--text-muted)]">
          Tolerance: ±2% allowed for rounding
        </span>
      </div>
    </div>
  );
}
