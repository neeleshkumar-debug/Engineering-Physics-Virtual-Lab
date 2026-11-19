import type { CellStatus } from '../../../types/lab';

export interface FourProbeObsRow {
  id: number;
  tempC: number;        // °C captured from live bench
  tempK: number;        // K (bench baseline)
  invT: number;         // 1000/T (K^-1, bench baseline)
  I_mA: number;         // mA captured from live bench
  V_mV: number;         // mV captured from live bench
  rho: number;          // Ω·cm (bench baseline)
  log10Rho: number;     // log10(ρ) (bench baseline)
  // Student-entered editable fields
  tempK_student: string;
  invT_student: string;
  rho_student: string;
  logRho_student: string;
  // Verification status per cell
  verified: boolean;
  cellStatus: {
    tempK: CellStatus;
    invT: CellStatus;
    rho: CellStatus;
    logRho: CellStatus;
  };
}

export interface FourProbeBenchState {
  powerOn: boolean;
  targetTempC: number;
  currentTempC: number;
  currentTempK: number;
  invT: number;             // 1000 / T (K^-1)
  I_mA: number;             // Constant current (mA)
  V_mV: number;             // Measured voltage (mV)
  rho: number;              // Resistivity (Ω·cm)
  log10Rho: number;         // log10(ρ)
  voltmeterRange: 'x1' | 'x10';
  isOverRange: boolean;     // When V > 199.9 mV in x1 range
  displayVoltageText: string;
  isHeating: boolean;
}

export interface FourProbeRegressionResult {
  slope: number;
  intercept: number;
  r2: number;
  eg_eV: number;            // Computed Energy Band Gap in eV
  percentError: number;     // Error relative to 0.67 eV
  verified: boolean;        // Eg within [0.60, 0.74] eV
}
