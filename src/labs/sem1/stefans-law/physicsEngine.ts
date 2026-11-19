// ─── physicsEngine.ts — Stefan's Law Experiment ───────────────────────────────
// Pure functions only. No React imports. Fully unit-testable.
//
// Physics guarantee: P = σ_eff × T^4 (Stefan's law, exact).
// σ_eff is calibrated so that at T_SIM_MAX, V = V_MAX = 6 V.
// This ensures log₁₀(P) vs log₁₀(T) has slope = 4.0 (ideal) or 3.85–4.15 (with noise).
//
// All temperature values are in Kelvin.
// All resistance values are in Ohms.
// All voltage/current/power values are in SI units (V, A, W).

// ─── Physical Constants ────────────────────────────────────────────────────────

/** Draper point: temperature at which tungsten just begins to glow (dull red), K */
export const T_DRAPER = 800;

/** Empirical tungsten resistance ratio at the Draper point: R(800K) / R(273K) */
export const R_RATIO_DRAPER = 3.9;

/**
 * Lab-manual linear fit coefficients for tungsten:
 *   T (K) = TUNGSTEN_A × (Rₜ / R₀) + TUNGSTEN_B
 * Inverse:
 *   Rₜ / R₀ = (T − TUNGSTEN_B) / TUNGSTEN_A
 */
export const TUNGSTEN_A = 157.12;
export const TUNGSTEN_B = 167.33;

/** Power supply maximum voltage (V) */
export const V_MAX = 6.0;

/** Noise percentage for realistic lab mode (±1.5%) */
export const NOISE_PCT = 0.015;

/** Minimum simulated filament temperature (slider > 0, power ON), K */
export const T_SIM_MIN = 600;

/** Maximum simulated filament temperature (slider = 100%), K.
 *  Calibrated so that at this temperature V = V_MAX. */
export const T_SIM_MAX = 2500;

/** Default cold resistance R₀ at 273 K, Ω.  Typical range 1.2–2.2 Ω. */
export const R0_DEFAULT = 1.4;

// ─── Calibration ──────────────────────────────────────────────────────────────

/**
 * Compute the effective Stefan constant σ_eff such that at T = T_SIM_MAX,
 * the filament dissipates exactly P = V_MAX² / Rₜ(T_SIM_MAX).
 *
 * This ensures P = σ_eff × T^4 at every temperature, so the
 * log₁₀(P) vs log₁₀(T) graph has slope = 4.0 by design.
 *
 * σ_eff = V_MAX² / (Rₜ_max × T_SIM_MAX^4)
 */
export function computeSigmaEff(R0: number): number {
  const ratio  = (T_SIM_MAX - TUNGSTEN_B) / TUNGSTEN_A;   // Rₜ_max / R₀
  const Rt_max = R0 * ratio;                               // Rₜ at T_SIM_MAX
  const P_max  = (V_MAX * V_MAX) / Rt_max;                 // P at V = V_MAX
  return P_max / Math.pow(T_SIM_MAX, 4);                   // σ_eff
}

// ─── Lab-Manual Formula Functions ─────────────────────────────────────────────

/**
 * Rg = Vg / Ig
 * Resistance of the filament at the just-glowing (Draper) point, Ω.
 */
export function computeRg(Vg: number, Ig: number): number {
  if (Ig <= 0) return 0;
  return Vg / Ig;
}

/**
 * R₀ = Rg / 3.9
 * Cold resistance at 273 K derived from Draper-point measurement, Ω.
 */
export function computeR0(Rg: number): number {
  return Rg / R_RATIO_DRAPER;
}

/**
 * Rₜ = V / I
 * Filament resistance at any operating point, Ω.
 * Returns null when I ≤ 0 (guarded — no division-by-zero).
 */
export function computeRt(V: number, I: number): number | null {
  if (I <= 0) return null;
  return V / I;
}

/**
 * P = V × I
 * Power dissipated by the filament, W.
 */
export function computePower(V: number, I: number): number {
  return V * I;
}

/**
 * T = 157.12 × (Rₜ / R₀) + 167.33
 * Filament temperature derived from resistance ratio, K.
 * This is the standard linear tungsten fit from the lab manual.
 */
export function computeTemperature(Rt: number, R0: number): number {
  if (R0 <= 0) return 0;
  return TUNGSTEN_A * (Rt / R0) + TUNGSTEN_B;
}

/**
 * log₁₀(P)
 * Returns null when P ≤ 0 (guarded — avoids log(0) or log(negative)).
 */
export function computeLogP(P: number): number | null {
  if (P <= 0) return null;
  return Math.log10(P);
}

/**
 * log₁₀(T)
 * Returns null when T ≤ 0 (guarded).
 */
export function computeLogT(T: number): number | null {
  if (T <= 0) return null;
  return Math.log10(T);
}

// ─── Full Filament State ───────────────────────────────────────────────────────

export interface FilamentState {
  V: number;              // Measured voltage (V)
  I: number;              // Measured current (A)
  Rt: number;             // Measured resistance Rₜ = V/I (Ω)
  R0: number;             // Session-fixed cold resistance (Ω)
  P: number;              // Dissipated power P = V×I (W)
  T: number;              // Physics temperature from slider map (K)
  logP: number | null;    // log₁₀(P)
  logT: number | null;    // log₁₀(T)
  bulbColor: string;      // CSS color of glow
  glowIntensity: number;  // 0–1 for canvas rendering
}

/**
 * Master simulation function: slider position → all derived physical quantities.
 *
 * Physics pipeline:
 *   1. slider [0–100] → T ∈ [T_SIM_MIN, T_SIM_MAX]  (nonlinear map)
 *   2. P = σ_eff × T^4                                (Stefan's law, exact)
 *   3. Rₜ = R₀ × (T − B) / A                         (lab-manual formula, inverted)
 *   4. V = √(P × Rₜ),  I = √(P / Rₜ)                (Ohm's law consistent with P and Rₜ)
 *   5. Optional ±1.5% noise on V and I                (realistic mode)
 *
 * @param sliderPct — rheostat slider position, 0–100 (percent)
 * @param powerOn   — whether the power supply is ON
 * @param R0        — session cold resistance (Ω)
 * @param noiseOn   — inject ±1.5% random measurement noise
 */
export function computeFilamentState(
  sliderPct: number,
  powerOn: boolean,
  R0: number,
  noiseOn: boolean,
): FilamentState {
  if (!powerOn || sliderPct <= 0) {
    return {
      V: 0, I: 0, Rt: R0, R0, P: 0, T: 300,
      logP: null, logT: null,
      bulbColor: getBulbColor(300),
      glowIntensity: 0,
    };
  }

  const s = Math.max(0.01, Math.min(100, sliderPct));

  // Nonlinear slider → temperature mapping.
  // Exponent 0.6 gives finer resolution at low temperatures (more data spread).
  const T = T_SIM_MIN + (T_SIM_MAX - T_SIM_MIN) * Math.pow(s / 100, 0.6);

  // Exact Stefan's law power (guarantees slope = 4 on log-log plot)
  const sigmaEff = computeSigmaEff(R0);
  const P_exact  = sigmaEff * Math.pow(T, 4);

  // Resistance from inverted lab formula: Rₜ = R₀ × (T − B) / A
  const Rt_exact = R0 * (T - TUNGSTEN_B) / TUNGSTEN_A;

  // V and I consistent with P and Rₜ via Ohm's law: P = V² / Rₜ = I² × Rₜ
  const V_exact = Math.sqrt(P_exact * Rt_exact);
  const I_exact = Math.sqrt(P_exact / Rt_exact);

  // Apply realistic measurement noise
  const V  = noiseOn ? applyNoise(V_exact, NOISE_PCT)  : V_exact;
  const I  = noiseOn ? applyNoise(I_exact, NOISE_PCT)  : I_exact;

  // Measured resistance and power (what instruments would display)
  const Rt = I > 0 ? V / I : Rt_exact;
  const P  = V * I;

  return {
    V:  Math.max(0, V),
    I:  Math.max(0, I),
    Rt: Math.max(0, Rt),
    R0,
    P:  Math.max(0, P),
    T,
    logP: computeLogP(P),
    logT: computeLogT(T),
    bulbColor:     getBulbColor(T),
    glowIntensity: computeGlowIntensity(T),
  };
}

// ─── Noise ────────────────────────────────────────────────────────────────────

/**
 * Apply ±pct random noise to simulate instrument measurement error.
 * Models realistic DC voltmeter / ammeter accuracy class 1.5.
 */
export function applyNoise(value: number, pct: number): number {
  const noise = 1 + (Math.random() * 2 - 1) * pct;
  return value * noise;
}

// ─── Bulb Glow ────────────────────────────────────────────────────────────────

/**
 * Map filament temperature to a CSS RGB color string
 * modelling visible tungsten black-body radiation.
 *
 * Colour progression (Kelvin → visible colour):
 *   < 600  : Dark / off
 *   600–800: Dull red-hot (Draper point at 800 K)
 *   800–1200: Bright red to orange
 *  1200–1800: Orange to yellow
 *  1800–2200: Yellow to warm white
 *  2200–2600: Warm white to white
 *   > 2600: Bright white
 */
export function getBulbColor(T: number): string {
  if (T < 600)   return '#1a1208';
  if (T < 800)   return lerpHex('#1a1208', '#8B1200', (T - 600)  / 200);
  if (T < 1200)  return lerpHex('#8B1200', '#FF4500', (T - 800)  / 400);
  if (T < 1800)  return lerpHex('#FF4500', '#FFA500', (T - 1200) / 600);
  if (T < 2200)  return lerpHex('#FFA500', '#FFE066', (T - 1800) / 400);
  if (T < 2600)  return lerpHex('#FFE066', '#FFF5D6', (T - 2200) / 400);
  return '#FFFFFF';
}

/** Glow intensity 0–1 for canvas rendering. 0 = no glow, 1 = maximum bloom. */
export function computeGlowIntensity(T: number): number {
  if (T < 600)  return 0;
  if (T > 2600) return 1;
  return (T - 600) / (2600 - 600);
}

/** Linear interpolation between two hex colours. */
function lerpHex(hex1: string, hex2: string, t: number): string {
  const t_ = Math.max(0, Math.min(1, t));
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  const r  = Math.round(r1 + (r2 - r1) * t_);
  const g  = Math.round(g1 + (g2 - g1) * t_);
  const b  = Math.round(b1 + (b2 - b1) * t_);
  return `rgb(${r},${g},${b})`;
}

// ─── Linear Regression ────────────────────────────────────────────────────────

export interface RegressionResult {
  slope: number;      // Stefan exponent n (should be ≈ 4)
  intercept: number;  // log₁₀(C) where C = σ_eff × emissivity × area
  r2: number;         // Coefficient of determination (goodness of fit)
  verified: boolean;  // true when 3.5 ≤ slope ≤ 4.5
}

/**
 * Least-squares linear regression on {x, y} pairs.
 * Used to compute slope n from log₁₀(P) vs log₁₀(T) data.
 * Returns null if fewer than 2 points are provided.
 */
export function computeLinearRegression(
  points: { x: number; y: number }[],
): RegressionResult | null {
  const n = points.length;
  if (n < 2) return null;

  const sumX  = points.reduce((s, p) => s + p.x,       0);
  const sumY  = points.reduce((s, p) => s + p.y,       0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-10) return null;

  const slope     = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R² = 1 − SS_res / SS_tot
  const yMean = sumY / n;
  const ssTot = points.reduce((s, p) => s + Math.pow(p.y - yMean, 2), 0);
  const ssRes = points.reduce((s, p) => {
    return s + Math.pow(p.y - (slope * p.x + intercept), 2);
  }, 0);
  const r2 = ssTot < 1e-10 ? 1 : 1 - ssRes / ssTot;

  return { slope, intercept, r2, verified: slope >= 3.5 && slope <= 4.5 };
}

// ─── Observation Table Verifier ───────────────────────────────────────────────

export interface VerificationResult {
  Rt:   { correct: boolean; expected: number };
  P:    { correct: boolean; expected: number };
  RtR0: { correct: boolean; expected: number };
  T:    { correct: boolean; expected: number };
  logP: { correct: boolean; expected: number | null };
  logT: { correct: boolean; expected: number | null };
}

/** Tolerance: 2% (approved). Accepts calculator rounding to 2 decimal places. */
const VERIFY_TOLERANCE = 0.02;

/**
 * Verify student's hand-calculated values against the physics engine.
 *
 * For each editable cell, compares the student's string input to the
 * correct value with a 2% relative tolerance.
 * Returns per-cell pass/fail and the expected value (for formula hints).
 */
export function verifyObservation(
  V: number,
  I: number,
  R0: number,
  student: {
    Rt: string; P: string; RtR0: string;
    T: string; logP: string; logT: string;
  },
): VerificationResult {
  const Rt_correct   = I > 0 ? V / I : 0;
  const P_correct    = V * I;
  const RtR0_correct = R0 > 0 ? Rt_correct / R0 : 0;
  const T_correct    = computeTemperature(Rt_correct, R0);
  const logP_correct = computeLogP(P_correct);
  const logT_correct = computeLogT(T_correct);

  function check(studentStr: string, expected: number | null): boolean {
    if (expected === null) return false;
    const val = parseFloat(studentStr.trim());
    if (!isFinite(val)) return false;
    // Guard against division by near-zero expected
    const denom = Math.abs(expected) < 1e-10 ? 1e-10 : Math.abs(expected);
    return Math.abs(val - expected) / denom <= VERIFY_TOLERANCE;
  }

  return {
    Rt:   { correct: check(student.Rt,   Rt_correct),   expected: Rt_correct },
    P:    { correct: check(student.P,    P_correct),    expected: P_correct },
    RtR0: { correct: check(student.RtR0, RtR0_correct), expected: RtR0_correct },
    T:    { correct: check(student.T,    T_correct),    expected: T_correct },
    logP: { correct: check(student.logP, logP_correct), expected: logP_correct },
    logT: { correct: check(student.logT, logT_correct), expected: logT_correct },
  };
}
