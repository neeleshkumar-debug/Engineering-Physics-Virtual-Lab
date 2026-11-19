import React from 'react';
import { Target, Layers, Calculator, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';
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
            <h2 className="text-lg font-semibold tracking-tight">Experiment 1: Verification of Stefan's Law</h2>
          </div>
          <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            Measurement of total radiant energy emitted by an incandescent tungsten filament as a function of temperature
            to verify the Stefan–Boltzmann radiation law (<span className="font-mono text-[var(--text)]">P ∝ T⁴</span>).
          </p>
        </div>

        {/* Grid: Aim & Apparatus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Aim */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase">
              <Target size={15} />
              <h3>Aim of the Practical</h3>
            </div>
            <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
              To verify Stefan-Boltzmann's Radiation Law by studying radiant power emitted by an electric incandescent lamp at various temperatures,
              and determine radiation exponent <span className="text-[var(--text)] font-semibold font-mono tabular-nums">n ≈ 4.0</span> by plotting <span className="font-mono text-[var(--text)]">log₁₀(P)</span> versus <span className="font-mono text-[var(--text)]">log₁₀(T)</span>.
            </p>
          </div>

          {/* Apparatus */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
              <Layers size={15} />
              <h3>Apparatus Required</h3>
            </div>
            <ul className="text-xs md:text-sm text-[var(--text-muted)] space-y-1 list-disc list-inside">
              <li>DC Regulated Power Supply (<span className="font-mono tabular-nums">0 – 6 V</span>, variable)</li>
              <li>Tungsten Filament Bulb (<span className="font-mono tabular-nums">6V, 0.3A</span> or <span className="font-mono tabular-nums">1A</span> rating)</li>
              <li>Precision DC Voltmeter (<span className="font-mono tabular-nums">0 – 6 V</span> range)</li>
              <li>Precision DC Ammeter (<span className="font-mono tabular-nums">0 – 1 A / 2 A</span> range)</li>
              <li>Variable Rheostat (smooth sliding current control)</li>
              <li>Connecting wires & Master Power Key</li>
            </ul>
          </div>
        </div>

        {/* Theory & Equations */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Calculator size={16} />
            <h3>Basic Principle & Governing Equations</h3>
          </div>

          <div className="space-y-3.5 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            <p>
              According to <strong className="text-[var(--text)]">Stefan's Law</strong> (for an ideal blackbody), the total radiant heat energy emitted per second per unit area is directly proportional to the fourth power of its absolute thermodynamic temperature:
            </p>

            <div className="p-2.5 rounded bg-[var(--bg)] border border-[var(--border)] font-mono text-center text-xs md:text-sm text-[var(--text)] font-semibold tabular-nums">
              E = σ · T⁴ &nbsp;&nbsp; (Stefan's Law for ideal blackbody)
            </div>

            <p>
              For an enclosed non-blackbody radiator (like an incandescent tungsten filament at absolute temperature <span className="font-mono">T</span>) enclosed inside an evacuated glass envelope whose walls are at ambient temperature <span className="font-mono">T₀</span>, the net radiant power <span className="font-mono">P</span> dissipated is given by:
            </p>

            <div className="p-2.5 rounded bg-[var(--bg)] border border-[var(--border)] font-mono text-center text-xs md:text-sm text-[var(--text)] font-semibold tabular-nums">
              P = C · (Tⁿ − T₀ⁿ)
            </div>

            <p>
              At high incandescent filament temperatures (<span className="font-mono tabular-nums">T &gt; 800 K</span> to <span className="font-mono tabular-nums">2500 K</span>), room temperature (<span className="font-mono tabular-nums">T₀ ≈ 300 K</span>) is negligible because <span className="font-mono tabular-nums">T⁴ ≫ T₀⁴</span>:
            </p>

            <div className="p-2.5 rounded bg-[var(--bg)] border border-[var(--accent)]/40 font-mono text-center text-xs md:text-sm text-[var(--accent)] font-bold tabular-nums">
              P ≈ C · Tⁿ &nbsp;&nbsp; (Taking logs: &nbsp; log₁₀(P) = n · log₁₀(T) + log₁₀(C))
            </div>

            <p>
              Plotting <span className="font-mono text-[var(--text)]">log₁₀(P)</span> on the Y-axis against <span className="font-mono text-[var(--text)]">log₁₀(T)</span> on the X-axis yields a straight line with slope <span className="font-mono font-semibold text-emerald-400 tabular-nums">m = n ≈ 4.0</span>, experimentally verifying Stefan's fourth-power radiation law.
            </p>
          </div>
        </div>

        {/* Draper Point & Calibration Method */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3.5">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <AlertCircle size={16} />
            <h3>Determination of Cold Resistance (R₀) & Filament Temperature (T)</h3>
          </div>

          <div className="space-y-3 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            <p>
              Because direct measurement of filament cold resistance <span className="font-mono">R₀</span> at <span className="font-mono tabular-nums">0 °C (273 K)</span> is technically impractical with standard classroom meters, we utilize the <strong className="text-[var(--text)]">Draper Point</strong> (<span className="font-mono tabular-nums">~800 K</span> / <span className="font-mono tabular-nums">527 °C</span>), the universal threshold temperature where heated solids first emit visible dull red radiation.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
                <h4 className="font-semibold text-xs text-[var(--text)] uppercase tracking-wider">Step 1: Deduced R₀ from Draper Point</h4>
                <p className="text-xs">
                  At the just-glowing Draper Point (<span className="font-mono tabular-nums">T_g ≈ 800 K</span>), the tungsten resistance ratio is well-established empirically as <span className="font-mono tabular-nums font-semibold text-[var(--text)]">R_g / R₀ = 3.9</span>. Therefore:
                </p>
                <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-center text-xs font-bold text-emerald-400 tabular-nums">
                  R₀ = R_g / 3.9
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
                <h4 className="font-semibold text-xs text-[var(--text)] uppercase tracking-wider">Step 2: Linearized Tungsten Fit</h4>
                <p className="text-xs">
                  Using the established AKTU lab calibration relationship between resistance ratio <span className="font-mono">Rₜ / R₀</span> and thermodynamic temperature <span className="font-mono">T (K)</span>:
                </p>
                <div className="p-2 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-center text-xs font-bold text-[var(--accent)] tabular-nums">
                  T = 157.12 · (Rₜ / R₀) + 167.33 &nbsp; (K)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-Step Practical Procedure */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 size={16} />
            <h3>Step-by-Step Procedure</h3>
          </div>

          <ol className="text-xs md:text-sm text-[var(--text-muted)] space-y-2 list-decimal list-inside leading-relaxed">
            <li>Connect the circuit in series: Power Supply → Variable Rheostat → DC Ammeter → Bulb → Key.</li>
            <li>Connect the precision Voltmeter directly in parallel across the filament bulb terminals.</li>
            <li>
              <strong className="text-[var(--text)]">Determine R_g:</strong> Slowly advance the rheostat until the filament in dark surrounds just begins to glow dull cherry-red. Record <span className="font-mono">V_g</span> and <span className="font-mono">I_g</span>. Repeat while slowly decreasing current until glow just extinguishes. Compute mean <span className="font-mono tabular-nums">R_g</span> and derive <span className="font-mono tabular-nums">R₀ = R_g / 3.9</span>.
            </li>
            <li>
              <strong className="text-[var(--text)]">Record Observations:</strong> Increase current gradually over 8 to 12 distinct voltage steps from dull red to full incandescence. Record <span className="font-mono">V</span> and <span className="font-mono">I</span> for each step.
            </li>
            <li>
              <strong className="text-[var(--text)]">Compute Student Values:</strong> Calculate <span className="font-mono">Rₜ = V/I</span>, dissipated power <span className="font-mono">P = V·I</span>, resistance ratio <span className="font-mono">Rₜ/R₀</span>, temperature <span className="font-mono">T (K)</span>, <span className="font-mono">log₁₀(P)</span>, and <span className="font-mono">log₁₀(T)</span>.
            </li>
            <li>
              <strong className="text-[var(--text)]">Plot Best-Fit Line:</strong> Plot <span className="font-mono">log₁₀(P)</span> versus <span className="font-mono">log₁₀(T)</span>. Measure the linear regression slope <span className="font-mono tabular-nums">n</span> and confirm <span className="font-mono tabular-nums">n ≈ 4.0</span>.
            </li>
          </ol>
        </div>
      </div>

      {/* ── Persistent Video Demonstration with PiP Mini-Player ── */}
      <LabVideoPlayer
        videoId="fkYZVIDT2YA"
        title="Stefan's Law Practical Demonstration (Full Bench Walkthrough)"
        headerTitle="Video Demonstration & External Academic References"
        fallbackWatchUrl="https://www.youtube.com/watch?v=fkYZVIDT2YA"
        secondaryWatchUrl={{
          title: 'Tungsten Filament Bulb Experiment & Graph Plot',
          url: 'https://www.youtube.com/watch?v=Q9ksPCrMFo4',
        }}
        academicReferences={[
          {
            label: 'Ministry of Education Virtual Labs (vlab.co.in)',
            url: 'https://www.vlab.co.in',
          },
          {
            label: 'HyperPhysics — Stefan-Boltzmann Law & Blackbody Radiation',
            url: 'http://hyperphysics.phy-astr.gsu.edu/hbase/thermo/stefan.html',
          },
        ]}
      />
    </div>
  );
}
