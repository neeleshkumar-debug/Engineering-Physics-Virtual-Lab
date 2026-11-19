// ─── physicsEngine.ts — Energy Band Gap (Four-Probe Method) ───────────────────
// Pure functions only. No React imports. Fully unit-testable.
//
// Physics guarantee:
//   Resistivity: ρ = (π · w / ln 2) · (V / I)  for thin slice (w ≪ s)
//   Intrinsic conductivity: ρ(T) = ρ₀ · exp(Eg / (2 · k · T))
//   log₁₀(ρ) = log₁₀(ρ₀) + [Eg / (2 · 2.3026 · k · 1000)] · (1000 / T)
//   Slope m = Eg / (2 · 2.3026 · k · 1000)
//   Eg (eV) = 2 · 2.302585 · k · 1000 · slope
// Target Germanium band gap: Eg ≈ 0.67 eV

import type { FourProbeBenchState, FourProbeRegressionResult } from './types';

// ─── Physical Constants ────────────────────────────────────────────────────────

/** Distance between adjacent collinear probe tips (cm) */
export const PROBE_SPACING_S = 0.2; // 2.0 mm

/** Thickness of the Germanium crystal slice (cm) */
export const CRYSTAL_THICKNESS_W = 0.05; // 0.5 mm

/** Target energy band gap for Germanium crystal at 300 K (eV) */
export const EG_GE_TARGET = 0.67;

/** Boltzmann constant in eV/K */
export const KB_EV = 8.617333262e-5;

/** Boltzmann constant in J/K */
export const KB_J = 1.380649e-23;

/** Room reference temperature (K) */
export const T_REF_K = 300.0; // ~26.85 °C

/** Nominal room temperature resistivity for Germanium at 300 K (Ω·cm) */
export const RHO_REF_300K = 45.0;

/** Measurement noise percentage for realistic lab mode (±1.5%) */
export const NOISE_PCT = 0.015;

/** Minimum allowed bench oven temperature (°C) */
export const T_MIN_C = 30;

/** Maximum allowed bench oven temperature (°C) */
export const T_MAX_C = 160;

/** Constant current limits (mA) */
export const I_MIN_MA = 1.0;
export const I_MAX_MA = 5.0;
export const I_DEFAULT_MA = 3.0;

/**
 * Geometric correction factor multiplier for thin crystal slice on mica:
 * C = (π · w) / ln(2)
 *
 * For w = 0.05 cm: C ≈ 0.226618007 cm
 * When V is in mV and I is in mA:
 *   V / I is in Ω, so ρ = C · (V / I) is directly in Ω·cm.
 */
export const THIN_SLICE_FACTOR = (Math.PI * CRYSTAL_THICKNESS_W) / Math.LN2;

/**
 * Theoretical slope constant:
 * slope_factor = 2 · 2.302585093 · KB_EV · 1000 ≈ 0.39686006
 * Eg (eV) = slope_factor · slope
 * slope = Eg / slope_factor
 */
export const SLOPE_FACTOR = 2 * Math.LN10 * KB_EV * 1000;

/** Ideal slope for standard Germanium (Eg = 0.67 eV) */
export const IDEAL_SLOPE_GE = EG_GE_TARGET / SLOPE_FACTOR; // ~1.68825

// ─── Core Mathematical / Physics Functions ────────────────────────────────────

/**
 * Convert Celsius to Kelvin.
 * Guarded against unphysical values below absolute zero.
 */
export function computeKelvin(tempC: number): number {
  if (tempC < -273.15) return 0;
  return parseFloat((tempC + 273.15).toFixed(2));
}

/**
 * Compute 1000 / T (K⁻¹).
 * Guarded against T ≤ 0.
 */
export function computeThousandOverT(tempK: number): number | null {
  if (tempK <= 0) return null;
  return 1000 / tempK;
}

/**
 * Compute the geometric correction factor G7(w/s) for thin slice approximation:
 * G7(w/s) = (2 · s / w) · ln(2)
 */
export function computeG7Correction(s: number = PROBE_SPACING_S, w: number = CRYSTAL_THICKNESS_W): number {
  if (s <= 0 || w <= 0) return 0;
  return (2 * s / w) * Math.LN2;
}

/**
 * Compute semi-infinite bulk resistivity ρ₀ = (V / I) · 2πs
 * Guarded: returns 0 if I ≤ 0 or s ≤ 0.
 */
export function computeBulkResistivity(V_mV: number, I_mA: number, s: number = PROBE_SPACING_S): number {
  if (I_mA <= 0 || s <= 0 || V_mV < 0) return 0;
  // (V_mV / I_mA) is Ω. s is in cm. ρ0 is in Ω·cm.
  return (V_mV / I_mA) * (2 * Math.PI * s);
}

/**
 * Compute sample resistivity ρ (Ω·cm) for thin slice:
 * ρ = ρ₀ / G7(w/s) = [(π · w) / ln(2)] · (V / I)
 *
 * Guarded: returns null if I ≤ 0, V < 0, w ≤ 0, or s ≤ 0.
 */
export function computeResistivity(
  V_mV: number,
  I_mA: number,
  w: number = CRYSTAL_THICKNESS_W,
  _s: number = PROBE_SPACING_S
): number | null {
  if (I_mA <= 0 || V_mV < 0 || w <= 0) return null;
  const factor = (Math.PI * w) / Math.LN2;
  return factor * (V_mV / I_mA);
}

/**
 * Compute log₁₀(ρ).
 * Guarded: returns null if ρ ≤ 0.
 */
export function computeLog10Rho(rho: number): number | null {
  if (rho <= 0) return null;
  return Math.log10(rho);
}

/**
 * Compute natural log ln(ρ).
 * Guarded: returns null if ρ ≤ 0.
 */
export function computeLnRho(rho: number): number | null {
  if (rho <= 0) return null;
  return Math.log(rho);
}

/**
 * Intrinsic semiconductor resistivity model for Germanium:
 *   ρ(T) = ρ(T_ref) · exp[ (Eg / 2k) · (1/T - 1/T_ref) ]
 *
 * This produces an exact theoretical band gap Eg = 0.67 eV
 * when fitted to log₁₀(ρ) vs 1000/T.
 * Guarded: returns 0 if tempK ≤ 0.
 */
export function computeGeResistivity(
  tempK: number,
  eg_eV: number = EG_GE_TARGET,
  rho_ref: number = RHO_REF_300K,
  t_ref_k: number = T_REF_K
): number {
  if (tempK <= 0) return 0;
  // exponent = (Eg / (2 * kB)) * (1/T - 1/T_ref)
  const eg_over_2k = eg_eV / (2 * KB_EV);
  const diff_inv_t = (1 / tempK) - (1 / t_ref_k);
  const exponent = eg_over_2k * diff_inv_t;
  return rho_ref * Math.exp(exponent);
}

/**
 * Compute ideal potential drop V (mV) across inner voltage probes 2 & 3:
 * V = I · ρ / [ (π · w) / ln(2) ]
 *
 * Guarded: returns 0 if I ≤ 0 or tempK ≤ 0.
 */
export function computeIdealVoltage(
  tempK: number,
  I_mA: number,
  w: number = CRYSTAL_THICKNESS_W
): number {
  if (tempK <= 0 || I_mA <= 0 || w <= 0) return 0;
  const rho = computeGeResistivity(tempK);
  const factor = (Math.PI * w) / Math.LN2;
  return (rho * I_mA) / factor;
}

/**
 * Apply deterministic or pseudo-random noise within ±NOISE_PCT (±1.5%)
 */
export function applyNoise(value: number, noisePct: number = NOISE_PCT): number {
  if (value === 0) return 0;
  // Box-Muller or uniform spread within ±noisePct
  const delta = (Math.random() * 2 - 1) * noisePct;
  return value * (1 + delta);
}

// ─── Bench Simulation State Generator ─────────────────────────────────────────

/**
 * Computes complete live telemetry state of the Four-Probe virtual bench.
 */
export function computeFourProbeState(
  powerOn: boolean,
  targetTempC: number,
  currentTempC: number,
  I_mA: number,
  voltmeterRange: 'x1' | 'x10',
  noiseOn: boolean,
  w: number = CRYSTAL_THICKNESS_W
): FourProbeBenchState {
  if (!powerOn) {
    return {
      powerOn: false,
      targetTempC,
      currentTempC,
      currentTempK: computeKelvin(currentTempC),
      invT: computeThousandOverT(computeKelvin(currentTempC)) ?? 0,
      I_mA: 0,
      V_mV: 0,
      rho: 0,
      log10Rho: 0,
      voltmeterRange,
      isOverRange: false,
      displayVoltageText: '000.0',
      isHeating: false,
    };
  }

  // Guard clamped current
  const clampedI = Math.max(0, Math.min(6.0, I_mA));
  const tempK = computeKelvin(currentTempC);
  const invT = computeThousandOverT(tempK) ?? 0;

  // Compute theoretical resistivity and voltage
  const pureRho = computeGeResistivity(tempK);
  let pureV = computeIdealVoltage(tempK, clampedI, w);

  if (noiseOn && pureV > 0) {
    pureV = applyNoise(pureV, NOISE_PCT);
  }

  // Back-compute actual measured rho from (V / I)
  const measuredRho = computeResistivity(pureV, clampedI, w) ?? pureRho;
  const log10Rho = computeLog10Rho(measuredRho) ?? 0;

  // Format voltmeter readout according to range
  // Range x1: max 199.9 mV
  // Range x10: max 1999 mV
  let isOverRange = false;
  let displayVoltageText = '0.0';

  if (voltmeterRange === 'x1') {
    if (pureV > 199.9) {
      isOverRange = true;
      displayVoltageText = '1 .   '; // Classic 3.5-digit DVM overflow symbol
    } else {
      displayVoltageText = pureV.toFixed(1);
    }
  } else {
    // x10 range
    if (pureV > 1999) {
      isOverRange = true;
      displayVoltageText = '1 .   ';
    } else {
      displayVoltageText = pureV.toFixed(0);
    }
  }

  const isHeating = targetTempC > currentTempC + 0.2;

  return {
    powerOn: true,
    targetTempC,
    currentTempC,
    currentTempK: tempK,
    invT,
    I_mA: clampedI,
    V_mV: pureV,
    rho: measuredRho,
    log10Rho,
    voltmeterRange,
    isOverRange,
    displayVoltageText,
    isHeating,
  };
}

// ─── Linear Regression & Band Gap Calculation ─────────────────────────────────

export interface RegressionPoint {
  x: number; // 1000 / T (K^-1)
  y: number; // log10(ρ)
}

/**
 * Compute linear regression: y = slope · x + intercept
 * and deduce Germanium band gap Eg:
 *   Eg (eV) = 2 · 2.302585 · k · 1000 · slope = SLOPE_FACTOR · slope
 *
 * Guarded against:
 *  - fewer than 2 points
 *  - collinear degenerate x values (variance < 1e-12)
 */
export function computeFourProbeRegression(
  points: RegressionPoint[]
): FourProbeRegressionResult | null {
  if (!points || points.length < 2) return null;

  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < n; i++) {
    sumX += points[i].x;
    sumY += points[i].y;
  }
  const meanX = sumX / n;
  const meanY = sumY / n;

  let ssXX = 0;
  let ssXY = 0;
  let ssYY = 0;

  for (let i = 0; i < n; i++) {
    const dx = points[i].x - meanX;
    const dy = points[i].y - meanY;
    ssXX += dx * dx;
    ssXY += dx * dy;
    ssYY += dy * dy;
  }

  // Guard against degenerate vertical line or identical x coordinates
  if (ssXX < 1e-12) return null;

  const slope = ssXY / ssXX;
  const intercept = meanY - slope * meanX;

  // Coefficient of determination R^2
  let r2 = 1.0;
  if (ssYY > 1e-12) {
    r2 = (ssXY * ssXY) / (ssXX * ssYY);
    r2 = Math.min(1.0, Math.max(0.0, r2));
  }

  // Energy Band Gap in eV:
  // Eg = 2 · 2.302585093 · k · 1000 · slope
  const eg_eV = slope * SLOPE_FACTOR;

  // Percentage error relative to standard Germanium band gap (0.67 eV)
  const percentError = Math.abs((eg_eV - EG_GE_TARGET) / EG_GE_TARGET) * 100;

  // Verified if Eg is within reasonable experimental range [0.60, 0.74] eV
  const verified = eg_eV >= 0.60 && eg_eV <= 0.74;

  return {
    slope,
    intercept,
    r2,
    eg_eV,
    percentError,
    verified,
  };
}

// ─── Active Learning: Student Math Verification (2% Tolerance) ────────────────

export interface StudentFourProbeInputs {
  tempK: string;
  invT: string;
  rho: string;
  logRho: string;
}

export interface VerificationFieldResult {
  correct: boolean;
  expected: number;
  entered: number | null;
  tolerancePct: number;
  hint: string;
}

export interface FourProbeVerificationResult {
  tempK: VerificationFieldResult;
  invT: VerificationFieldResult;
  rho: VerificationFieldResult;
  logRho: VerificationFieldResult;
  allCorrect: boolean;
}

/**
 * Verify student's hand calculations with 2% tolerance.
 * Provides formula hints when wrong.
 */
export function verifyFourProbeObservation(
  tempC: number,
  I_mA: number,
  V_mV: number,
  student: StudentFourProbeInputs,
  w: number = CRYSTAL_THICKNESS_W
): FourProbeVerificationResult {
  const TOLERANCE_PCT = 0.02; // 2%

  // 1. Expected Temperature in K: T_K = T_C + 273.15
  const expectedTempK = tempC + 273.15;
  const enteredTempK = parseFloat(student.tempK);
  const tempKDiff = Math.abs(enteredTempK - expectedTempK);
  // Allow either 2% or ±0.5 K difference for rounding (e.g. 273 vs 273.15)
  const tempKCorrect =
    !isNaN(enteredTempK) && (tempKDiff / expectedTempK <= TOLERANCE_PCT || tempKDiff <= 0.5);

  // 2. Expected 1000 / T (K^-1)
  const expectedInvT = 1000 / expectedTempK;
  const enteredInvT = parseFloat(student.invT);
  const invTCorrect =
    !isNaN(enteredInvT) &&
    Math.abs(enteredInvT - expectedInvT) / expectedInvT <= TOLERANCE_PCT;

  // 3. Expected Resistivity ρ = (π · w / ln 2) · (V / I)
  const factor = (Math.PI * w) / Math.LN2;
  const expectedRho = I_mA > 0 ? factor * (V_mV / I_mA) : 0;
  const enteredRho = parseFloat(student.rho);
  const rhoCorrect =
    !isNaN(enteredRho) &&
    expectedRho > 0 &&
    Math.abs(enteredRho - expectedRho) / expectedRho <= TOLERANCE_PCT;

  // 4. Expected log10(ρ)
  const expectedLogRho = expectedRho > 0 ? Math.log10(expectedRho) : 0;
  const enteredLogRho = parseFloat(student.logRho);
  // On log scale, allow absolute delta of 0.05 or 2%
  const logRhoDiff = Math.abs(enteredLogRho - expectedLogRho);
  const logRhoCorrect =
    !isNaN(enteredLogRho) &&
    (logRhoDiff <= 0.05 || (expectedLogRho !== 0 && logRhoDiff / Math.abs(expectedLogRho) <= TOLERANCE_PCT));

  return {
    tempK: {
      correct: tempKCorrect,
      expected: parseFloat(expectedTempK.toFixed(2)),
      entered: isNaN(enteredTempK) ? null : enteredTempK,
      tolerancePct: 2,
      hint: `Formula: T (K) = T (°C) + 273.15 = ${tempC} + 273.15 = ${expectedTempK.toFixed(2)} K`,
    },
    invT: {
      correct: invTCorrect,
      expected: parseFloat(expectedInvT.toFixed(3)),
      entered: isNaN(enteredInvT) ? null : enteredInvT,
      tolerancePct: 2,
      hint: `Formula: 1000 / T (K⁻¹) = 1000 / ${expectedTempK.toFixed(2)} = ${expectedInvT.toFixed(3)}`,
    },
    rho: {
      correct: rhoCorrect,
      expected: parseFloat(expectedRho.toFixed(3)),
      entered: isNaN(enteredRho) ? null : enteredRho,
      tolerancePct: 2,
      hint: `Formula: ρ = (π·w / ln 2) · (V / I) = (0.2266) · (${V_mV.toFixed(1)} / ${I_mA.toFixed(1)}) = ${expectedRho.toFixed(3)} Ω·cm`,
    },
    logRho: {
      correct: logRhoCorrect,
      expected: parseFloat(expectedLogRho.toFixed(4)),
      entered: isNaN(enteredLogRho) ? null : enteredLogRho,
      tolerancePct: 2,
      hint: `Formula: log₁₀(ρ) = log₁₀(${expectedRho.toFixed(3)}) = ${expectedLogRho.toFixed(4)}`,
    },
    allCorrect: tempKCorrect && invTCorrect && rhoCorrect && logRhoCorrect,
  };
}
