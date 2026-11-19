import React from 'react';
import {
  Target,
  Layers,
  Calculator,
  BookOpen,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { useLabShell } from '../../../../components/layout/LabShell';
import { LabVideoPlayer } from '../../../../components/ui/LabVideoPlayer';

export function TheoryContent() {
  const { activeTab } = useLabShell();
  const isTheoryTab = activeTab === 'theory';

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 text-[var(--text)]">
      {/* ── Theory Manual Text (Hidden when activeTab !== 'theory') ────────── */}
      <div className={isTheoryTab ? 'space-y-6' : 'hidden'}>
        {/* Lab Header */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <div className="flex items-center gap-2.5 text-[var(--text)] mb-2">
            <BookOpen size={18} className="text-[var(--accent)]" />
            <h2 className="text-lg font-semibold tracking-tight">
              Experiment 3: Determination of Hall Coefficient & Carrier Mobility
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            Study of the Hall effect in a semiconductor wafer (Germanium) to determine the{' '}
            <strong className="text-[var(--text)]">Hall coefficient ($R_H$)</strong>,{' '}
            <strong className="text-[var(--text)]">carrier concentration ($n$)</strong>,{' '}
            <strong className="text-[var(--text)]">majority carrier type</strong> (n-type or p-type), and{' '}
            <strong className="text-[var(--text)]">carrier mobility ($\mu$)</strong>.
          </p>
        </div>

        {/* Grid: Aim & Apparatus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Aim */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase">
              <Target size={15} />
              <h3>Aim</h3>
            </div>
            <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
              To determine the Hall coefficient (<span className="text-[var(--text)] font-semibold font-mono">R_H</span>),
              carrier concentration (<span className="text-[var(--text)] font-semibold font-mono">n</span>),
              type of majority charge carriers, and carrier mobility (<span className="text-[var(--text)] font-semibold font-mono">μ</span>)
              of a semiconductor specimen by applying a transverse magnetic field (<span className="font-mono tabular-nums text-[var(--text)]">B</span>)
              perpendicular to longitudinal current (<span className="font-mono tabular-nums text-[var(--text)]">I</span>).
            </p>
          </div>

          {/* Apparatus */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
              <Layers size={15} />
              <h3>Apparatus</h3>
            </div>
            <ul className="text-xs md:text-sm text-[var(--text-muted)] space-y-1 list-disc list-inside">
              <li>Electromagnet with flat adjustable pole pieces (0–5 A DC coil energizing current)</li>
              <li>Constant Current Power Supply for electromagnet</li>
              <li>Digital Gaussmeter with calibrated InAs Hall probe (ranges 0–2 kG, 0–20 kG)</li>
              <li>Hall Effect Setup (AE-208) containing:
                <ul className="pl-5 list-circle space-y-0.5 text-[11px] text-[var(--text-muted)]">
                  <li>Constant current generator for sample (0–20 mA DC)</li>
                  <li>Digital milli-voltmeter for transverse Hall potential (0–200 mV)</li>
                </ul>
              </li>
              <li>Semiconductor wafer (Germanium slice: thickness <span className="font-mono tabular-nums">t = 0.5 mm</span>, resistivity <span className="font-mono tabular-nums">ρ ≈ 8.5 Ω·cm</span>)</li>
              <li>Four contact terminals (2 longitudinal for current, 2 transverse for Hall voltage)</li>
            </ul>
          </div>
        </div>

        {/* Principle & Lorentz Force */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Zap size={16} />
            <h3>Principle: Lorentz Force & Hall Field Equilibrium</h3>
          </div>

          <div className="space-y-3 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            <p>
              When a current-carrying semiconductor strip is placed in a perpendicular magnetic field, charge carriers
              moving with drift velocity <span className="font-mono text-[var(--text)]">v_d</span> experience a sideways
              magnetic Lorentz force perpendicular to both current and magnetic field vectors:
            </p>
            <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] font-mono text-center text-xs md:text-sm text-[var(--text)]">
              <strong>F</strong> = q · (<strong>E</strong> + <strong>v</strong>_d × <strong>B</strong>)
            </div>
            <p>
              This force deflects charge carriers toward one lateral edge of the specimen. As charges accumulate at that edge,
              an opposing lateral electrostatic field—the <strong className="text-[var(--text)]">Hall field ($E_H$)</strong>—develops across the strip.
              Accumulation continues until the electrostatic force balances the magnetic Lorentz force in dynamic equilibrium:
            </p>
            <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] font-mono text-center text-xs text-[var(--text)]">
              q · E_H = q · v_d · B &nbsp;⇒&nbsp; E_H = v_d · B
            </div>
          </div>
        </div>

        {/* Mathematical Derivations & Formulas */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Calculator size={16} />
            <h3>Mathematical Formulations & Experimental Equations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Box 1: Hall Voltage & Hall Coefficient */}
            <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-2">
              <h4 className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Compass size={13} />
                1. Hall Voltage & Coefficient
              </h4>
              <p className="text-[var(--text-muted)]">
                The current density is <span className="font-mono">J = I / (w·t) = n·q·v_d</span>, giving drift velocity <span className="font-mono">v_d = I / (n·q·w·t)</span>.
                The transverse Hall voltage across sample width <span className="font-mono">w</span> is:
              </p>
              <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-center text-xs text-emerald-400 font-semibold">
                V_H = E_H · w = (R_H · I · B) / t
              </div>
              <p className="text-[var(--text-muted)]">
                Rearranging yields the <strong className="text-[var(--text)]">Hall Coefficient ($R_H$)</strong>:
              </p>
              <div className="p-2 rounded bg-[var(--surface)] border border-emerald-500/30 font-mono text-center text-xs md:text-sm text-emerald-400 font-semibold">
                R_H = (V_H · t) / (I · B) &nbsp; [m³/C]
              </div>
            </div>

            {/* Box 2: Carrier Density & Mobility */}
            <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-2">
              <h4 className="font-semibold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Zap size={13} />
                2. Carrier Concentration & Mobility
              </h4>
              <p className="text-[var(--text-muted)]">
                From <span className="font-mono">R_H = 1 / (n·q)</span>, carrier concentration (<span className="font-mono">n</span>) is:
              </p>
              <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-center text-xs text-cyan-400 font-semibold">
                n = 1 / (|R_H| · e) &nbsp; [m⁻³]
              </div>
              <p className="text-[var(--text-muted)]">
                Carrier mobility (<span className="font-mono">μ</span>) relates conductivity (<span className="font-mono">σ = 1/ρ = n·e·μ</span>) to <span className="font-mono">R_H</span>:
              </p>
              <div className="p-2 rounded bg-[var(--surface)] border border-cyan-500/30 font-mono text-center text-xs md:text-sm text-cyan-400 font-semibold">
                μ = |R_H| / ρ &nbsp; [m²/(V·s) or cm²/(V·s)]
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1">
            <strong className="text-[var(--text)]">Majority Carrier Type Identification:</strong>
            <ul className="list-disc list-inside space-y-0.5">
              <li><strong className="text-indigo-400">n-type semiconductor:</strong> Conduction dominated by electrons (<span className="font-mono">q = -e</span>) ⇒ <span className="font-mono text-indigo-400">R_H &lt; 0</span> (Negative Hall Voltage).</li>
              <li><strong className="text-amber-400">p-type semiconductor:</strong> Conduction dominated by holes (<span className="font-mono">q = +e</span>) ⇒ <span className="font-mono text-amber-400">R_H &gt; 0</span> (Positive Hall Voltage).</li>
            </ul>
          </div>
        </div>

        {/* Step-by-Step Procedure */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 size={16} />
            <h3>Step-by-Step Procedure</h3>
          </div>

          <ol className="text-xs md:text-sm text-[var(--text-muted)] space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              Position the semiconductor Hall probe securely in the center of the air gap between the electromagnet pole faces.
            </li>
            <li>
              Insert the Gaussmeter probe adjacent to the semiconductor slice to measure the true local magnetic flux density (<span className="font-mono tabular-nums">B</span>).
            </li>
            <li>
              Turn ON the electromagnet power supply and calibrate the field <span className="font-mono tabular-nums">B</span> (0.5 to 5.0 kG, corresponding to 0.05 to 0.50 T).
            </li>
            <li>
              Turn ON the constant current supply to the semiconductor specimen and set an initial sample current (e.g., <span className="font-mono tabular-nums">5.0 mA</span>).
            </li>
            <li>
              <strong className="text-[var(--text)]">Method 1 (Varying Magnetic Field):</strong> Hold sample current <span className="font-mono tabular-nums">I</span> constant (e.g., 5.0 mA) and increase <span className="font-mono tabular-nums">B</span> in steps of 0.5 kG. Record the transverse Hall voltage <span className="font-mono tabular-nums">V_H (mV)</span> at each step.
            </li>
            <li>
              <strong className="text-[var(--text)]">Method 2 (Varying Current):</strong> Hold magnetic field <span className="font-mono tabular-nums">B</span> constant (e.g., 3.0 kG = 0.3 T) and vary current <span className="font-mono tabular-nums">I</span> from 1.0 to 10.0 mA. Record <span className="font-mono tabular-nums">V_H (mV)</span>.
            </li>
            <li>
              Plot <span className="font-mono tabular-nums">V_H vs B</span> (or <span className="font-mono tabular-nums">V_H vs I</span>). Extract the slope from the linear regression line to compute <span className="font-mono tabular-nums">R_H</span>, carrier density <span className="font-mono tabular-nums">n</span>, and mobility <span className="font-mono tabular-nums">μ</span>.
            </li>
          </ol>
        </div>

        {/* Precautions */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
            <ShieldCheck size={16} />
            <h3>Precautions</h3>
          </div>
          <ul className="text-xs md:text-sm text-[var(--text-muted)] space-y-1 list-disc list-inside">
            <li>Ensure the semiconductor probe is mounted strictly perpendicular to magnetic flux lines to maximize Lorentz deflection.</li>
            <li>Do not exceed the rated current of the electromagnet coils (5 A) to prevent overheating.</li>
            <li>Zero-adjust the digital millivoltmeter before applying the magnetic field to eliminate probe misalignment offset voltage.</li>
            <li>Reverse the magnetic field direction or current to eliminate stray thermoelectric voltages (Seebeck / Nernst effects).</li>
            <li>Handle the fragile Germanium crystal probe with extreme care; never force probe tips into tight air gaps.</li>
          </ul>
        </div>
      </div>

      {/* ── Persistent Video Demonstration & References with PiP Mini-Player ── */}
      <LabVideoPlayer
        videoId="oOB5lM7_xXs"
        title="AE 208 Hall Effect Apparatus (ASICO) — Gaurav Srivastava"
        headerTitle="Video Demonstration & Reference Manuals"
        fallbackWatchUrl="https://youtu.be/oOB5lM7_xXs?si=lJ9nMFBhCRF_ddsm"
        academicReferences={[
          {
            label: 'Virtual Labs (Amrita / Ministry of Education) — Hall Effect in Semiconductors',
            url: 'https://vlab.amrita.edu/?sub=1&brch=282&sim=879&cnt=1',
          },
          {
            label: 'HyperPhysics (Georgia State University) — The Hall Effect & Lorentz Deflection',
            url: 'http://hyperphysics.phy-astr.gsu.edu/hbase/magnetic/hall.html',
          },
        ]}
      />
    </div>
  );
}
