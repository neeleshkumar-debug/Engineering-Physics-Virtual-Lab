import React, { useState, useMemo } from 'react';
import { LabShell, type LabTab } from '../../../components/layout/LabShell';
import { TheoryContent } from './theory/TheoryContent';
import { CareyFosterCanvas } from './components/CareyFosterCanvas';
import { BenchControls } from './components/BenchControls';
import { ObservationTable } from './components/ObservationTable';
import { CareyFosterGraph } from './components/CareyFosterGraph';
import { VivaContent } from './viva/VivaContent';
import {
  computeCareyFosterBenchState,
  computeNullPoint,
  computeRhoW,
  computeUnknownResistanceY,
  DEFAULT_RHO_W,
  DEFAULT_ALPHA,
  DEFAULT_BETA,
  WIRE_SPECIMENS,
  SAMPLE_PART_A_ROWS,
  SAMPLE_PART_B_ROWS,
} from './physicsEngine';
import type {
  ExperimentPart,
  GapConfig,
  PartARow,
  PartBRow,
  ScrewGaugeStudentState,
  WireSpecimen,
} from './types';
import { Sparkles, ArrowRight } from 'lucide-react';

export function CareyFosterLab() {
  const [activeTab, setActiveTab] = useState<LabTab>('bench');
  const [part, setPart] = useState<ExperimentPart>('partA');
  const [gapConfig, setGapConfig] = useState<GapConfig>('normal');
  const [resistanceX, setResistanceX] = useState<number>(0.2);
  const [jockeyPos, setJockeyPos] = useState<number>(50.0);
  const [activeSpecimen, setActiveSpecimen] = useState<WireSpecimen>(WIRE_SPECIMENS.constantan);
  const [noiseOn, setNoiseOn] = useState<boolean>(false);

  // Observations recorded by student
  const [partARows, setPartARows] = useState<PartARow[]>([]);
  const [partBRows, setPartBRows] = useState<PartBRow[]>([]);

  // Screw gauge state
  const [screwGaugeState, setScrewGaugeState] = useState<ScrewGaugeStudentState>({
    msr_mm: '',
    csr_div: '',
    zeroError_mm: '',
    diameter_student_mm: '',
    radius_student_cm: '',
    length_student_cm: '',
    rho_student_ohm_m: '',
    verified: false,
    cellStatus: {
      diameter: 'idle',
      radius: 'idle',
      length: 'idle',
      rho: 'idle',
    },
  });

  // Live bench telemetry state
  const benchState = useMemo(() => {
    return computeCareyFosterBenchState(
      part,
      gapConfig,
      resistanceX,
      activeSpecimen,
      jockeyPos,
      noiseOn,
      Date.now() % 1000
    );
  }, [part, gapConfig, resistanceX, activeSpecimen, jockeyPos, noiseOn]);

  // Check if current X has recorded l1 and l2 in Part A
  const currentPartARow = partARows.find(
    (r) => Math.abs(r.resistanceX_ohm - resistanceX) < 0.01
  );
  const hasRecordedL1_A = currentPartARow ? currentPartARow.l1_cm > 0 : false;
  const hasRecordedL2_A = currentPartARow ? currentPartARow.l2_cm > 0 : false;

  // Check if current X has recorded l1' and l2' in Part B
  const currentPartBRow = partBRows.find(
    (r) => Math.abs(r.resistanceX_ohm - resistanceX) < 0.01
  );
  const hasRecordedL1_B = currentPartBRow ? currentPartBRow.l1_cm > 0 : false;
  const hasRecordedL2_B = currentPartBRow ? currentPartBRow.l2_cm > 0 : false;

  // Mean rho_w from Table 1 for Part B references
  const validRhoWList = partARows
    .map((r) => parseFloat(r.rho_w_student))
    .filter((v) => Number.isFinite(v) && v > 0);
  const meanRhoW =
    validRhoWList.length > 0
      ? validRhoWList.reduce((a, b) => a + b, 0) / validRhoWList.length
      : DEFAULT_RHO_W;

  // ── Record Null Length (l1 or l2 / l1' or l2') ────────────────────────────
  const handleRecordNullLength = () => {
    const recordedLength = parseFloat(jockeyPos.toFixed(2));

    if (part === 'partA') {
      const existingIdx = partARows.findIndex(
        (r) => Math.abs(r.resistanceX_ohm - resistanceX) < 0.01
      );

      if (existingIdx >= 0) {
        setPartARows((prev) => {
          const next = [...prev];
          const row = next[existingIdx];
          const l1 = gapConfig === 'normal' ? recordedLength : row.l1_cm;
          const l2 = gapConfig === 'interchanged' ? recordedLength : row.l2_cm;
          const diff = l1 > 0 && l2 > 0 ? parseFloat((l2 - l1).toFixed(2)) : row.diff_ref_cm;
          const rho_w = diff > 0 ? computeRhoW(row.resistanceX_ohm, l1, l2) || row.rho_w_ref : row.rho_w_ref;

          next[existingIdx] = {
            ...row,
            l1_cm: l1,
            l2_cm: l2,
            diff_ref_cm: diff,
            rho_w_ref: rho_w,
          };
          return next;
        });
      } else {
        const newId = partARows.length > 0 ? Math.max(...partARows.map((r) => r.id)) + 1 : 1;
        const counterpartConfig = gapConfig === 'normal' ? 'interchanged' : 'normal';
        const R_left = counterpartConfig === 'normal' ? resistanceX : 0;
        const R_right = counterpartConfig === 'normal' ? 0 : resistanceX;
        const counterpartNull = computeNullPoint(R_left, R_right, DEFAULT_RHO_W, DEFAULT_ALPHA, DEFAULT_BETA, false);

        const l1 = gapConfig === 'normal' ? recordedLength : parseFloat(counterpartNull.toFixed(2));
        const l2 = gapConfig === 'interchanged' ? recordedLength : parseFloat(counterpartNull.toFixed(2));
        const diff = parseFloat((l2 - l1).toFixed(2));
        const rho_w = computeRhoW(resistanceX, l1, l2) || DEFAULT_RHO_W;

        const newRow: PartARow = {
          id: newId,
          resistanceX_ohm: resistanceX,
          l1_cm: l1,
          l2_cm: l2,
          diff_ref_cm: diff,
          rho_w_ref: rho_w,
          diff_student: '',
          rho_w_student: '',
          verified: false,
          cellStatus: { diff: 'idle', rho_w: 'idle' },
        };
        setPartARows((prev) => [...prev, newRow].sort((a, b) => a.resistanceX_ohm - b.resistanceX_ohm));
      }
    } else {
      // Part B
      const existingIdx = partBRows.findIndex(
        (r) => Math.abs(r.resistanceX_ohm - resistanceX) < 0.01
      );

      if (existingIdx >= 0) {
        setPartBRows((prev) => {
          const next = [...prev];
          const row = next[existingIdx];
          const l1 = gapConfig === 'normal' ? recordedLength : row.l1_cm;
          const l2 = gapConfig === 'interchanged' ? recordedLength : row.l2_cm;
          const diff = l1 > 0 && l2 > 0 ? parseFloat((l2 - l1).toFixed(2)) : row.diff_ref_cm;
          const y = computeUnknownResistanceY(row.resistanceX_ohm, l1, l2, meanRhoW) || row.y_ref_ohm;

          next[existingIdx] = {
            ...row,
            l1_cm: l1,
            l2_cm: l2,
            diff_ref_cm: diff,
            y_ref_ohm: y,
          };
          return next;
        });
      } else {
        const newId = partBRows.length > 0 ? Math.max(...partBRows.map((r) => r.id)) + 1 : 1;
        const counterpartConfig = gapConfig === 'normal' ? 'interchanged' : 'normal';
        const R_left = counterpartConfig === 'normal' ? resistanceX : activeSpecimen.nominalResistanceOhm;
        const R_right = counterpartConfig === 'normal' ? activeSpecimen.nominalResistanceOhm : resistanceX;
        const counterpartNull = computeNullPoint(R_left, R_right, DEFAULT_RHO_W, DEFAULT_ALPHA, DEFAULT_BETA, false);

        const l1 = gapConfig === 'normal' ? recordedLength : parseFloat(counterpartNull.toFixed(2));
        const l2 = gapConfig === 'interchanged' ? recordedLength : parseFloat(counterpartNull.toFixed(2));
        const diff = parseFloat((l2 - l1).toFixed(2));
        const y = computeUnknownResistanceY(resistanceX, l1, l2, meanRhoW) || activeSpecimen.nominalResistanceOhm;

        const newRow: PartBRow = {
          id: newId,
          resistanceX_ohm: resistanceX,
          l1_cm: l1,
          l2_cm: l2,
          diff_ref_cm: diff,
          y_ref_ohm: y,
          diff_student: '',
          y_student: '',
          verified: false,
          cellStatus: { diff: 'idle', y: 'idle' },
        };
        setPartBRows((prev) => [...prev, newRow].sort((a, b) => a.resistanceX_ohm - b.resistanceX_ohm));
      }
    }
  };

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

  const totalReadings = partARows.length + partBRows.length;

  return (
    <LabShell
      title="Carey Foster's Bridge — Resistance per Unit Length & Specific Resistance"
      category="Year 1 · Semester 1 · Applied Physics Lab · AKTU Code: AAS151 / ASS251"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerBadge={
        <div className="flex items-center gap-2">
          {totalReadings > 0 && (
            <button
              onClick={() => setActiveTab('table')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg)] transition-all font-mono tabular-nums"
            >
              <span>{totalReadings} Readings Logged</span>
              <ArrowRight size={12} className="text-[var(--accent)]" />
            </button>
          )}
        </div>
      }
      // Tab 1: Theory & Persistent Video Player
      theory={<TheoryContent />}
      // Tab 2: Virtual Bench (Simulation)
      bench={
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-5">
          {/* Bench Instruction Bar */}
          <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Move the <strong className="text-[var(--text)]">Jockey Slider</strong> (or click along the meter scale) until the galvanometer reads{' '}
                <strong className="text-emerald-400">0.0 div</strong>, then click <strong className="text-[var(--text)]">Record Null Length</strong>.
              </span>
            </div>

            {totalReadings === 0 && (
              <button
                onClick={handleLoadSampleData}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)] text-xs font-medium transition-all"
              >
                <Sparkles size={12} className="text-amber-400" />
                <span>Load Sample Lab Readings</span>
              </button>
            )}
          </div>

          {/* HTML5 Canvas Simulation Bench */}
          <CareyFosterCanvas
            benchState={benchState}
            onJockeyMove={setJockeyPos}
          />

          {/* Controls & Telemetry */}
          <BenchControls
            benchState={benchState}
            part={part}
            setPart={setPart}
            gapConfig={gapConfig}
            setGapConfig={setGapConfig}
            resistanceX={resistanceX}
            setResistanceX={setResistanceX}
            jockeyPos={jockeyPos}
            setJockeyPos={setJockeyPos}
            activeSpecimen={activeSpecimen}
            setActiveSpecimen={setActiveSpecimen}
            noiseOn={noiseOn}
            setNoiseOn={setNoiseOn}
            onRecordNullLength={handleRecordNullLength}
            recordedA_Count={partARows.length}
            recordedB_Count={partBRows.length}
            hasRecordedL1={part === 'partA' ? hasRecordedL1_A : hasRecordedL1_B}
            hasRecordedL2={part === 'partA' ? hasRecordedL2_A : hasRecordedL2_B}
          />
        </div>
      }
      // Tab 3: Observation Table & Math Checker & Graph
      table={
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
          <ObservationTable
            partARows={partARows}
            setPartARows={setPartARows}
            partBRows={partBRows}
            setPartBRows={setPartBRows}
            activeSpecimen={activeSpecimen}
            screwGaugeState={screwGaugeState}
            setScrewGaugeState={setScrewGaugeState}
          />

          <CareyFosterGraph rows={partARows} />
        </div>
      }
      // Tab 4: Viva Voce & Quiz & Error Analysis
      viva={<VivaContent />}
    />
  );
}
