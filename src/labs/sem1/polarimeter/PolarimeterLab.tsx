import React, { useState, useMemo } from 'react';
import { LabShell, type LabTab } from '../../../components/layout/LabShell';
import { TheoryContent } from './theory/TheoryContent';
import { PolarimeterCanvas } from './components/PolarimeterCanvas';
import { BenchControls } from './components/BenchControls';
import { ObservationTable } from './components/ObservationTable';
import { PolarimeterGraph } from './components/PolarimeterGraph';
import { VivaContent } from './viva/VivaContent';
import {
  computeBenchState,
  getSolutionMeta,
  getSamplePolarimeterObservations,
  DEFAULT_WATER_ZERO_DEG,
  SUCROSE_SPECIFIC_ROTATION,
} from './physicsEngine';
import type {
  TubeLengthOption,
  SolutionType,
  PolarimeterObsRow,
} from './types';
import { Sparkles, ArrowRight } from 'lucide-react';

export function PolarimeterLab() {
  const [activeTab, setActiveTab] = useState<LabTab>('bench');
  const [lampOn, setLampOn] = useState<boolean>(true);
  const [analyzerAngleDeg, setAnalyzerAngleDeg] = useState<number>(10.00);
  const [tubeLengthDm, setTubeLengthDm] = useState<TubeLengthOption>(2.0);
  const [selectedSolution, setSelectedSolution] = useState<SolutionType>('water');
  const [waterZeroAngleDeg, setWaterZeroAngleDeg] = useState<number>(DEFAULT_WATER_ZERO_DEG);
  const [noiseOn, setNoiseOn] = useState<boolean>(false);
  const [noiseOffsetDeg, setNoiseOffsetDeg] = useState<number>(0);

  // Observations recorded by student
  const [rows, setRows] = useState<PolarimeterObsRow[]>([]);

  // Toggle noise with realistic human random offset
  const handleToggleNoise = (on: boolean) => {
    setNoiseOn(on);
    if (on) {
      const rand = parseFloat(((Math.random() - 0.5) * 0.16).toFixed(2));
      setNoiseOffsetDeg(rand);
    } else {
      setNoiseOffsetDeg(0);
    }
  };

  // Live bench state
  const benchState = useMemo(() => {
    return computeBenchState(
      lampOn,
      analyzerAngleDeg,
      tubeLengthDm,
      selectedSolution,
      waterZeroAngleDeg,
      noiseOn,
      noiseOffsetDeg
    );
  }, [
    lampOn,
    analyzerAngleDeg,
    tubeLengthDm,
    selectedSolution,
    waterZeroAngleDeg,
    noiseOn,
    noiseOffsetDeg,
  ]);

  // Snap to balance point helper
  const handleAutoMatch = () => {
    setAnalyzerAngleDeg(benchState.theoreticalMatchAngleDeg);
  };

  // Reset bench to initial water zero
  const handleResetBench = () => {
    setAnalyzerAngleDeg(DEFAULT_WATER_ZERO_DEG);
    setSelectedSolution('water');
    setTubeLengthDm(2.0);
    setWaterZeroAngleDeg(DEFAULT_WATER_ZERO_DEG);
  };

  // Record observed reading to observation table
  const handleRecordReading = () => {
    if (!lampOn) return;

    const currentAngle = benchState.apparentAngleDeg;
    const sol = getSolutionMeta(selectedSolution);

    if (selectedSolution === 'water') {
      // Establish reference water zero reading
      setWaterZeroAngleDeg(currentAngle);

      setRows((prev) => {
        const existingIdx = prev.findIndex((r) => r.concentration_g_cm3 === 0);
        const waterRow: PolarimeterObsRow = {
          id: existingIdx >= 0 ? prev[existingIdx].id : prev.length + 1,
          solutionName: sol.name,
          concentration_g_cm3: 0.0,
          tubeLength_dm: tubeLengthDm,
          referenceAngle_deg: currentAngle,
          observedAngle_deg: currentAngle,
          deltaTheta_ref: 0.0,
          specificRotation_ref: 0.0,
          deltaTheta_student: '',
          specificRotation_student: '',
          verified: false,
          cellStatus: { deltaTheta: 'idle', specificRotation: 'idle' },
        };

        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = waterRow;
          return updated;
        }
        return [waterRow, ...prev];
      });
      return;
    }

    // Sugar solution reading
    const delta = Math.abs(currentAngle - waterZeroAngleDeg);
    const expectedS =
      tubeLengthDm > 0 && sol.concentration_g_cm3 > 0
        ? parseFloat((delta / (tubeLengthDm * sol.concentration_g_cm3)).toFixed(2))
        : 0;

    setRows((prev) => {
      const existingIdx = prev.findIndex((r) => r.solutionName === sol.name);
      const newRow: PolarimeterObsRow = {
        id: existingIdx >= 0 ? prev[existingIdx].id : prev.length > 0 ? Math.max(...prev.map((r) => r.id)) + 1 : 1,
        solutionName: sol.name,
        concentration_g_cm3: sol.concentration_g_cm3,
        tubeLength_dm: tubeLengthDm,
        referenceAngle_deg: waterZeroAngleDeg,
        observedAngle_deg: currentAngle,
        deltaTheta_ref: parseFloat(delta.toFixed(2)),
        specificRotation_ref: expectedS,
        deltaTheta_student: '',
        specificRotation_student: '',
        verified: false,
        cellStatus: { deltaTheta: 'idle', specificRotation: 'idle' },
      };

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newRow;
        return updated;
      }
      return [...prev, newRow];
    });
  };

  // Load sample lab readings
  const handleLoadSampleReadings = () => {
    const samples = getSamplePolarimeterObservations(tubeLengthDm, waterZeroAngleDeg);
    setRows(samples);
  };

  return (
    <LabShell
      title="Specific Rotation of Sugar Solution using Half-Shade Polarimeter"
      category="Year 1 · Semester 1 · Optics & Polarization (AKTU AAS151 / AAS251)"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerBadge={
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 font-mono">
            Experiment 7
          </span>
          {benchState.isEqualBrightness && lampOn && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Sparkles size={12} />
              <span>Balanced</span>
            </span>
          )}
        </div>
      }
      // Tab 1: Theory & Aim + Persistent Video Player
      theory={<TheoryContent />}
      // Tab 2: Virtual Bench
      bench={
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
          <PolarimeterCanvas
            benchState={benchState}
            onAngleChange={setAnalyzerAngleDeg}
          />

          <BenchControls
            benchState={benchState}
            lampOn={lampOn}
            setLampOn={setLampOn}
            analyzerAngleDeg={analyzerAngleDeg}
            setAnalyzerAngleDeg={setAnalyzerAngleDeg}
            tubeLengthDm={tubeLengthDm}
            setTubeLengthDm={setTubeLengthDm}
            selectedSolution={selectedSolution}
            setSelectedSolution={setSelectedSolution}
            noiseOn={noiseOn}
            setNoiseOn={handleToggleNoise}
            onRecordReading={handleRecordReading}
            onAutoMatch={handleAutoMatch}
            onResetBench={handleResetBench}
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
            tubeLengthDm={tubeLengthDm}
            waterZeroDeg={waterZeroAngleDeg}
            onLoadSampleReadings={handleLoadSampleReadings}
            canRecord={lampOn}
          />

          <PolarimeterGraph
            rows={rows}
            tubeLengthDm={tubeLengthDm}
          />
        </div>
      }
      // Tab 4: Viva Voce & Quiz & Error Analysis
      viva={<VivaContent />}
    />
  );
}
