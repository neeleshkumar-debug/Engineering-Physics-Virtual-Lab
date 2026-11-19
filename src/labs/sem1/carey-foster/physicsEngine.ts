// ─── Carey Foster's Bridge Physics Engine ──────────────────────────────────────
// High-precision mathematical models for Carey Foster's Bridge experiment:
// 1. Wheatstone bridge null condition with contact end-corrections α & β
// 2. Resistance per unit length calibration: ρ_w = X / (l_2 - l_1)
// 3. Unknown resistance calculation: Y = X - ρ_w * (l_2' - l_1')
// 4. Specific resistance / resistivity: ρ = (Y * π * r²) / L
// 5. Galvanometer deflection & null detection model
// 6. Screw gauge micro-measurements & 2% tolerance student verification

import type {
  CareyFosterBenchState,
  ExperimentPart,
  GapConfig,
  PartARow,
  PartBRow,
  ScrewGaugeStudentState,
  WireSpecimen,
} from './types';

// Standard bridge wire calibration constants
export const DEFAULT_RHO_W = 0.0350; // Bridge wire resistance per unit length (Ohm/cm)
export const DEFAULT_ALPHA = 0.05;   // Left strip contact resistance end-error (Ohm)
export const DEFAULT_BETA = 0.08;    // Right strip contact resistance end-error (Ohm)
export const DEFAULT_RATIO_P = 2.0;  // Standard ratio arm P (Ohm)
export const DEFAULT_RATIO_Q = 2.0;  // Standard ratio arm Q (Ohm)

// Documented standard laboratory wire specimens
export const WIRE_SPECIMENS: Record<string, WireSpecimen> = {
  constantan: {
    id: 'constantan',
    name: 'Constantan (Eureka)',
    material: 'Constantan alloy (55% Cu, 45% Ni)',
    lengthCm: 60.0,
    diameterMm: 0.60,
    resistivityOhmM: 4.90e-7,
    nominalResistanceOhm: 1.040, // (4.90e-7 * 0.60) / (pi * (0.0003)^2) = 1.0398 Ohm
    screwGauge: {
      pitchMm: 0.5,
      divisions: 50,
      leastCountMm: 0.01,
      msrMm: 0.5,
      csrDiv: 10,
      zeroErrorMm: 0.0,
    },
  },
  nichrome: {
    id: 'nichrome',
    name: 'Nichrome',
    material: 'Nichrome alloy (80% Ni, 20% Cr)',
    lengthCm: 50.0,
    diameterMm: 0.80,
    resistivityOhmM: 1.10e-6,
    nominalResistanceOhm: 1.094, // (1.10e-6 * 0.50) / (pi * (0.0004)^2) = 1.0941 Ohm
    screwGauge: {
      pitchMm: 0.5,
      divisions: 50,
      leastCountMm: 0.01,
      msrMm: 0.5,
      csrDiv: 30,
      zeroErrorMm: 0.0,
    },
  },
  manganin: {
    id: 'manganin',
    name: 'Manganin',
    material: 'Manganin alloy (84% Cu, 12% Mn, 4% Ni)',
    lengthCm: 80.0,
    diameterMm: 0.65,
    resistivityOhmM: 4.82e-7,
    nominalResistanceOhm: 1.162, // (4.82e-7 * 0.80) / (pi * (0.000325)^2) = 1.1620 Ohm
    screwGauge: {
      pitchMm: 0.5,
      divisions: 50,
      leastCountMm: 0.01,
      msrMm: 0.5,
      csrDiv: 15,
      zeroErrorMm: 0.0,
    },
  },
  cuni: {
    id: 'cuni',
    name: 'Cu-Ni Alloy (Thin)',
    material: 'Copper-Nickel alloy (Cu-Ni)',
    lengthCm: 45.0,
    diameterMm: 0.50,
    resistivityOhmM: 3.50e-7,
    nominalResistanceOhm: 0.802, // (3.50e-7 * 0.45) / (pi * (0.00025)^2) = 0.8021 Ohm
    screwGauge: {
      pitchMm: 0.5,
      divisions: 50,
      leastCountMm: 0.01,
      msrMm: 0.5,
      csrDiv: 0,
      zeroErrorMm: 0.0,
    },
  },
};

export const WIRE_SPECIMENS_LIST: WireSpecimen[] = Object.values(WIRE_SPECIMENS);

/**
 * Computes exact balance null-point length along 100 cm bridge wire.
 *
 * Mathematical derivation:
 * Left branch: R_left + alpha + l * rho_w
 * Right branch: R_right + beta + (100 - l) * rho_w
 * At balance (P = Q):
 * R_left + alpha + l * rho_w = R_right + beta + (100 - l) * rho_w
 * => 2 * l * rho_w = (R_right - R_left) + (beta - alpha) + 100 * rho_w
 * => l = 50 + [ (R_right - R_left) + (beta - alpha) ] / (2 * rho_w)
 */
export function computeNullPoint(
  R_left: number,
  R_right: number,
  rho_w: number = DEFAULT_RHO_W,
  alpha: number = DEFAULT_ALPHA,
  beta: number = DEFAULT_BETA,
  noiseOn: boolean = false,
  noiseSeed: number = 0
): number {
  if (rho_w <= 0 || !Number.isFinite(rho_w)) {
    return 50.0;
  }

  const deltaR = R_right - R_left;
  const deltaEnd = beta - alpha;
  const nominal = 50.0 + (deltaR + deltaEnd) / (2.0 * rho_w);

  let result = nominal;
  if (noiseOn) {
    // Deterministic pseudo-noise bounded within +/- 0.2 cm
    const noise = Math.sin(noiseSeed * 12.9898 + (R_left - R_right) * 78.233) * 0.2;
    result += noise;
  }

  // Clamp within 0.0 and 100.0 cm
  return Math.max(0.0, Math.min(100.0, result));
}

/**
 * Computes galvanometer needle deflection (-30 to +30 divs) based on jockey position
 * relative to the bridge null point.
 * Snaps smoothly to 0.0 when within 0.05 cm.
 */
export function computeGalvoDeflection(
  jockeyCm: number,
  nullPointCm: number,
  sensitivity: number = 3.5
): { deflectionDiv: number; isAtNull: boolean } {
  if (!Number.isFinite(jockeyCm) || !Number.isFinite(nullPointCm)) {
    return { deflectionDiv: 0.0, isAtNull: true };
  }

  const offset = jockeyCm - nullPointCm;
  if (Math.abs(offset) <= 0.05) {
    return { deflectionDiv: 0.0, isAtNull: true };
  }

  // Smooth saturated deflection across -30 to +30 divisions
  const defl = 30.0 * Math.tanh(offset / Math.max(0.5, sensitivity));
  return {
    deflectionDiv: parseFloat(defl.toFixed(1)),
    isAtNull: false,
  };
}

/**
 * Calculates resistance per unit length rho_w = X / (l_2 - l_1).
 * Returns null if division by zero or invalid inputs.
 */
export function computeRhoW(
  resistanceX_ohm: number,
  l1_cm: number,
  l2_cm: number
): number | null {
  if (
    !Number.isFinite(resistanceX_ohm) ||
    !Number.isFinite(l1_cm) ||
    !Number.isFinite(l2_cm) ||
    resistanceX_ohm <= 0
  ) {
    return null;
  }

  const diff = l2_cm - l1_cm;
  if (Math.abs(diff) < 1e-4) {
    return null; // Division by zero protection
  }

  const rho_w = resistanceX_ohm / diff;
  return Number.isFinite(rho_w) ? parseFloat(rho_w.toFixed(5)) : null;
}

/**
 * Calculates unknown resistance Y = X - rho_w * (l_2' - l_1').
 * Returns null if invalid inputs.
 */
export function computeUnknownResistanceY(
  resistanceX_ohm: number,
  l1_prime_cm: number,
  l2_prime_cm: number,
  rho_w: number
): number | null {
  if (
    !Number.isFinite(resistanceX_ohm) ||
    !Number.isFinite(l1_prime_cm) ||
    !Number.isFinite(l2_prime_cm) ||
    !Number.isFinite(rho_w) ||
    rho_w <= 0
  ) {
    return null;
  }

  const diff = l2_prime_cm - l1_prime_cm;
  const Y = resistanceX_ohm - rho_w * diff;
  return Number.isFinite(Y) ? parseFloat(Y.toFixed(4)) : null;
}

/**
 * Calculates specific resistance (resistivity):
 * rho = (Y * pi * (d/2)^2) / L
 * where:
 * Y in Ohms
 * d in mm => converted to meters
 * L in cm => converted to meters
 * Returns rho in Ohm.m
 */
export function computeSpecificResistance(
  resistanceY_ohm: number,
  diameterMm: number,
  lengthCm: number
): number | null {
  if (
    !Number.isFinite(resistanceY_ohm) ||
    !Number.isFinite(diameterMm) ||
    !Number.isFinite(lengthCm) ||
    resistanceY_ohm <= 0 ||
    diameterMm <= 0 ||
    lengthCm <= 0
  ) {
    return null;
  }

  const d_m = diameterMm * 1e-3;
  const radius_m = d_m / 2.0;
  const area_m2 = Math.PI * radius_m * radius_m;
  const length_m = lengthCm * 1e-2;

  const rho = (resistanceY_ohm * area_m2) / length_m;
  return Number.isFinite(rho) ? rho : null;
}

/**
 * Computes Ordinary Least Squares linear regression:
 * y = slope * x + intercept
 * Returns slope, intercept, and r2.
 */
export function computeLinearRegression(
  points: { x: number; y: number }[]
): { slope: number; intercept: number; r2: number } {
  const valid = points.filter(
    (p) => Number.isFinite(p.x) && Number.isFinite(p.y)
  );

  if (valid.length < 2) {
    return { slope: 0, intercept: 0, r2: 0 };
  }

  const n = valid.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const p of valid) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-12) {
    return { slope: 0, intercept: 0, r2: 0 };
  }

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // Pearson r2
  const numR = n * sumXY - sumX * sumY;
  const denR = Math.sqrt(
    Math.max(0, (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  );
  const r2 = denR > 1e-12 ? Math.pow(numR / denR, 2) : 0;

  return {
    slope: parseFloat(slope.toFixed(4)),
    intercept: parseFloat(intercept.toFixed(4)),
    r2: parseFloat(r2.toFixed(4)),
  };
}

/**
 * Checks if student input is within 2% tolerance of reference value.
 */
export function isWithinTolerance(
  studentVal: number,
  referenceVal: number,
  tolerancePct: number = 2.0
): boolean {
  if (!Number.isFinite(studentVal) || !Number.isFinite(referenceVal)) {
    return false;
  }
  if (Math.abs(referenceVal) < 1e-9) {
    return Math.abs(studentVal) < 1e-4;
  }
  const pctError = (Math.abs(studentVal - referenceVal) / Math.abs(referenceVal)) * 100;
  return pctError <= tolerancePct;
}

/**
 * Verifies student calculation for Table 1 (Part A): (l2 - l1) and rho_w.
 */
export function verifyPartARow(
  row: PartARow
): {
  diff: { correct: boolean; hint: string };
  rho_w: { correct: boolean; hint: string };
} {
  const studentDiff = parseFloat(row.diff_student);
  const studentRhoW = parseFloat(row.rho_w_student);

  const diffOk = isWithinTolerance(studentDiff, row.diff_ref_cm, 2.0);
  const diffHint = diffOk
    ? 'Correct difference (l2 - l1)!'
    : `Expected l2 - l1 = ${row.l2_cm.toFixed(2)} - ${row.l1_cm.toFixed(2)} = ${row.diff_ref_cm.toFixed(2)} cm.`;

  const rhoOk = isWithinTolerance(studentRhoW, row.rho_w_ref, 2.0);
  const rhoHint = rhoOk
    ? 'Correct resistance per unit length rho_w!'
    : `Expected rho_w = X / (l2 - l1) = ${row.resistanceX_ohm.toFixed(2)} / ${row.diff_ref_cm.toFixed(2)} ≈ ${row.rho_w_ref.toFixed(4)} Ω/cm.`;

  return {
    diff: { correct: diffOk, hint: diffHint },
    rho_w: { correct: rhoOk, hint: rhoHint },
  };
}

/**
 * Verifies student calculation for Table 2 (Part B): (l2' - l1') and Y.
 */
export function verifyPartBRow(
  row: PartBRow,
  rho_w: number
): {
  diff: { correct: boolean; hint: string };
  y: { correct: boolean; hint: string };
} {
  const studentDiff = parseFloat(row.diff_student);
  const studentY = parseFloat(row.y_student);

  const diffOk = isWithinTolerance(studentDiff, row.diff_ref_cm, 2.0);
  const diffHint = diffOk
    ? 'Correct difference (l2\' - l1\')!'
    : `Expected l2' - l1' = ${row.l2_cm.toFixed(2)} - ${row.l1_cm.toFixed(2)} = ${row.diff_ref_cm.toFixed(2)} cm.`;

  const yOk = isWithinTolerance(studentY, row.y_ref_ohm, 2.0);
  const yHint = yOk
    ? 'Correct unknown resistance Y!'
    : `Expected Y = X - rho_w * (l2' - l1') = ${row.resistanceX_ohm.toFixed(2)} - (${rho_w.toFixed(4)} * ${row.diff_ref_cm.toFixed(2)}) ≈ ${row.y_ref_ohm.toFixed(3)} Ω.`;

  return {
    diff: { correct: diffOk, hint: diffHint },
    y: { correct: yOk, hint: yHint },
  };
}

/**
 * Verifies Screw Gauge readings and specific resistance calculation.
 */
export function verifyScrewGaugeAndRho(
  state: ScrewGaugeStudentState,
  specimen: WireSpecimen,
  meanY: number
): {
  diameter: { correct: boolean; hint: string };
  radius: { correct: boolean; hint: string };
  length: { correct: boolean; hint: string };
  rho: { correct: boolean; hint: string };
} {
  const studentD = parseFloat(state.diameter_student_mm);
  const studentR = parseFloat(state.radius_student_cm);
  const studentL = parseFloat(state.length_student_cm);
  const studentRho = parseFloat(state.rho_student_ohm_m);

  const refD = specimen.diameterMm;
  const refR_cm = (specimen.diameterMm / 10.0) / 2.0; // cm
  const refL_cm = specimen.lengthCm;
  const refRho_micro = specimen.resistivityOhmM * 1e6; // in 10^-6 Ohm.m or student entered directly

  const dOk = isWithinTolerance(studentD, refD, 2.0);
  const rOk = isWithinTolerance(studentR, refR_cm, 2.0);
  const lOk = isWithinTolerance(studentL, refL_cm, 2.0);

  // Check rho: either in 10^-6 Ohm.m (e.g. 0.49 for constantan) or exact Ohm.m (4.9e-7)
  const calcRho = computeSpecificResistance(meanY > 0 ? meanY : specimen.nominalResistanceOhm, specimen.diameterMm, specimen.lengthCm) || specimen.resistivityOhmM;
  const calcRhoMicro = calcRho * 1e6;

  const rhoOk =
    isWithinTolerance(studentRho, calcRhoMicro, 2.0) ||
    isWithinTolerance(studentRho, calcRho, 2.0);

  return {
    diameter: {
      correct: dOk,
      hint: dOk
        ? 'Correct diameter from screw gauge!'
        : `Expected d = MSR + (CSR × LC) = ${specimen.screwGauge.msrMm} + (${specimen.screwGauge.csrDiv} × ${specimen.screwGauge.leastCountMm}) = ${refD.toFixed(2)} mm.`,
    },
    radius: {
      correct: rOk,
      hint: rOk
        ? 'Correct radius in cm!'
        : `Expected r = (d / 2) in cm = (${refD.toFixed(2)} mm / 20) = ${refR_cm.toFixed(4)} cm.`,
    },
    length: {
      correct: lOk,
      hint: lOk
        ? 'Correct specimen wire length!'
        : `Expected length L = ${refL_cm.toFixed(1)} cm.`,
    },
    rho: {
      correct: rhoOk,
      hint: rhoOk
        ? 'Correct specific resistance ρ!'
        : `Expected ρ = (Y * π * r²) / L ≈ ${calcRhoMicro.toFixed(2)} × 10⁻⁶ Ω·m (${calcRho.toExponential(2)} Ω·m).`,
    },
  };
}

/**
 * Computes complete live bench telemetry state.
 */
export function computeCareyFosterBenchState(
  part: ExperimentPart,
  gapConfig: GapConfig,
  resistanceX_ohm: number,
  activeSpecimen: WireSpecimen,
  jockeyPosCm: number,
  noiseOn: boolean,
  noiseSeed: number = 0
): CareyFosterBenchState {
  const resistanceY_ohm = part === 'partA' ? 0.0 : activeSpecimen.nominalResistanceOhm;

  // In Normal position: Left gap = X, Right gap = Y (or 0 for strip)
  // In Interchanged position: Left gap = Y, Right gap = X
  const R_left = gapConfig === 'normal' ? resistanceX_ohm : resistanceY_ohm;
  const R_right = gapConfig === 'normal' ? resistanceY_ohm : resistanceX_ohm;

  const trueNull = computeNullPoint(
    R_left,
    R_right,
    DEFAULT_RHO_W,
    DEFAULT_ALPHA,
    DEFAULT_BETA,
    false,
    0
  );

  const activeNull = computeNullPoint(
    R_left,
    R_right,
    DEFAULT_RHO_W,
    DEFAULT_ALPHA,
    DEFAULT_BETA,
    noiseOn,
    noiseSeed
  );

  const galvo = computeGalvoDeflection(jockeyPosCm, activeNull, 3.5);

  return {
    part,
    gapConfig,
    resistanceX_ohm,
    resistanceY_ohm,
    activeSpecimen,
    jockeyPosCm,
    nullPointCm: parseFloat(activeNull.toFixed(2)),
    trueNullPointCm: parseFloat(trueNull.toFixed(2)),
    galvoDeflectionDiv: galvo.deflectionDiv,
    galvoImbalanceOhm: parseFloat((R_right - R_left).toFixed(4)),
    isAtNull: galvo.isAtNull,
    rho_w_true: DEFAULT_RHO_W,
    endAlphaOhm: DEFAULT_ALPHA,
    endBetaOhm: DEFAULT_BETA,
  };
}

// ─── Sample Lab Data ─────────────────────────────────────────────────────────

export const SAMPLE_PART_A_ROWS: PartARow[] = [
  {
    id: 1,
    resistanceX_ohm: 0.2,
    l1_cm: 47.57,
    l2_cm: 53.29,
    diff_ref_cm: 5.71,
    rho_w_ref: 0.0350,
    diff_student: '5.71',
    rho_w_student: '0.0350',
    verified: true,
    cellStatus: { diff: 'correct', rho_w: 'correct' },
  },
  {
    id: 2,
    resistanceX_ohm: 0.4,
    l1_cm: 44.71,
    l2_cm: 56.14,
    diff_ref_cm: 11.43,
    rho_w_ref: 0.0350,
    diff_student: '11.43',
    rho_w_student: '0.0350',
    verified: true,
    cellStatus: { diff: 'correct', rho_w: 'correct' },
  },
  {
    id: 3,
    resistanceX_ohm: 0.6,
    l1_cm: 41.86,
    l2_cm: 59.00,
    diff_ref_cm: 17.14,
    rho_w_ref: 0.0350,
    diff_student: '17.14',
    rho_w_student: '0.0350',
    verified: true,
    cellStatus: { diff: 'correct', rho_w: 'correct' },
  },
  {
    id: 4,
    resistanceX_ohm: 0.8,
    l1_cm: 39.00,
    l2_cm: 61.86,
    diff_ref_cm: 22.86,
    rho_w_ref: 0.0350,
    diff_student: '22.86',
    rho_w_student: '0.0350',
    verified: true,
    cellStatus: { diff: 'correct', rho_w: 'correct' },
  },
  {
    id: 5,
    resistanceX_ohm: 1.0,
    l1_cm: 36.14,
    l2_cm: 64.71,
    diff_ref_cm: 28.57,
    rho_w_ref: 0.0350,
    diff_student: '28.57',
    rho_w_student: '0.0350',
    verified: true,
    cellStatus: { diff: 'correct', rho_w: 'correct' },
  },
];

export const SAMPLE_PART_B_ROWS: Record<string, PartBRow[]> = {
  constantan: [
    {
      id: 1,
      resistanceX_ohm: 0.6,
      l1_cm: 56.71,
      l2_cm: 44.14,
      diff_ref_cm: -12.57,
      y_ref_ohm: 1.040,
      diff_student: '-12.57',
      y_student: '1.040',
      verified: true,
      cellStatus: { diff: 'correct', y: 'correct' },
    },
    {
      id: 2,
      resistanceX_ohm: 0.8,
      l1_cm: 53.86,
      l2_cm: 47.00,
      diff_ref_cm: -6.86,
      y_ref_ohm: 1.040,
      diff_student: '-6.86',
      y_student: '1.040',
      verified: true,
      cellStatus: { diff: 'correct', y: 'correct' },
    },
    {
      id: 3,
      resistanceX_ohm: 1.0,
      l1_cm: 51.00,
      l2_cm: 49.86,
      diff_ref_cm: -1.14,
      y_ref_ohm: 1.040,
      diff_student: '-1.14',
      y_student: '1.040',
      verified: true,
      cellStatus: { diff: 'correct', y: 'correct' },
    },
  ],
};
