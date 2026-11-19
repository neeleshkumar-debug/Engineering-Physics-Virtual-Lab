// ─── types.ts — Half-Shade Polarimeter Experiment ───────────────────────────

import type { CellStatus } from '../../../types/lab';

export type TubeLengthOption = 1.0 | 2.0 | 2.2; // in decimeters (dm)

export type SolutionType = 'water' | '5%' | '10%' | '15%' | '20%' | 'unknown';

export interface SolutionMeta {
  id: SolutionType;
  name: string;
  shortLabel: string;
  concentration_g_cm3: number; // in g/cm3 (equivalent to g/mL)
  percentage: number; // in % w/v (g / 100 mL)
  isUnknown?: boolean;
}

export interface PolarimeterBenchState {
  lampOn: boolean;
  analyzerAngleDeg: number; // decimal degrees, e.g. 0° to 360°
  tubeLengthDm: TubeLengthOption;
  selectedSolution: SolutionType;
  concentration_g_cm3: number;
  waterZeroAngleDeg: number; // theta_0 reference offset
  noiseOn: boolean;
  noiseOffsetDeg: number;
  theoreticalRotationDeg: number; // deltaTheta = S * L * c
  theoreticalMatchAngleDeg: number; // theta = theta_0 + deltaTheta
  apparentAngleDeg: number; // angle shown on the vernier dial
  leftLuminance: number; // 0 to 1
  rightLuminance: number; // 0 to 1
  contrast: number; // |I_L - I_R| / (I_L + I_R)
  isEqualBrightness: boolean; // within balance tolerance
}

export interface PolarimeterObsRow {
  id: number;
  solutionName: string;
  concentration_g_cm3: number; // c in g/cm3 (g/mL)
  tubeLength_dm: number; // L in dm
  referenceAngle_deg: number; // theta_0 in degrees (water blank)
  observedAngle_deg: number; // theta in degrees
  deltaTheta_ref: number; // Reference Delta theta = |theta - theta_0|
  specificRotation_ref: number; // Reference S = Delta theta / (L * c)

  // Hand-calculated student values (stored as strings for partial inputs)
  deltaTheta_student: string;
  specificRotation_student: string;

  // Verification state
  verified: boolean;
  cellStatus: {
    deltaTheta: CellStatus;
    specificRotation: CellStatus;
  };
}

export interface PolarimeterVerificationResult {
  deltaTheta: {
    correct: boolean;
    expected: number;
    studentVal: number;
    message: string;
  };
  specificRotation: {
    correct: boolean;
    expected: number;
    studentVal: number;
    message: string;
  };
  allCorrect: boolean;
}

export interface PolarimeterRegressionResult {
  slope: number; // Delta theta / c (in deg / (g/cm3))
  intercept: number;
  r2: number;
  specificRotation: number | null; // slope / L
  pointsCount: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface VivaQA {
  q: string;
  a: string;
  tag: string;
}
