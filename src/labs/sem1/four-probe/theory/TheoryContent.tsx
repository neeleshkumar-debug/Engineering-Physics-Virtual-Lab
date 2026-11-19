import React from 'react';
import {
  Target,
  Layers,
  Calculator,
  BookOpen,
  CheckCircle2,
  Zap,
  ShieldCheck,
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
              Experiment 2: Energy Band Gap of a Semiconductor (Four-Probe Method)
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            Measurement of the temperature dependence of resistivity (<span className="font-mono">ρ</span>) in a Germanium semiconductor crystal
            using the collinear four-probe method to determine its energy band gap (<span className="font-mono tabular-nums">E_g ≈ 0.67 eV</span>).
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
              To determine the forbidden energy band gap (<span className="text-[var(--text)] font-semibold">E_g</span>) of a Germanium crystal
              slice by measuring resistivity (<span className="font-mono">ρ</span>) as a function of temperature across{' '}
              <span className="font-mono tabular-nums text-[var(--text)]">30 °C – 160 °C</span> using a collinear four-probe setup.
            </p>
          </div>

          {/* Apparatus */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
              <Layers size={15} />
              <h3>Apparatus</h3>
            </div>
            <ul className="text-xs md:text-sm text-[var(--text-muted)] space-y-1 list-disc list-inside">
              <li>Collinear four-probe arrangement (<span className="font-mono tabular-nums">s = 0.2 cm</span> probe spacing)</li>
              <li>Germanium slice (<span className="font-mono tabular-nums">w ≈ 0.05 cm</span> thickness, mounted on mica sheet)</li>
              <li>Regulated heating oven (ambient to <span className="font-mono tabular-nums">200 °C</span>)</li>
              <li>Digital thermometer / RTD sensor</li>
              <li>Constant DC current source (<span className="font-mono tabular-nums">1.0 – 5.0 mA</span>)</li>
              <li>Digital milli-voltmeter (<span className="font-mono tabular-nums">×1</span>: 199.9 mV, <span className="font-mono tabular-nums">×10</span>: 1999 mV)</li>
            </ul>
          </div>
        </div>

        {/* Principle & Elimination of Contact Resistance */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Zap size={16} />
            <h3>Principle: Elimination of Contact Resistance</h3>
          </div>

          <div className="space-y-3 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            <p>
              In a conventional two-probe measurement, the contact resistance between metal probe tips and the semiconductor crystal
              is significant and non-ohmic. Because measured resistance includes probe-contact barriers and lead resistance,
              two-probe measurements cannot yield accurate semiconductor resistivity.
            </p>
            <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1.5 text-xs">
              <div className="font-semibold text-[var(--text)] uppercase tracking-wider text-[11px]">
                Four-Probe Method Operation
              </div>
              <p>
                • <strong className="text-[var(--text)]">Outer Probes (1 & 4):</strong> Inject a regulated constant current <span className="font-mono">I</span> through the crystal slice.<br />
                • <strong className="text-[var(--text)]">Inner Probes (2 & 3):</strong> Measure the potential drop <span className="font-mono">V</span> across an ultra-high input impedance digital voltmeter (<span className="font-mono">R_in &gt; 10 MΩ</span>).<br />
                • Because the voltmeter draws negligible current (<span className="font-mono">I_voltmeter ≈ 0</span>), the voltage drop across probe contact resistance is zero, giving the true sample potential drop.
              </p>
            </div>
          </div>
        </div>

        {/* Governing Equations & Derivations */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Calculator size={16} />
            <h3>Governing Equations</h3>
          </div>

          <div className="space-y-3.5 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            {/* Formula 1 */}
            <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-2">
              <h4 className="font-semibold text-[var(--text)] text-xs uppercase tracking-wider">
                1. Thin-Slice Resistivity Formula
              </h4>
              <p>
                For a semi-infinite bulk semiconductor, bulk resistivity is <span className="font-mono text-[var(--text)]">ρ₀ = (V / I) · 2πs</span>.
                For a thin slice of thickness <span className="font-mono tabular-nums">w = 0.05 cm</span> resting on an insulating mica sheet (<span className="font-mono tabular-nums">w/s = 0.25 &lt; 0.5</span>),
                the geometric correction factor is <span className="font-mono text-[var(--text)]">G₇(w/s) = (2s / w) · ln 2</span>.
              </p>
              <div className="p-2.5 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-center text-xs md:text-sm text-[var(--text)] font-semibold tabular-nums">
                ρ = [ (π · w) / ln 2 ] · (V / I) ≈ 0.2266 · (V / I) &nbsp; (Ω·cm)
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                When <span className="font-mono">V</span> is in millivolts (mV) and <span className="font-mono">I</span> is in milliamperes (mA), <span className="font-mono">V / I</span> is in Ohms (Ω), directly yielding <span className="font-mono">ρ</span> in Ω·cm.
              </p>
            </div>

            {/* Formula 2 */}
            <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-2">
              <h4 className="font-semibold text-[var(--text)] text-xs uppercase tracking-wider">
                2. Temperature Dependence & Arrhenius Relation
              </h4>
              <p>
                In the intrinsic conduction region, thermal excitation of charge carriers dominates:
              </p>
              <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-center text-xs text-[var(--text)]">
                ρ(T) = ρ₀ · exp[ E_g / (2 · k_B · T) ]
              </div>
              <p>
                Taking the common logarithm (base 10) converts this into linear form <span className="font-mono">y = m·x + c</span>:
              </p>
              <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-center text-xs text-[var(--text)]">
                log₁₀(ρ) = log₁₀(ρ₀) + [ E_g / (2 · 2.3026 · k_B · 1000) ] · (1000 / T)
              </div>
              <p>
                The slope <span className="font-mono">m</span> of <span className="font-mono">log₁₀(ρ)</span> versus <span className="font-mono">1000/T</span> yields the band gap:
              </p>
              <div className="p-2.5 rounded bg-[var(--surface)] border border-emerald-500/30 font-mono text-center text-xs md:text-sm text-emerald-400 font-semibold tabular-nums">
                E_g (eV) = 2 · 2.3026 · k_B · 1000 · Slope ≈ 0.3969 · Slope
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Where <span className="font-mono tabular-nums">k_B = 8.617 × 10⁻⁵ eV/K</span>. For Germanium (<span className="font-mono tabular-nums">E_g ≈ 0.67 eV</span>), the expected slope is <span className="font-mono tabular-nums">m ≈ 1.69</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Procedure */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 size={16} />
            <h3>Procedure</h3>
          </div>

          <ol className="text-xs md:text-sm text-[var(--text-muted)] space-y-2 list-decimal list-inside leading-relaxed">
            <li>Check probe tip alignment on the Germanium slice mounted over the mica base.</li>
            <li>Set the constant current source to a steady operating value (<span className="font-mono tabular-nums">2.0 – 4.0 mA</span>).</li>
            <li>Select the <span className="font-mono">×10</span> range on the digital milli-voltmeter for ambient temperature, switching to <span className="font-mono">×1</span> when voltage falls below 199.9 mV.</li>
            <li>Turn ON the oven heater and set target temperature increments.</li>
            <li>Allow thermal stabilization at each step, then record temperature <span className="font-mono">T (°C)</span> and potential drop <span className="font-mono">V (mV)</span>.</li>
            <li>Compute <span className="font-mono">T (K)</span>, <span className="font-mono">1000/T</span>, <span className="font-mono">ρ</span>, and <span className="font-mono">log₁₀(ρ)</span>. Plot <span className="font-mono">log₁₀(ρ) vs 1000/T</span> to extract slope <span className="font-mono">m</span> and compute <span className="font-mono">E_g</span>.</li>
          </ol>
        </div>

        {/* Precautions */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
            <ShieldCheck size={16} />
            <h3>Precautions</h3>
          </div>
          <ul className="text-xs md:text-sm text-[var(--text-muted)] space-y-1 list-disc list-inside">
            <li>Do not exert excessive mechanical force on the probe tips; Germanium crystal wafers are brittle.</li>
            <li>Maintain current below 5.0 mA to prevent internal Joule heating (<span className="font-mono">I²R</span>).</li>
            <li>Verify the mica sheet is intact to avoid current leakage to the oven ground.</li>
            <li>Log observations only after temperature stabilization.</li>
            <li>Do not heat above 180 °C to prevent surface oxidation.</li>
          </ul>
        </div>
      </div>

      {/* ── Persistent Video Demonstration & References with PiP Mini-Player ── */}
      <LabVideoPlayer
        videoId="wc6ZtWaoex4"
        title="AE 220 Four Probe Setup complete — Gaurav Srivastava"
        headerTitle="Video Demonstration & Reference Manuals"
        fallbackWatchUrl="https://youtu.be/wc6ZtWaoex4"
        academicReferences={[
          {
            label: 'Virtual Labs (Amrita / Ministry of Education) — Four-Probe Method',
            url: 'https://vlab.amrita.edu/?sub=1&brch=282&sim=1512&cnt=1',
          },
        ]}
      />
    </div>
  );
}
