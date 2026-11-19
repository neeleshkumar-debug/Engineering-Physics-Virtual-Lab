import React, { useState, useMemo } from 'react';
import { LabShell, type LabTab } from '../../../components/layout/LabShell';
import { TheoryContent } from './theory/TheoryContent';
import { HallEffectCanvas } from './components/HallEffectCanvas';
import { BenchControls } from './components/BenchControls';
import { ObservationTable } from './components/ObservationTable';
import { HallGraph } from './components/HallGraph';
import { VivaContent } from './viva/VivaContent';
import {
  computeHallBenchState,
  DEFAULT_THICKNESS_MM,
  DEFAULT_RESISTIVITY_OHM_CM,
} from './physicsEngine';
import type { HallEffectObsRow, SpecimenType } from './types';
import { Sparkles, ArrowRight } from 'lucide-react';

export function HallEffectLab() {
  const [activeTab, setActiveTab] = useState<LabTab>('bench');
  const [powerOn, setPowerOn] = useState<boolean>(true);
  const [specimenType, setSpecimenType] = useState<SpecimenType>('n-type');
  const [currentI_mA, setCurrentI_mA] = useState<number>(5.0);
  const [magneticFieldB_kG, setMagneticFieldB_kG] = useState<number>(3.0);
  const [thickness_mm, setThickness_mm] = useState<number>(DEFAULT_THICKNESS_MM);
  const [noiseOn, setNoiseOn] = useState<boolean>(false);

  // Observations recorded by student
  const [rows, setRows] = useState<HallEffectObsRow[]>([]);

  // Compute live bench telemetry state from physics engine
  const benchState = useMemo(() => {
    return computeHallBenchState(
      powerOn,
      specimenType,
      currentI_mA,
      magneticFieldB_kG,
      thickness_mm,
      DEFAULT_RESISTIVITY_OHM_CM,
      noiseOn
    );
  }, [powerOn, specimenType, currentI_mA, magneticFieldB_kG, thickness_mm, noiseOn]);

  // Capture current live bench reading into observation table
  const handleRecordReading = () => {
    if (!powerOn || benchState.currentI_mA <= 0 || benchState.magneticFieldB_T <= 0) return;

    const newId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    const vh_mV = parseFloat(benchState.hallVoltage_mV.toFixed(2));
    const I_mA = parseFloat(benchState.currentI_mA.toFixed(1));
    const B_T = parseFloat(benchState.magneticFieldB_T.toFixed(3));
    const B_kG = parseFloat(benchState.magneticFieldB_kG.toFixed(1));

    const newRow: HallEffectObsRow = {
      id: newId,
      specimenType: benchState.specimenType,
      currentI_mA: I_mA,
      magneticFieldB_T: B_T,
      magneticFieldB_kG: B_kG,
      thickness_mm: benchState.thickness_mm,
      hallVoltage_mV: vh_mV,
      rh_ref: parseFloat((benchState.hallCoefficient_m3_per_C * 1e3).toFixed(3)),
      n_ref: parseFloat((benchState.carrierDensity_m3 / 1e21).toFixed(2)),
      mobility_ref: parseFloat(benchState.carrierMobility_cm2_Vs.toFixed(1)),
      // Active learning: student-entered fields are empty strings by default
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

  // Populate sample college lab file readings across varying B (0.5 kG to 4.0 kG at I = 5.0 mA)
  const handleLoadSampleData = () => {
    const sampleFields_kG = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0];
    const generated: HallEffectObsRow[] = sampleFields_kG.map((b_kG, idx) => {
      const state = computeHallBenchState(
        true,
        specimenType,
        5.0,
        b_kG,
        DEFAULT_THICKNESS_MM,
        DEFAULT_RESISTIVITY_OHM_CM,
        false
      );

      return {
        id: idx + 1,
        specimenType,
        currentI_mA: 5.0,
        magneticFieldB_kG: b_kG,
        magneticFieldB_T: parseFloat(state.magneticFieldB_T.toFixed(3)),
        thickness_mm: DEFAULT_THICKNESS_MM,
        hallVoltage_mV: parseFloat(state.hallVoltage_mV.toFixed(2)),
        rh_ref: parseFloat((state.hallCoefficient_m3_per_C * 1e3).toFixed(3)),
        n_ref: parseFloat((state.carrierDensity_m3 / 1e21).toFixed(2)),
        mobility_ref: parseFloat(state.carrierMobility_cm2_Vs.toFixed(1)),
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
    });

    setRows(generated);
  };

  return (
    <LabShell
      title="Determination of Hall Coefficient & Carrier Mobility"
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
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>
                Set <strong className="text-[var(--text)]">Sample Current (1–10 mA)</strong>, vary <strong className="text-[var(--text)]">Magnetic Field (0.5–5.0 kG)</strong>, and record readings with <strong className="text-[var(--text)]">Record Reading</strong>.
              </span>
            </div>

            {rows.length === 0 && (
              <button
                onClick={handleLoadSampleData}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)] text-xs font-medium"
              >
                <Sparkles size={12} className="text-amber-400" />
                Load Sample Lab Readings (0.5–4.0 kG)
              </button>
            )}
          </div>

          {/* HTML5 Canvas Simulation Bench */}
          <HallEffectCanvas benchState={benchState} />

          {/* Controls & Telemetry */}
          <BenchControls
            benchState={benchState}
            powerOn={powerOn}
            setPowerOn={setPowerOn}
            specimenType={specimenType}
            setSpecimenType={setSpecimenType}
            currentI_mA={currentI_mA}
            setCurrentI_mA={setCurrentI_mA}
            magneticFieldB_kG={magneticFieldB_kG}
            setMagneticFieldB_kG={setMagneticFieldB_kG}
            thickness_mm={thickness_mm}
            setThickness_mm={setThickness_mm}
            noiseOn={noiseOn}
            setNoiseOn={setNoiseOn}
            onRecordReading={handleRecordReading}
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
            onRecordCurrent={handleRecordReading}
            canRecord={powerOn && benchState.currentI_mA > 0 && benchState.magneticFieldB_T > 0}
          />

          <HallGraph rows={rows} />
        </div>
      }
      // Tab 4: Viva Voce & Quiz & Error Analysis
      viva={<VivaContent />}
    />
  );
}
