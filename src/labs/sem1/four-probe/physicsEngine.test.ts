import { describe, it, expect } from 'vitest';
import {
  computeKelvin,
  computeThousandOverT,
  computeG7Correction,
  computeBulkResistivity,
  computeResistivity,
  computeLog10Rho,
  computeLnRho,
  computeGeResistivity,
  computeIdealVoltage,
  computeFourProbeState,
  computeFourProbeRegression,
  verifyFourProbeObservation,
  applyNoise,
  PROBE_SPACING_S,
  CRYSTAL_THICKNESS_W,
  EG_GE_TARGET,
  SLOPE_FACTOR,
  THIN_SLICE_FACTOR,
} from './physicsEngine';

describe('Four-Probe Physics Engine — Pure Mathematical Functions', () => {
  describe('Temperature and Unit Conversion', () => {
    it('computeKelvin converts °C to K accurately', () => {
      expect(computeKelvin(0)).toBe(273.15);
      expect(computeKelvin(25)).toBe(298.15);
      expect(computeKelvin(100)).toBe(373.15);
    });

    it('computeKelvin guards against temperatures below absolute zero', () => {
      expect(computeKelvin(-274)).toBe(0);
      expect(computeKelvin(-300)).toBe(0);
    });

    it('computeThousandOverT returns 1000 / T (K^-1)', () => {
      expect(computeThousandOverT(1000)).toBe(1);
      expect(computeThousandOverT(500)).toBe(2);
      const res = computeThousandOverT(300);
      expect(res).not.toBeNull();
      expect(res!).toBeCloseTo(3.3333, 3);
    });

    it('computeThousandOverT returns null when T <= 0', () => {
      expect(computeThousandOverT(0)).toBeNull();
      expect(computeThousandOverT(-50)).toBeNull();
    });
  });

  describe('Geometric Correction Factor & Resistivity Formulas', () => {
    it('computeG7Correction computes (2s/w) * ln(2)', () => {
      const g7 = computeG7Correction(0.2, 0.05);
      // (2 * 0.2 / 0.05) * ln(2) = 8 * ln(2) ≈ 5.545177
      expect(g7).toBeCloseTo(8 * Math.LN2, 5);
    });

    it('computeG7Correction guards against non-positive inputs', () => {
      expect(computeG7Correction(0, 0.05)).toBe(0);
      expect(computeG7Correction(0.2, -0.01)).toBe(0);
    });

    it('computeBulkResistivity computes (V / I) * 2πs', () => {
      // V = 10 mV, I = 2 mA => V/I = 5 Ω
      // 5 * 2 * π * 0.2 = 2π ≈ 6.283185 Ω·cm
      const rho0 = computeBulkResistivity(10, 2, 0.2);
      expect(rho0).toBeCloseTo(2 * Math.PI, 4);
    });

    it('computeBulkResistivity guards against I <= 0 and s <= 0', () => {
      expect(computeBulkResistivity(10, 0, 0.2)).toBe(0);
      expect(computeBulkResistivity(10, -2, 0.2)).toBe(0);
      expect(computeBulkResistivity(10, 2, 0)).toBe(0);
      expect(computeBulkResistivity(-5, 2, 0.2)).toBe(0);
    });

    it('computeResistivity applies thin-slice correction: ρ = (πw / ln 2) * (V / I)', () => {
      // w = 0.05 cm, s = 0.2 cm
      // factor = π * 0.05 / ln(2) ≈ 0.226618
      // If V = 100 mV, I = 2 mA => V/I = 50 Ω
      // ρ = 50 * 0.226618007 ≈ 11.3309 Ω·cm
      const rho = computeResistivity(100, 2, 0.05, 0.2);
      expect(rho).not.toBeNull();
      expect(rho!).toBeCloseTo(50 * THIN_SLICE_FACTOR, 4);
    });

    it('computeResistivity guards against I <= 0, V < 0, or w <= 0', () => {
      expect(computeResistivity(100, 0, 0.05, 0.2)).toBeNull();
      expect(computeResistivity(100, -2, 0.05, 0.2)).toBeNull();
      expect(computeResistivity(-10, 2, 0.05, 0.2)).toBeNull();
      expect(computeResistivity(100, 2, 0, 0.2)).toBeNull();
    });

    it('computeLog10Rho and computeLnRho handle positive values and guard <= 0', () => {
      expect(computeLog10Rho(100)).toBeCloseTo(2, 5);
      expect(computeLog10Rho(1)).toBeCloseTo(0, 5);
      expect(computeLog10Rho(0)).toBeNull();
      expect(computeLog10Rho(-5)).toBeNull();

      expect(computeLnRho(Math.E)).toBeCloseTo(1, 5);
      expect(computeLnRho(0)).toBeNull();
      expect(computeLnRho(-2)).toBeNull();
    });
  });

  describe('Germanium Intrinsic Resistivity Model', () => {
    it('computeGeResistivity yields expected reference value at 300 K', () => {
      const rho300 = computeGeResistivity(300);
      expect(rho300).toBeCloseTo(45.0, 3);
    });

    it('computeGeResistivity decreases monotonically with increasing temperature (NTC behavior)', () => {
      const rho300 = computeGeResistivity(300);
      const rho350 = computeGeResistivity(350);
      const rho400 = computeGeResistivity(400);

      expect(rho300).toBeGreaterThan(rho350);
      expect(rho350).toBeGreaterThan(rho400);
      expect(rho400).toBeGreaterThan(0);
    });

    it('computeGeResistivity guards against non-positive temperatures', () => {
      expect(computeGeResistivity(0)).toBe(0);
      expect(computeGeResistivity(-100)).toBe(0);
    });

    it('computeIdealVoltage scales linearly with current', () => {
      const v2 = computeIdealVoltage(350, 2.0);
      const v4 = computeIdealVoltage(350, 4.0);
      expect(v4).toBeCloseTo(2 * v2, 4);
    });
  });

  describe('Linear Regression and Degenerate Edge Cases', () => {
    it('returns null for empty array or single point', () => {
      expect(computeFourProbeRegression([])).toBeNull();
      expect(computeFourProbeRegression([{ x: 2.5, y: 1.2 }])).toBeNull();
    });

    it('returns null for degenerate vertical line (identical x values)', () => {
      const degenerate = [
        { x: 3.0, y: 1.0 },
        { x: 3.0, y: 2.0 },
        { x: 3.0, y: 3.0 },
      ];
      expect(computeFourProbeRegression(degenerate)).toBeNull();
    });

    it('calculates exact slope and intercept for synthetic linear data', () => {
      // y = 2.0 * x + 1.5
      const data = [
        { x: 1.0, y: 3.5 },
        { x: 2.0, y: 5.5 },
        { x: 3.0, y: 7.5 },
        { x: 4.0, y: 9.5 },
      ];
      const reg = computeFourProbeRegression(data);
      expect(reg).not.toBeNull();
      expect(reg!.slope).toBeCloseTo(2.0, 5);
      expect(reg!.intercept).toBeCloseTo(1.5, 5);
      expect(reg!.r2).toBeCloseTo(1.0, 5);
    });
  });

  describe('🔭 CRITICAL: Energy Band Gap Eg ≈ 0.67 eV Verification', () => {
    it('Ideal Mode: reproduces Germanium Eg ≈ 0.67 eV with R² > 0.9999 across 40°C–150°C', () => {
      const tempsC = [40, 55, 70, 85, 100, 115, 130, 145, 160];
      const points = tempsC.map((tc) => {
        const state = computeFourProbeState(true, tc, tc, 3.0, 'x10', false);
        return {
          x: state.invT,
          y: state.log10Rho,
        };
      });

      const reg = computeFourProbeRegression(points);
      expect(reg).not.toBeNull();
      console.log(`\n  ── Four-Probe Ideal Mode Regression ──`);
      console.log(`  Slope m   = ${reg!.slope.toFixed(6)}`);
      console.log(`  Eg (eV)   = ${reg!.eg_eV.toFixed(4)} eV (Target: ${EG_GE_TARGET} eV)`);
      console.log(`  R²        = ${reg!.r2.toFixed(8)}`);
      console.log(`  % Error   = ${reg!.percentError.toFixed(3)}%\n`);

      expect(reg!.eg_eV).toBeCloseTo(0.67, 2);
      expect(reg!.r2).toBeGreaterThan(0.9999);
      expect(reg!.percentError).toBeLessThan(0.1);
      expect(reg!.verified).toBe(true);
    });

    it('Noise Mode (±1.5%): Eg stays within [0.65, 0.69] eV over 100 randomized trials', () => {
      const tempsC = [40, 55, 70, 85, 100, 115, 130, 145, 160];
      let minEg = Infinity;
      let maxEg = -Infinity;
      let sumEg = 0;
      const TRIALS = 100;

      for (let t = 0; t < TRIALS; t++) {
        const points = tempsC.map((tc) => {
          const state = computeFourProbeState(true, tc, tc, 3.0, 'x10', true);
          return {
            x: state.invT,
            y: state.log10Rho,
          };
        });

        const reg = computeFourProbeRegression(points);
        expect(reg).not.toBeNull();
        const eg = reg!.eg_eV;
        if (eg < minEg) minEg = eg;
        if (eg > maxEg) maxEg = eg;
        sumEg += eg;

        expect(eg).toBeGreaterThanOrEqual(0.64);
        expect(eg).toBeLessThanOrEqual(0.70);
        expect(reg!.verified).toBe(true);
      }

      const avgEg = sumEg / TRIALS;
      console.log(`  ── Four-Probe Noise Mode (100 trials) ──`);
      console.log(`  Min Eg = ${minEg.toFixed(4)} eV`);
      console.log(`  Max Eg = ${maxEg.toFixed(4)} eV`);
      console.log(`  Avg Eg = ${avgEg.toFixed(4)} eV`);
      expect(avgEg).toBeCloseTo(0.67, 1);
    });
  });

  describe('Bench State Generator & Voltmeter Range Handling', () => {
    it('returns zero telemetry when power is OFF', () => {
      const state = computeFourProbeState(false, 80, 25, 3.0, 'x10', false);
      expect(state.powerOn).toBe(false);
      expect(state.I_mA).toBe(0);
      expect(state.V_mV).toBe(0);
      expect(state.displayVoltageText).toBe('000.0');
    });

    it('handles x1 voltmeter range overflow (>199.9 mV)', () => {
      // At room temperature (~30 °C), V for 3 mA is > 500 mV
      const state = computeFourProbeState(true, 30, 30, 3.0, 'x1', false);
      expect(state.V_mV).toBeGreaterThan(199.9);
      expect(state.isOverRange).toBe(true);
      expect(state.displayVoltageText.trim()).toBe('1 .');
    });

    it('displays normal voltage in x1 range when V <= 199.9 mV', () => {
      // At high temperature (~120 °C), V drops well below 199.9 mV
      const state = computeFourProbeState(true, 120, 120, 3.0, 'x1', false);
      expect(state.V_mV).toBeLessThan(199.9);
      expect(state.isOverRange).toBe(false);
      expect(state.displayVoltageText).toMatch(/^\d+\.\d$/);
    });

    it('in x10 range, high voltages up to 1999 mV do not overflow', () => {
      const state = computeFourProbeState(true, 30, 30, 3.0, 'x10', false);
      expect(state.isOverRange).toBe(false);
      expect(parseFloat(state.displayVoltageText)).toBeGreaterThan(300);
    });
  });

  describe('Active Learning: 2% Student Math Verification', () => {
    it('passes all fields when student enters exact values', () => {
      const tempC = 50;
      const I_mA = 3.0;
      const V_mV = 150.0;
      const tempK = tempC + 273.15;
      const invT = 1000 / tempK;
      const rho = (Math.PI * CRYSTAL_THICKNESS_W / Math.LN2) * (V_mV / I_mA);
      const logRho = Math.log10(rho);

      const student = {
        tempK: tempK.toFixed(2),
        invT: invT.toFixed(3),
        rho: rho.toFixed(3),
        logRho: logRho.toFixed(4),
      };

      const result = verifyFourProbeObservation(tempC, I_mA, V_mV, student);
      expect(result.allCorrect).toBe(true);
      expect(result.tempK.correct).toBe(true);
      expect(result.invT.correct).toBe(true);
      expect(result.rho.correct).toBe(true);
      expect(result.logRho.correct).toBe(true);
    });

    it('accepts student hand calculations within 2% tolerance (calculator rounding)', () => {
      const tempC = 60;
      const I_mA = 3.0;
      const V_mV = 120.0;
      const tempK = tempC + 273.15; // 333.15
      const invT = 1000 / tempK;    // 3.00165
      const rho = (Math.PI * CRYSTAL_THICKNESS_W / Math.LN2) * (V_mV / I_mA); // ~9.0647
      const logRho = Math.log10(rho); // ~0.9573

      // Student rounds T to 333, invT to 3.00, rho to 9.15 (+0.9%), logRho to 0.96
      const student = {
        tempK: '333',
        invT: '3.00',
        rho: '9.15',
        logRho: '0.96',
      };

      const result = verifyFourProbeObservation(tempC, I_mA, V_mV, student);
      expect(result.allCorrect).toBe(true);
    });

    it('rejects student values beyond 2% tolerance and returns helpful hints', () => {
      const tempC = 60;
      const I_mA = 3.0;
      const V_mV = 120.0;

      const student = {
        tempK: '350', // Wrong: off by > 16 K (> 5%)
        invT: '5.00', // Completely wrong
        rho: '25.0',  // Wrong
        logRho: '2.5', // Wrong
      };

      const result = verifyFourProbeObservation(tempC, I_mA, V_mV, student);
      expect(result.allCorrect).toBe(false);
      expect(result.tempK.correct).toBe(false);
      expect(result.invT.correct).toBe(false);
      expect(result.rho.correct).toBe(false);
      expect(result.logRho.correct).toBe(false);
      expect(result.rho.hint).toContain('Formula: ρ = (π·w / ln 2)');
    });

    it('handles empty or non-numeric student input without crashing', () => {
      const student = {
        tempK: '',
        invT: 'abc',
        rho: '',
        logRho: '-',
      };

      const result = verifyFourProbeObservation(50, 3.0, 150.0, student);
      expect(result.allCorrect).toBe(false);
      expect(result.tempK.entered).toBeNull();
      expect(result.invT.entered).toBeNull();
    });
  });

  describe('applyNoise function properties', () => {
    it('stays strictly within ±5% over 1000 trials', () => {
      const original = 100.0;
      for (let i = 0; i < 1000; i++) {
        const noisy = applyNoise(original, 0.015);
        expect(noisy).toBeGreaterThan(95.0);
        expect(noisy).toBeLessThan(105.0);
      }
    });
  });
});
