import { describe, it, expect } from 'vitest';
import {
  kGToTesla,
  teslaToKG,
  computeTheoreticalRH,
  computeHallVoltage,
  computeRHFromMeasurements,
  computeCarrierDensity,
  computeCarrierMobility,
  applyLabNoise,
  computeHallBenchState,
  verifyHallObservation,
  computeLinearRegression,
  computeHallRegression,
  DEFAULT_THICKNESS_MM,
  DEFAULT_CARRIER_DENSITY_M3,
  DEFAULT_RESISTIVITY_OHM_CM,
  ELEMENTARY_CHARGE_C,
} from './physicsEngine';

describe('Hall Effect Physics Engine — Pure Functions & Physical Guarantees', () => {
  describe('Unit Conversions (Tesla ↔ kiloGauss)', () => {
    it('accurately converts kiloGauss to Tesla (10 kG = 1 T)', () => {
      expect(kGToTesla(0)).toBe(0);
      expect(kGToTesla(10)).toBe(1.0);
      expect(kGToTesla(3.0)).toBe(0.3);
      expect(kGToTesla(5.5)).toBe(0.55);
      expect(kGToTesla(-2)).toBe(0); // guarded against negative
    });

    it('accurately converts Tesla to kiloGauss', () => {
      expect(teslaToKG(0)).toBe(0);
      expect(teslaToKG(0.1)).toBe(1.0);
      expect(teslaToKG(0.35)).toBe(3.5);
      expect(teslaToKG(-0.5)).toBe(0); // guarded
    });
  });

  describe('Theoretical Hall Coefficient RH & Specimen Polarity', () => {
    it('yields negative RH for n-type Germanium', () => {
      const rh_n = computeTheoreticalRH('n-type', DEFAULT_CARRIER_DENSITY_M3);
      expect(rh_n).toBeLessThan(0);
      // |RH| = 1 / (1.25e21 * 1.602176634e-19) ≈ 4.9932e-3 m³/C
      expect(Math.abs(rh_n)).toBeCloseTo(4.993e-3, 5);
    });

    it('yields positive RH for p-type Germanium with equal magnitude', () => {
      const rh_p = computeTheoreticalRH('p-type', DEFAULT_CARRIER_DENSITY_M3);
      const rh_n = computeTheoreticalRH('n-type', DEFAULT_CARRIER_DENSITY_M3);
      expect(rh_p).toBeGreaterThan(0);
      expect(rh_p).toBeCloseTo(-rh_n, 8);
    });

    it('guards against non-positive carrier concentration', () => {
      expect(computeTheoreticalRH('n-type', 0)).toBe(0);
      expect(computeTheoreticalRH('p-type', -100)).toBe(0);
    });
  });

  describe('Transverse Hall Voltage (VH) Calculation', () => {
    it('computes exact Hall voltage: VH = (RH · I · B) / t', () => {
      // RH = -4.9932e-3 m³/C, I = 5.0 mA, B = 0.3 T, t = 0.5 mm
      // I = 5.0e-3 A, t = 0.5e-3 m
      // VH = (-4.9932e-3 * 5e-3 * 0.3) / 0.5e-3 = -1.49796e-3 V = -14.98 mV
      const rh = computeTheoreticalRH('n-type', DEFAULT_CARRIER_DENSITY_M3);
      const vh = computeHallVoltage(rh, 5.0, 0.3, DEFAULT_THICKNESS_MM);
      expect(vh).toBeCloseTo(-14.98, 1);
    });

    it('returns positive voltage for p-type material', () => {
      const rh = computeTheoreticalRH('p-type', DEFAULT_CARRIER_DENSITY_M3);
      const vh = computeHallVoltage(rh, 5.0, 0.3, DEFAULT_THICKNESS_MM);
      expect(vh).toBeGreaterThan(0);
      expect(vh).toBeCloseTo(14.98, 1);
    });

    it('guards against zero current, zero field, or non-positive thickness', () => {
      const rh = computeTheoreticalRH('n-type');
      expect(computeHallVoltage(rh, 0, 0.3, 0.5)).toBe(0);
      expect(computeHallVoltage(rh, 5.0, 0, 0.5)).toBe(0);
      expect(computeHallVoltage(rh, 5.0, 0.3, 0)).toBe(0);
      expect(computeHallVoltage(rh, 5.0, 0.3, -1)).toBe(0);
    });
  });

  describe('Inverse Physics: Extracting RH, n, and μ from Measurements', () => {
    it('recovers Hall coefficient RH accurately from VH, I, B, and t', () => {
      const rh_true = computeTheoreticalRH('n-type', DEFAULT_CARRIER_DENSITY_M3);
      const vh = computeHallVoltage(rh_true, 4.0, 0.25, 0.5);
      const rh_measured = computeRHFromMeasurements(vh, 4.0, 0.25, 0.5);

      expect(rh_measured).not.toBeNull();
      expect(rh_measured!).toBeCloseTo(rh_true, 5);
    });

    it('recovers carrier concentration n = 1 / (|RH| · e)', () => {
      const rh = -4.9932e-3;
      const n = computeCarrierDensity(rh);
      expect(n).not.toBeNull();
      expect(n!).toBeCloseTo(DEFAULT_CARRIER_DENSITY_M3, -18);
    });

    it('computes carrier mobility μ = |RH| / ρ', () => {
      const rh = 4.9932e-3; // m³/C
      const mu = computeCarrierMobility(rh, DEFAULT_RESISTIVITY_OHM_CM);
      expect(mu).not.toBeNull();
      // ρ = 8.5 Ω·cm = 0.085 Ω·m
      // μ_SI = 4.9932e-3 / 0.085 ≈ 0.05874 m²/(V·s)
      // μ_cgs = 0.05874 * 1e4 ≈ 587.4 cm²/(V·s)
      expect(mu!).toBeCloseTo(587.4, 0);
    });

    it('guards against division by zero in inverse formulas', () => {
      expect(computeRHFromMeasurements(10, 0, 0.3, 0.5)).toBeNull();
      expect(computeRHFromMeasurements(10, 5, 0, 0.5)).toBeNull();
      expect(computeRHFromMeasurements(10, 5, 0.3, 0)).toBeNull();
      expect(computeCarrierDensity(0)).toBeNull();
      expect(computeCarrierMobility(0, 8.5)).toBeNull();
      expect(computeCarrierMobility(4.99e-3, 0)).toBeNull();
    });
  });

  describe('Virtual Bench Telemetry State', () => {
    it('returns zeroed state when power is OFF', () => {
      const state = computeHallBenchState(false, 'n-type', 5.0, 3.0);
      expect(state.powerOn).toBe(false);
      expect(state.currentI_mA).toBe(0);
      expect(state.hallVoltage_mV).toBe(0);
      expect(state.magneticFieldB_T).toBe(0);
    });

    it('returns active telemetry when power is ON', () => {
      const state = computeHallBenchState(true, 'n-type', 5.0, 3.0, 0.5, 8.5, false);
      expect(state.powerOn).toBe(true);
      expect(state.currentI_mA).toBe(5.0);
      expect(state.magneticFieldB_T).toBe(0.3);
      expect(state.hallVoltage_mV).toBeCloseTo(-14.98, 1);
      expect(state.carrierDensity_m3).toBeCloseTo(DEFAULT_CARRIER_DENSITY_M3, -18);
    });

    it('injects ±1.5% noise when noise is ON', () => {
      const stateIdeal = computeHallBenchState(true, 'n-type', 5.0, 3.0, 0.5, 8.5, false);
      const stateNoisy = computeHallBenchState(true, 'n-type', 5.0, 3.0, 0.5, 8.5, true);

      expect(Math.abs(stateNoisy.hallVoltage_mV - stateIdeal.hallVoltage_mV)).toBeLessThan(
        Math.abs(stateIdeal.hallVoltage_mV) * 0.02
      );
    });
  });

  describe('Student Math Verification (2% Tolerance Rule)', () => {
    it('validates correct student inputs within 2%', () => {
      const result = verifyHallObservation(
        'n-type',
        -14.98, // VH
        5.0,    // I (mA)
        0.3,    // B (T)
        0.5,    // t (mm)
        8.5,    // rho (ohm·cm)
        {
          rh: '-5.0',     // Expected ≈ -4.99 in 10⁻³ m³/C
          n: '1.25',      // Expected ≈ 1.25 in 10²¹ m⁻³
          mobility: '587', // Expected ≈ 587.4 in cm²/V·s
        }
      );

      expect(result.rh.correct).toBe(true);
      expect(result.n.correct).toBe(true);
      expect(result.mobility.correct).toBe(true);
    });

    it('rejects wrong student inputs that deviate > 2%', () => {
      const result = verifyHallObservation(
        'n-type',
        -14.98,
        5.0,
        0.3,
        0.5,
        8.5,
        {
          rh: '-10.5', // off by 100%
          n: '3.5',    // off
          mobility: '150', // off
        }
      );

      expect(result.rh.correct).toBe(false);
      expect(result.n.correct).toBe(false);
      expect(result.mobility.correct).toBe(false);
    });

    it('handles blank or non-numeric entries gracefully without throw', () => {
      const result = verifyHallObservation(
        'n-type',
        -14.98,
        5.0,
        0.3,
        0.5,
        8.5,
        {
          rh: '',
          n: 'invalid-string',
          mobility: '   ',
        }
      );

      expect(result.rh.correct).toBe(false);
      expect(result.n.correct).toBe(false);
      expect(result.mobility.correct).toBe(false);
    });
  });

  describe('Linear Regression & Slope Analysis', () => {
    it('fits linear data with R² ≈ 1.0', () => {
      const points = [
        { x: 0.1, y: 5.0 },
        { x: 0.2, y: 10.0 },
        { x: 0.3, y: 15.0 },
        { x: 0.4, y: 20.0 },
      ];
      const fit = computeLinearRegression(points);
      expect(fit).not.toBeNull();
      expect(fit!.slope).toBeCloseTo(50.0, 3);
      expect(fit!.intercept).toBeCloseTo(0, 3);
      expect(fit!.r2).toBe(1.0);
    });

    it('recovers RH and carrier type from V_H vs B slope (at fixed I = 5 mA)', () => {
      // Points: B (Tesla) vs VH (mV) for n-type Ge (slope ≈ -49.93 mV/T)
      const points = [
        { x: 0.1, y: -4.99 },
        { x: 0.2, y: -9.99 },
        { x: 0.3, y: -14.98 },
        { x: 0.4, y: -19.97 },
      ];

      const reg = computeHallRegression(points, 'Vh_vs_B', 5.0, 0.5);
      expect(reg).not.toBeNull();
      expect(reg!.carrierType).toBe('n-type');
      expect(reg!.r2).toBeGreaterThanOrEqual(0.999);
      expect(reg!.extractedCarrierDensity_m3).toBeCloseTo(DEFAULT_CARRIER_DENSITY_M3, -19);
      expect(reg!.verified).toBe(true);
    });

    it('recovers RH and carrier type from V_H vs I slope (at fixed B = 0.3 T)', () => {
      // Points: I (mA) vs VH (mV) for p-type Ge (slope ≈ +2.996 mV/mA)
      const points = [
        { x: 2.0, y: 5.99 },
        { x: 4.0, y: 11.98 },
        { x: 6.0, y: 17.98 },
        { x: 8.0, y: 23.97 },
      ];

      const reg = computeHallRegression(points, 'Vh_vs_I', 0.3, 0.5);
      expect(reg).not.toBeNull();
      expect(reg!.carrierType).toBe('p-type');
      expect(reg!.r2).toBeGreaterThanOrEqual(0.999);
      expect(reg!.extractedCarrierDensity_m3).toBeCloseTo(DEFAULT_CARRIER_DENSITY_M3, -19);
      expect(reg!.verified).toBe(true);
    });

    it('guards against single point or empty datasets', () => {
      expect(computeLinearRegression([])).toBeNull();
      expect(computeLinearRegression([{ x: 1, y: 2 }])).toBeNull();
      expect(computeHallRegression([], 'Vh_vs_B', 5.0)).toBeNull();
    });
  });
});
