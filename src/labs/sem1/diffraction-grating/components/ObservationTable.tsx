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
  ArrowRight,
} from 'lucide-react';
import type { DiffractionObsRow, SpectralLineId } from '../types';
import type { CellStatus } from '../../../../types/lab';
import {
  MERCURY_LINES,
  MERCURY_LINES_LIST,
  verifyDiffractionObservation,
  decimalDegToDMS,
  lpiToGratingElementNm,
} from '../physicsEngine';

interface ObservationTableProps {
  rows: DiffractionObsRow[];
  setRows: React.Dispatch<React.SetStateAction<DiffractionObsRow[]>>;
  onRecordCurrent: (side: 'left' | 'right') => void;
  canRecord: boolean;
  gratingLPI: number;
}

export function ObservationTable({
  rows,
  setRows,
  onRecordCurrent,
  canRecord,
  gratingLPI,
}: ObservationTableProps) {
  const [activeHint, setActiveHint] = useState<{
    rowId: number;
    col: string;
    message: string;
  } | null>(null);

  // Update a single cell in a row
  const handleCellChange = (
    rowId: number,
    field: keyof DiffractionObsRow,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const updated = { ...row, [field]: value };
        const key = field.replace('_student', '') as keyof DiffractionObsRow['cellStatus'];
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

  // Verify student math with 2% tolerance
  const handleVerifyMath = () => {
    setRows((prev) =>
      prev.map((row) => {
        const studentValues = {
          twoTheta: row.twoTheta_student,
          theta: row.theta_student,
          sinTheta: row.sinTheta_student,
          lambda: row.lambda_student_nm,
        };

        const result = verifyDiffractionObservation(
          row.thetaL_deg,
          row.thetaR_deg,
          row.order,
          gratingLPI,
          studentValues
        );

        const newStatus: Record<string, CellStatus> = {
          twoTheta: result.twoTheta.correct ? 'correct' : 'wrong',
          theta: result.theta.correct ? 'correct' : 'wrong',
          sinTheta: result.sinTheta.correct ? 'correct' : 'wrong',
          lambda: result.lambda.correct ? 'correct' : 'wrong',
        };

        return {
          ...row,
          verified: true,
          cellStatus: newStatus as DiffractionObsRow['cellStatus'],
        };
      })
    );
  };

  // Auto-Calculate Practice Mode
  const handleAutoCalculate = () => {
    setRows((prev) =>
      prev.map((row) => {
        const twoTheta = row.twoTheta_ref.toFixed(2);
        const theta = row.theta_ref.toFixed(2);
        const sinTheta = row.sinTheta_ref.toFixed(4);
        const lambda = row.lambda_ref_nm.toFixed(1);

        return {
          ...row,
          twoTheta_student: twoTheta,
          theta_student: theta,
          sinTheta_student: sinTheta,
          lambda_student_nm: lambda,
          verified: true,
          cellStatus: {
            twoTheta: 'correct',
            theta: 'correct',
            sinTheta: 'correct',
            lambda: 'correct',
          },
        };
      })
    );
  };

  // Add a manual blank observation row
  const handleAddManualRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    const defaultLine = MERCURY_LINES.green;
    const thetaDefault = 18.815;
    const dms = decimalDegToDMS(thetaDefault);

    const newRow: DiffractionObsRow = {
      id: newId,
      color: 'green',
      colorName: defaultLine.name,
      order: 1,
      thetaL_deg: thetaDefault,
      thetaL_dms: dms.formatted,
      thetaR_deg: thetaDefault,
      thetaR_dms: dms.formatted,
      twoTheta_ref: parseFloat((thetaDefault * 2).toFixed(2)),
      theta_ref: thetaDefault,
      sinTheta_ref: parseFloat(Math.sin((thetaDefault * Math.PI) / 180).toFixed(4)),
      lambda_ref_nm: defaultLine.wavelengthNm,
      twoTheta_student: '',
      theta_student: '',
      sinTheta_student: '',
      lambda_student_nm: '',
      verified: false,
      cellStatus: {
        twoTheta: 'idle',
        theta: 'idle',
        sinTheta: 'idle',
        lambda: 'idle',
      },
    };

    setRows((prev) => [...prev, newRow]);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (rows.length === 0) return;
    const headers = [
      'S.No',
      'Spectral_Line',
      'Order_n',
      'Theta_Left_deg',
      'Theta_Left_DMS',
      'Theta_Right_deg',
      'Theta_Right_DMS',
      'Two_Theta_deg',
      'Theta_deg',
      'Sin_Theta',
      'Wavelength_nm',
      'Standard_Lambda_nm',
    ];

    const csvRows = rows.map((r, idx) => [
      idx + 1,
      r.colorName,
      r.order,
      r.thetaL_deg.toFixed(3),
      `"${r.thetaL_dms}"`,
      r.thetaR_deg.toFixed(3),
      `"${r.thetaR_dms}"`,
      r.twoTheta_student || r.twoTheta_ref.toFixed(2),
      r.theta_student || r.theta_ref.toFixed(2),
      r.sinTheta_student || r.sinTheta_ref.toFixed(4),
      r.lambda_student_nm || r.lambda_ref_nm.toFixed(1),
      r.lambda_ref_nm,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Diffraction_Grating_Observations_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusClass = (status: CellStatus) => {
    if (status === 'correct') return 'bg-emerald-500/10 border-emerald-500 text-emerald-400';
    if (status === 'wrong') return 'bg-rose-500/10 border-rose-500 text-rose-400';
    return 'bg-[var(--bg)] border-[var(--border)] text-[var(--text)]';
  };

  return (
    <div className="p-4 md:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-5">
      {/* ── Table Header & Action Buttons ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--text)] tracking-tight">
            Observation Table & Student Math Verification
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Active Learning: Log spectrometer readings ($\theta_L$, $\theta_R$), hand-calculate $2\theta, \theta, \sin\theta, \lambda$, and verify with 2% tolerance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Verify Math */}
          <button
            onClick={handleVerifyMath}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle size={14} />
            <span>Verify My Math (2%)</span>
          </button>

          {/* Auto Calculate Practice */}
          <button
            onClick={handleAutoCalculate}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--border)] text-[var(--text)] text-xs font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Populate calculated columns (Practice Mode)"
          >
            <Sparkles size={13} className="text-amber-400" />
            <span>Auto-Calculate</span>
          </button>

          {/* Add Row */}
          <button
            onClick={handleAddManualRow}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--border)] text-[var(--text)] text-xs font-medium transition-all"
            title="Add blank row"
          >
            <Plus size={13} />
            <span>Add Row</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] hover:bg-[var(--border)] text-[var(--text)] text-xs font-medium transition-all disabled:opacity-50"
            title="Export Table to CSV"
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
          <div className="text-sm font-medium text-[var(--text)]">No Spectrometer Readings Logged Yet</div>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            Switch to the <strong>Virtual Bench</strong> tab to align the telescope on mercury spectral lines and record readings,
            or click <strong>&quot;Load Sample Lab Readings&quot;</strong> on the bench to explore pre-recorded AKTU college data.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-xs text-left border-collapse font-mono tabular-nums">
            <thead>
              <tr className="bg-[var(--bg)] border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Spectral Line</th>
                <th className="py-2.5 px-3">Order (n)</th>
                <th className="py-2.5 px-3">Left Reading (θ_L)</th>
                <th className="py-2.5 px-3">Right Reading (θ_R)</th>
                <th className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <span>2θ = |θ_L - θ_R|</span>
                    <button
                      onClick={() =>
                        setActiveHint({
                          rowId: 0,
                          col: '2θ Calculation',
                          message: '2θ = |θ_Left - θ_Right| (in decimal degrees or degrees). Taking difference eliminates zero-error.',
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
                    <span>θ = 2θ / 2</span>
                    <button
                      onClick={() =>
                        setActiveHint({
                          rowId: 0,
                          col: 'Diffraction Angle θ',
                          message: 'Divide 2θ by 2 to get the single-side diffraction angle θ.',
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
                    <span>sin(θ)</span>
                    <button
                      onClick={() =>
                        setActiveHint({
                          rowId: 0,
                          col: 'sin(θ)',
                          message: 'Compute trigonometric sine of diffraction angle θ (e.g. sin(18.82°) = 0.3225).',
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
                    <span>Calculated λ (nm)</span>
                    <button
                      onClick={() =>
                        setActiveHint({
                          rowId: 0,
                          col: 'Wavelength λ',
                          message: 'λ = (e · sin θ) / n, where grating element e = 25,400,000 / N nm.',
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
            <tbody className="divide-y divide-[var(--border)] text-[var(--text)]">
              {rows.map((row, idx) => {
                const lineMeta = MERCURY_LINES_LIST.find((l) => l.id === row.color) || MERCURY_LINES.green;

                return (
                  <tr key={row.id} className="hover:bg-[var(--bg)]/50 transition-colors">
                    {/* Index */}
                    <td className="py-2.5 px-3 text-[var(--text-muted)] font-mono">{idx + 1}</td>

                    {/* Spectral line color pill */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2 font-sans font-medium text-xs">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: lineMeta.colorHex }}
                        />
                        <span>{row.colorName}</span>
                      </div>
                    </td>

                    {/* Order */}
                    <td className="py-2.5 px-3 font-semibold text-sky-400">
                      n = {row.order}
                    </td>

                    {/* Left Reading */}
                    <td className="py-2.5 px-3">
                      <div className="text-xs font-semibold text-[var(--text)]">{row.thetaL_dms}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">({row.thetaL_deg.toFixed(3)}°)</div>
                    </td>

                    {/* Right Reading */}
                    <td className="py-2.5 px-3">
                      <div className="text-xs font-semibold text-[var(--text)]">{row.thetaR_dms}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">({row.thetaR_deg.toFixed(3)}°)</div>
                    </td>

                    {/* 2θ Student Input */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={row.twoTheta_student}
                        onChange={(e) => handleCellChange(row.id, 'twoTheta_student', e.target.value)}
                        placeholder={row.twoTheta_ref.toFixed(2)}
                        className={`w-20 px-2 py-1 rounded text-xs border font-mono transition-colors focus:outline-none ${getStatusClass(
                          row.cellStatus?.twoTheta
                        )}`}
                      />
                    </td>

                    {/* θ Student Input */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={row.theta_student}
                        onChange={(e) => handleCellChange(row.id, 'theta_student', e.target.value)}
                        placeholder={row.theta_ref.toFixed(2)}
                        className={`w-20 px-2 py-1 rounded text-xs border font-mono transition-colors focus:outline-none ${getStatusClass(
                          row.cellStatus?.theta
                        )}`}
                      />
                    </td>

                    {/* sin(θ) Student Input */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={row.sinTheta_student}
                        onChange={(e) => handleCellChange(row.id, 'sinTheta_student', e.target.value)}
                        placeholder={row.sinTheta_ref.toFixed(4)}
                        className={`w-20 px-2 py-1 rounded text-xs border font-mono transition-colors focus:outline-none ${getStatusClass(
                          row.cellStatus?.sinTheta
                        )}`}
                      />
                    </td>

                    {/* λ Student Input */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={row.lambda_student_nm}
                          onChange={(e) => handleCellChange(row.id, 'lambda_student_nm', e.target.value)}
                          placeholder={row.lambda_ref_nm.toFixed(1)}
                          className={`w-20 px-2 py-1 rounded text-xs border font-mono transition-colors focus:outline-none ${getStatusClass(
                            row.cellStatus?.lambda
                          )}`}
                        />
                        <span className="text-[10px] text-[var(--text-muted)] font-sans">nm</span>
                      </div>
                    </td>

                    {/* Delete */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleDeleteRow(row.id)}
                        className="text-[var(--text-muted)] hover:text-rose-400 p-1 rounded transition-colors"
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
