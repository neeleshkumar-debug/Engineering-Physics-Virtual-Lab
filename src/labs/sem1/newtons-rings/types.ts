import type { CellStatus } from '../../../types/lab';

export type LensRadiusOption = 90 | 100 | 120; // cm

export interface VernierScaleReading {
  pitchCm: number;        // 0.05 cm = 0.5 mm
  totalDivisions: number; // 50
  leastCountCm: number;   // 0.001 cm = 0.01 mm
  msrCm: number;          // Main Scale Reading (multiples of 0.05 cm)
  vsrDiv: number;         // Vernier Scale Reading (0-49)
  totalCm: number;        // msrCm + vsrDiv * leastCountCm
  formatted: string;      // e.g. "5.150 cm"
}

export interface NewtonsRingsBenchState {
  lampOn: boolean;
  micrometerPosCm: number;          // Current position x of traveling microscope crosshair (e.g., 3.0 to 7.0 cm)
  centerPosCm: number;              // Center of rings pattern (default 5.000 cm)
  radiusOfCurvatureCm: LensRadiusOption; // R (e.g. 100 cm)
  sodiumWavelengthNm: number;       // λ ≈ 589.3 nm
  contactOffsetCm2: number;         // D0^2 (dust/pressure contact offset, default 0 or small offset)
  noiseOn: boolean;
  selectedRing: number;             // Ring order selected for highlighting / snap
  vernier: VernierScaleReading;
  apparentPosCm: number;            // Position with noise if enabled
  ringUnderCrosshair: {
    order: number;
    side: 'left' | 'right' | 'center';
    exactRingPosCm: number;
    distanceFromDarkCm: number;
    isAligned: boolean;
  } | null;
}

export interface NewtonsRingsObsRow {
  id: number;
  ringOrder: number;           // n (e.g., 16, 14, 12, ...)
  xL_cm: number;               // Left crosshair reading in cm
  xR_cm: number;               // Right crosshair reading in cm
  pairedOrder?: number;        // (n + p) paired ring order
  pStep?: number;              // p step difference
  // Reference computed values
  diameter_ref_cm: number;     // Dn = |xL - xR|
  diameterSq_ref_cm2: number;  // Dn^2
  diffSq_ref_cm2?: number;     // D_{n+p}^2 - D_n^2
  lambda_ref_nm?: number;      // Calculated lambda in nm
  // Student-entered inputs (stored as strings)
  diameter_student_cm: string;
  diameterSq_student_cm2: string;
  diffSq_student_student_cm2: string;
  lambda_student_nm: string;
  // Verification states
  verified: boolean;
  cellStatus: {
    diameter: CellStatus;
    diameterSq: CellStatus;
    diffSq: CellStatus;
    lambda: CellStatus;
  };
}

export interface NewtonsRingsRegressionResult {
  slope: number;               // Slope m = 4 * lambda * R
  intercept: number;           // Intercept c = D0^2
  r2: number;                  // R^2 determination coefficient
  pointsCount: number;
  calculatedLambdaNm: number;  // lambda = slope / (4 * R) in nm
  targetLambdaNm: number;      // 589.3 nm
  percentageError: number;
}

export interface CellVerificationResult {
  correct: boolean;
  received: number;
  expected: number;
  pctError: number;
}

export interface NewtonsRingsRowVerification {
  diameter: CellVerificationResult;
  diameterSq: CellVerificationResult;
  diffSq?: CellVerificationResult;
  lambda?: CellVerificationResult;
  allCorrect: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface VivaQA {
  tag: string;
  q: string;
  a: string;
}
