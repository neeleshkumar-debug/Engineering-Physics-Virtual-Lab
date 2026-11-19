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
import type { HallEffectObsRow } from '../types';
import type { CellStatus } from '../../../../types/lab';
import {
  verifyHallObservation,
  computeRHFromMeasurements,
  computeCarrierDensity,
  computeCarrierMobility,
  DEFAULT_RESISTIVITY_OHM_CM,
  DEFAULT_THICKNESS_MM,
} from '../physicsEngine';

interface ObservationTableProps {
  rows: HallEffectObsRow[];
  setRows: React.Dispatch<React.SetStateAction<HallEffectObsRow[]>>;
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
    field: keyof HallEffectObsRow,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const updated = { ...row, [field]: value };
        const key = field.replace('_student', '') as keyof HallEffectObsRow['cellStatus'];
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
          rh: row.rh_student,
          n: row.n_student,
          mobility: row.mobility_student,
        };

        const result = verifyHallObservation(
          row.specimenType,
          row.hallVoltage_mV,
          row.currentI_mA,
          row.magneticFieldB_T,
          row.thickness_mm,
          DEFAULT_RESISTIVITY_OHM_CM,
          student
        );

        const newStatus: Record<string, CellStatus> = {
          rh: result.rh.correct ? 'correct' : 'wrong',
          n: result.n.correct ? 'correct' : 'wrong',
          mobility: result.mobility.correct ? 'correct' : 'wrong',
        };

        return {
          ...row,
          verified: true,
          cellStatus: newStatus as HallEffectObsRow['cellStatus'],
        };
      })
    );
  };

  // Auto-Calculate Practice Mode (fills in all student columns)
  const handleAutoCalculate = () => {
    setRows((prev) =>
      prev.map((row) => {
        const rawRH = computeRHFromMeasurements(
          row.hallVoltage_mV,
          row.currentI_mA,
          row.magneticFieldB_T,
          row.thickness_mm
        );
        const rh_10minus3 = rawRH !== null ? (rawRH * 1e3).toFixed(2) : '-4.99';
        const rawN = rawRH !== null ? computeCarrierDensity(rawRH) : 1.25e21;
        const n_10exp21 = rawN !== null ? (rawN / 1e21).toFixed(2) : '1.25';
        const rawMu = rawRH !== null ? computeCarrierMobility(rawRH, DEFAULT_RESISTIVITY_OHM_CM) : 587.4;
        const mu_str = rawMu !== null ? rawMu.toFixed(1) : '587.4';

        return {
          ...row,
          rh_student: rh_10minus3,
          n_student: n_10exp21,
          mobility_student: mu_str,
          verified: true,
          cellStatus: {
            rh: 'correct',
            n: 'correct',
            mobility: 'correct',
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
      'Specimen_Type',
      'Current_mA',
      'Magnetic_Field_kG',
      'Magnetic_Field_T',
      'Thickness_mm',
      'Hall_Voltage_mV',
      'RH_10minus3_m3_per_C',
      'Carrier_Density_10exp21_mminus3',
      'Mobility_cm2_per_Vs',
    ];

    const csvRows = rows.map((r, idx) => [
      idx + 1,
      r.specimenType,
      r.currentI_mA,
      r.magneticFieldB_kG,
      r.magneticFieldB_T,
      r.thickness_mm,
      r.hallVoltage_mV,
      r.rh_student || (r.rh_ref !== undefined ? r.rh_ref.toFixed(3) : ''),
      r.n_student || (r.n_ref !== undefined ? r.n_ref.toFixed(3) : ''),
      r.mobility_student || (r.mobility_ref !== undefined ? r.mobility_ref.toFixed(1) : ''),
    ]);

    const csvContent = [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'hall_effect_experiment_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add custom manual row
  const handleAddManualRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    const newRow: HallEffectObsRow = {
      id: newId,
      specimenType: 'n-type',
      currentI_mA: 5.0,
      magneticFieldB_kG: 3.0,
      magneticFieldB_T: 0.3,
      thickness_mm: DEFAULT_THICKNESS_MM,
      hallVoltage_mV: -14.98,
      rh_ref: -4.993,
      n_ref: 1.25,
      mobility_ref: 587.4,
      rh_student: '',
      n_student: '',
      mobility_student: '',
      verified: false,
      cellStatus: {
        rh: 'idle',
        n: 'idle',
        mobility: 'idle',
      },
    };
    setRows((prev) => [...prev, newRow]);
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
          'bg-[var(--bg)] border-[var(--border)] text-[var(--text)] focus:border-[var(--accent)] hover:border-slate-500'
        );
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
      {/* Table Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div>
          <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
            <span>Observation Table: Hall Effect & Electrical Transport</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--border)] font-mono tabular-nums text-[var(--text-muted)]">
              {rows.length} {rows.length === 1 ? 'Reading' : 'Readings'}
            </span>
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Log raw bench values, then compute <span className="font-mono">R_H</span>, carrier concentration <span className="font-mono">n</span>, and mobility <span className="font-mono">μ</span>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleVerifyMath}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle size={14} />
            <span>Verify My Math (±2%)</span>
          </button>

          <button
            onClick={handleAutoCalculate}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--border)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Fill in calculated values for practice"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>Auto-Calculate</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--border)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Download CSV"
          >
            <Download size={13} />
            <span>CSV</span>
          </button>

          <button
            onClick={handleAddManualRow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-xs bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--border)] transition-colors"
          >
            <Plus size={13} />
            <span>Add Row</span>
          </button>

          {rows.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Clear all rows"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Observation Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg)]/60">
              <th className="py-2.5 px-2 text-center font-medium w-12">#</th>
              <th className="py-2.5 px-2 text-center font-medium">Type</th>
              <th className="py-2.5 px-2 text-center font-medium">Current I (mA)</th>
              <th className="py-2.5 px-2 text-center font-medium">Field B (kG / T)</th>
              <th className="py-2.5 px-2 text-center font-medium">t (mm)</th>
              <th className="py-2.5 px-2 text-center font-medium">Hall Voltage V_H (mV)</th>
              <th className="py-2.5 px-2 text-center font-medium min-w-[110px]">
                R_H (×10⁻³ m³/C)
                <span className="block text-[10px] text-emerald-400 font-normal">Student Hand Calc</span>
              </th>
              <th className="py-2.5 px-2 text-center font-medium min-w-[110px]">
                n (×10²¹ m⁻³)
                <span className="block text-[10px] text-cyan-400 font-normal">1 / (|R_H|·e)</span>
              </th>
              <th className="py-2.5 px-2 text-center font-medium min-w-[110px]">
                μ (cm²/V·s)
                <span className="block text-[10px] text-amber-400 font-normal">|R_H| / ρ</span>
              </th>
              <th className="py-2.5 px-2 text-center font-medium w-10">Del</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-[var(--text-muted)]">
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

                  {/* Specimen Type Badge */}
                  <td className="py-2 px-2 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
                        row.specimenType === 'n-type'
                          ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {row.specimenType}
                    </span>
                  </td>

                  {/* Current I (mA) */}
                  <td className="py-2 px-2 text-center font-mono tabular-nums text-cyan-400 font-medium">
                    {row.currentI_mA.toFixed(1)}
                  </td>

                  {/* Field B */}
                  <td className="py-2 px-2 text-center font-mono tabular-nums text-emerald-400 font-medium">
                    {row.magneticFieldB_kG.toFixed(1)} <span className="text-[10px] text-[var(--text-muted)]">({row.magneticFieldB_T.toFixed(2)} T)</span>
                  </td>

                  {/* Thickness */}
                  <td className="py-2 px-2 text-center font-mono tabular-nums text-[var(--text-muted)]">
                    {row.thickness_mm.toFixed(1)}
                  </td>

                  {/* Hall Voltage mV */}
                  <td
                    className={`py-2 px-2 text-center font-mono tabular-nums font-semibold ${
                      row.hallVoltage_mV < 0 ? 'text-indigo-400' : 'text-emerald-400'
                    }`}
                  >
                    {row.hallVoltage_mV.toFixed(2)}
                  </td>

                  {/* Student RH */}
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.rh_student}
                      placeholder={row.specimenType === 'n-type' ? '-4.99' : '4.99'}
                      onChange={(e) => handleCellChange(row.id, 'rh_student', e.target.value)}
                      className={getCellClasses(row.cellStatus.rh)}
                    />
                  </td>

                  {/* Student Carrier Density n */}
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.n_student}
                      placeholder="1.25"
                      onChange={(e) => handleCellChange(row.id, 'n_student', e.target.value)}
                      className={getCellClasses(row.cellStatus.n)}
                    />
                  </td>

                  {/* Student Mobility μ */}
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={row.mobility_student}
                      placeholder="587.4"
                      onChange={(e) => handleCellChange(row.id, 'mobility_student', e.target.value)}
                      className={getCellClasses(row.cellStatus.mobility)}
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
      <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <Info size={14} className="text-[var(--accent)] shrink-0" />
          <span>
            <strong className="text-[var(--text)]">Formulas:</strong> &nbsp;
            <span className="font-mono text-emerald-400">R_H = (V_H · t) / (I · B)</span> &nbsp;|&nbsp;
            <span className="font-mono text-cyan-400">n = 1 / (|R_H| · e)</span> &nbsp;|&nbsp;
            <span className="font-mono text-amber-400">μ = |R_H| / ρ</span>
          </span>
        </div>
        <span className="text-[11px] text-[var(--text-muted)]">
          Tolerance: ±2% allowed for student rounding
        </span>
      </div>
    </div>
  );
}
