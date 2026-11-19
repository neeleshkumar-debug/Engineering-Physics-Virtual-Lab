// ─── physicsEngine.ts — Half-Shade Polarimeter Physics ──────────────────────

import type {
  TubeLengthOption,
  SolutionType,
  SolutionMeta,
  PolarimeterBenchState,
  PolarimeterObsRow,
  PolarimeterVerificationResult,
  PolarimeterRegressionResult,
} from './types';

// Standard reference constants
export const SUCROSE_SPECIFIC_ROTATION = 66.5; // deg / (dm · (g/cm3)) at 20°C for sodium D-line
export const SODIUM_D_LINE_NM = 589.3;
export const HALF_SHADE_ANGLE_DEG = 4.0; // Half-shade split angle alpha (degrees)
export const DEFAULT_WATER_ZERO_DEG = 10.00; // Realistic reference zero offset
export const VERNIER_LEAST_COUNT_DEG = 0.05; // 3 arcminutes (0.05°)

// Calibrated lab solutions
export const LAB_SOLUTIONS: SolutionMeta[] = [
  {
    id: 'water',
    name: 'Distilled Water (Reference Blank)',
    shortLabel: 'Distilled Water (0%)',
    concentration_g_cm3: 0.0,
    percentage: 0,
  },
  {
    id: '5%',
    name: '5% Cane Sugar Solution (0.05 g/cm³)',
    shortLabel: '5% Sucrose',
    concentration_g_cm3: 0.05,
    percentage: 5,
  },
  {
    id: '10%',
    name: '10% Cane Sugar Solution (0.10 g/cm³)',
    shortLabel: '10% Sucrose',
    concentration_g_cm3: 0.10,
    percentage: 10,
  },
  {
    id: '15%',
    name: '15% Cane Sugar Solution (0.15 g/cm³)',
    shortLabel: '15% Sucrose',
    concentration_g_cm3: 0.15,
    percentage: 15,
  },
  {
    id: '20%',
    name: '20% Cane Sugar Solution (0.20 g/cm³)',
    shortLabel: '20% Sucrose',
    concentration_g_cm3: 0.20,
    percentage: 20,
  },
  {
    id: 'unknown',
    name: 'Unknown Sugar Solution (Sample X: ~12.5%)',
    shortLabel: 'Unknown Sample X',
    concentration_g_cm3: 0.125,
    percentage: 12.5,
    isUnknown: true,
  },
];

export function getSolutionMeta(id: SolutionType): SolutionMeta {
  return LAB_SOLUTIONS.find((s) => s.id === id) ?? LAB_SOLUTIONS[0];
}

/**
 * Calculates optical rotation Delta theta = S * L * c (Biot's Law)
 * @param S Specific rotation in deg / (dm · (g/cm³))
 * @param L_dm Tube length in decimeters
 * @param c_g_cm3 Sugar concentration in g/cm³ (or g/mL)
 * @returns Optical rotation in decimal degrees (>= 0)
 */
export function computeOpticalRotation(
  S: number,
  L_dm: number,
  c_g_cm3: number
): number {
  if (
    !Number.isFinite(S) ||
    !Number.isFinite(L_dm) ||
    !Number.isFinite(c_g_cm3) ||
    L_dm <= 0 ||
    c_g_cm3 <= 0 ||
    S <= 0
  ) {
    return 0.0;
  }
  const deltaTheta = S * L_dm * c_g_cm3;
  return parseFloat(deltaTheta.toFixed(4));
}

/**
 * Computes observed analyzer balance angle:
 * theta = theta_0 + Delta theta + noise
 */
export function computeAnalyzerBalanceAngle(
  theta0_deg: number,
  deltaTheta_deg: number,
  noiseDeg = 0
): number {
  const safeTheta0 = Number.isFinite(theta0_deg) ? theta0_deg : 0;
  const safeDelta = Number.isFinite(deltaTheta_deg) ? deltaTheta_deg : 0;
  const safeNoise = Number.isFinite(noiseDeg) ? noiseDeg : 0;

  const total = (safeTheta0 + safeDelta + safeNoise) % 360;
  const wrapped = total < 0 ? total + 360 : total;
  return parseFloat(wrapped.toFixed(2));
}

/**
 * Normalizes an angle difference to shortest path in [-90, +90]
 * (Polarimeter balance positions repeat every 180° due to analyzer symmetry)
 */
export function normalizeAngularMismatch(angleA: number, angleB: number): number {
  let diff = ((angleA - angleB + 180) % 360 + 360) % 360 - 180;
  diff = ((diff + 90) % 180 + 180) % 180 - 90;
  return diff;
}

/**
 * Half-Shade Split-Field Luminance Helper
 * Quantifies left/right half illumination as a function of analyzer mismatch delta phi
 * Based on Laurent's half-shade Malus formulation near sensitive dim match:
 * I_left = sin^2(delta + alpha), I_right = sin^2(delta - alpha)
 */
export function computeHalfShadeFieldLuminance(
  analyzerAngleDeg: number,
  balanceAngleDeg: number,
  halfShadeAngleDeg = HALF_SHADE_ANGLE_DEG
): {
  leftLuminance: number;
  rightLuminance: number;
  contrast: number;
  isEqual: boolean;
} {
  const mismatchDeg = normalizeAngularMismatch(analyzerAngleDeg, balanceAngleDeg);
  const deltaRad = (mismatchDeg * Math.PI) / 180;
  const alphaRad = (halfShadeAngleDeg * Math.PI) / 180;

  // Raw Malus transmissions near sensitive match point
  const rawLeft = Math.sin(deltaRad + alphaRad) ** 2;
  const rawRight = Math.sin(deltaRad - alphaRad) ** 2;

  // Add subtle ambient leakage and normalize to [0.04, 1.0]
  const leak = 0.05;
  const left = leak + (1 - leak) * rawLeft;
  const right = leak + (1 - leak) * rawRight;

  const sum = left + right;
  const contrast = sum > 0 ? Math.abs(left - right) / sum : 0;
  // Match threshold: within 0.08° (close to human vernier discrimination)
  const isEqual = Math.abs(mismatchDeg) <= 0.08;

  return {
    leftLuminance: parseFloat(Math.min(1, Math.max(0, left)).toFixed(4)),
    rightLuminance: parseFloat(Math.min(1, Math.max(0, right)).toFixed(4)),
    contrast: parseFloat(contrast.toFixed(4)),
    isEqual,
  };
}

/**
 * Inverse specific rotation solver: S = Delta theta / (L * c)
 */
export function calculateSpecificRotation(
  deltaThetaDeg: number,
  L_dm: number,
  c_g_cm3: number
): number | null {
  if (
    !Number.isFinite(deltaThetaDeg) ||
    !Number.isFinite(L_dm) ||
    !Number.isFinite(c_g_cm3) ||
    L_dm <= 0 ||
    c_g_cm3 <= 0 ||
    deltaThetaDeg <= 0
  ) {
    return null;
  }
  const S = deltaThetaDeg / (L_dm * c_g_cm3);
  return parseFloat(S.toFixed(2));
}

/**
 * Unknown concentration estimator: c = Delta theta / (S * L)
 */
export function calculateUnknownConcentration(
  deltaThetaDeg: number,
  L_dm: number,
  S = SUCROSE_SPECIFIC_ROTATION
): number | null {
  if (
    !Number.isFinite(deltaThetaDeg) ||
    !Number.isFinite(L_dm) ||
    !Number.isFinite(S) ||
    L_dm <= 0 ||
    S <= 0 ||
    deltaThetaDeg <= 0
  ) {
    return null;
  }
  const c = deltaThetaDeg / (S * L_dm);
  return parseFloat(c.toFixed(4));
}

/**
 * Linear regression of Delta theta vs. concentration c:
 * Delta theta = (S * L) * c + intercept
 * Returns slope, intercept, R^2, and derived S = slope / L
 */
export function linearRegressionDeltaThetaVsC(
  points: { c: number; deltaTheta: number }[],
  L_dm = 2.0
): PolarimeterRegressionResult {
  if (!points || points.length < 2) {
    return {
      slope: 0,
      intercept: 0,
      r2: 0,
      specificRotation: null,
      pointsCount: points ? points.length : 0,
    };
  }

  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXX = 0;
  let sumYY = 0;
  let sumXY = 0;

  for (const pt of points) {
    sumX += pt.c;
    sumY += pt.deltaTheta;
    sumXX += pt.c * pt.c;
    sumYY += pt.deltaTheta * pt.deltaTheta;
    sumXY += pt.c * pt.deltaTheta;
  }

  const denom = n * sumXX - sumX * sumX;
  if (Math.abs(denom) < 1e-12) {
    return {
      slope: 0,
      intercept: 0,
      r2: 0,
      specificRotation: null,
      pointsCount: n,
    };
  }

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R^2
  const denomY = n * sumYY - sumY * sumY;
  let r2 = 1.0;
  if (Math.abs(denomY) > 1e-12) {
    const numR = n * sumXY - sumX * sumY;
    const r = numR / Math.sqrt(denom * denomY);
    r2 = Math.min(1.0, Math.max(0.0, r * r));
  }

  const specificRotation =
    L_dm > 0 && Number.isFinite(L_dm)
      ? parseFloat((slope / L_dm).toFixed(2))
      : null;

  return {
    slope: parseFloat(slope.toFixed(4)),
    intercept: parseFloat(intercept.toFixed(4)),
    r2: parseFloat(r2.toFixed(4)),
    specificRotation,
    pointsCount: n,
  };
}

/**
 * Verifies student's hand-calculated Delta theta and S within 2% tolerance
 */
export function verifyPolarimeterStudentMath(
  row: PolarimeterObsRow,
  tolerance = 0.02
): PolarimeterVerificationResult {
  const expectedDelta = Math.abs(row.observedAngle_deg - row.referenceAngle_deg);
  const expectedS =
    row.tubeLength_dm > 0 && row.concentration_g_cm3 > 0
      ? expectedDelta / (row.tubeLength_dm * row.concentration_g_cm3)
      : 0;

  const studentDelta = parseFloat(row.deltaTheta_student);
  const studentS = parseFloat(row.specificRotation_student);

  // Delta theta verification: within 2% or 0.05° absolute
  const deltaCorrect =
    !isNaN(studentDelta) &&
    (Math.abs(studentDelta - expectedDelta) <= Math.max(0.05, expectedDelta * tolerance) ||
      (expectedDelta === 0 && Math.abs(studentDelta) < 0.05));

  let deltaMsg = '';
  if (isNaN(studentDelta)) {
    deltaMsg = 'Please enter calculated optical rotation Δθ = |θ - θ₀|';
  } else if (!deltaCorrect) {
    deltaMsg = `Calculated Δθ differs from expected ${expectedDelta.toFixed(2)}° (use Δθ = |${row.observedAngle_deg.toFixed(2)}° - ${row.referenceAngle_deg.toFixed(2)}°|)`;
  } else {
    deltaMsg = `Correct! Δθ = ${expectedDelta.toFixed(2)}°`;
  }

  // Specific rotation verification: within 2% tolerance
  let sCorrect = false;
  let sMsg = '';

  if (row.concentration_g_cm3 === 0) {
    // Blank water has no sugar
    sCorrect = isNaN(studentS) || studentS === 0 || row.specificRotation_student.trim() === '-' || row.specificRotation_student.trim() === 'N/A';
    sMsg = sCorrect
      ? 'Distilled water has zero sugar (S not applicable)'
      : 'Blank water reading does not contain solute';
  } else if (isNaN(studentS)) {
    sMsg = `Please enter calculated specific rotation S = Δθ / (L · c)`;
  } else if (expectedS > 0) {
    sCorrect = Math.abs(studentS - expectedS) <= expectedS * tolerance;
    if (!sCorrect) {
      sMsg = `Calculated S differs from expected ${expectedS.toFixed(1)}° dm⁻¹ (g/cm³)⁻¹ (Formula: S = ${expectedDelta.toFixed(2)} / (${row.tubeLength_dm} · ${row.concentration_g_cm3}))`;
    } else {
      sMsg = `Correct! S = ${expectedS.toFixed(1)}° dm⁻¹ (g/cm³)⁻¹`;
    }
  }

  return {
    deltaTheta: {
      correct: deltaCorrect,
      expected: parseFloat(expectedDelta.toFixed(2)),
      studentVal: isNaN(studentDelta) ? 0 : studentDelta,
      message: deltaMsg,
    },
    specificRotation: {
      correct: sCorrect,
      expected: parseFloat(expectedS.toFixed(1)),
      studentVal: isNaN(studentS) ? 0 : studentS,
      message: sMsg,
    },
    allCorrect: deltaCorrect && sCorrect,
  };
}

/**
 * Computes live bench state for UI rendering
 */
export function computeBenchState(
  lampOn: boolean,
  analyzerAngleDeg: number,
  tubeLengthDm: TubeLengthOption,
  solutionId: SolutionType,
  waterZeroAngleDeg: number,
  noiseOn: boolean,
  noiseOffsetDeg = 0
): PolarimeterBenchState {
  const solution = getSolutionMeta(solutionId);
  const S = SUCROSE_SPECIFIC_ROTATION;
  const deltaTheta = computeOpticalRotation(S, tubeLengthDm, solution.concentration_g_cm3);
  const activeNoise = noiseOn ? noiseOffsetDeg : 0;
  const matchAngle = computeAnalyzerBalanceAngle(waterZeroAngleDeg, deltaTheta, activeNoise);

  const apparentAngle = parseFloat((((analyzerAngleDeg % 360) + 360) % 360).toFixed(2));

  if (!lampOn) {
    return {
      lampOn: false,
      analyzerAngleDeg,
      tubeLengthDm,
      selectedSolution: solutionId,
      concentration_g_cm3: solution.concentration_g_cm3,
      waterZeroAngleDeg,
      noiseOn,
      noiseOffsetDeg,
      theoreticalRotationDeg: deltaTheta,
      theoreticalMatchAngleDeg: matchAngle,
      apparentAngleDeg: apparentAngle,
      leftLuminance: 0,
      rightLuminance: 0,
      contrast: 0,
      isEqualBrightness: false,
    };
  }

  const { leftLuminance, rightLuminance, contrast, isEqual } =
    computeHalfShadeFieldLuminance(analyzerAngleDeg, matchAngle);

  return {
    lampOn: true,
    analyzerAngleDeg,
    tubeLengthDm,
    selectedSolution: solutionId,
    concentration_g_cm3: solution.concentration_g_cm3,
    waterZeroAngleDeg,
    noiseOn,
    noiseOffsetDeg,
    theoreticalRotationDeg: deltaTheta,
    theoreticalMatchAngleDeg: matchAngle,
    apparentAngleDeg: apparentAngle,
    leftLuminance,
    rightLuminance,
    contrast,
    isEqualBrightness: isEqual,
  };
}

/**
 * Vernier scale decomposition helper
 */
export function formatVernierAngle(
  angleDeg: number,
  leastCountDeg = VERNIER_LEAST_COUNT_DEG
): {
  msr: number;
  vsr: number;
  totalDeg: number;
  formatted: string;
} {
  const normalized = ((angleDeg % 360) + 360) % 360;
  const msr = Math.floor(normalized);
  const fractional = normalized - msr;
  const vsr = Math.round(fractional / leastCountDeg);
  const totalDeg = parseFloat((msr + vsr * leastCountDeg).toFixed(2));
  const arcmin = Math.round(fractional * 60);

  return {
    msr,
    vsr,
    totalDeg,
    formatted: `${msr}° ${arcmin < 10 ? '0' : ''}${arcmin}' (${totalDeg.toFixed(2)}°)`,
  };
}

/**
 * Realistic sample observation set for demonstration and practice mode
 */
export function getSamplePolarimeterObservations(
  tubeLengthDm: TubeLengthOption = 2.0,
  waterZeroDeg = DEFAULT_WATER_ZERO_DEG
): PolarimeterObsRow[] {
  const sampleConfigs: { id: SolutionType; name: string; c: number }[] = [
    { id: 'water', name: 'Distilled Water (Blank)', c: 0.0 },
    { id: '5%', name: '5% Cane Sugar Solution', c: 0.05 },
    { id: '10%', name: '10% Cane Sugar Solution', c: 0.10 },
    { id: '15%', name: '15% Cane Sugar Solution', c: 0.15 },
    { id: '20%', name: '20% Cane Sugar Solution', c: 0.20 },
  ];

  return sampleConfigs.map((cfg, idx) => {
    const delta = computeOpticalRotation(SUCROSE_SPECIFIC_ROTATION, tubeLengthDm, cfg.c);
    const obsAngle = parseFloat((waterZeroDeg + delta).toFixed(2));
    const expectedS = cfg.c > 0 ? parseFloat((delta / (tubeLengthDm * cfg.c)).toFixed(2)) : 0;

    return {
      id: idx + 1,
      solutionName: cfg.name,
      concentration_g_cm3: cfg.c,
      tubeLength_dm: tubeLengthDm,
      referenceAngle_deg: waterZeroDeg,
      observedAngle_deg: obsAngle,
      deltaTheta_ref: delta,
      specificRotation_ref: expectedS,
      deltaTheta_student: '',
      specificRotation_student: '',
      verified: false,
      cellStatus: {
        deltaTheta: 'idle',
        specificRotation: 'idle',
      },
    };
  });
}
