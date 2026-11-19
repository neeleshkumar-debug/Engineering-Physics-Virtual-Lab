// ─── physicsEngine.ts — Hall Effect Experiment ────────────────────────────────
// Pure functions only. No React dependencies. Fully unit-tested.
//
// Physics Principles:
//   Lorentz Force: F = q · (E + v_d × B)
//   Hall Field: E_H = v_d · B = (I / (n · q · w · t)) · B
//   Hall Voltage: V_H = E_H · w = (R_H · I · B) / t
//   Hall Coefficient: R_H = 1 / (n · q) = (V_H · t) / (I · B)
//   Carrier Density: n = 1 / (|R_H| · e)
//   Carrier Mobility: μ = |R_H| / ρ = |R_H| · σ

import type {
  SpecimenType,
  HallEffectBenchState,
  HallRegressionResult,
} from './types';

// ─── Physical Constants ────────────────────────────────────────────────────────

/** Elementary charge in Coulombs */
export const ELEMENTARY_CHARGE_C = 1.602176634e-19;

/** Tesla to kiloGauss conversion factor (1 T = 10 kG) */
export const KG_PER_TESLA = 10.0;
export const TESLA_PER_KG = 0.1;

/** Standard thickness of semiconductor wafer (mm) */
export const DEFAULT_THICKNESS_MM = 0.5;

/** Standard thickness of semiconductor wafer in meters */
export const DEFAULT_THICKNESS_M = 0.5e-3;

/** Standard Germanium wafer resistivity (Ω·cm) */
export const DEFAULT_RESISTIVITY_OHM_CM = 8.5;

/** Standard carrier concentration for Ge sample (m⁻³) */
export const DEFAULT_CARRIER_DENSITY_M3 = 1.25e21; // 1.25 × 10¹⁵ cm⁻³

/**
 * Standard Hall coefficient magnitude for Germanium wafer (m³/C):
 * |R_H| = 1 / (n · e) = 1 / (1.25e21 · 1.602176634e-19) ≈ 4.993202e-3 m³/C
 */
export const DEFAULT_RH_MAGNITUDE_M3_PER_C =
  1 / (DEFAULT_CARRIER_DENSITY_M3 * ELEMENTARY_CHARGE_C);

/** Realistic measurement noise level (±1.5%) */
export const NOISE_PCT = 0.015;

/** Tolerance percentage for student verification (2%) */
export const MATH_TOLERANCE_PCT = 0.02;

// ─── Pure Calculation Functions ───────────────────────────────────────────────

/**
 * Convert magnetic field from kiloGauss to Tesla.
 */
export function kGToTesla(kG: number): number {
  if (kG < 0) return 0;
  return parseFloat((kG * TESLA_PER_KG).toFixed(4));
}

/**
 * Convert magnetic field from Tesla to kiloGauss.
 */
export function teslaToKG(tesla: number): number {
  if (tesla < 0) return 0;
  return parseFloat((tesla * KG_PER_TESLA).toFixed(2));
}

/**
 * Compute theoretical Hall coefficient R_H (m³/C) from carrier density and specimen type.
 * n-type: negative R_H
 * p-type: positive R_H
 */
export function computeTheoreticalRH(
  specimenType: SpecimenType,
  carrierDensity_m3: number = DEFAULT_CARRIER_DENSITY_M3
): number {
  if (carrierDensity_m3 <= 0) return 0;
  const magnitude = 1 / (carrierDensity_m3 * ELEMENTARY_CHARGE_C);
  return specimenType === 'n-type' ? -magnitude : magnitude;
}

/**
 * Compute transverse Hall voltage V_H in millivolts (mV).
 *
 * Formula:
 *   V_H (Volts) = (R_H · I · B) / t
 *   V_H (mV) = [ R_H (m³/C) · (I_mA · 10⁻³ A) · B_Tesla ] / (t_mm · 10⁻³ m) · 10³
 *            = [ R_H · I_mA · B_Tesla / t_mm ] · 10³
 *
 * @param rh_m3_per_C Hall coefficient in m³/C
 * @param currentI_mA Sample longitudinal current in mA
 * @param magneticFieldB_T Magnetic field in Tesla
 * @param thickness_mm Specimen thickness in mm
 * @returns Hall voltage in mV (guarded against division by zero)
 */
export function computeHallVoltage(
  rh_m3_per_C: number,
  currentI_mA: number,
  magneticFieldB_T: number,
  thickness_mm: number = DEFAULT_THICKNESS_MM
): number {
  if (thickness_mm <= 0 || currentI_mA === 0 || magneticFieldB_T === 0 || rh_m3_per_C === 0) {
    return 0;
  }

  const I_A = currentI_mA * 1e-3;
  const t_m = thickness_mm * 1e-3;
  const V_volts = (rh_m3_per_C * I_A * magneticFieldB_T) / t_m;

  return parseFloat((V_volts * 1e3).toFixed(3)); // mV
}

/**
 * Compute Hall coefficient R_H from measured parameters.
 *
 * Formula:
 *   R_H = (V_H · t) / (I · B)
 *
 * Units:
 *   V_H in mV -> V_H · 10⁻³ V
 *   t in mm -> t · 10⁻³ m
 *   I in mA -> I · 10⁻³ A
 *   B in Tesla -> B Tesla
 *   R_H = (V_H · 10⁻³ · t · 10⁻³) / (I · 10⁻³ · B) = [(V_H · t) / (I · B)] · 10⁻³ m³/C
 *
 * @returns R_H in m³/C, or null if division by zero
 */
export function computeRHFromMeasurements(
  vh_mV: number,
  currentI_mA: number,
  magneticFieldB_T: number,
  thickness_mm: number = DEFAULT_THICKNESS_MM
): number | null {
  if (currentI_mA === 0 || magneticFieldB_T === 0 || thickness_mm <= 0) {
    return null;
  }

  const I_A = currentI_mA * 1e-3;
  const t_m = thickness_mm * 1e-3;
  const V_V = vh_mV * 1e-3;

  const rh = (V_V * t_m) / (I_A * magneticFieldB_T);
  if (!isFinite(rh)) return null;
  return rh;
}

/**
 * Compute carrier density n (m⁻³) from Hall coefficient R_H (m³/C).
 *
 * Formula:
 *   n = 1 / (|R_H| · e)
 */
export function computeCarrierDensity(rh_m3_per_C: number): number | null {
  const absRH = Math.abs(rh_m3_per_C);
  if (absRH <= 1e-12 || !isFinite(absRH)) return null;
  const n = 1 / (absRH * ELEMENTARY_CHARGE_C);
  return isFinite(n) && n > 0 ? n : null;
}

/**
 * Compute carrier mobility μ (cm²/V·s) from Hall coefficient R_H and resistivity ρ.
 *
 * Formula:
 *   μ_SI = |R_H| / ρ_SI  [m²/(V·s)]
 *   where ρ_SI (Ω·m) = ρ (Ω·cm) · 10⁻²
 *   μ_cgs [cm²/(V·s)] = μ_SI · 10⁴ = (|R_H| · 10⁶) / ρ_ohm_cm
 */
export function computeCarrierMobility(
  rh_m3_per_C: number,
  resistivity_ohm_cm: number = DEFAULT_RESISTIVITY_OHM_CM
): number | null {
  const absRH = Math.abs(rh_m3_per_C);
  if (resistivity_ohm_cm <= 0 || absRH <= 1e-12 || !isFinite(absRH)) return null;

  const rho_SI = resistivity_ohm_cm * 1e-2; // Ω·m
  const mu_SI = absRH / rho_SI; // m²/(V·s)
  const mu_cm2_Vs = mu_SI * 1e4; // cm²/(V·s)

  return isFinite(mu_cm2_Vs) && mu_cm2_Vs > 0 ? parseFloat(mu_cm2_Vs.toFixed(1)) : null;
}

/**
 * Apply deterministic pseudo-random noise within ±NOISE_PCT for testing or interactive bench.
 */
export function applyLabNoise(value: number, seed?: number): number {
  if (value === 0) return 0;
  const factor = seed !== undefined
    ? 1 + ((Math.sin(seed * 997.3) + 1) / 2 * 2 - 1) * NOISE_PCT
    : 1 + (Math.random() * 2 - 1) * NOISE_PCT;
  return parseFloat((value * factor).toFixed(3));
}

/**
 * Compute live telemetry state for the virtual bench.
 */
export function computeHallBenchState(
  powerOn: boolean,
  specimenType: SpecimenType,
  currentI_mA: number,
  magneticFieldB_kG: number,
  thickness_mm: number = DEFAULT_THICKNESS_MM,
  resistivity_ohm_cm: number = DEFAULT_RESISTIVITY_OHM_CM,
  noiseOn: boolean = false
): HallEffectBenchState {
  const B_T = kGToTesla(magneticFieldB_kG);
  // In typical lab electromagnet, 1 A coil current yields ~1.2 kG (0.12 T)
  const electromagnetCurrent_A = parseFloat((magneticFieldB_kG / 1.2).toFixed(2));

  if (!powerOn) {
    return {
      powerOn: false,
      specimenType,
      currentI_mA: 0,
      magneticFieldB_kG: 0,
      magneticFieldB_T: 0,
      electromagnetCurrent_A: 0,
      thickness_mm,
      resistivity_ohm_cm,
      hallVoltage_mV: 0,
      idealHallVoltage_mV: 0,
      hallCoefficient_m3_per_C: 0,
      carrierDensity_m3: 0,
      carrierMobility_cm2_Vs: 0,
      noiseOn,
    };
  }

  const rh = computeTheoreticalRH(specimenType, DEFAULT_CARRIER_DENSITY_M3);
  const idealVh_mV = computeHallVoltage(rh, currentI_mA, B_T, thickness_mm);
  const vh_mV = noiseOn ? applyLabNoise(idealVh_mV) : idealVh_mV;
  const n = computeCarrierDensity(rh) ?? DEFAULT_CARRIER_DENSITY_M3;
  const mu = computeCarrierMobility(rh, resistivity_ohm_cm) ?? 0;

  return {
    powerOn: true,
    specimenType,
    currentI_mA,
    magneticFieldB_kG,
    magneticFieldB_T: B_T,
    electromagnetCurrent_A,
    thickness_mm,
    resistivity_ohm_cm,
    hallVoltage_mV: vh_mV,
    idealHallVoltage_mV: idealVh_mV,
    hallCoefficient_m3_per_C: rh,
    carrierDensity_m3: n,
    carrierMobility_cm2_Vs: mu,
    noiseOn,
  };
}

// ─── Verification & Math Checking Helper ──────────────────────────────────────

export interface VerificationResultItem {
  correct: boolean;
  expected: number;
  entered: number | null;
  message?: string;
}

export interface VerificationResult {
  rh: VerificationResultItem;
  n: VerificationResultItem;
  mobility: VerificationResultItem;
}

/**
 * Verify student hand-calculations against exact physics formulas with 2% tolerance.
 *
 * Expected units for student inputs:
 * - rh_student: R_H in 10⁻³ m³/C (e.g. -4.99 or 4.99)
 * - n_student: carrier density in 10²¹ m⁻³ (e.g. 1.25)
 * - mobility_student: mobility in cm²/V·s (e.g. 587.4)
 */
export function verifyHallObservation(
  specimenType: SpecimenType,
  vh_mV: number,
  currentI_mA: number,
  magneticFieldB_T: number,
  thickness_mm: number,
  resistivity_ohm_cm: number,
  studentInputs: {
    rh: string;
    n: string;
    mobility: string;
  }
): VerificationResult {
  // Expected RH in 10⁻³ m³/C
  const rawRH = computeRHFromMeasurements(vh_mV, currentI_mA, magneticFieldB_T, thickness_mm);
  const expectedRH_10minus3 = rawRH !== null ? rawRH * 1e3 : (specimenType === 'n-type' ? -5.0 : 5.0);

  // Expected carrier density in 10²¹ m⁻³
  const rawN = rawRH !== null ? computeCarrierDensity(rawRH) : DEFAULT_CARRIER_DENSITY_M3;
  const expectedN_10exp21 = rawN !== null ? rawN / 1e21 : 1.25;

  // Expected mobility in cm²/V·s
  const rawMu = rawRH !== null ? computeCarrierMobility(rawRH, resistivity_ohm_cm) : 587.4;
  const expectedMu = rawMu !== null ? rawMu : 587.4;

  const checkValue = (
    enteredStr: string,
    expected: number,
    allowSignFlip: boolean = false
  ): VerificationResultItem => {
    const trimmed = enteredStr.trim();
    if (!trimmed) {
      return { correct: false, expected, entered: null, message: 'Please enter a value' };
    }

    const val = parseFloat(trimmed);
    if (!isFinite(val)) {
      return { correct: false, expected, entered: null, message: 'Invalid number format' };
    }

    const diff = allowSignFlip
      ? Math.min(Math.abs(val - expected), Math.abs(val - Math.abs(expected)))
      : Math.abs(val - expected);

    const denom = Math.abs(expected) > 1e-6 ? Math.abs(expected) : 1;
    const isCorrect = diff / denom <= MATH_TOLERANCE_PCT;

    return {
      correct: isCorrect,
      expected: parseFloat(expected.toFixed(3)),
      entered: val,
      message: isCorrect
        ? 'Correct (within ±2%)'
        : `Expected ≈ ${expected.toFixed(2)}, entered ${val}`,
    };
  };

  return {
    rh: checkValue(studentInputs.rh, expectedRH_10minus3),
    n: checkValue(studentInputs.n, expectedN_10exp21),
    mobility: checkValue(studentInputs.mobility, expectedMu),
  };
}

// ─── Linear Regression Helper ─────────────────────────────────────────────────

export interface XYPoint {
  x: number;
  y: number;
}

/**
 * Best-fit linear regression y = m · x + c with R² calculation.
 * Guarded against N < 2 or zero variance in x.
 */
export function computeLinearRegression(points: XYPoint[]): {
  slope: number;
  intercept: number;
  r2: number;
} | null {
  if (points.length < 2) return null;

  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const { x, y } = points[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const denominator = n * sumX2 - sumX * sumX;
  if (Math.abs(denominator) < 1e-12) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Compute R²
  const meanY = sumY / n;
  let ssTot = 0;
  let ssRes = 0;

  for (let i = 0; i < n; i++) {
    const { x, y } = points[i];
    const yPred = slope * x + intercept;
    ssTot += (y - meanY) * (y - meanY);
    ssRes += (y - yPred) * (y - yPred);
  }

  const r2 = ssTot > 1e-12 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 1;

  return {
    slope: parseFloat(slope.toFixed(4)),
    intercept: parseFloat(intercept.toFixed(4)),
    r2: parseFloat(r2.toFixed(5)),
  };
}

/**
 * Compute Hall Effect regression analysis from observation table points.
 *
 * For V_H vs B plot (at constant current I):
 *   V_H = (R_H · I / t) · B
 *   Slope S_B = (R_H · I / t)
 *   R_H = (S_B · t) / I
 *
 * For V_H vs I plot (at constant field B):
 *   V_H = (R_H · B / t) · I
 *   Slope S_I = (R_H · B / t)
 *   R_H = (S_I · t) / B
 */
export function computeHallRegression(
  points: { x: number; y: number }[],
  mode: 'Vh_vs_B' | 'Vh_vs_I',
  constantParam: number, // If Vh_vs_B: constant I in mA; if Vh_vs_I: constant B in T
  thickness_mm: number = DEFAULT_THICKNESS_MM
): HallRegressionResult | null {
  const reg = computeLinearRegression(points);
  if (!reg) return null;

  const t_m = thickness_mm * 1e-3;
  let rh_m3_per_C = 0;

  if (mode === 'Vh_vs_B') {
    // slope is in mV / T
    // S_B (V/T) = slope · 10⁻³
    // I_A = constantParam (mA) · 10⁻³
    // R_H = (S_B · t) / I = (slope · 10⁻³ · t_m) / (constantParam · 10⁻³) = (slope · t_m) / constantParam
    const slope_V_per_T = reg.slope * 1e-3;
    const I_A = constantParam * 1e-3;
    if (I_A > 0) {
      rh_m3_per_C = (slope_V_per_T * t_m) / I_A;
    }
  } else {
    // slope is in mV / mA = V / A
    // S_I = slope
    // B_T = constantParam
    // R_H = (S_I · t) / B = (slope · t_m) / constantParam
    const slope_V_per_A = reg.slope;
    const B_T = constantParam;
    if (B_T > 0) {
      rh_m3_per_C = (slope_V_per_A * t_m) / B_T;
    }
  }

  const carrierType: SpecimenType = rh_m3_per_C < 0 ? 'n-type' : 'p-type';
  const carrierDensity = computeCarrierDensity(rh_m3_per_C) ?? 0;

  // Verified if R² >= 0.98 and carrier density within physical order of magnitude for Germanium (10²⁰–10²² m⁻³)
  const verified = reg.r2 >= 0.98 && carrierDensity >= 1e20 && carrierDensity <= 1e22;

  return {
    slope: reg.slope,
    intercept: reg.intercept,
    r2: reg.r2,
    extractedRH_m3_per_C: rh_m3_per_C,
    extractedCarrierDensity_m3: carrierDensity,
    carrierType,
    verified,
  };
}
