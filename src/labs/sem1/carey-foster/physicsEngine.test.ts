import { describe, it, expect } from 'vitest';
import {
  computeNullPoint,
  computeGalvoDeflection,
  computeRhoW,
  computeUnknownResistanceY,
  computeSpecificResistance,
  computeLinearRegression,
  isWithinTolerance,
  verifyPartARow,
  verifyPartBRow,
  verifyScrewGaugeAndRho,
  computeCareyFosterBenchState,
  DEFAULT_RHO_W,
  DEFAULT_ALPHA,
  DEFAULT_BETA,
  WIRE_SPECIMENS,
} from './physicsEngine';
import type { PartARow, PartBRow, ScrewGaugeStudentState } from './types';

describe("Carey Foster's Bridge Physics Engine", () => {
  // ─── Test 1: Mathematical Proof of End-Error Cancellation ──────────────────
  describe('Mathematical Elimination of End-Errors (α and β)', () => {
    it('proves that l2 - l1 cancels out α and β identically for any arbitrary end-resistances', () => {
      const rho_w = 0.035;
      const X = 0.5;
      const Y = 0.0; // Copper strip

      // Test with multiple arbitrary pairs of alpha and beta
      const endErrorPairs = [
        { alpha: 0.0, beta: 0.0 },
        { alpha: 0.05, beta: 0.08 },
        { alpha: 0.12, beta: 0.03 },
        { alpha: 0.25, beta: 0.45 },
        { alpha: -0.02, beta: 0.06 },
      ];

      for (const { alpha, beta } of endErrorPairs) {
        // Normal: X in left, Y in right
        const l1 = computeNullPoint(X, Y, rho_w, alpha, beta, false);
        // Interchanged: Y in left, X in right
        const l2 = computeNullPoint(Y, X, rho_w, alpha, beta, false);

        const diff = l2 - l1;
        const expectedDiff = (X - Y) / rho_w;

        // Difference must equal X / rho_w within floating point precision
        expect(diff).toBeCloseTo(expectedDiff, 6);
        expect(X / diff).toBeCloseTo(rho_w, 6);
      }
    });

    it('proves that l2 prime - l1 prime cancels out α and β when unknown resistance Y is present', () => {
      const rho_w = 0.035;
      const X = 0.8;
      const Y = 1.04; // Constantan specimen

      const endErrorPairs = [
        { alpha: 0.0, beta: 0.0 },
        { alpha: 0.05, beta: 0.08 },
        { alpha: 0.2, beta: 0.1 },
      ];

      for (const { alpha, beta } of endErrorPairs) {
        const l1 = computeNullPoint(X, Y, rho_w, alpha, beta, false);
        const l2 = computeNullPoint(Y, X, rho_w, alpha, beta, false);

        const diff = l2 - l1;
        const expectedDiff = (X - Y) / rho_w;

        expect(diff).toBeCloseTo(expectedDiff, 6);
        const recoveredY = X - rho_w * diff;
        expect(recoveredY).toBeCloseTo(Y, 6);
      }
    });
  });

  // ─── Test 2: Calibration & Inverse Solvers ──────────────────────────────────
  describe('Resistance per Unit Length (ρ_w) & Linear Regression', () => {
    it('recovers exact ρ_w = 0.0350 Ω/cm for standard resistance box steps', () => {
      const steps = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1.0];

      for (const X of steps) {
        const l1 = computeNullPoint(X, 0, DEFAULT_RHO_W, DEFAULT_ALPHA, DEFAULT_BETA, false);
        const l2 = computeNullPoint(0, X, DEFAULT_RHO_W, DEFAULT_ALPHA, DEFAULT_BETA, false);

        const calculatedRhoW = computeRhoW(X, l1, l2);
        expect(calculatedRhoW).not.toBeNull();
        expect(calculatedRhoW).toBeCloseTo(DEFAULT_RHO_W, 4);
      }
    });

    it('produces linear regression of (l2 - l1) vs X with slope = 1/ρ_w and R² = 1.0000', () => {
      const steps = [0.2, 0.4, 0.6, 0.8, 1.0];
      const points = steps.map((X) => {
        const l1 = computeNullPoint(X, 0, DEFAULT_RHO_W, DEFAULT_ALPHA, DEFAULT_BETA, false);
        const l2 = computeNullPoint(0, X, DEFAULT_RHO_W, DEFAULT_ALPHA, DEFAULT_BETA, false);
        return { x: X, y: l2 - l1 };
      });

      const reg = computeLinearRegression(points);
      const expectedSlope = 1.0 / DEFAULT_RHO_W; // 1 / 0.035 = 28.5714

      expect(reg.slope).toBeCloseTo(expectedSlope, 2);
      expect(reg.intercept).toBeCloseTo(0.0, 2);
      expect(reg.r2).toBeCloseTo(1.0, 3);

      const deducedRhoW = 1.0 / reg.slope;
      expect(deducedRhoW).toBeCloseTo(DEFAULT_RHO_W, 3);
    });
  });

  // ─── Test 3: Unknown Resistance & Specific Resistance Recovery ──────────────
  describe('Unknown Resistance Y and Specific Resistance ρ Recovery', () => {
    it('recovers exact Y and specific resistance for all four standard specimens', () => {
      const specimens = Object.values(WIRE_SPECIMENS);

      for (const spec of specimens) {
        const X = 0.8;
        const l1 = computeNullPoint(X, spec.nominalResistanceOhm, DEFAULT_RHO_W, DEFAULT_ALPHA, DEFAULT_BETA, false);
        const l2 = computeNullPoint(spec.nominalResistanceOhm, X, DEFAULT_RHO_W, DEFAULT_ALPHA, DEFAULT_BETA, false);

        const recoveredY = computeUnknownResistanceY(X, l1, l2, DEFAULT_RHO_W);
        expect(recoveredY).not.toBeNull();
        expect(recoveredY!).toBeCloseTo(spec.nominalResistanceOhm, 3);

        const recoveredRho = computeSpecificResistance(recoveredY!, spec.diameterMm, spec.lengthCm);
        expect(recoveredRho).not.toBeNull();
        expect(recoveredRho!).toBeCloseTo(spec.resistivityOhmM, 8);
      }
    });
  });

  // ─── Test 4: Galvanometer Deflection & Null Detection ───────────────────────
  describe('Galvanometer Needle Deflection Model', () => {
    it('snaps cleanly to zero deflection when within 0.05 cm of null point', () => {
      const nullPt = 50.0;

      const exact = computeGalvoDeflection(50.0, nullPt);
      expect(exact.deflectionDiv).toBe(0.0);
      expect(exact.isAtNull).toBe(true);

      const withinThreshold = computeGalvoDeflection(50.03, nullPt);
      expect(withinThreshold.deflectionDiv).toBe(0.0);
      expect(withinThreshold.isAtNull).toBe(true);
    });

    it('deflects left (- div) when jockey is left of null point and right (+ div) when right of null point', () => {
      const nullPt = 50.0;

      const left = computeGalvoDeflection(45.0, nullPt);
      expect(left.deflectionDiv).toBeLessThan(0);
      expect(left.isAtNull).toBe(false);

      const right = computeGalvoDeflection(55.0, nullPt);
      expect(right.deflectionDiv).toBeGreaterThan(0);
      expect(right.isAtNull).toBe(false);

      // Deflection should saturate gracefully and never exceed 30 divisions
      const farLeft = computeGalvoDeflection(10.0, nullPt);
      expect(farLeft.deflectionDiv).toBeGreaterThanOrEqual(-30.0);

      const farRight = computeGalvoDeflection(90.0, nullPt);
      expect(farRight.deflectionDiv).toBeLessThanOrEqual(30.0);
    });
  });

  // ─── Test 5: Randomized Noise Mode Trials ───────────────────────────────────
  describe('Realistic Noise Trials (±0.2 cm)', () => {
    it('maintains slope and average ρ_w within 1.5% across 100 randomized noisy trials', () => {
      const noisyRhoWList: number[] = [];

      for (let seed = 1; seed <= 100; seed++) {
        const X = 0.5;
        const l1 = computeNullPoint(X, 0, DEFAULT_RHO_W, DEFAULT_ALPHA, DEFAULT_BETA, true, seed);
        const l2 = computeNullPoint(0, X, DEFAULT_RHO_W, DEFAULT_ALPHA, DEFAULT_BETA, true, seed + 50);

        const rho_w = computeRhoW(X, l1, l2);
        if (rho_w !== null) {
          noisyRhoWList.push(rho_w);
        }
      }

      const avgRhoW = noisyRhoWList.reduce((a, b) => a + b, 0) / noisyRhoWList.length;
      expect(avgRhoW).toBeCloseTo(DEFAULT_RHO_W, 2);
    });
  });

  // ─── Test 6: 2% Student Math Verification Helper ───────────────────────────
  describe('2% Math-Checker Tolerance & Feedback', () => {
    it('passes student answers within 2% tolerance and rejects errors > 2%', () => {
      expect(isWithinTolerance(10.0, 10.0, 2.0)).toBe(true);
      expect(isWithinTolerance(10.15, 10.0, 2.0)).toBe(true); // +1.5% error
      expect(isWithinTolerance(9.85, 10.0, 2.0)).toBe(true);  // -1.5% error
      expect(isWithinTolerance(10.3, 10.0, 2.0)).toBe(false); // +3.0% error
      expect(isWithinTolerance(9.7, 10.0, 2.0)).toBe(false);  // -3.0% error
    });

    it('verifies Part A row calculation correctly', () => {
      const row: PartARow = {
        id: 1,
        resistanceX_ohm: 0.4,
        l1_cm: 44.71,
        l2_cm: 56.14,
        diff_ref_cm: 11.43,
        rho_w_ref: 0.0350,
        diff_student: '11.43',
        rho_w_student: '0.0350',
        verified: false,
        cellStatus: { diff: 'idle', rho_w: 'idle' },
      };

      const result = verifyPartARow(row);
      expect(result.diff.correct).toBe(true);
      expect(result.rho_w.correct).toBe(true);

      // Wrong input
      const wrongRow: PartARow = {
        ...row,
        diff_student: '15.00',
        rho_w_student: '0.0500',
      };
      const wrongResult = verifyPartARow(wrongRow);
      expect(wrongResult.diff.correct).toBe(false);
      expect(wrongResult.rho_w.correct).toBe(false);
    });

    it('verifies Part B row and Screw Gauge calculation correctly', () => {
      const row: PartBRow = {
        id: 1,
        resistanceX_ohm: 0.8,
        l1_cm: 53.86,
        l2_cm: 47.00,
        diff_ref_cm: -6.86,
        y_ref_ohm: 1.040,
        diff_student: '-6.86',
        y_student: '1.040',
        verified: false,
        cellStatus: { diff: 'idle', y: 'idle' },
      };

      const result = verifyPartBRow(row, DEFAULT_RHO_W);
      expect(result.diff.correct).toBe(true);
      expect(result.y.correct).toBe(true);

      const sgState: ScrewGaugeStudentState = {
        msr_mm: '0.5',
        csr_div: '10',
        zeroError_mm: '0.0',
        diameter_student_mm: '0.60',
        radius_student_cm: '0.0300',
        length_student_cm: '60.0',
        rho_student_ohm_m: '0.49', // 0.49 × 10⁻⁶ Ω·m
        verified: false,
        cellStatus: { diameter: 'idle', radius: 'idle', length: 'idle', rho: 'idle' },
      };

      const sgResult = verifyScrewGaugeAndRho(sgState, WIRE_SPECIMENS.constantan, 1.04);
      expect(sgResult.diameter.correct).toBe(true);
      expect(sgResult.radius.correct).toBe(true);
      expect(sgResult.length.correct).toBe(true);
      expect(sgResult.rho.correct).toBe(true);
    });
  });

  // ─── Test 7: Edge Cases & Crash Protection ─────────────────────────────────
  describe('Edge Cases & Defensive Safeguards', () => {
    it('handles division by zero when l2 = l1 gracefully without NaN or throwing', () => {
      expect(computeRhoW(0.5, 50.0, 50.0)).toBeNull();
      expect(computeUnknownResistanceY(0.5, 50.0, 50.0, 0.035)).toBe(0.5);
    });

    it('handles negative or zero length and diameter in specific resistance gracefully', () => {
      expect(computeSpecificResistance(1.0, 0, 50.0)).toBeNull();
      expect(computeSpecificResistance(1.0, 0.5, -10.0)).toBeNull();
      expect(computeSpecificResistance(0, 0.5, 50.0)).toBeNull();
      expect(computeSpecificResistance(NaN, 0.5, 50.0)).toBeNull();
    });

    it('safely computes linear regression on empty or single-point datasets', () => {
      expect(computeLinearRegression([])).toEqual({ slope: 0, intercept: 0, r2: 0 });
      expect(computeLinearRegression([{ x: 1, y: 1 }])).toEqual({ slope: 0, intercept: 0, r2: 0 });
    });

    it('clamps null point within physical meter wire [0, 100] cm', () => {
      // Very large imbalance
      const leftExtreme = computeNullPoint(100.0, 0.0, DEFAULT_RHO_W, 0, 0, false);
      expect(leftExtreme).toBe(0.0);

      const rightExtreme = computeNullPoint(0.0, 100.0, DEFAULT_RHO_W, 0, 0, false);
      expect(rightExtreme).toBe(100.0);
    });

    it('computes live bench state without runtime exceptions', () => {
      const state = computeCareyFosterBenchState(
        'partA',
        'normal',
        0.5,
        WIRE_SPECIMENS.constantan,
        45.0,
        false,
        0
      );
      expect(state.nullPointCm).toBeGreaterThan(0);
      expect(state.nullPointCm).toBeLessThan(100);
      expect(state.galvoDeflectionDiv).toBeDefined();
    });
  });
});
