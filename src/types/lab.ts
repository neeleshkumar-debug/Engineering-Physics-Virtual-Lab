// ─── Shared TypeScript interfaces used across the whole lab platform ───────────

export type LabYear = 1 | 2 | 3 | 4;
export type LabSemester = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type LabCategory = 'Optics' | 'Thermal' | 'Electricity' | 'Mechanics' | 'Modern Physics';
export type LabDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type LabStatus = 'live' | 'coming-soon';

export interface LabMeta {
  slug: string;
  title: string;
  shortDesc: string;
  year: LabYear;
  semester: LabSemester;
  category: LabCategory;
  difficulty: LabDifficulty;
  status: LabStatus;
  icon: string;          // Lucide icon name
  estimatedTime: string; // e.g. "45 min"
  apparatus: string[];   // key apparatus items
}

// ─── Observation table row (Stefan's Law specific, but pattern reusable) ───────

export interface ObsRow {
  id: number;
  V: number;             // Volts — captured from live bench (read-only)
  I: number;             // Amperes — captured from live bench (read-only)
  // Student-entered editable fields (stored as strings to allow partial input)
  Rt_student: string;
  P_student: string;
  RtR0_student: string;
  T_student: string;
  logP_student: string;
  logT_student: string;
  // Verification status per cell
  verified: boolean;
  cellStatus: {
    Rt: CellStatus;
    P: CellStatus;
    RtR0: CellStatus;
    T: CellStatus;
    logP: CellStatus;
    logT: CellStatus;
  };
}

export type CellStatus = 'idle' | 'correct' | 'wrong';

// ─── Regression result ─────────────────────────────────────────────────────────

export interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
  verified: boolean; // slope between 3.5 and 4.5
}
