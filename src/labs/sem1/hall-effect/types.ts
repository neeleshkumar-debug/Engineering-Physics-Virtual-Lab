// ─── types.ts — Hall Effect Experiment ──────────────────────────────────────────

import type { CellStatus } from '../../../types/lab';

export type SpecimenType = 'n-type' | 'p-type';

export interface HallEffectBenchState {
  powerOn: boolean;
  specimenType: SpecimenType;
  currentI_mA: number;          // Sample longitudinal current (mA)
  magneticFieldB_kG: number;    // Electromagnet field (kG)
  magneticFieldB_T: number;     // Magnetic field in Tesla (1 kG = 0.1 T)
  electromagnetCurrent_A: number; // Electromagnet coil current (A)
  thickness_mm: number;         // Specimen thickness (mm), typically 0.5 mm
  resistivity_ohm_cm: number;   // Specimen resistivity (Ω·cm)
  hallVoltage_mV: number;       // Measured transverse Hall voltage (mV)
  idealHallVoltage_mV: number;  // Theoretical noise-free Hall voltage (mV)
  hallCoefficient_m3_per_C: number; // Hall coefficient RH (m³/C)
  carrierDensity_m3: number;    // Carrier density n (m⁻³)
  carrierMobility_cm2_Vs: number; // Carrier mobility μ (cm²/V·s)
  noiseOn: boolean;
}

export interface HallEffectObsRow {
  id: number;
  specimenType: SpecimenType;
  currentI_mA: number;          // Measured bench current (mA)
  magneticFieldB_T: number;     // Measured bench field (Tesla)
  magneticFieldB_kG: number;    // Measured bench field (kG)
  thickness_mm: number;         // Thickness (mm)
  hallVoltage_mV: number;       // Measured Hall voltage (mV)
  
  // Theoretical reference values (for verification)
  rh_ref: number;               // RH in 10⁻³ m³/C
  n_ref: number;                // n in 10²¹ m⁻³
  mobility_ref: number;         // μ in cm²/V·s

  // Student hand-calculated fields (empty strings initially)
  rh_student: string;           // Student RH (in 10⁻³ m³/C)
  n_student: string;            // Student carrier concentration n (in 10²¹ m⁻³)
  mobility_student: string;     // Student mobility μ (in cm²/V·s)

  verified: boolean;
  cellStatus: {
    rh: CellStatus;
    n: CellStatus;
    mobility: CellStatus;
  };
}

export interface HallRegressionResult {
  slope: number;
  intercept: number;
  r2: number;
  extractedRH_m3_per_C: number;
  extractedCarrierDensity_m3: number;
  carrierType: SpecimenType;
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
