// ─── physicsEngine.test.ts — Vitest Suite for Diffraction Grating ─────────────

import { describe, it, expect } from 'vitest';
import {
  MERCURY_LINES,
  MERCURY_LINES_LIST,
  lpiToGratingElementCm,
  lpiToGratingElementNm,
  computeDiffractionAngleRad,
  computeDiffractionAngleDeg,
  computeWavelengthNm,
  decimalDegToDMS,
  dmsToDecimalDeg,
  parseDMSToDecimal,
  applyVernierNoise,
  getAllSpectralPeaks,
  computeGratingBenchState,
  isWithinTolerance,
  verifyDiffractionObservation,
  computeGratingRegression,
  computeDispersivePowerDegPerNm,
  computeResolvingPower,
  INCH_TO_CM,
} from './physicsEngine';

describe('Diffraction Grating Physics Engine — Pure Functions & AKTU Specifications', () => {
  describe('Grating Element Conversion & Dimensions', () => {
    it('correctly calculates grating element e for 15,000 LPI', () => {
      const e_cm = lpiToGratingElementCm(15000);
      const e_nm = lpiToGratingElementNm(15000);

      // e = 2.54 / 15000 cm = 1.69333... * 10^-4 cm = 1693.333 nm
      expect(e_cm).toBeCloseTo(1.69333e-4, 8);
      expect(e_nm).toBeCloseTo(1693.333, 3);
    });

    it('correctly calculates grating element e for 6,000 LPI', () => {
      const e_cm = lpiToGratingElementCm(6000);
      const e_nm = lpiToGratingElementNm(6000);

      // e = 2.54 / 6000 cm = 4.2333... * 10^-4 cm = 4233.333 nm
      expect(e_cm).toBeCloseTo(4.23333e-4, 8);
      expect(e_nm).toBeCloseTo(4233.333, 3);
    });

    it('safely guards against non-positive or non-finite LPI inputs', () => {
      expect(lpiToGratingElementCm(0)).toBe(0);
      expect(lpiToGratingElementCm(-500)).toBe(0);
      expect(lpiToGratingElementNm(0)).toBe(0);
      expect(lpiToGratingElementNm(-100)).toBe(0);
      expect(lpiToGratingElementNm(NaN)).toBe(0);
    });
  });

  describe('Diffraction Angle Calculation (Normal Incidence)', () => {
    const e_nm = lpiToGratingElementNm(15000);

    it('produces exact 1st order diffraction angles for 15,000 LPI', () => {
      // Violet (404.7 nm)
      const thetaViolet = computeDiffractionAngleDeg(MERCURY_LINES.violet.wavelengthNm, 1, e_nm);
      expect(thetaViolet).not.toBeNull();
      // sin(θ) = 404.7 / 1693.333 ≈ 0.238996 => θ ≈ 13.829°
      expect(thetaViolet!).toBeCloseTo(13.829, 2);

      // Blue (435.8 nm)
      const thetaBlue = computeDiffractionAngleDeg(MERCURY_LINES.blue.wavelengthNm, 1, e_nm);
      expect(thetaBlue).not.toBeNull();
      // sin(θ) = 435.8 / 1693.333 ≈ 0.257362 => θ ≈ 14.914°
      expect(thetaBlue!).toBeCloseTo(14.914, 2);

      // Green (546.1 nm)
      const thetaGreen = computeDiffractionAngleDeg(MERCURY_LINES.green.wavelengthNm, 1, e_nm);
      expect(thetaGreen).not.toBeNull();
      // sin(θ) = 546.1 / 1693.333 ≈ 0.322500 => θ ≈ 18.815°
      expect(thetaGreen!).toBeCloseTo(18.815, 2);

      // Yellow 1 (577.0 nm)
      const thetaY1 = computeDiffractionAngleDeg(MERCURY_LINES.yellow1.wavelengthNm, 1, e_nm);
      expect(thetaY1).not.toBeNull();
      // sin(θ) = 577.0 / 1693.333 ≈ 0.340748 => θ ≈ 19.923°
      expect(thetaY1!).toBeCloseTo(19.923, 2);

      // Yellow 2 (579.1 nm)
      const thetaY2 = computeDiffractionAngleDeg(MERCURY_LINES.yellow2.wavelengthNm, 1, e_nm);
      expect(thetaY2).not.toBeNull();
      // sin(θ) = 579.1 / 1693.333 ≈ 0.341988 => θ ≈ 19.998°
      expect(thetaY2!).toBeCloseTo(19.998, 2);

      // Yellow doublet angular separation in 1st order: ~0.075° = 4.5 arcminutes
      expect(thetaY2! - thetaY1!).toBeCloseTo(0.075, 2);
    });

    it('produces exact 2nd order diffraction angles for 15,000 LPI', () => {
      // Violet (404.7 nm, n=2)
      const thetaViolet2 = computeDiffractionAngleDeg(MERCURY_LINES.violet.wavelengthNm, 2, e_nm);
      // sin(θ) = 2 * 404.7 / 1693.333 ≈ 0.47799 => θ ≈ 28.555°
      expect(thetaViolet2!).toBeCloseTo(28.555, 2);

      // Green (546.1 nm, n=2)
      const thetaGreen2 = computeDiffractionAngleDeg(MERCURY_LINES.green.wavelengthNm, 2, e_nm);
      // sin(θ) = 2 * 546.1 / 1693.333 ≈ 0.6450 => θ ≈ 40.166°
      expect(thetaGreen2!).toBeCloseTo(40.166, 2);

      // Yellow doublet angular separation doubles in 2nd order: ~0.19° ≈ 11.5 arcminutes
      const thetaY1_2 = computeDiffractionAngleDeg(MERCURY_LINES.yellow1.wavelengthNm, 2, e_nm)!;
      const thetaY2_2 = computeDiffractionAngleDeg(MERCURY_LINES.yellow2.wavelengthNm, 2, e_nm)!;
      expect(thetaY2_2 - thetaY1_2).toBeCloseTo(0.192, 2);
    });

    it('returns symmetrical negative angles for negative orders (left side readings)', () => {
      const thetaRight = computeDiffractionAngleDeg(MERCURY_LINES.green.wavelengthNm, 1, e_nm)!;
      const thetaLeft = computeDiffractionAngleDeg(MERCURY_LINES.green.wavelengthNm, -1, e_nm)!;
      expect(thetaLeft).toBeCloseTo(-thetaRight, 6);
    });

    it('returns null for physically impossible orders where sin(θ) > 1', () => {
      // For 15,000 LPI (e = 1693 nm), 3rd order green (3 * 546.1 = 1638.3 nm < 1693) exists,
      // but 3rd order yellow (3 * 579.1 = 1737.3 nm > 1693) is impossible (sin θ > 1).
      const impossibleAngle = computeDiffractionAngleDeg(MERCURY_LINES.yellow2.wavelengthNm, 3, e_nm);
      expect(impossibleAngle).toBeNull();
    });

    it('returns 0 for order 0 (central un-diffracted beam)', () => {
      expect(computeDiffractionAngleDeg(546.1, 0, e_nm)).toBe(0);
    });
  });

  describe('Wavelength Solver λ = (e · sin θ) / n', () => {
    const e_nm = lpiToGratingElementNm(15000);

    it('perfectly recovers original wavelengths from exact angles', () => {
      for (const line of MERCURY_LINES_LIST) {
        const thetaDeg = computeDiffractionAngleDeg(line.wavelengthNm, 1, e_nm)!;
        const recoveredLambda = computeWavelengthNm(e_nm, thetaDeg, 1);
        expect(recoveredLambda).toBeCloseTo(line.wavelengthNm, 4);
      }
    });

    it('handles negative angles symmetrically', () => {
      const thetaDeg = computeDiffractionAngleDeg(MERCURY_LINES.green.wavelengthNm, -1, e_nm)!;
      const recoveredLambda = computeWavelengthNm(e_nm, thetaDeg, -1);
      expect(recoveredLambda).toBeCloseTo(MERCURY_LINES.green.wavelengthNm, 4);
    });

    it('guards against order = 0 (division by zero)', () => {
      expect(computeWavelengthNm(e_nm, 10, 0)).toBeNull();
    });
  });

  describe('DMS (Degrees, Minutes, Seconds) Conversions & Parsers', () => {
    it('correctly converts decimal degrees to DMS format', () => {
      const dms1 = decimalDegToDMS(18.815);
      // 18° + 0.815 * 60 = 18° 48.9' ≈ 18° 49'
      expect(dms1.degrees).toBe(18);
      expect(dms1.minutes).toBe(49);
      expect(dms1.formatted).toBe("18° 49'");

      const dmsZero = decimalDegToDMS(0);
      expect(dmsZero.formatted).toBe("0° 00'");

      const dmsNeg = decimalDegToDMS(-14.914);
      expect(dmsNeg.sign).toBe(-1);
      expect(dmsNeg.formatted).toBe("-14° 55'");
    });

    it('round-trips decimal -> DMS -> decimal accurately', () => {
      const initial = 28.555;
      const dms = decimalDegToDMS(initial);
      const recovered = dmsToDecimalDeg(dms.degrees, dms.minutes, dms.seconds);
      expect(recovered).toBeCloseTo(initial, 2);
    });

    it('parses diverse student string formats correctly', () => {
      expect(parseDMSToDecimal("18° 49'")).toBeCloseTo(18.8166, 3);
      expect(parseDMSToDecimal("18 49")).toBeCloseTo(18.8166, 3);
      expect(parseDMSToDecimal("18.815")).toBeCloseTo(18.815, 3);
      expect(parseDMSToDecimal("-14° 55'")).toBeCloseTo(-14.9166, 3);
      expect(parseDMSToDecimal("")).toBeNull();
      expect(parseDMSToDecimal("invalid")).toBeNull();
    });
  });

  describe('Vernier Noise Simulation', () => {
    it('returns exact angle when noise is off', () => {
      expect(applyVernierNoise(18.815, false)).toBe(18.815);
    });

    it('keeps noise within realistic ±1 arcminute range (±0.0167°)', () => {
      for (let i = 0; i < 50; i++) {
        const noisy = applyVernierNoise(20.0, true);
        expect(noisy).toBeGreaterThanOrEqual(20.0 - 1 / 60 - 1e-6);
        expect(noisy).toBeLessThanOrEqual(20.0 + 1 / 60 + 1e-6);
      }
    });
  });

  describe('Spectral Peaks & Bench Telemetry', () => {
    it('generates all expected peaks for 15,000 LPI in orders -2 to +2', () => {
      const peaks = getAllSpectralPeaks(15000, 'all');
      // n=0 (1 white) + n=1 (5 lines) + n=-1 (5 lines) + n=2 (5 lines) + n=-2 (5 lines) = 21 peaks
      expect(peaks.length).toBe(21);
      expect(peaks.some((p) => p.order === 0)).toBe(true);
      expect(peaks.some((p) => p.line.id === 'green' && p.order === 1)).toBe(true);
      expect(peaks.some((p) => p.line.id === 'yellow2' && p.order === 2)).toBe(true);
    });

    it('filters peaks when a specific order is selected', () => {
      const peaksOrder1 = getAllSpectralPeaks(15000, 1);
      // n=1 (5) + n=-1 (5) = 10 peaks
      expect(peaksOrder1.length).toBe(10);
      expect(peaksOrder1.every((p) => Math.abs(p.order) === 1)).toBe(true);
    });

    it('detects when telescope is aligned with green line (18.815°)', () => {
      const state = computeGratingBenchState(true, 15000, 18.815, 'all', false);
      expect(state.activeLineNearby?.id).toBe('green');
      expect(state.currentOrder).toBe(1);
      expect(Math.abs(state.alignmentDiffDeg!)).toBeLessThan(0.01);
    });
  });

  describe('Active Learning Math Checker (2% Tolerance Verification)', () => {
    it('validates correct hand-calculated values within 2%', () => {
      // Green 1st order: θL = 18.815°, θR = 18.815° => 2θ = 37.63°, θ = 18.815°, sin θ = 0.3225, λ = 546.1 nm
      const result = verifyDiffractionObservation(
        18.815,
        18.815,
        1,
        15000,
        {
          twoTheta: '37.63',
          theta: '18.82',
          sinTheta: '0.3225',
          lambda: '546.1',
        }
      );

      expect(result.twoTheta.correct).toBe(true);
      expect(result.theta.correct).toBe(true);
      expect(result.sinTheta.correct).toBe(true);
      expect(result.lambda.correct).toBe(true);
      expect(result.allCorrect).toBe(true);
    });

    it('flags student mistakes exceeding 2% tolerance and provides helpful formula hints', () => {
      const result = verifyDiffractionObservation(
        18.815,
        18.815,
        1,
        15000,
        {
          twoTheta: '30.0', // Wrong
          theta: '18.82',
          sinTheta: '0.50', // Wrong
          lambda: '400.0', // Wrong
        }
      );

      expect(result.twoTheta.correct).toBe(false);
      expect(result.twoTheta.hint).toContain('2θ = |θ_Left - θ_Right|');
      expect(result.theta.correct).toBe(true);
      expect(result.sinTheta.correct).toBe(false);
      expect(result.lambda.correct).toBe(false);
      expect(result.allCorrect).toBe(false);
    });
  });

  describe('Linear Regression & Experimental Grating Constant Verification', () => {
    it('verifies linear proportionality sin(θ) vs n·λ with R² > 0.9999 and recovers 15,000 LPI', () => {
      const e_nm = lpiToGratingElementNm(15000);
      // Points (x = n * λ in cm, y = sin(θ))
      // Since 1 cm = 10^7 nm:
      const points = MERCURY_LINES_LIST.map((line) => {
        const thetaRad = computeDiffractionAngleRad(line.wavelengthNm, 1, e_nm)!;
        const sinTheta = Math.sin(thetaRad);
        const x_cm = (1 * line.wavelengthNm) / 1e7;
        return { x: x_cm, y: sinTheta };
      });

      const regression = computeGratingRegression(points, 15000);

      // Slope = 1 / e_cm = 15000 / 2.54 ≈ 5905.51 cm^-1
      expect(regression.r2).toBeGreaterThan(0.9999);
      expect(regression.experimentalLPI).toBe(15000);
      expect(regression.percentError).toBeLessThan(0.01);
      expect(regression.verified).toBe(true);
    });
  });

  describe('Dispersive & Resolving Power Formulas', () => {
    it('calculates dispersive power dθ/dλ for green line in 1st order', () => {
      const e_nm = lpiToGratingElementNm(15000);
      const thetaRad = computeDiffractionAngleRad(MERCURY_LINES.green.wavelengthNm, 1, e_nm)!;
      const disp = computeDispersivePowerDegPerNm(1, e_nm, thetaRad);
      // dθ/dλ = 1 / (1693.33 * cos(18.815°)) rad/nm ≈ 6.24 * 10^-4 rad/nm ≈ 0.0357 deg/nm
      expect(disp).toBeGreaterThan(0.03);
      expect(disp).toBeLessThan(0.045);
    });

    it('calculates theoretical resolving power R = n * N', () => {
      // 1 inch ruled width => 15,000 lines
      const rOrder1 = computeResolvingPower(1, 15000);
      const rOrder2 = computeResolvingPower(2, 15000);
      expect(rOrder1).toBe(15000);
      expect(rOrder2).toBe(30000);
    });
  });
});
