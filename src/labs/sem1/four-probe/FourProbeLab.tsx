import React, { useState, useMemo, useEffect } from 'react';
import { LabShell, type LabTab } from '../../../components/layout/LabShell';
import { TheoryContent } from './theory/TheoryContent';
import { FourProbeCanvas } from './components/FourProbeCanvas';
import { BenchControls } from './components/BenchControls';
import { ObservationTable } from './components/ObservationTable';
import { BandGapGraph } from './components/BandGapGraph';
import { VivaContent } from './viva/VivaContent';
import {
  computeFourProbeState,
  computeResistivity,
  computeLog10Rho,
  I_DEFAULT_MA,
} from './physicsEngine';
import type { FourProbeObsRow } from './types';
import { Sparkles, ArrowRight } from 'lucide-react';

export function FourProbeLab() {
  const [activeTab, setActiveTab] = useState<LabTab>('bench');
  const [powerOn, setPowerOn] = useState<boolean>(true);
  const [targetTempC, setTargetTempC] = useState<number>(30); // Start at room temperature ~30 °C
  const [currentTempC, setCurrentTempC] = useState<number>(30);
  const [currentI_mA, setCurrentI_mA] = useState<number>(I_DEFAULT_MA);
  const [voltmeterRange, setVoltmeterRange] = useState<'x1' | 'x10'>('x10');
  const [noiseOn, setNoiseOn] = useState<boolean>(false);

  // Observations list captured by student
  const [rows, setRows] = useState<FourProbeObsRow[]>([]);

  // Smooth thermal approach to target temperature
  useEffect(() => {
    if (!powerOn) return;

    const interval = setInterval(() => {
      setCurrentTempC((prev) => {
        const diff = targetTempC - prev;
        if (Math.abs(diff) < 0.1) return targetTempC;
        // Exponential thermal approach
        return parseFloat((prev + diff * 0.12).toFixed(2));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [targetTempC, powerOn]);

  // Compute live telemetry state from physics engine
  const benchState = useMemo(() => {
    return computeFourProbeState(
      powerOn,
      targetTempC,
      currentTempC,
      currentI_mA,
      voltmeterRange,
      noiseOn
    );
  }, [powerOn, targetTempC, currentTempC, currentI_mA, voltmeterRange, noiseOn]);

  // Capture current live bench reading (Temp, Current, Voltage) into table
  const handleRecordReading = () => {
    if (!powerOn || benchState.I_mA <= 0) return;

    const newId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    const tempC = parseFloat(benchState.currentTempC.toFixed(1));
    const tempK = parseFloat(benchState.currentTempK.toFixed(2));
    const invT = parseFloat(benchState.invT.toFixed(3));
    const I_mA = parseFloat(benchState.I_mA.toFixed(2));
    const V_mV = parseFloat(benchState.V_mV.toFixed(1));
    const rho = parseFloat(benchState.rho.toFixed(3));
    const log10Rho = parseFloat(benchState.log10Rho.toFixed(4));

    const newRow: FourProbeObsRow = {
      id: newId,
      tempC,
      tempK,
      invT,
      I_mA,
      V_mV,
      rho,
      log10Rho,
      // Active learning: student-entered fields are empty strings by default
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

  // Populate sample college lab file readings across 40°C–150°C
  const handleLoadSampleData = () => {
    const sampleTemps = [40, 55, 70, 85, 100, 115, 130, 145];
    const generated: FourProbeObsRow[] = sampleTemps.map((tc, idx) => {
      const state = computeFourProbeState(true, tc, tc, currentI_mA, 'x10', false);
      return {
        id: idx + 1,
        tempC: tc,
        tempK: parseFloat(state.currentTempK.toFixed(2)),
        invT: parseFloat(state.invT.toFixed(3)),
        I_mA: parseFloat(state.I_mA.toFixed(2)),
        V_mV: parseFloat(state.V_mV.toFixed(1)),
        rho: parseFloat(state.rho.toFixed(3)),
        log10Rho: parseFloat(state.log10Rho.toFixed(4)),
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
    });
    setRows(generated);
  };

  return (
    <LabShell
      title="Energy Band Gap of a Semiconductor (Four-Probe Method)"
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
      // Tab 1: Theory & Aim
      theory={<TheoryContent />}
      // Tab 2: Virtual Bench (Simulation)
      bench={
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-5">
          {/* Bench Instruction Bar */}
          <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>
                Set <strong className="text-[var(--text)]">Current (2–4 mA)</strong>, vary <strong className="text-[var(--text)]">Oven Setpoint</strong>, and log readings with <strong className="text-[var(--text)]">Record Reading</strong>.
              </span>
            </div>

            {rows.length === 0 && (
              <button
                onClick={handleLoadSampleData}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)] text-xs font-medium"
              >
                <Sparkles size={12} className="text-amber-400" />
                Load Sample Readings (40°C–145°C)
              </button>
            )}
          </div>

          {/* HTML5 Canvas Simulation Bench */}
          <FourProbeCanvas benchState={benchState} />

          {/* Controls & Telemetry */}
          <BenchControls
            benchState={benchState}
            powerOn={powerOn}
            setPowerOn={setPowerOn}
            targetTempC={targetTempC}
            setTargetTempC={setTargetTempC}
            currentI_mA={currentI_mA}
            setCurrentI_mA={setCurrentI_mA}
            voltmeterRange={voltmeterRange}
            setVoltmeterRange={setVoltmeterRange}
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
            canRecord={powerOn && benchState.I_mA > 0}
          />

          <BandGapGraph rows={rows} />
        </div>
      }
      // Tab 4: Viva Voce & Error Analysis
      viva={<VivaContent />}
    />
  );
}
