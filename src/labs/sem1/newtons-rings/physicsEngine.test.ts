import { describe, it, expect } from 'vitest';
import {
  computeDarkRingRadiusCm,
  computeDarkRingDiameterCm,
  computeDarkRingDiameterSqCm2,
  computeRadialIntensity,
  computeWavelengthFromDifferenceNm,
  computeWavelengthFromDiametersNm,
  computeNewtonsRingsRegression,
  calculateVernierReading,
  applyMicrometerNoise,
  isWithinTolerance,
  verifyNewtonsRingsObservation,
  getSampleNewtonsRingsObservations,
  SODIUM_D_LINE_NM,
  DEFAULT_LENS_RADIUS_CM,
  MICROMETER_LEAST_COUNT_CM,
} from './physicsEngine';

describe("Newton's Rings Physics Engine", () => {
  describe('Dark Ring Radius & Diameter Calculations', () => {
    it('computes exact dark ring radius for central spot (n=0) as 0 when D0^2 = 0', () => {
      const r0 = computeDarkRingRadiusCm(0, SODIUM_D_LINE_NM, 100, 0);
      expect(r0).toBe(0);
      const d0 = computeDarkRingDiameterCm(0, SODIUM_D_LINE_NM, 100, 0);
      expect(d0).toBe(0);
      const d0Sq = computeDarkRingDiameterSqCm2(0, SODIUM_D_LINE_NM, 100, 0);
      expect(d0Sq).toBe(0);
    });

    it('computes radius and diameter with r_n = sqrt(n * lambda * R) for n=4 and n=16', () => {
      const R = 100; // cm
      const lambdaCm = SODIUM_D_LINE_NM * 1e-7; // 5.893e-5 cm

      // n = 4
      const expectedR4 = Math.sqrt(4 * lambdaCm * R);
      const r4 = computeDarkRingRadiusCm(4, SODIUM_D_LINE_NM, R, 0);
      expect(r4).toBeCloseTo(expectedR4, 6);

      const d4 = computeDarkRingDiameterCm(4, SODIUM_D_LINE_NM, R, 0);
      expect(d4).toBeCloseTo(2 * expectedR4, 6);

      const d4Sq = computeDarkRingDiameterSqCm2(4, SODIUM_D_LINE_NM, R, 0);
      expect(d4Sq).toBeCloseTo(4 * 4 * lambdaCm * R, 6);

      // n = 16
      const expectedR16 = Math.sqrt(16 * lambdaCm * R);
      const r16 = computeDarkRingRadiusCm(16, SODIUM_D_LINE_NM, R, 0);
      expect(r16).toBeCloseTo(expectedR16, 6);
      expect(r16).toBeCloseTo(2 * r4, 6); // because sqrt(16) / sqrt(4) = 2
    });

    it('properly includes contact offset D0^2 in diameter and radius', () => {
      const D0Sq = 0.02; // cm^2
      const d0 = computeDarkRingDiameterCm(0, SODIUM_D_LINE_NM, 100, D0Sq);
      expect(d0).toBeCloseTo(Math.sqrt(0.02), 6);

      const d4Sq = computeDarkRingDiameterSqCm2(4, SODIUM_D_LINE_NM, 100, D0Sq);
      const expectedD4Sq = 4 * 4 * (SODIUM_D_LINE_NM * 1e-7) * 100 + D0Sq;
      expect(d4Sq).toBeCloseTo(expectedD4Sq, 6);
    });

    it('guards against invalid inputs (negative n, zero or negative R/lambda)', () => {
      expect(computeDarkRingRadiusCm(-1, SODIUM_D_LINE_NM, 100)).toBe(0);
      expect(computeDarkRingRadiusCm(4, 0, 100)).toBe(0);
      expect(computeDarkRingRadiusCm(4, SODIUM_D_LINE_NM, -50)).toBe(0);
      expect(computeDarkRingDiameterCm(-5, SODIUM_D_LINE_NM, 100)).toBe(0);
      expect(computeDarkRingDiameterSqCm2(-5, SODIUM_D_LINE_NM, 100)).toBe(0);
    });
  });

  describe('Contact-Offset Cancellation in Difference Formula', () => {
    it('cancels out contact offset D0^2 identically and recovers exact lambda', () => {
      const R = 100; // cm
      const p = 4;
      const n = 8;
      const contactOffset = 0.035; // significant contact imperfection

      const dnSq = computeDarkRingDiameterSqCm2(n, SODIUM_D_LINE_NM, R, contactOffset);
      const dnPlusPSq = computeDarkRingDiameterSqCm2(n + p, SODIUM_D_LINE_NM, R, contactOffset);

      const diffSq = dnPlusPSq - dnSq;
      // Theoretical diffSq = 4 * p * lambda * R (without contactOffset)
      const expectedDiffSq = 4 * p * (SODIUM_D_LINE_NM * 1e-7) * R;
      expect(diffSq).toBeCloseTo(expectedDiffSq, 8);

      const recoveredLambdaNm = computeWavelengthFromDifferenceNm(diffSq, p, R);
      expect(recoveredLambdaNm).toBeCloseTo(SODIUM_D_LINE_NM, 4);
    });

    it('works identically via computeWavelengthFromDiametersNm', () => {
      const R = 120;
      const p = 5;
      const n = 6;
      const dn = computeDarkRingDiameterCm(n, SODIUM_D_LINE_NM, R, 0.012);
      const dnPlusP = computeDarkRingDiameterCm(n + p, SODIUM_D_LINE_NM, R, 0.012);

      const recoveredLambda = computeWavelengthFromDiametersNm(dnPlusP, dn, p, R);
      expect(recoveredLambda).toBeCloseTo(SODIUM_D_LINE_NM, 4);
    });

    it('guards against invalid p <= 0, R <= 0, or non-finite inputs', () => {
      expect(computeWavelengthFromDifferenceNm(0.094, 0, 100)).toBe(0);
      expect(computeWavelengthFromDifferenceNm(0.094, -2, 100)).toBe(0);
      expect(computeWavelengthFromDifferenceNm(0.094, 4, 0)).toBe(0);
      expect(computeWavelengthFromDifferenceNm(0.094, 4, -100)).toBe(0);
      expect(computeWavelengthFromDifferenceNm(NaN, 4, 100)).toBe(0);
      expect(computeWavelengthFromDiametersNm(0, 0.2, 4, 100)).toBe(0);
    });
  });

  describe('Radial Intensity Profile', () => {
    it('evaluates to 0 (minimum intensity) at exact dark ring radii', () => {
      const R = 100;
      for (const n of [1, 2, 4, 9, 16]) {
        const rn = computeDarkRingRadiusCm(n, SODIUM_D_LINE_NM, R, 0);
        const intensity = computeRadialIntensity(rn, SODIUM_D_LINE_NM, R, 0);
        expect(intensity).toBeLessThan(1e-10); // essentially zero
      }
    });

    it('evaluates close to 1 (maximum brightness) at bright ring radii', () => {
      const R = 100;
      const lambdaCm = SODIUM_D_LINE_NM * 1e-7;
      // Bright rings occur at r^2 = (n - 0.5) * lambda * R
      for (const n of [1, 2, 3]) {
        const rBright = Math.sqrt((n - 0.5) * lambdaCm * R);
        const intensity = computeRadialIntensity(rBright, SODIUM_D_LINE_NM, R, 0);
        expect(intensity).toBeCloseTo(1.0, 5);
      }
    });

    it('guards against invalid lambda and radius', () => {
      expect(computeRadialIntensity(0.5, 0, 100)).toBe(0);
      expect(computeRadialIntensity(0.5, SODIUM_D_LINE_NM, -10)).toBe(0);
    });
  });

  describe('Linear Regression Helper (Dn^2 vs n)', () => {
    it('yields R^2 = 1.00000 and recovers exact lambda and intercept in ideal conditions', () => {
      const R = 100;
      const D0Sq = 0.015; // cm^2
      const testOrders = [2, 4, 6, 8, 10, 12, 14, 16];
      const points = testOrders.map((n) => ({
        n,
        dnSq: computeDarkRingDiameterSqCm2(n, SODIUM_D_LINE_NM, R, D0Sq),
      }));

      const reg = computeNewtonsRingsRegression(points, R, SODIUM_D_LINE_NM);

      expect(reg.pointsCount).toBe(8);
      expect(reg.r2).toBeCloseTo(1.0, 4);
      expect(reg.intercept).toBeCloseTo(D0Sq, 4);
      expect(reg.calculatedLambdaNm).toBeCloseTo(SODIUM_D_LINE_NM, 1);
      expect(reg.percentageError).toBeLessThan(0.05);
    });

    it('handles small datasets and guarded conditions gracefully', () => {
      expect(computeNewtonsRingsRegression([], 100).r2).toBe(0);
      expect(computeNewtonsRingsRegression([{ n: 1, dnSq: 0.02 }], 100).r2).toBe(0);
      expect(computeNewtonsRingsRegression([{ n: 1, dnSq: 0.02 }, { n: 2, dnSq: 0.04 }], -50).r2).toBe(0);
    });
  });

  describe('Vernier Scale Synthesizer', () => {
    it('correctly deconstructs position into MSR and VSR', () => {
      // 5.123 cm:
      // MSR = floor(5.123 / 0.05) * 0.05 = 102 * 0.05 = 5.100 cm
      // Remainder = 0.023 cm = 23 * 0.001 cm => VSR = 23
      const reading = calculateVernierReading(5.123);
      expect(reading.msrCm).toBeCloseTo(5.100, 3);
      expect(reading.vsrDiv).toBe(23);
      expect(reading.totalCm).toBeCloseTo(5.123, 3);
      expect(reading.formatted).toBe('5.123 cm');
    });

    it('handles exact multiples of pitch', () => {
      const reading = calculateVernierReading(5.000);
      expect(reading.msrCm).toBe(5.000);
      expect(reading.vsrDiv).toBe(0);
      expect(reading.totalCm).toBe(5.000);
    });

    it('guards against negative or non-finite position', () => {
      const reading = calculateVernierReading(-1);
      expect(reading.totalCm).toBe(0);
      expect(reading.msrCm).toBe(0);
      expect(reading.vsrDiv).toBe(0);
    });
  });

  describe('Micrometer Noise Simulation', () => {
    it('returns exact position when noise is off', () => {
      expect(applyMicrometerNoise(5.123, false)).toBe(5.123);
    });

    it('adds jitter bounded within +/- least count when noise is on', () => {
      const base = 5.250;
      for (let i = 0; i < 50; i++) {
        const noisy = applyMicrometerNoise(base, true);
        expect(Math.abs(noisy - base)).toBeLessThanOrEqual(MICROMETER_LEAST_COUNT_CM);
      }
    });
  });

  describe('Student Math Verification (2% Tolerance)', () => {
    it('verifies values within 2% tolerance correctly', () => {
      expect(isWithinTolerance(589.3, 589.3, 2.0)).toBe(true);
      expect(isWithinTolerance(585.0, 589.3, 2.0)).toBe(true); // ~0.73% err
      expect(isWithinTolerance(600.0, 589.3, 2.0)).toBe(true); // ~1.81% err
      expect(isWithinTolerance(605.0, 589.3, 2.0)).toBe(false); // ~2.66% err
      expect(isWithinTolerance(NaN, 589.3, 2.0)).toBe(false);
    });

    it('verifies row calculation with accurate student inputs', () => {
      const xL = 4.693;
      const xR = 5.307;
      const expectedDn = 0.614;
      const expectedDnSq = expectedDn * expectedDn; // ~0.376996
      const pairedRow = { diameterSq_ref_cm2: 0.5655 };
      const pStep = 4;
      const R = 100;
      const expectedDiffSq = 0.5655 - expectedDnSq;
      const expectedLambda = computeWavelengthFromDifferenceNm(expectedDiffSq, pStep, R);

      const verification = verifyNewtonsRingsObservation(
        xL,
        xR,
        R,
        pStep,
        pairedRow,
        {
          diameter: expectedDn.toFixed(3),
          diameterSq: expectedDnSq.toFixed(4),
          diffSq: expectedDiffSq.toFixed(4),
          lambda: expectedLambda.toFixed(1),
        }
      );

      expect(verification.allCorrect).toBe(true);
      expect(verification.diameter.correct).toBe(true);
      expect(verification.diameterSq.correct).toBe(true);
      expect(verification.diffSq?.correct).toBe(true);
      expect(verification.lambda?.correct).toBe(true);
    });

    it('rejects row calculation when inputs exceed tolerance or are invalid', () => {
      const verification = verifyNewtonsRingsObservation(
        4.693,
        5.307,
        100,
        4,
        { diameterSq_ref_cm2: 0.5655 },
        {
          diameter: '1.500', // incorrect
          diameterSq: '0.377',
          diffSq: '0.1885',
          lambda: '589.3',
        }
      );

      expect(verification.allCorrect).toBe(false);
      expect(verification.diameter.correct).toBe(false);
    });
  });

  describe('Sample Lab Readings Generator', () => {
    it('produces 8 standard AKTU observation rows with paired differences for p=4', () => {
      const rows = getSampleNewtonsRingsObservations(100, 5.0);
      expect(rows.length).toBe(8);

      const rowOrders = rows.map((r) => r.ringOrder);
      expect(rowOrders).toEqual([16, 14, 12, 10, 8, 6, 4, 2]);

      // Check row for n = 12 (paired with 16)
      const row12 = rows.find((r) => r.ringOrder === 12);
      expect(row12?.pairedOrder).toBe(16);
      expect(row12?.pStep).toBe(4);
      expect(row12?.lambda_ref_nm).toBeCloseTo(SODIUM_D_LINE_NM, 0);

      // Student fields start empty
      rows.forEach((r) => {
        expect(r.diameter_student_cm).toBe('');
        expect(r.diameterSq_student_cm2).toBe('');
      });
    });
  });
});
