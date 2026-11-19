import React, { useState, useMemo } from 'react';
import { LabShell, type LabTab } from '../../../components/layout/LabShell';
import { TheoryContent } from './theory/TheoryContent';
import { GratingCanvas } from './components/GratingCanvas';
import { BenchControls } from './components/BenchControls';
import { ObservationTable } from './components/ObservationTable';
import { GratingGraph } from './components/GratingGraph';
import { VivaContent } from './viva/VivaContent';
import {
  computeGratingBenchState,
  computeDiffractionAngleDeg,
  decimalDegToDMS,
  MERCURY_LINES,
  MERCURY_LINES_LIST,
  lpiToGratingElementNm,
} from './physicsEngine';
import type { DiffractionObsRow, GratingLPI, SpectralLineId } from './types';
import { Sparkles, ArrowRight } from 'lucide-react';

export function DiffractionGratingLab() {
  const [activeTab, setActiveTab] = useState<LabTab>('bench');
  const [lampOn, setLampOn] = useState<boolean>(true);
  const [telescopeAngleDeg, setTelescopeAngleDeg] = useState<number>(0);
  const [gratingLPI, setGratingLPI] = useState<GratingLPI>(15000);
  const [selectedOrder, setSelectedOrder] = useState<0 | 1 | 2 | 'all'>('all');
  const [noiseOn, setNoiseOn] = useState<boolean>(false);
  const [slitWidthMm, setSlitWidthMm] = useState<number>(0.3);

  // Observations recorded by student
  const [rows, setRows] = useState<DiffractionObsRow[]>([]);

  // Compute live bench telemetry state
  const benchState = useMemo(() => {
    return computeGratingBenchState(
      lampOn,
      gratingLPI,
      telescopeAngleDeg,
      selectedOrder,
      noiseOn,
      slitWidthMm
    );
  }, [lampOn, gratingLPI, telescopeAngleDeg, selectedOrder, noiseOn, slitWidthMm]);

  // Record Left Reading (θ_L)
  const handleRecordLeftReading = () => {
    if (!lampOn) return;

    const angle = Math.abs(benchState.apparentAngleDeg);
    const dms = decimalDegToDMS(angle);
    const targetLine = benchState.activeLineNearby || MERCURY_LINES.green;
    const order = Math.abs(benchState.currentOrder || 1) || 1;

    // Check if an existing row matches this line and order
    const existingIndex = rows.findIndex(
      (r) => r.color === targetLine.id && r.order === order
    );

    if (existingIndex >= 0) {
      setRows((prev) => {
        const next = [...prev];
        const row = next[existingIndex];
        const twoTheta = Math.abs(angle - row.thetaR_deg) || angle + row.thetaR_deg;
        const theta = twoTheta / 2;
        const sinTheta = Math.sin((theta * Math.PI) / 180);
        const e_nm = lpiToGratingElementNm(gratingLPI);
        const lambda = (e_nm * sinTheta) / order;

        next[existingIndex] = {
          ...row,
          thetaL_deg: parseFloat(angle.toFixed(3)),
          thetaL_dms: dms.formatted,
          twoTheta_ref: parseFloat(twoTheta.toFixed(2)),
          theta_ref: parseFloat(theta.toFixed(2)),
          sinTheta_ref: parseFloat(sinTheta.toFixed(4)),
          lambda_ref_nm: parseFloat(lambda.toFixed(1)),
        };
        return next;
      });
    } else {
      const newId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
      const nominalThetaDeg = computeDiffractionAngleDeg(targetLine.wavelengthNm, order, benchState.gratingElementNm) || angle;
      const rightAngle = nominalThetaDeg;
      const rightDms = decimalDegToDMS(rightAngle);
      const twoTheta = angle + rightAngle;
      const theta = twoTheta / 2;
      const sinTheta = Math.sin((theta * Math.PI) / 180);

      const newRow: DiffractionObsRow = {
        id: newId,
        color: targetLine.id as SpectralLineId,
        colorName: targetLine.name,
        order,
        thetaL_deg: parseFloat(angle.toFixed(3)),
        thetaL_dms: dms.formatted,
        thetaR_deg: parseFloat(rightAngle.toFixed(3)),
        thetaR_dms: rightDms.formatted,
        twoTheta_ref: parseFloat(twoTheta.toFixed(2)),
        theta_ref: parseFloat(theta.toFixed(2)),
        sinTheta_ref: parseFloat(sinTheta.toFixed(4)),
        lambda_ref_nm: targetLine.wavelengthNm,
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
    }
  };

  // Record Right Reading (θ_R)
  const handleRecordRightReading = () => {
    if (!lampOn) return;

    const angle = Math.abs(benchState.apparentAngleDeg);
    const dms = decimalDegToDMS(angle);
    const targetLine = benchState.activeLineNearby || MERCURY_LINES.green;
    const order = Math.abs(benchState.currentOrder || 1) || 1;

    // Check if an existing row matches this line and order
    const existingIndex = rows.findIndex(
      (r) => r.color === targetLine.id && r.order === order
    );

    if (existingIndex >= 0) {
      setRows((prev) => {
        const next = [...prev];
        const row = next[existingIndex];
        const twoTheta = Math.abs(row.thetaL_deg - angle) || row.thetaL_deg + angle;
        const theta = twoTheta / 2;
        const sinTheta = Math.sin((theta * Math.PI) / 180);
        const e_nm = lpiToGratingElementNm(gratingLPI);
        const lambda = (e_nm * sinTheta) / order;

        next[existingIndex] = {
          ...row,
          thetaR_deg: parseFloat(angle.toFixed(3)),
          thetaR_dms: dms.formatted,
          twoTheta_ref: parseFloat(twoTheta.toFixed(2)),
          theta_ref: parseFloat(theta.toFixed(2)),
          sinTheta_ref: parseFloat(sinTheta.toFixed(4)),
          lambda_ref_nm: parseFloat(lambda.toFixed(1)),
        };
        return next;
      });
    } else {
      const newId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
      const nominalThetaDeg = computeDiffractionAngleDeg(targetLine.wavelengthNm, order, benchState.gratingElementNm) || angle;
      const leftAngle = nominalThetaDeg;
      const leftDms = decimalDegToDMS(leftAngle);
      const twoTheta = leftAngle + angle;
      const theta = twoTheta / 2;
      const sinTheta = Math.sin((theta * Math.PI) / 180);

      const newRow: DiffractionObsRow = {
        id: newId,
        color: targetLine.id as SpectralLineId,
        colorName: targetLine.name,
        order,
        thetaL_deg: parseFloat(leftAngle.toFixed(3)),
        thetaL_dms: leftDms.formatted,
        thetaR_deg: parseFloat(angle.toFixed(3)),
        thetaR_dms: dms.formatted,
        twoTheta_ref: parseFloat(twoTheta.toFixed(2)),
        theta_ref: parseFloat(theta.toFixed(2)),
        sinTheta_ref: parseFloat(sinTheta.toFixed(4)),
        lambda_ref_nm: targetLine.wavelengthNm,
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
    }
  };

  // Populate sample college lab readings for all 5 prominent lines in 1st order
  const handleLoadSampleData = () => {
    const e_nm = lpiToGratingElementNm(gratingLPI);
    const order = 1;

    const sampleRows: DiffractionObsRow[] = MERCURY_LINES_LIST.map((line, idx) => {
      const exactTheta = computeDiffractionAngleDeg(line.wavelengthNm, order, e_nm)!;
      // Slight simulated experimental imperfection: ±1 arcminute
      const noiseL = (idx % 2 === 0 ? 1 : -1) * (1 / 60);
      const noiseR = (idx % 3 === 0 ? -1 : 1) * (1 / 60);

      const thetaL = exactTheta + noiseL;
      const thetaR = exactTheta + noiseR;
      const dmsL = decimalDegToDMS(thetaL);
      const dmsR = decimalDegToDMS(thetaR);

      const twoTheta = thetaL + thetaR;
      const theta = twoTheta / 2;
      const sinTheta = Math.sin((theta * Math.PI) / 180);
      const lambdaCalc = (e_nm * sinTheta) / order;

      return {
        id: idx + 1,
        color: line.id as SpectralLineId,
        colorName: line.name,
        order,
        thetaL_deg: parseFloat(thetaL.toFixed(3)),
        thetaL_dms: dmsL.formatted,
        thetaR_deg: parseFloat(thetaR.toFixed(3)),
        thetaR_dms: dmsR.formatted,
        twoTheta_ref: parseFloat(twoTheta.toFixed(2)),
        theta_ref: parseFloat(theta.toFixed(2)),
        sinTheta_ref: parseFloat(sinTheta.toFixed(4)),
        lambda_ref_nm: parseFloat(lambdaCalc.toFixed(1)),
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
    });

    setRows(sampleRows);
  };

  return (
    <LabShell
      title="Wavelength of Spectral Lines using Diffraction Grating"
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
                Rotate the <strong className="text-[var(--text)]">Telescope Angle Slider</strong> to align the vertical crosshair
                with mercury spectral lines, and log <strong className="text-[var(--text)]">Record Left (θ_L)</strong> & <strong className="text-[var(--text)]">Record Right (θ_R)</strong>.
              </span>
            </div>

            {rows.length === 0 && (
              <button
                onClick={handleLoadSampleData}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)] text-xs font-medium transition-all"
              >
                <Sparkles size={12} className="text-amber-400" />
                <span>Load Sample Lab Readings (1st Order)</span>
              </button>
            )}
          </div>

          {/* HTML5 Canvas Simulation Bench */}
          <GratingCanvas benchState={benchState} />

          {/* Controls & Telemetry */}
          <BenchControls
            benchState={benchState}
            lampOn={lampOn}
            setLampOn={setLampOn}
            telescopeAngleDeg={telescopeAngleDeg}
            setTelescopeAngleDeg={setTelescopeAngleDeg}
            gratingLPI={gratingLPI}
            setGratingLPI={setGratingLPI}
            selectedOrder={selectedOrder}
            setSelectedOrder={setSelectedOrder}
            noiseOn={noiseOn}
            setNoiseOn={setNoiseOn}
            slitWidthMm={slitWidthMm}
            setSlitWidthMm={setSlitWidthMm}
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
            onRecordCurrent={handleRecordLeftReading}
            canRecord={lampOn}
            gratingLPI={gratingLPI}
          />

          <GratingGraph rows={rows} gratingLPI={gratingLPI} />
        </div>
      }
      // Tab 4: Viva Voce & Quiz & Error Analysis
      viva={<VivaContent />}
    />
  );
}
