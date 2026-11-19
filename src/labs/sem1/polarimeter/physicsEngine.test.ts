// ─── physicsEngine.test.ts — Half-Shade Polarimeter Physics Unit Tests ──────

import { describe, it, expect } from 'vitest';
import {
  SUCROSE_SPECIFIC_ROTATION,
  SODIUM_D_LINE_NM,
  computeOpticalRotation,
  computeAnalyzerBalanceAngle,
  computeHalfShadeFieldLuminance,
  calculateSpecificRotation,
  calculateUnknownConcentration,
  linearRegressionDeltaThetaVsC,
  verifyPolarimeterStudentMath,
  computeBenchState,
  formatVernierAngle,
  getSamplePolarimeterObservations,
  normalizeAngularMismatch,
} from './physicsEngine';
import type { PolarimeterObsRow } from './types';

describe('Half-Shade Polarimeter Physics Engine', () => {
  describe('Optical Rotation Scaling (Biot\'s Law: Δθ = S · L · c)', () => {
    it('calculates expected optical rotation for standard cane sugar concentrations at L = 2.0 dm', () => {
      const S = SUCROSE_SPECIFIC_ROTATION; // 66.5°
      const L = 2.0;

      // 5% sugar: c = 0.05 g/cm³ -> Δθ = 66.5 * 2 * 0.05 = 6.65°
      expect(computeOpticalRotation(S, L, 0.05)).toBeCloseTo(6.65, 2);

      // 10% sugar: c = 0.10 g/cm³ -> Δθ = 66.5 * 2 * 0.10 = 13.30°
      expect(computeOpticalRotation(S, L, 0.10)).toBeCloseTo(13.30, 2);

      // 15% sugar: c = 0.15 g/cm³ -> Δθ = 66.5 * 2 * 0.15 = 19.95°
      expect(computeOpticalRotation(S, L, 0.15)).toBeCloseTo(19.95, 2);

      // 20% sugar: c = 0.20 g/cm³ -> Δθ = 66.5 * 2 * 0.20 = 26.60°
      expect(computeOpticalRotation(S, L, 0.20)).toBeCloseTo(26.60, 2);
    });

    it('scales linearly with polarimeter tube length L', () => {
      const S = 66.5;
      const c = 0.10;

      const rot10 = computeOpticalRotation(S, 1.0, c); // 1.0 dm (10 cm)
      const rot20 = computeOpticalRotation(S, 2.0, c); // 2.0 dm (20 cm)
      const rot22 = computeOpticalRotation(S, 2.2, c); // 2.2 dm (22 cm)

      expect(rot10).toBeCloseTo(6.65, 2);
      expect(rot20).toBeCloseTo(13.30, 2);
      expect(rot22).toBeCloseTo(14.63, 2);
      expect(rot20 / rot10).toBeCloseTo(2.0, 4);
    });

    it('returns 0 for zero or distilled water concentration', () => {
      expect(computeOpticalRotation(66.5, 2.0, 0.0)).toBe(0.0);
    });

    it('guards against negative, zero or NaN tube length and concentrations safely', () => {
      expect(computeOpticalRotation(66.5, -2.0, 0.10)).toBe(0.0);
      expect(computeOpticalRotation(66.5, 2.0, -0.05)).toBe(0.0);
      expect(computeOpticalRotation(NaN, 2.0, 0.10)).toBe(0.0);
      expect(computeOpticalRotation(66.5, NaN, 0.10)).toBe(0.0);
      expect(computeOpticalRotation(66.5, 2.0, NaN)).toBe(0.0);
    });
  });

  describe('Analyzer Balance Angle & Periodic Wrapping', () => {
    it('computes θ = θ₀ + Δθ wrapped within [0, 360)', () => {
      const theta0 = 10.0;
      const deltaTheta = 13.3;
      expect(computeAnalyzerBalanceAngle(theta0, deltaTheta)).toBe(23.3);
    });

    it('wraps around 360° seamlessly', () => {
      expect(computeAnalyzerBalanceAngle(350.0, 20.0)).toBe(10.0);
      expect(computeAnalyzerBalanceAngle(-10.0, 0.0)).toBe(350.0);
    });

    it('correctly incorporates noise offset when active', () => {
      expect(computeAnalyzerBalanceAngle(10.0, 13.3, 0.08)).toBe(23.38);
    });
  });

  describe('Half-Shade Split-Field Luminance & Equal Brightness Match', () => {
    it('yields equal brightness (contrast ≈ 0 and isEqual = true) at the exact match angle', () => {
      const balance = 23.30;
      const res = computeHalfShadeFieldLuminance(balance, balance);

      expect(res.isEqual).toBe(true);
      expect(res.leftLuminance).toBeCloseTo(res.rightLuminance, 3);
      expect(res.contrast).toBeLessThan(0.01);
    });

    it('shows Left half brighter when analyzer is rotated past balance point (Δφ > 0)', () => {
      const balance = 23.30;
      const current = 28.00; // +4.7° clockwise
      const res = computeHalfShadeFieldLuminance(current, balance);

      expect(res.isEqual).toBe(false);
      expect(res.leftLuminance).toBeGreaterThan(res.rightLuminance);
      expect(res.contrast).toBeGreaterThan(0.15);
    });

    it('shows Right half brighter when analyzer is rotated behind balance point (Δφ < 0)', () => {
      const balance = 23.30;
      const current = 18.00; // -5.3° counter-clockwise
      const res = computeHalfShadeFieldLuminance(current, balance);

      expect(res.isEqual).toBe(false);
      expect(res.rightLuminance).toBeGreaterThan(res.leftLuminance);
      expect(res.contrast).toBeGreaterThan(0.15);
    });

    it('keeps luminance values bounded between 0 and 1', () => {
      for (let angle = 0; angle <= 360; angle += 15) {
        const res = computeHalfShadeFieldLuminance(angle, 45.0);
        expect(res.leftLuminance).toBeGreaterThanOrEqual(0);
        expect(res.leftLuminance).toBeLessThanOrEqual(1);
        expect(res.rightLuminance).toBeGreaterThanOrEqual(0);
        expect(res.rightLuminance).toBeLessThanOrEqual(1);
      }
    });

    it('respects 180° inversion symmetry of polarimeter balance', () => {
      const balance = 20.0;
      const res0 = computeHalfShadeFieldLuminance(20.0, balance);
      const res180 = computeHalfShadeFieldLuminance(200.0, balance);

      expect(res0.isEqual).toBe(true);
      expect(res180.isEqual).toBe(true);
      expect(res0.contrast).toBeCloseTo(res180.contrast, 2);
    });
  });

  describe('Inverse Calculations: Specific Rotation & Unknown Concentration', () => {
    it('accurately recovers S = Δθ / (L · c)', () => {
      const deltaTheta = 13.30;
      const L = 2.0;
      const c = 0.10;
      const S = calculateSpecificRotation(deltaTheta, L, c);
      expect(S).toBeCloseTo(66.5, 1);
    });

    it('returns null on division by zero or invalid inputs for S', () => {
      expect(calculateSpecificRotation(13.3, 0, 0.1)).toBeNull();
      expect(calculateSpecificRotation(13.3, 2.0, 0)).toBeNull();
      expect(calculateSpecificRotation(0, 2.0, 0.1)).toBeNull();
      expect(calculateSpecificRotation(-5, 2.0, 0.1)).toBeNull();
      expect(calculateSpecificRotation(NaN, 2.0, 0.1)).toBeNull();
    });

    it('accurately solves unknown concentration c = Δθ / (S · L)', () => {
      const S = 66.5;
      const L = 2.0;
      const expectedC = 0.125; // 12.5% unknown
      const deltaTheta = S * L * expectedC; // 16.625°

      const solvedC = calculateUnknownConcentration(deltaTheta, L, S);
      expect(solvedC).toBeCloseTo(0.125, 3);
    });

    it('returns null on invalid inputs for unknown concentration', () => {
      expect(calculateUnknownConcentration(10.0, 0, 66.5)).toBeNull();
      expect(calculateUnknownConcentration(10.0, 2.0, 0)).toBeNull();
      expect(calculateUnknownConcentration(0, 2.0, 66.5)).toBeNull();
    });
  });

  describe('Linear Regression (Δθ vs c calibration curve)', () => {
    it('recovers slope = S · L and S_graph = slope / L with R² = 1.000 for ideal points', () => {
      const L = 2.0;
      const S = 66.5;
      const points = [
        { c: 0.05, deltaTheta: S * L * 0.05 },
        { c: 0.10, deltaTheta: S * L * 0.10 },
        { c: 0.15, deltaTheta: S * L * 0.15 },
        { c: 0.20, deltaTheta: S * L * 0.20 },
      ];

      const reg = linearRegressionDeltaThetaVsC(points, L);
      expect(reg.pointsCount).toBe(4);
      expect(reg.slope).toBeCloseTo(133.0, 2);
      expect(reg.intercept).toBeCloseTo(0.0, 2);
      expect(reg.r2).toBeCloseTo(1.0, 3);
      expect(reg.specificRotation).toBeCloseTo(66.5, 1);
    });

    it('handles fewer than 2 points without crashing', () => {
      const reg0 = linearRegressionDeltaThetaVsC([], 2.0);
      expect(reg0.slope).toBe(0);
      expect(reg0.specificRotation).toBeNull();

      const reg1 = linearRegressionDeltaThetaVsC([{ c: 0.1, deltaTheta: 13.3 }], 2.0);
      expect(reg1.slope).toBe(0);
      expect(reg1.specificRotation).toBeNull();
    });

    it('handles identical x coordinates (zero variance) safely', () => {
      const reg = linearRegressionDeltaThetaVsC(
        [
          { c: 0.1, deltaTheta: 10 },
          { c: 0.1, deltaTheta: 12 },
        ],
        2.0
      );
      expect(reg.slope).toBe(0);
      expect(reg.specificRotation).toBeNull();
    });
  });

  describe('Active Learning Student Math Verification (2% Tolerance)', () => {
    const baseRow: PolarimeterObsRow = {
      id: 1,
      solutionName: '10% Cane Sugar Solution',
      concentration_g_cm3: 0.10,
      tubeLength_dm: 2.0,
      referenceAngle_deg: 10.00,
      observedAngle_deg: 23.30,
      deltaTheta_ref: 13.30,
      specificRotation_ref: 66.5,
      deltaTheta_student: '',
      specificRotation_student: '',
      verified: false,
      cellStatus: { deltaTheta: 'idle', specificRotation: 'idle' },
    };

    it('accepts hand-calculated Δθ and S within 2% tolerance', () => {
      const testRow: PolarimeterObsRow = {
        ...baseRow,
        deltaTheta_student: '13.30',
        specificRotation_student: '66.5',
      };
      const res = verifyPolarimeterStudentMath(testRow);
      expect(res.deltaTheta.correct).toBe(true);
      expect(res.specificRotation.correct).toBe(true);
      expect(res.allCorrect).toBe(true);
    });

    it('accepts slight student rounding within 2%', () => {
      // 66.5 * 0.985 = 65.5 (within 2%)
      const testRow: PolarimeterObsRow = {
        ...baseRow,
        deltaTheta_student: '13.3',
        specificRotation_student: '65.8',
      };
      const res = verifyPolarimeterStudentMath(testRow);
      expect(res.allCorrect).toBe(true);
    });

    it('flags math that is outside 2% tolerance as wrong', () => {
      const testRow: PolarimeterObsRow = {
        ...baseRow,
        deltaTheta_student: '11.00', // expected 13.30
        specificRotation_student: '55.0', // expected 66.5
      };
      const res = verifyPolarimeterStudentMath(testRow);
      expect(res.deltaTheta.correct).toBe(false);
      expect(res.specificRotation.correct).toBe(false);
      expect(res.allCorrect).toBe(false);
    });

    it('handles blank water reference row cleanly', () => {
      const waterRow: PolarimeterObsRow = {
        id: 0,
        solutionName: 'Distilled Water (Blank)',
        concentration_g_cm3: 0.0,
        tubeLength_dm: 2.0,
        referenceAngle_deg: 10.0,
        observedAngle_deg: 10.0,
        deltaTheta_ref: 0.0,
        specificRotation_ref: 0.0,
        deltaTheta_student: '0.0',
        specificRotation_student: '-',
        verified: false,
        cellStatus: { deltaTheta: 'idle', specificRotation: 'idle' },
      };
      const res = verifyPolarimeterStudentMath(waterRow);
      expect(res.deltaTheta.correct).toBe(true);
      expect(res.specificRotation.correct).toBe(true);
      expect(res.allCorrect).toBe(true);
    });
  });

  describe('Bench State & Vernier Formatting', () => {
    it('sets zero luminance when lamp is turned off', () => {
      const state = computeBenchState(false, 20.0, 2.0, '10%', 10.0, false);
      expect(state.lampOn).toBe(false);
      expect(state.leftLuminance).toBe(0);
      expect(state.rightLuminance).toBe(0);
      expect(state.isEqualBrightness).toBe(false);
    });

    it('formats vernier angle into degrees and arcminutes', () => {
      const vernier = formatVernierAngle(23.50);
      expect(vernier.msr).toBe(23);
      expect(vernier.vsr).toBe(10); // 0.50 / 0.05
      expect(vernier.formatted).toContain('23° 30\'');
    });

    it('generates sample observation rows properly', () => {
      const rows = getSamplePolarimeterObservations(2.0, 10.0);
      expect(rows.length).toBe(5);
      expect(rows[0].concentration_g_cm3).toBe(0.0); // water
      expect(rows[1].concentration_g_cm3).toBe(0.05); // 5%
      expect(rows[4].concentration_g_cm3).toBe(0.20); // 20%
      expect(rows[2].deltaTheta_student).toBe(''); // active learning: blank by default
    });
  });
});
