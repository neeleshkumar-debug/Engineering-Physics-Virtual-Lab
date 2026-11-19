// ─── Newton's Rings Physics Engine ─────────────────────────────────────────
// High-precision mathematical models for AKTU Applied Physics Lab (AAS151 / ASS251)
// Experiment: Determination of Wavelength of Sodium Light using Newton's Rings
//
// 1. Air film interference geometry & dark ring diameters:
//    r_n = sqrt(n * lambda * R), Dn = 2 * r_n => Dn^2 = 4 * n * lambda * R + D0^2
// 2. Radial interference intensity profile:
//    I(r) = I0 * sin^2( pi * r^2 / (lambda * R) )
// 3. Difference formula cancelling central contact error D0^2:
//    lambda = (D_{n+p}^2 - D_n^2) / (4 * p * R)
// 4. Linear regression solver (Dn^2 vs n) & derived wavelength
// 5. Vernier scale synthesizer (Least Count = 0.001 cm)
// 6. 2% tolerance student math checker

import type {
  CellVerificationResult,
  LensRadiusOption,
  NewtonsRingsBenchState,
  NewtonsRingsObsRow,
  NewtonsRingsRegressionResult,
  NewtonsRingsRowVerification,
  VernierScaleReading,
} from './types';

// Standard Physical Constants
export const SODIUM_D_LINE_NM = 589.3;           // Standard mean sodium doublet wavelength (nm)
export const SODIUM_D_LINE_CM = 5.893e-5;         // Wavelength in cm
export const SODIUM_D_LINE_ANGSTROM = 5893.0;     // Wavelength in Angstroms
export const DEFAULT_LENS_RADIUS_CM = 100;        // Default R = 100 cm
export const MICROMETER_PITCH_CM = 0.05;         // 0.5 mm = 0.05 cm
export const MICROMETER_VERNIER_DIVS = 50;       // 50 vernier divisions
export const MICROMETER_LEAST_COUNT_CM = 0.001;  // 0.001 cm = 0.01 mm = 10 um
export const DEFAULT_BENCH_CENTER_CM = 5.000;    // Center of Newton's rings on horizontal travel scale

// ── 1. Dark Ring Radius & Diameter Calculations ──────────────────────────────
/**
 * Calculates exact dark ring radius r_n in cm.
 * r_n^2 = n * lambda * R + r0^2
 * @param n Ring order (0 for central spot, 1, 2, ...)
 * @param lambdaNm Light wavelength in nm (default 589.3 nm)
 * @param radiusCm Plano-convex lens radius of curvature R in cm (default 100 cm)
 * @param contactOffsetCm2 D0^2 offset in cm^2 (default 0)
 */
export function computeDarkRingRadiusCm(
  n: number,
  lambdaNm: number = SODIUM_D_LINE_NM,
  radiusCm: number = DEFAULT_LENS_RADIUS_CM,
  contactOffsetCm2: number = 0
): number {
  if (n < 0 || lambdaNm <= 0 || radiusCm <= 0) return 0;
  const lambdaCm = lambdaNm * 1e-7;
  const r0Sq = Math.max(0, contactOffsetCm2 / 4);
  const rnSq = n * lambdaCm * radiusCm + r0Sq;
  return Math.sqrt(Math.max(0, rnSq));
}

/**
 * Calculates exact dark ring diameter D_n in cm.
 * D_n^2 = 4 * n * lambda * R + D0^2
 */
export function computeDarkRingDiameterCm(
  n: number,
  lambdaNm: number = SODIUM_D_LINE_NM,
  radiusCm: number = DEFAULT_LENS_RADIUS_CM,
  contactOffsetCm2: number = 0
): number {
  if (n < 0 || lambdaNm <= 0 || radiusCm <= 0) return 0;
  const lambdaCm = lambdaNm * 1e-7;
  const dnSq = 4 * n * lambdaCm * radiusCm + Math.max(0, contactOffsetCm2);
  return Math.sqrt(Math.max(0, dnSq));
}

/**
 * Calculates exact dark ring squared diameter D_n^2 in cm^2.
 */
export function computeDarkRingDiameterSqCm2(
  n: number,
  lambdaNm: number = SODIUM_D_LINE_NM,
  radiusCm: number = DEFAULT_LENS_RADIUS_CM,
  contactOffsetCm2: number = 0
): number {
  if (n < 0 || lambdaNm <= 0 || radiusCm <= 0) return 0;
  const lambdaCm = lambdaNm * 1e-7;
  return 4 * n * lambdaCm * radiusCm + Math.max(0, contactOffsetCm2);
}

// ── 2. Radial Interference Intensity Profile for Canvas ───────────────────────
/**
 * Computes normalised reflected interference intensity I(r) in [0, 1].
 * For an air wedge with normal incidence:
 * Path difference Delta = 2t + lambda / 2
 * Destructive interference occurs when 2t = n * lambda => Delta = (2n + 1) * lambda / 2
 * Geometric thickness t = r^2 / (2R) + t0
 * Intensity: I(r) = sin^2( pi * (r^2 + r0^2) / (lambda * R) )
 */
export function computeRadialIntensity(
  rCm: number,
  lambdaNm: number = SODIUM_D_LINE_NM,
  radiusCm: number = DEFAULT_LENS_RADIUS_CM,
  contactOffsetCm2: number = 0
): number {
  if (lambdaNm <= 0 || radiusCm <= 0) return 0;
  const lambdaCm = lambdaNm * 1e-7;
  const r0Sq = Math.max(0, contactOffsetCm2 / 4);
  const phase = (Math.PI * (rCm * rCm + r0Sq)) / (lambdaCm * radiusCm);
  const sinVal = Math.sin(phase);
  return sinVal * sinVal;
}

// ── 3. Inverse Wavelength Solver (Difference Formula) ─────────────────────────
/**
 * Solves for wavelength lambda using the difference formula:
 * lambda = (D_{n+p}^2 - D_n^2) / (4 * p * R)
 * Returns wavelength in nanometers (nm).
 * Notice: This cancels out any constant contact error D0^2 perfectly!
 */
export function computeWavelengthFromDifferenceNm(
  diffSqCm2: number,
  p: number,
  radiusCm: number = DEFAULT_LENS_RADIUS_CM
): number {
  if (p <= 0 || radiusCm <= 0 || !Number.isFinite(diffSqCm2) || diffSqCm2 <= 0) {
    return 0;
  }
  const lambdaCm = diffSqCm2 / (4 * p * radiusCm);
  return lambdaCm * 1e7;
}

/**
 * Solves for wavelength from two measured diameters Dn_plus_p and Dn.
 */
export function computeWavelengthFromDiametersNm(
  dnPlusPCm: number,
  dnCm: number,
  p: number,
  radiusCm: number = DEFAULT_LENS_RADIUS_CM
): number {
  if (p <= 0 || radiusCm <= 0 || dnPlusPCm <= 0 || dnCm < 0) return 0;
  const diffSq = dnPlusPCm * dnPlusPCm - dnCm * dnCm;
  return computeWavelengthFromDifferenceNm(diffSq, p, radiusCm);
}

// ── 4. Linear Regression Helper (Dn^2 vs n) ──────────────────────────────────
/**
 * Computes least-squares linear regression for Dn^2 (y) vs ring order n (x).
 * Equation: Dn^2 = m * n + c
 * Slope m = 4 * lambda * R (in cm^2)
 * Therefore: lambda = m / (4 * R) (in cm) = (m / (4 * R)) * 1e7 (in nm)
 * Intercept c = D0^2 (in cm^2) provides direct measurement of contact error!
 */
export function computeNewtonsRingsRegression(
  points: { n: number; dnSq: number }[],
  radiusCm: number = DEFAULT_LENS_RADIUS_CM,
  targetLambdaNm: number = SODIUM_D_LINE_NM
): NewtonsRingsRegressionResult {
  const k = points.length;
  if (k < 2 || radiusCm <= 0) {
    return {
      slope: 0,
      intercept: 0,
      r2: 0,
      pointsCount: k,
      calculatedLambdaNm: 0,
      targetLambdaNm,
      percentageError: 0,
    };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const pt of points) {
    sumX += pt.n;
    sumY += pt.dnSq;
    sumXY += pt.n * pt.dnSq;
    sumX2 += pt.n * pt.n;
    sumY2 += pt.dnSq * pt.dnSq;
  }

  const denominator = k * sumX2 - sumX * sumX;
  if (Math.abs(denominator) < 1e-12) {
    return {
      slope: 0,
      intercept: 0,
      r2: 0,
      pointsCount: k,
      calculatedLambdaNm: 0,
      targetLambdaNm,
      percentageError: 0,
    };
  }

  const slope = (k * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / k;

  // Correlation coefficient R^2
  const numeratorR = k * sumXY - sumX * sumY;
  const denomR = Math.sqrt(
    Math.max(0, (k * sumX2 - sumX * sumX) * (k * sumY2 - sumY * sumY))
  );
  const r2 = denomR > 0 ? Math.min(1.0, Math.pow(numeratorR / denomR, 2)) : 0;

  // Calculate lambda: m = 4 * lambda * R => lambda = m / (4 * R)
  const lambdaCm = slope / (4 * radiusCm);
  const calculatedLambdaNm = lambdaCm * 1e7;

  const percentageError = targetLambdaNm > 0
    ? (Math.abs(calculatedLambdaNm - targetLambdaNm) / targetLambdaNm) * 100
    : 0;

  return {
    slope: parseFloat(slope.toFixed(6)),
    intercept: parseFloat(intercept.toFixed(6)),
    r2: parseFloat(r2.toFixed(5)),
    pointsCount: k,
    calculatedLambdaNm: parseFloat(calculatedLambdaNm.toFixed(1)),
    targetLambdaNm,
    percentageError: parseFloat(percentageError.toFixed(2)),
  };
}

// ── 5. Traveling Microscope Vernier Scale Synthesizer ─────────────────────────
/**
 * Deconstructs position x (in cm) into Main Scale Reading (MSR) and Vernier Scale Reading (VSR).
 * Pitch = 0.05 cm (0.5 mm), Total Vernier Divisions = 50.
 * Least Count = Pitch / 50 = 0.001 cm (0.01 mm).
 */
export function calculateVernierReading(posCm: number): VernierScaleReading {
  if (!Number.isFinite(posCm) || posCm < 0) {
    return {
      pitchCm: MICROMETER_PITCH_CM,
      totalDivisions: MICROMETER_VERNIER_DIVS,
      leastCountCm: MICROMETER_LEAST_COUNT_CM,
      msrCm: 0,
      vsrDiv: 0,
      totalCm: 0,
      formatted: '0.000 cm',
    };
  }

  // Rounded to least count resolution
  const roundedCm = Math.round(posCm / MICROMETER_LEAST_COUNT_CM) * MICROMETER_LEAST_COUNT_CM;
  const msrSteps = Math.floor(roundedCm / MICROMETER_PITCH_CM);
  const msrCm = msrSteps * MICROMETER_PITCH_CM;
  const remainder = roundedCm - msrCm;
  const vsrDiv = Math.min(
    MICROMETER_VERNIER_DIVS - 1,
    Math.max(0, Math.round(remainder / MICROMETER_LEAST_COUNT_CM))
  );
  const totalCm = msrCm + vsrDiv * MICROMETER_LEAST_COUNT_CM;

  return {
    pitchCm: MICROMETER_PITCH_CM,
    totalDivisions: MICROMETER_VERNIER_DIVS,
    leastCountCm: MICROMETER_LEAST_COUNT_CM,
    msrCm: parseFloat(msrCm.toFixed(3)),
    vsrDiv,
    totalCm: parseFloat(totalCm.toFixed(3)),
    formatted: `${totalCm.toFixed(3)} cm`,
  };
}

/**
 * Realistic micrometer noise simulation: adds small reproducible or pseudorandom jitter
 * bounded by ±1 Least Count (±0.001 cm) to simulate real human alignment uncertainty.
 */
export function applyMicrometerNoise(posCm: number, noiseOn: boolean): number {
  if (!noiseOn) return posCm;
  const jitter = (Math.random() * 2 - 1) * MICROMETER_LEAST_COUNT_CM;
  return posCm + jitter;
}

// ── 6. Active Student Math Verification (2% Tolerance) ────────────────────────
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
    return Math.abs(studentVal) < 0.005;
  }
  const pctError = (Math.abs(studentVal - referenceVal) / Math.abs(referenceVal)) * 100;
  return pctError <= tolerancePct;
}

/**
 * Verifies a single observation row with 2% tolerance.
 */
export function verifyNewtonsRingsObservation(
  xL_cm: number,
  xR_cm: number,
  radiusCm: number,
  pStep: number | undefined,
  pairedRow: { diameterSq_ref_cm2: number } | undefined,
  studentInputs: {
    diameter: string;
    diameterSq: string;
    diffSq: string;
    lambda: string;
  }
): NewtonsRingsRowVerification {
  const refDiameter = Math.abs(xR_cm - xL_cm);
  const refDiameterSq = refDiameter * refDiameter;

  const parsedDiameter = parseFloat(studentInputs.diameter);
  const parsedDiameterSq = parseFloat(studentInputs.diameterSq);

  const diameterCheck: CellVerificationResult = {
    received: parsedDiameter,
    expected: parseFloat(refDiameter.toFixed(3)),
    pctError: refDiameter > 0 ? (Math.abs(parsedDiameter - refDiameter) / refDiameter) * 100 : 0,
    correct: isWithinTolerance(parsedDiameter, refDiameter, 2.0),
  };

  const diameterSqCheck: CellVerificationResult = {
    received: parsedDiameterSq,
    expected: parseFloat(refDiameterSq.toFixed(4)),
    pctError: refDiameterSq > 0 ? (Math.abs(parsedDiameterSq - refDiameterSq) / refDiameterSq) * 100 : 0,
    correct: isWithinTolerance(parsedDiameterSq, refDiameterSq, 2.0),
  };

  let diffSqCheck: CellVerificationResult | undefined;
  let lambdaCheck: CellVerificationResult | undefined;
  let allCorrect = diameterCheck.correct && diameterSqCheck.correct;

  if (pStep && pStep > 0 && pairedRow) {
    const refDiffSq = Math.abs(pairedRow.diameterSq_ref_cm2 - refDiameterSq);
    const refLambdaNm = computeWavelengthFromDifferenceNm(refDiffSq, pStep, radiusCm);

    const parsedDiffSq = parseFloat(studentInputs.diffSq);
    const parsedLambda = parseFloat(studentInputs.lambda);

    diffSqCheck = {
      received: parsedDiffSq,
      expected: parseFloat(refDiffSq.toFixed(4)),
      pctError: refDiffSq > 0 ? (Math.abs(parsedDiffSq - refDiffSq) / refDiffSq) * 100 : 0,
      correct: isWithinTolerance(parsedDiffSq, refDiffSq, 2.0),
    };

    lambdaCheck = {
      received: parsedLambda,
      expected: parseFloat(refLambdaNm.toFixed(1)),
      pctError: refLambdaNm > 0 ? (Math.abs(parsedLambda - refLambdaNm) / refLambdaNm) * 100 : 0,
      correct: isWithinTolerance(parsedLambda, refLambdaNm, 2.0),
    };

    allCorrect = allCorrect && diffSqCheck.correct && lambdaCheck.correct;
  }

  return {
    diameter: diameterCheck,
    diameterSq: diameterSqCheck,
    diffSq: diffSqCheck,
    lambda: lambdaCheck,
    allCorrect,
  };
}

// ── 7. Bench State Synthesizer ────────────────────────────────────────────────
/**
 * Computes full live telemetry state for the Newton's rings virtual bench.
 */
export function computeNewtonsRingsBenchState(
  lampOn: boolean,
  micrometerPosCm: number,
  centerPosCm: number = DEFAULT_BENCH_CENTER_CM,
  radiusOfCurvatureCm: LensRadiusOption = DEFAULT_LENS_RADIUS_CM,
  selectedRing: number = 8,
  noiseOn: boolean = false,
  contactOffsetCm2: number = 0
): NewtonsRingsBenchState {
  const apparentPosCm = applyMicrometerNoise(micrometerPosCm, noiseOn);
  const vernier = calculateVernierReading(apparentPosCm);

  // Determine which dark ring is nearest to the crosshair
  const distanceFromCenterCm = apparentPosCm - centerPosCm;
  const absDistCm = Math.abs(distanceFromCenterCm);
  const side: 'left' | 'right' | 'center' =
    Math.abs(distanceFromCenterCm) < 0.005
      ? 'center'
      : distanceFromCenterCm < 0
      ? 'left'
      : 'right';

  // Find nearest integer dark ring order n where r_n ≈ absDistCm
  const lambdaCm = SODIUM_D_LINE_NM * 1e-7;
  const estimatedN = Math.round(
    Math.max(0, (absDistCm * absDistCm - contactOffsetCm2 / 4) / (lambdaCm * radiusOfCurvatureCm))
  );

  const exactRadiusCm = computeDarkRingRadiusCm(
    estimatedN,
    SODIUM_D_LINE_NM,
    radiusOfCurvatureCm,
    contactOffsetCm2
  );
  const exactPosCm = side === 'left' ? centerPosCm - exactRadiusCm : centerPosCm + exactRadiusCm;
  const distFromDarkCm = Math.abs(apparentPosCm - exactPosCm);
  const isAligned = distFromDarkCm <= 0.005; // within 0.05 mm

  return {
    lampOn,
    micrometerPosCm,
    centerPosCm,
    radiusOfCurvatureCm,
    sodiumWavelengthNm: SODIUM_D_LINE_NM,
    contactOffsetCm2,
    noiseOn,
    selectedRing,
    vernier,
    apparentPosCm,
    ringUnderCrosshair: estimatedN >= 0 ? {
      order: estimatedN,
      side,
      exactRingPosCm: parseFloat(exactPosCm.toFixed(3)),
      distanceFromDarkCm: parseFloat(distFromDarkCm.toFixed(3)),
      isAligned,
    } : null,
  };
}

// ── 8. Sample Lab Readings (AKTU Practical Standard) ──────────────────────────
/**
 * Generates typical realistic laboratory readings for AKTU students.
 * Orders: n = 16, 14, 12, 10, 8, 6, 4, 2 with step p = 4.
 * R = 100 cm, lambda = 589.3 nm.
 */
export function getSampleNewtonsRingsObservations(
  radiusCm: LensRadiusOption = DEFAULT_LENS_RADIUS_CM,
  centerPosCm: number = DEFAULT_BENCH_CENTER_CM
): NewtonsRingsObsRow[] {
  const orders = [16, 14, 12, 10, 8, 6, 4, 2];
  const pStep = 4;

  // First generate raw rows with reference Dn and Dn^2
  const rows: NewtonsRingsObsRow[] = orders.map((n, idx) => {
    const rn = computeDarkRingRadiusCm(n, SODIUM_D_LINE_NM, radiusCm, 0);
    const xL = centerPosCm - rn;
    const xR = centerPosCm + rn;
    const dn = xR - xL;
    const dnSq = dn * dn;

    return {
      id: idx + 1,
      ringOrder: n,
      xL_cm: parseFloat(xL.toFixed(3)),
      xR_cm: parseFloat(xR.toFixed(3)),
      diameter_ref_cm: parseFloat(dn.toFixed(3)),
      diameterSq_ref_cm2: parseFloat(dnSq.toFixed(4)),
      diameter_student_cm: '',
      diameterSq_student_cm2: '',
      diffSq_student_student_cm2: '',
      lambda_student_nm: '',
      verified: false,
      cellStatus: {
        diameter: 'idle',
        diameterSq: 'idle',
        diffSq: 'idle',
        lambda: 'idle',
      },
    };
  });

  // Now compute paired differences (Dn+p^2 - Dn^2) where (n+p) exists
  return rows.map((row) => {
    const pairedRingOrder = row.ringOrder + pStep;
    const higherRow = rows.find((r) => r.ringOrder === pairedRingOrder);

    if (higherRow) {
      const diffSq = higherRow.diameterSq_ref_cm2 - row.diameterSq_ref_cm2;
      const lambdaNm = computeWavelengthFromDifferenceNm(diffSq, pStep, radiusCm);

      return {
        ...row,
        pairedOrder: pairedRingOrder,
        pStep,
        diffSq_ref_cm2: parseFloat(diffSq.toFixed(4)),
        lambda_ref_nm: parseFloat(lambdaNm.toFixed(1)),
      };
    }

    return row;
  });
}
