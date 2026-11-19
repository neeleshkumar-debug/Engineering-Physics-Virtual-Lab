import React, { useState, useMemo } from 'react';
import { LabShell, type LabTab } from '../../../components/layout/LabShell';
import { TheoryContent } from './theory/TheoryContent';
import { CircuitCanvas } from './components/CircuitCanvas';
import { BenchControls } from './components/BenchControls';
import { RgTable } from './components/RgTable';
import { ObservationTable } from './components/ObservationTable';
import { LogGraph } from './components/LogGraph';
import { VivaContent } from './viva/VivaContent';
import {
  computeFilamentState,
  R0_DEFAULT,
} from './physicsEngine';
import type { ObsRow } from '../../../types/lab';
import { Sparkles, ArrowRight } from 'lucide-react';

export function StefansLawLab() {
  const [activeTab, setActiveTab] = useState<LabTab>('bench');
  const [powerOn, setPowerOn] = useState<boolean>(true);
  const [sliderPct, setSliderPct] = useState<number>(30); // ~950 K, visibly glowing bulb
  const [noiseOn, setNoiseOn] = useState<boolean>(false);
  const [sessionR0, setSessionR0] = useState<number>(R0_DEFAULT);

  // Observations list captured by student
  const [rows, setRows] = useState<ObsRow[]>([]);

  // Compute live filament state from physics engine
  const filamentState = useMemo(() => {
    return computeFilamentState(sliderPct, powerOn, sessionR0, noiseOn);
  }, [sliderPct, powerOn, sessionR0, noiseOn]);

  // Capture current live bench reading (V, I) into table
  const handleRecordReading = () => {
    if (!powerOn || filamentState.I <= 0) return;

    const newId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    const newRow: ObsRow = {
      id: newId,
      V: parseFloat(filamentState.V.toFixed(3)),
      I: parseFloat(filamentState.I.toFixed(3)),
      // Active learning: student-entered fields are empty strings by default!
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
    };

    setRows((prev) => [...prev, newRow]);
  };

  // Preset to just glowing Draper point (~800 K)
  const handleSetDraperPoint = () => {
    setPowerOn(true);
    setSliderPct(12.5); // Produces ~800 K in nonlinear mapping
  };

  // Populate sample college lab file readings for instant trial
  const handleLoadSampleData = () => {
    const sampleSliders = [10, 20, 35, 50, 65, 80, 95];
    const generated: ObsRow[] = sampleSliders.map((s, idx) => {
      const state = computeFilamentState(s, true, sessionR0, false);
      return {
        id: idx + 1,
        V: parseFloat(state.V.toFixed(3)),
        I: parseFloat(state.I.toFixed(3)),
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
      };
    });
    setRows(generated);
  };

  return (
    <LabShell
      title="Verification of Stefan's Law of Radiation"
      category="Year 1 · Semester 1 · Thermal Physics Lab · Code: PHY-101"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerBadge={
        <div className="flex items-center gap-2">
          {rows.length > 0 && (
            <button
              onClick={() => setActiveTab('table')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/25 transition-all"
            >
              <span>{rows.length} Readings in Table</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      }
      // Tab 1: Theory & Aim
      theory={<TheoryContent />}
      // Tab 2: Virtual Bench (Simulation)
      bench={
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
          {/* Top Quick Guide Banner */}
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                Use the <strong className="text-[var(--text)]">Rheostat Slider</strong> to vary current.
                Observe the bulb filament color transition from dull red (800 K) to white-hot. Click{' '}
                <strong className="text-[var(--text)]">"Record Reading"</strong> to log V & I.
              </span>
            </div>

            {rows.length === 0 && (
              <button
                onClick={handleLoadSampleData}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg)] border border-[var(--border)] text-[var(--accent)] hover:bg-[var(--border)] text-xs font-semibold"
              >
                <Sparkles size={13} />
                Load 7 Sample Bench Readings
              </button>
            )}
          </div>

          {/* HTML5 Canvas Simulation Bench */}
          <CircuitCanvas
            filamentState={filamentState}
            sliderPct={sliderPct}
            powerOn={powerOn}
          />

          {/* Controls & Telemetry */}
          <BenchControls
            powerOn={powerOn}
            setPowerOn={setPowerOn}
            sliderPct={sliderPct}
            setSliderPct={setSliderPct}
            noiseOn={noiseOn}
            setNoiseOn={setNoiseOn}
            filamentState={filamentState}
            onRecordReading={handleRecordReading}
            onSetDraperPoint={handleSetDraperPoint}
            recordedCount={rows.length}
          />
        </div>
      }
      // Tab 3: Observation Table & Active Math Checker & Graph
      table={
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
          {/* Table 1: R_g and R_0 determination */}
          <RgTable
            currentV={filamentState.V}
            currentI={filamentState.I}
            sessionR0={sessionR0}
            onUpdateR0={setSessionR0}
          />

          {/* Table 2: Main Observation Table with Math Checker */}
          <ObservationTable
            rows={rows}
            setRows={setRows}
            sessionR0={sessionR0}
            onRecordCurrent={handleRecordReading}
            canRecord={powerOn && filamentState.I > 0}
          />

          {/* Recharts log(P) vs log(T) Plot */}
          <LogGraph rows={rows} />
        </div>
      }
      // Tab 4: Viva & Error Analysis
      viva={<VivaContent />}
    />
  );
}
