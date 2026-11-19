// ─── types.ts — Diffraction Grating Experiment ───────────────────────────────

import type { CellStatus } from '../../../types/lab';

export type SpectralLineId = 'violet' | 'blue' | 'green' | 'yellow1' | 'yellow2';

export interface SpectralLine {
  id: SpectralLineId;
  name: string;
  wavelengthNm: number;
  wavelengthAngstrom: number;
  colorHex: string;
  colorRgb: [number, number, number];
  label: string;
}

export type GratingLPI = 15000 | 6000;

export interface SpectralPeak {
  line: SpectralLine;
  order: number; // -2, -1, 0, 1, 2
  diffractionAngleDeg: number; // positive or negative
  diffractionAngleRad: number;
  intensity: number; // 0 to 1
}

export interface GratingBenchState {
  lampOn: boolean;
  gratingLPI: GratingLPI;
  gratingElementCm: number;
  gratingElementNm: number;
  telescopeAngleDeg: number; // decimal degrees, signed (-45 to +45)
  selectedOrder: 0 | 1 | 2 | 'all';
  noiseOn: boolean;
  slitWidthMm: number;
  apparentAngleDeg: number; // with noise if active
  activeLineNearby: SpectralLine | null;
  alignmentDiffDeg: number | null;
  currentOrder: number | null;
}

export interface DiffractionObsRow {
  id: number;
  color: SpectralLineId;
  colorName: string;
  order: number; // 1 or 2
  thetaL_deg: number; // Left telescope reading (positive)
  thetaL_dms: string; // DMS format, e.g., 18° 49'
  thetaR_deg: number; // Right telescope reading (positive)
  thetaR_dms: string; // DMS format, e.g., 18° 49'
  twoTheta_ref: number; // Reference 2θ = |θL - θR| or θL + θR
  theta_ref: number; // Reference θ = 2θ / 2
  sinTheta_ref: number; // Reference sin(θ)
  lambda_ref_nm: number; // Reference λ in nm

  // Hand-calculated fields entered by student
  twoTheta_student: string;
  theta_student: string;
  sinTheta_student: string;
  lambda_student_nm: string;

  verified: boolean;
  cellStatus: {
    twoTheta: CellStatus;
    theta: CellStatus;
    sinTheta: CellStatus;
    lambda: CellStatus;
  };
}

export interface GratingRegressionResult {
  slope: number;
  intercept: number;
  r2: number;
  experimentalLPI: number;
  nominalLPI: number;
  percentError: number;
  pointsCount: number;
  verified: boolean;
}

export interface VivaQA {
  tag: string;
  q: string;
  a: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
