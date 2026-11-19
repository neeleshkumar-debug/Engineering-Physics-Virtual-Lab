// ─── Central Lab Registry ──────────────────────────────────────────────────────
// To add a new experiment:
//   1. Create src/labs/semX/your-experiment/ folder
//   2. Add ONE entry to this array below
//   3. Register the route in src/App.tsx
// That's it — Sidebar, LabGrid, and LabCard all update automatically.

import type { LabMeta } from '../types/lab';

export const labsRegistry: LabMeta[] = [
  // ── YEAR 1 · SEMESTER 1 ────────────────────────────────────────────────────
  {
    slug: 'stefans-law',
    title: "Verification of Stefan's Law",
    shortDesc:
      'Verify the Stefan–Boltzmann radiation law using a tungsten filament bulb. Plot log(P) vs log(T) and determine the radiation exponent n ≈ 4.',
    year: 1,
    semester: 1,
    category: 'Thermal',
    difficulty: 'Intermediate',
    status: 'live',
    icon: 'Flame',
    estimatedTime: '45 min',
    apparatus: [
      '6V DC Regulated Power Supply',
      'Tungsten Filament Bulb',
      'DC Voltmeter',
      'DC Ammeter',
      'Variable Rheostat',
    ],
  },
  {
    slug: 'four-probe',
    title: 'Energy Band Gap (Four-Probe Method)',
    shortDesc:
      'Determine the forbidden energy band gap (Eg ≈ 0.67 eV) of a Germanium semiconductor crystal slice by studying temperature variation of resistivity using the collinear four-probe method.',
    year: 1,
    semester: 1,
    category: 'Modern Physics',
    difficulty: 'Intermediate',
    status: 'live',
    icon: 'Cpu',
    estimatedTime: '45 min',
    apparatus: [
      'Collinear Four-Probe Arrangement (s = 0.2 cm)',
      'Germanium Crystal Slice (w = 0.05 cm) on Mica Sheet',
      'Constant DC Current Source (1.0–5.0 mA)',
      'Digital Milli-Voltmeter (×1 / ×10 ranges)',
      'Regulated Electric Heating Oven (up to 200°C)',
      'Precision Digital Temperature Indicator',
    ],
  },
  {
    slug: 'newtons-rings',
    title: "Newton's Rings",
    shortDesc:
      'Determine the wavelength of sodium light and the radius of curvature of a plano-convex lens using the Newton\'s rings interference pattern.',
    year: 1,
    semester: 1,
    category: 'Optics',
    difficulty: 'Intermediate',
    status: 'coming-soon',
    icon: 'CircleDot',
    estimatedTime: '50 min',
    apparatus: [
      'Sodium Vapour Lamp',
      'Plano-Convex Lens',
      'Plane Glass Plate',
      'Travelling Microscope',
    ],
  },
  {
    slug: 'diffraction-grating',
    title: 'Wavelength using Diffraction Grating',
    shortDesc:
      'Determine the wavelength of prominent spectral lines of mercury light (Violet, Blue, Green, Yellow doublet) using a plane transmission diffraction grating and a spectrometer.',
    year: 1,
    semester: 1,
    category: 'Optics',
    difficulty: 'Intermediate',
    status: 'live',
    icon: 'Layers',
    estimatedTime: '45 min',
    apparatus: [
      'Spectrometer with Dual Verniers (Least Count 1\')',
      'Plane Transmission Diffraction Grating (15,000 LPI)',
      'High-Pressure Mercury Arc Discharge Lamp',
      'Collimator & Telescope with Crosshairs',
      'Reading Magnifier Lens & Auxiliary Illuminator',
    ],
  },
  {
    slug: 'hall-effect',
    title: 'Hall Effect & Carrier Mobility',
    shortDesc:
      'Determine the Hall coefficient, carrier concentration, majority carrier type (n-type / p-type), and carrier mobility in a semiconductor crystal (Germanium) using transverse magnetic fields.',
    year: 1,
    semester: 1,
    category: 'Electricity',
    difficulty: 'Advanced',
    status: 'live',
    icon: 'Magnet',
    estimatedTime: '55 min',
    apparatus: [
      'Electromagnet with Variable DC Power Supply (0–5 A)',
      'Digital Gaussmeter with Calibrated InAs Hall Probe',
      'Constant DC Sample Current Source (0–20 mA)',
      'Digital Milli-Voltmeter (0–200 mV)',
      'Germanium Specimen Wafer (t = 0.5 mm, ρ ≈ 8.5 Ω·cm)',
      'Transverse & Longitudinal Probe Assembly',
    ],
  },
  {
    slug: 'carey-foster',
    title: "Carey Foster's Bridge",
    shortDesc:
      'Determine the resistance per unit length of a bridge wire, and find the unknown resistance and specific resistance (resistivity) of a given wire material by eliminating end-corrections.',
    year: 1,
    semester: 1,
    category: 'Electricity',
    difficulty: 'Intermediate',
    status: 'live',
    icon: 'GitBranch',
    estimatedTime: '45 min',
    apparatus: [
      'Carey Foster Bridge Board (100 cm Wire, 4 Gaps)',
      'Fractional Resistance Box (0.1–1.0 Ω)',
      'Thick Copper Strip (0.00 Ω)',
      'Equal Ratio Coils (P = Q = 2.0 Ω)',
      'Moving-Coil Galvanometer with Shunt Key',
      'Unknown Specimen Resistance Wires (Constantan, Nichrome, Manganin)',
      'Micrometer Screw Gauge (Least Count 0.01 mm)',
      '1.5V DC Power Source with Plug Key',
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function getLabBySlug(slug: string): LabMeta | undefined {
  return labsRegistry.find(
    (lab) =>
      lab.slug === slug ||
      (slug === 'carey-foster-bridge' && lab.slug === 'carey-foster') ||
      (slug === 'carey-foster' && lab.slug === 'carey-foster-bridge')
  );
}

export function getLabsByYear(year: number): LabMeta[] {
  return labsRegistry.filter((lab) => lab.year === year);
}

export function getLabsBySemester(semester: number): LabMeta[] {
  return labsRegistry.filter((lab) => lab.semester === semester);
}

export function getLabsByCategory(category: string): LabMeta[] {
  return labsRegistry.filter((lab) => lab.category === category);
}
