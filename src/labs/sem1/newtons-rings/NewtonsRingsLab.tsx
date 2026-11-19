import React, { useState, useMemo } from 'react';
import { LabShell, type LabTab } from '../../../components/layout/LabShell';
import { TheoryContent } from './theory/TheoryContent';
import { NewtonsRingsCanvas } from './components/NewtonsRingsCanvas';
import { BenchControls } from './components/BenchControls';
import { ObservationTable } from './components/ObservationTable';
import { NewtonsRingsGraph } from './components/NewtonsRingsGraph';
import { VivaContent } from './viva/VivaContent';
import {
  computeNewtonsRingsBenchState,
  computeDarkRingRadiusCm,
  computeWavelengthFromDifferenceNm,
  getSampleNewtonsRingsObservations,
  SODIUM_D_LINE_NM,
} from './physicsEngine';
import type { LensRadiusOption, NewtonsRingsObsRow } from './types';
import { Sparkles, ArrowRight } from 'lucide-react';

export function NewtonsRingsLab() {
  const [activeTab, setActiveTab] = useState<LabTab>('bench');
  const [lampOn, setLampOn] = useState<boolean>(true);
  const [micrometerPosCm, setMicrometerPosCm] = useState<number>(5.000);
  const [radiusOfCurvatureCm, setRadiusOfCurvatureCm] = useState<LensRadiusOption>(100);
  const [selectedRing, setSelectedRing] = useState<number>(8);
  const [noiseOn, setNoiseOn] = useState<boolean>(false);
  const [contactOffsetCm2, setContactOffsetCm2] = useState<number>(0);
  const [pStep, setPStep] = useState<number>(4);

  // Observations recorded by student
  const [rows, setRows] = useState<NewtonsRingsObsRow[]>([]);

  // Compute live bench state
  const benchState = useMemo(() => {
    return computeNewtonsRingsBenchState(
      lampOn,
      micrometerPosCm,
      5.000,
      radiusOfCurvatureCm,
      selectedRing,
      noiseOn,
      contactOffsetCm2
    );
  }, [lampOn, micrometerPosCm, radiusOfCurvatureCm, selectedRing, noiseOn, contactOffsetCm2]);

  // Recalculate reference values and pairings
  const recalculateRows = (baseRows: NewtonsRingsObsRow[]): NewtonsRingsObsRow[] => {
    // Sort descending by ring order (e.g. 16, 14, 12, ...)
    const sorted = [...baseRows].sort((a, b) => b.ringOrder - a.ringOrder);

    return sorted.map((row) => {
      const dn = Math.abs(row.xR_cm - row.xL_cm);
      const dnSq = dn * dn;

      const pairedRingOrder = row.ringOrder + pStep;
      const higherRow = sorted.find((r) => r.ringOrder === pairedRingOrder);

      let diffSq: number | undefined;
      let lambdaNm: number | undefined;

      if (higherRow) {
        const higherDn = Math.abs(higherRow.xR_cm - higherRow.xL_cm);
        const higherDnSq = higherDn * higherDn;
        diffSq = higherDnSq - dnSq;
        lambdaNm = computeWavelengthFromDifferenceNm(diffSq, pStep, radiusOfCurvatureCm);
      }

      return {
        ...row,
        diameter_ref_cm: parseFloat(dn.toFixed(3)),
        diameterSq_ref_cm2: parseFloat(dnSq.toFixed(4)),
        pairedOrder: higherRow ? pairedRingOrder : undefined,
        pStep: higherRow ? pStep : undefined,
        diffSq_ref_cm2: diffSq !== undefined ? parseFloat(diffSq.toFixed(4)) : undefined,
        lambda_ref_nm: lambdaNm !== undefined ? parseFloat(lambdaNm.toFixed(1)) : undefined,
      };
    });
  };

  // Record Left Reading (x_L)
  const handleRecordLeftReading = () => {
    if (!lampOn) return;

    const currentPos = benchState.apparentPosCm;
    const n = selectedRing;
    const rn = computeDarkRingRadiusCm(n, SODIUM_D_LINE_NM, radiusOfCurvatureCm, contactOffsetCm2);
    const nominalXR = parseFloat((5.000 + rn).toFixed(3));

    setRows((prev) => {
      const existingIdx = prev.findIndex((r) => r.ringOrder === n);
      let updated: NewtonsRingsObsRow[];

      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          xL_cm: parseFloat(currentPos.toFixed(3)),
        };
      } else {
        const newId = prev.length > 0 ? Math.max(...prev.map((r) => r.id)) + 1 : 1;
        const newRow: NewtonsRingsObsRow = {
          id: newId,
          ringOrder: n,
          xL_cm: parseFloat(currentPos.toFixed(3)),
          xR_cm: nominalXR,
          diameter_ref_cm: 0,
          diameterSq_ref_cm2: 0,
          diameter_student_cm: '',
          diameterSq_student_cm2: '',
          diffSq_student_student_cm2: '',
          lambda_student_nm: '',
          verified: false,
          cellStatus: {
            diameter: 'idle',
            diameterSq: 'idle',
            diffSq: 'idle',
            lambda: 'idle',
          },
        };
        updated = [...prev, newRow];
      }

      return recalculateRows(updated);
    });
  };

  // Record Right Reading (x_R)
  const handleRecordRightReading = () => {
    if (!lampOn) return;

    const currentPos = benchState.apparentPosCm;
    const n = selectedRing;
    const rn = computeDarkRingRadiusCm(n, SODIUM_D_LINE_NM, radiusOfCurvatureCm, contactOffsetCm2);
    const nominalXL = parseFloat((5.000 - rn).toFixed(3));

    setRows((prev) => {
      const existingIdx = prev.findIndex((r) => r.ringOrder === n);
      let updated: NewtonsRingsObsRow[];

      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          xR_cm: parseFloat(currentPos.toFixed(3)),
        };
      } else {
        const newId = prev.length > 0 ? Math.max(...prev.map((r) => r.id)) + 1 : 1;
        const newRow: NewtonsRingsObsRow = {
          id: newId,
          ringOrder: n,
          xL_cm: nominalXL,
          xR_cm: parseFloat(currentPos.toFixed(3)),
          diameter_ref_cm: 0,
          diameterSq_ref_cm2: 0,
          diameter_student_cm: '',
          diameterSq_student_cm2: '',
          diffSq_student_student_cm2: '',
          lambda_student_nm: '',
          verified: false,
          cellStatus: {
            diameter: 'idle',
            diameterSq: 'idle',
            diffSq: 'idle',
            lambda: 'idle',
          },
        };
        updated = [...prev, newRow];
      }

      return recalculateRows(updated);
    });
  };

  // Load sample observations
  const handleLoadSampleData = () => {
    const samples = getSampleNewtonsRingsObservations(radiusOfCurvatureCm, 5.000);
    setRows(samples);
  };

  return (
    <LabShell
      title="Wavelength of Sodium Light using Newton's Rings"
      category="Year 1 · Semester 1 · Applied Physics Lab · AKTU Code: AAS151 / ASS251"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerBadge={
        <div className="flex items-center gap-2">
          {rows.length > 0 && (
            <button
              onClick={() => setActiveTab('table')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg)] transition-all font-mono tabular-nums"
            >
              <span>{rows.length} Readings Logged</span>
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
                Rotate the <strong className="text-[var(--text)]">Micrometer Screw</strong> to align the vertical crosshair
                with dark fringes, and log <strong className="text-[var(--text)]">Record Left (x_L)</strong> & <strong className="text-[var(--text)]">Record Right (x_R)</strong>.
              </span>
            </div>

            {rows.length === 0 && (
              <button
                onClick={handleLoadSampleData}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)] text-xs font-medium transition-all"
              >
                <Sparkles size={12} className="text-amber-400" />
                <span>Load Sample Lab Readings (n = 16 to 2)</span>
              </button>
            )}
          </div>

          {/* HTML5 Canvas Simulation Bench */}
          <NewtonsRingsCanvas
            benchState={benchState}
            onMicrometerMove={setMicrometerPosCm}
          />

          {/* Controls & Telemetry */}
          <BenchControls
            benchState={benchState}
            lampOn={lampOn}
            setLampOn={setLampOn}
            micrometerPosCm={micrometerPosCm}
            setMicrometerPosCm={setMicrometerPosCm}
            radiusOfCurvatureCm={radiusOfCurvatureCm}
            setRadiusOfCurvatureCm={setRadiusOfCurvatureCm}
            selectedRing={selectedRing}
            setSelectedRing={setSelectedRing}
            noiseOn={noiseOn}
            setNoiseOn={setNoiseOn}
            contactOffsetCm2={contactOffsetCm2}
            setContactOffsetCm2={setContactOffsetCm2}
            onRecordLeftReading={handleRecordLeftReading}
            onRecordRightReading={handleRecordRightReading}
            recordedCount={rows.length}
          />
        </div>
      }
      // Tab 3: Observation Table & Math Checker & Graph
      table={
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
          <ObservationTable
            rows={rows}
            setRows={setRows}
            radiusOfCurvatureCm={radiusOfCurvatureCm}
            pStep={pStep}
            setPStep={setPStep}
            canRecord={lampOn}
          />

          <NewtonsRingsGraph
            rows={rows}
            radiusOfCurvatureCm={radiusOfCurvatureCm}
          />
        </div>
      }
      // Tab 4: Viva Voce & Quiz & Error Analysis
      viva={<VivaContent />}
    />
  );
}
