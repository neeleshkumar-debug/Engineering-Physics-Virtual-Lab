import type { CellStatus } from '../../../types/lab';

export type ExperimentPart = 'partA' | 'partB';
export type GapConfig = 'normal' | 'interchanged';

export interface ScrewGaugeSpecs {
  pitchMm: number;
  divisions: number;
  leastCountMm: number;
  msrMm: number;
  csrDiv: number;
  zeroErrorMm: number;
}

export interface WireSpecimen {
  id: string;
  name: string;
  material: string;
  lengthCm: number;
  diameterMm: number;
  resistivityOhmM: number;
  nominalResistanceOhm: number;
  screwGauge: ScrewGaugeSpecs;
}

export interface CareyFosterBenchState {
  part: ExperimentPart;
  gapConfig: GapConfig;
  resistanceX_ohm: number;
  resistanceY_ohm: number; // 0 for copper strip in Part A
  activeSpecimen: WireSpecimen;
  jockeyPosCm: number;
  nullPointCm: number; // current balance point (with noise if active)
  trueNullPointCm: number; // ideal null point without noise
  galvoDeflectionDiv: number; // -30 to +30 divs
  galvoImbalanceOhm: number;
  isAtNull: boolean;
  rho_w_true: number; // 0.0350 Ohm/cm
  endAlphaOhm: number; // 0.05 Ohm
  endBetaOhm: number;  // 0.08 Ohm
}

export interface PartARow {
  id: number;
  resistanceX_ohm: number;
  l1_cm: number;
  l2_cm: number;
  diff_ref_cm: number;
  rho_w_ref: number;
  diff_student: string;
  rho_w_student: string;
  verified: boolean;
  cellStatus: {
    diff: CellStatus;
    rho_w: CellStatus;
  };
}

export interface PartBRow {
  id: number;
  resistanceX_ohm: number;
  l1_cm: number;
  l2_cm: number;
  diff_ref_cm: number;
  y_ref_ohm: number;
  diff_student: string;
  y_student: string;
  verified: boolean;
  cellStatus: {
    diff: CellStatus;
    y: CellStatus;
  };
}

export interface ScrewGaugeStudentState {
  msr_mm: string;
  csr_div: string;
  zeroError_mm: string;
  diameter_student_mm: string;
  radius_student_cm: string;
  length_student_cm: string;
  rho_student_ohm_m: string;
  verified: boolean;
  cellStatus: {
    diameter: CellStatus;
    radius: CellStatus;
    length: CellStatus;
    rho: CellStatus;
  };
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
