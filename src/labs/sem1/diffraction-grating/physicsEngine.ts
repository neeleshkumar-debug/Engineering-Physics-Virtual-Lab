// ─── physicsEngine.ts — Pure Physics Engine for Diffraction Grating Lab ───────

import type {
  SpectralLine,
  SpectralLineId,
  SpectralPeak,
  GratingLPI,
  GratingBenchState,
  GratingRegressionResult,
} from './types';

// ── Standard Mercury Spectral Lines (AKTU Applied Physics Syllabus) ─────────────
export const MERCURY_LINES: Record<SpectralLineId, SpectralLine> = {
  violet: {
    id: 'violet',
    name: 'Violet',
    wavelengthNm: 404.7,
    wavelengthAngstrom: 4047,
    colorHex: '#8a2be2', // BlueViolet
    colorRgb: [138, 43, 226],
    label: 'Violet (404.7 nm)',
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    wavelengthNm: 435.8,
    wavelengthAngstrom: 4358,
    colorHex: '#00bfff', // DeepSkyBlue
    colorRgb: [0, 191, 255],
    label: 'Blue (435.8 nm)',
  },
  green: {
    id: 'green',
    name: 'Green',
    wavelengthNm: 546.1,
    wavelengthAngstrom: 5461,
    colorHex: '#00e676', // Bright Emerald Green
    colorRgb: [0, 230, 118],
    label: 'Green (546.1 nm)',
  },
  yellow1: {
    id: 'yellow1',
    name: 'Yellow 1',
    wavelengthNm: 577.0,
    wavelengthAngstrom: 5770,
    colorHex: '#ffd700', // Gold
    colorRgb: [255, 215, 0],
    label: 'Yellow-1 (577.0 nm)',
  },
  yellow2: {
    id: 'yellow2',
    name: 'Yellow 2',
    wavelengthNm: 579.1,
    wavelengthAngstrom: 5791,
    colorHex: '#ff9100', // Amber/Orange-Yellow
    colorRgb: [255, 145, 0],
    label: 'Yellow-2 (579.1 nm)',
  },
};

export const MERCURY_LINES_LIST: SpectralLine[] = [
  MERCURY_LINES.violet,
  MERCURY_LINES.blue,
  MERCURY_LINES.green,
  MERCURY_LINES.yellow1,
  MERCURY_LINES.yellow2,
];

export const INCH_TO_CM = 2.54;
export const INCH_TO_M = 0.0254;
export const INCH_TO_NM = 25400000; // 2.54 * 10^7 nm

// ── Grating Element Conversions ───────────────────────────────────────────────
export function lpiToGratingElementCm(lpi: number): number {
  if (lpi <= 0 || !Number.isFinite(lpi)) return 0;
  return INCH_TO_CM / lpi;
}

export function lpiToGratingElementNm(lpi: number): number {
  if (lpi <= 0 || !Number.isFinite(lpi)) return 0;
  return INCH_TO_NM / lpi;
}

export function lpiToGratingElementM(lpi: number): number {
  if (lpi <= 0 || !Number.isFinite(lpi)) return 0;
  return INCH_TO_M / lpi;
}

// ── Exact Diffraction Angle Calculations ──────────────────────────────────────
/**
 * Normal incidence condition: (a + b) * sin(θ) = n * λ
 * => sin(θ) = (n * λ) / e
 * Returns angle in radians or null if evanescent/impossible (|sin(θ)| > 1).
 */
export function computeDiffractionAngleRad(
  wavelengthNm: number,
  order: number,
  gratingElementNm: number
): number | null {
  if (gratingElementNm <= 0 || wavelengthNm <= 0) return null;
  const sinTheta = (order * wavelengthNm) / gratingElementNm;
  if (Math.abs(sinTheta) > 1.0) return null;
  return Math.asin(sinTheta);
}

export function computeDiffractionAngleDeg(
  wavelengthNm: number,
  order: number,
  gratingElementNm: number
): number | null {
  const rad = computeDiffractionAngleRad(wavelengthNm, order, gratingElementNm);
  if (rad === null) return null;
  return (rad * 180) / Math.PI;
}

// ── Wavelength Solver ─────────────────────────────────────────────────────────
/**
 * λ = (e * sin(θ)) / n
 * Guards against order = 0 and invalid inputs.
 */
export function computeWavelengthNm(
  gratingElementNm: number,
  diffractionAngleDeg: number,
  order: number
): number | null {
  if (order === 0 || gratingElementNm <= 0) return null;
  const angleRad = (Math.abs(diffractionAngleDeg) * Math.PI) / 180;
  const sinTheta = Math.sin(angleRad);
  const lambda = (gratingElementNm * sinTheta) / Math.abs(order);
  return Number.isFinite(lambda) ? lambda : null;
}

// ── Degrees, Minutes, Seconds (DMS) Helpers ──────────────────────────────────
export interface DMSResult {
  sign: number;
  degrees: number;
  minutes: number;
  seconds: number;
  formatted: string; // e.g. "18° 49'"
  formattedFull: string; // e.g. "18° 49' 00\""
}

export function decimalDegToDMS(deg: number): DMSResult {
  if (!Number.isFinite(deg)) {
    return { sign: 1, degrees: 0, minutes: 0, seconds: 0, formatted: "0° 00'", formattedFull: "0° 00' 00\"" };
  }

  const sign = deg < 0 ? -1 : 1;
  const abs = Math.abs(deg);
  // Round to nearest arcminute for spectrometer least-count reading
  const totalMinutes = Math.round(abs * 60);
  let d = Math.floor(totalMinutes / 60);
  let m = totalMinutes % 60;

  // Exact seconds for full precision representation
  const exactD = Math.floor(abs);
  const exactRemMin = (abs - exactD) * 60;
  const exactM = Math.floor(exactRemMin);
  let exactS = Math.round((exactRemMin - exactM) * 60);
  let resolvedExactM = exactM;
  let resolvedExactD = exactD;
  if (exactS >= 60) {
    resolvedExactM += 1;
    exactS = 0;
  }
  if (resolvedExactM >= 60) {
    resolvedExactD += 1;
    resolvedExactM = 0;
  }

  const signPrefix = sign < 0 ? '-' : '';
  const mm = m < 10 ? `0${m}` : `${m}`;
  const exactSs = exactS < 10 ? `0${exactS}` : `${exactS}`;
  const exactMm = resolvedExactM < 10 ? `0${resolvedExactM}` : `${resolvedExactM}`;

  return {
    sign,
    degrees: d,
    minutes: m,
    seconds: exactS,
    formatted: `${signPrefix}${d}° ${mm}'`,
    formattedFull: `${signPrefix}${resolvedExactD}° ${exactMm}' ${exactSs}"`,
  };
}

export function dmsToDecimalDeg(degrees: number, minutes: number, seconds: number = 0): number {
  const sign = degrees < 0 ? -1 : 1;
  const absD = Math.abs(degrees);
  return sign * (absD + minutes / 60 + seconds / 3600);
}

/**
 * Flexible student DMS/Decimal parser:
 * Accepts: "18° 49'", "18 49", "18.82", "18.816", "18°49'12\""
 */
export function parseDMSToDecimal(input: string): number | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Try direct decimal parse first
  if (!/[°'"]/.test(trimmed) && !trimmed.includes(' ') && !isNaN(Number(trimmed))) {
    return Number(trimmed);
  }

  // Regex for D° M' [S"] or D M
  const match = trimmed.match(/^([-+]?\d+)(?:[°\s]+(\d+(?:\.\d+)?))?(?:['\s]+(\d+(?:\.\d+)?))?["']?$/);
  if (match) {
    const d = parseFloat(match[1]);
    const m = match[2] ? parseFloat(match[2]) : 0;
    const s = match[3] ? parseFloat(match[3]) : 0;
    const sign = d < 0 || match[1].startsWith('-') ? -1 : 1;
    return sign * (Math.abs(d) + m / 60 + s / 3600);
  }

  const fallback = parseFloat(trimmed);
  return Number.isFinite(fallback) ? fallback : null;
}

// ── Realistic Vernier Measurement Noise ──────────────────────────────────────
/**
 * Vernier least count in student lab spectrometers is typically 1 arcminute (1' = 1/60° ≈ 0.0167°).
 * Adds reproducible or pseudorandom ±1' jitter when enabled.
 */
export function applyVernierNoise(angleDeg: number, noiseOn: boolean): number {
  if (!noiseOn) return angleDeg;
  // Uniform jitter in [-1/60, +1/60] degrees
  const jitter = (Math.random() * 2 - 1) * (1 / 60);
  return angleDeg + jitter;
}

// ── Spectral Peaks Generator ──────────────────────────────────────────────────
export function getAllSpectralPeaks(
  gratingLPI: GratingLPI,
  selectedOrder: 0 | 1 | 2 | 'all' = 'all'
): SpectralPeak[] {
  const gratingElementNm = lpiToGratingElementNm(gratingLPI);
  const peaks: SpectralPeak[] = [];

  const ordersToCheck =
    selectedOrder === 'all'
      ? [-2, -1, 0, 1, 2]
      : selectedOrder === 0
      ? [0]
      : [-selectedOrder, selectedOrder];

  // Zero order white central line (combined peak represented as white)
  if (ordersToCheck.includes(0)) {
    peaks.push({
      line: {
        id: 'green', // base metadata
        name: 'Central White Slit (n=0)',
        wavelengthNm: 0,
        wavelengthAngstrom: 0,
        colorHex: '#ffffff',
        colorRgb: [255, 255, 255],
        label: 'Direct Slit Image (0°)',
      },
      order: 0,
      diffractionAngleDeg: 0,
      diffractionAngleRad: 0,
      intensity: 1.0,
    });
  }

  // Non-zero orders for each mercury spectral line
  for (const n of ordersToCheck) {
    if (n === 0) continue;
    const intensity = Math.abs(n) === 1 ? 0.9 : 0.65; // 2nd order is slightly dimmer

    for (const line of MERCURY_LINES_LIST) {
      const angleRad = computeDiffractionAngleRad(line.wavelengthNm, n, gratingElementNm);
      if (angleRad !== null) {
        const angleDeg = (angleRad * 180) / Math.PI;
        peaks.push({
          line,
          order: n,
          diffractionAngleDeg: angleDeg,
          diffractionAngleRad: angleRad,
          intensity,
        });
      }
    }
  }

  return peaks.sort((a, b) => a.diffractionAngleDeg - b.diffractionAngleDeg);
}

// ── Compute Live Telemetry Bench State ─────────────────────────────────────────
export function computeGratingBenchState(
  lampOn: boolean,
  gratingLPI: GratingLPI,
  telescopeAngleDeg: number,
  selectedOrder: 0 | 1 | 2 | 'all',
  noiseOn: boolean,
  slitWidthMm: number = 0.3
): GratingBenchState {
  const gratingElementCm = lpiToGratingElementCm(gratingLPI);
  const gratingElementNm = lpiToGratingElementNm(gratingLPI);

  const apparentAngleDeg = applyVernierNoise(telescopeAngleDeg, noiseOn);

  // Check if telescope is currently near any spectral peak (within eyepiece field of view ±1.5°)
  const peaks = getAllSpectralPeaks(gratingLPI, selectedOrder);
  let activeLineNearby: SpectralLine | null = null;
  let alignmentDiffDeg: number | null = null;
  let currentOrder: number | null = null;

  let minDiff = Infinity;
  for (const p of peaks) {
    const diff = Math.abs(telescopeAngleDeg - p.diffractionAngleDeg);
    if (diff < minDiff) {
      minDiff = diff;
      if (diff <= 1.5) {
        activeLineNearby = p.line;
        alignmentDiffDeg = telescopeAngleDeg - p.diffractionAngleDeg;
        currentOrder = p.order;
      }
    }
  }

  return {
    lampOn,
    gratingLPI,
    gratingElementCm,
    gratingElementNm,
    telescopeAngleDeg,
    selectedOrder,
    noiseOn,
    slitWidthMm,
    apparentAngleDeg,
    activeLineNearby,
    alignmentDiffDeg,
    currentOrder,
  };
}

// ── Math Checker & 2% Tolerance Verification ──────────────────────────────────
export interface CellVerificationResult {
  correct: boolean;
  expected: number;
  received: number;
  relativeError: number;
  hint: string;
}

export interface RowVerificationResult {
  twoTheta: CellVerificationResult;
  theta: CellVerificationResult;
  sinTheta: CellVerificationResult;
  lambda: CellVerificationResult;
  allCorrect: boolean;
}

export function isWithinTolerance(received: number, expected: number, tolerancePct: number = 2.0): boolean {
  if (!Number.isFinite(received) || !Number.isFinite(expected)) return false;
  if (Math.abs(expected) < 1e-9) {
    return Math.abs(received) < 0.05;
  }
  const relativeErr = (Math.abs(received - expected) / Math.abs(expected)) * 100;
  return relativeErr <= tolerancePct;
}

export function verifyDiffractionObservation(
  thetaL_deg: number,
  thetaR_deg: number,
  order: number,
  gratingLPI: number,
  studentValues: {
    twoTheta: string;
    theta: string;
    sinTheta: string;
    lambda: string;
  }
): RowVerificationResult {
  // Expected values
  const expectedTwoTheta = Math.abs(thetaL_deg - thetaR_deg) || thetaL_deg + thetaR_deg;
  const expectedTheta = expectedTwoTheta / 2;
  const thetaRad = (expectedTheta * Math.PI) / 180;
  const expectedSinTheta = Math.sin(thetaRad);
  const gratingElementNm = lpiToGratingElementNm(gratingLPI);
  const expectedLambda = (gratingElementNm * expectedSinTheta) / Math.abs(order);

  // Student parsed values
  const valTwoTheta = parseDMSToDecimal(studentValues.twoTheta) ?? parseFloat(studentValues.twoTheta);
  const valTheta = parseDMSToDecimal(studentValues.theta) ?? parseFloat(studentValues.theta);
  const valSinTheta = parseFloat(studentValues.sinTheta);
  const valLambda = parseFloat(studentValues.lambda);

  const checkCell = (received: number, expected: number, formulaHint: string): CellVerificationResult => {
    if (isNaN(received)) {
      return {
        correct: false,
        expected,
        received: NaN,
        relativeError: 100,
        hint: `Please enter a valid numeric value. (${formulaHint})`,
      };
    }
    const match = isWithinTolerance(received, expected, 2.0);
    const relErr = expected !== 0 ? (Math.abs(received - expected) / Math.abs(expected)) * 100 : 0;
    return {
      correct: match,
      expected,
      received,
      relativeError: relErr,
      hint: match ? 'Verified within 2% error' : `Formula: ${formulaHint}. Expected ~${expected.toFixed(3)}`,
    };
  };

  const resTwoTheta = checkCell(
    valTwoTheta,
    expectedTwoTheta,
    '2θ = |θ_Left - θ_Right|'
  );

  const resTheta = checkCell(
    valTheta,
    expectedTheta,
    'θ = (2θ) / 2'
  );

  const resSinTheta = checkCell(
    valSinTheta,
    expectedSinTheta,
    'sin(θ) = sin(diffraction angle in radians)'
  );

  const resLambda = checkCell(
    valLambda,
    expectedLambda,
    'λ = (e · sin θ) / n, where e = 2.54 / N cm'
  );

  return {
    twoTheta: resTwoTheta,
    theta: resTheta,
    sinTheta: resSinTheta,
    lambda: resLambda,
    allCorrect: resTwoTheta.correct && resTheta.correct && resSinTheta.correct && resLambda.correct,
  };
}

// ── Linear Regression for sin(θ) vs Wavelength ────────────────────────────────
/**
 * Normal incidence condition: sin(θ) = (n / e) * λ
 * Plotting sin(θ) on Y-axis vs (n * λ_standard in cm) on X-axis:
 * Slope m = 1 / e (in cm⁻¹) = N / 2.54
 * Therefore, Experimental N = m * 2.54 (lines/inch).
 */
export function computeGratingRegression(
  points: { x: number; y: number }[],
  nominalLPI: number = 15000
): GratingRegressionResult {
  const n = points.length;
  if (n < 2) {
    return {
      slope: 0,
      intercept: 0,
      r2: 0,
      experimentalLPI: 0,
      nominalLPI,
      percentError: 0,
      pointsCount: n,
      verified: false,
    };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  let sumYY = 0;

  for (const pt of points) {
    sumX += pt.x;
    sumY += pt.y;
    sumXY += pt.x * pt.y;
    sumXX += pt.x * pt.x;
    sumYY += pt.y * pt.y;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (Math.abs(denominator) < 1e-15) {
    return {
      slope: 0,
      intercept: 0,
      r2: 0,
      experimentalLPI: 0,
      nominalLPI,
      percentError: 0,
      pointsCount: n,
      verified: false,
    };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  // Pearson R²
  const ssTotal = sumYY - (sumY * sumY) / n;
  const ssRes = points.reduce((acc, pt) => {
    const yPred = slope * pt.x + intercept;
    return acc + Math.pow(pt.y - yPred, 2);
  }, 0);

  const r2 = ssTotal > 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTotal)) : 1;

  // If x is in cm (e.g. n * λ / 1e7), slope m has units cm⁻¹
  // Since 1/e = N / 2.54, N_exp = slope * 2.54
  const experimentalLPI = slope * INCH_TO_CM;
  const percentError = Math.abs((experimentalLPI - nominalLPI) / nominalLPI) * 100;

  return {
    slope,
    intercept,
    r2,
    experimentalLPI: Math.round(experimentalLPI),
    nominalLPI,
    percentError: parseFloat(percentError.toFixed(2)),
    pointsCount: n,
    verified: r2 >= 0.98,
  };
}

// ── Dispersive & Resolving Power Helpers ──────────────────────────────────────
/**
 * Dispersive Power = dθ / dλ = n / (e * cos(θ))
 * Units: rad/nm or deg/nm
 */
export function computeDispersivePowerDegPerNm(
  order: number,
  gratingElementNm: number,
  thetaRad: number
): number {
  if (gratingElementNm <= 0 || Math.cos(thetaRad) === 0) return 0;
  const dThetaRadPerNm = Math.abs(order) / (gratingElementNm * Math.cos(thetaRad));
  return (dThetaRadPerNm * 180) / Math.PI;
}

/**
 * Resolving Power R = λ / dλ = n * N_total
 * For mercury yellow doublet: λ_avg ≈ 578.0 nm, dλ = 2.1 nm => Required R ≈ 275
 */
export function computeResolvingPower(order: number, totalRuledLines: number): number {
  return Math.abs(order) * totalRuledLines;
}
