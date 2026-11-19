import React from 'react';
import {
  Target,
  Layers,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Split,
  Binary,
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
              Experiment 5: Carey Foster&apos;s Bridge — Resistance per Unit Length &amp; Specific Resistance
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            Measurement of low resistances, determination of resistance per unit length (<span className="font-mono text-[var(--text)] font-semibold">ρ_w</span>)
            of a 1-meter bridge wire, and evaluation of the unknown resistance (<span className="font-mono text-[var(--text)] font-semibold">Y</span>)
            and specific resistance (resistivity <span className="font-mono text-[var(--text)] font-semibold">ρ</span>) of a metallic specimen wire
            by eliminating end-resistance errors using Carey Foster&apos;s method.
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
            <ul className="text-xs md:text-sm text-[var(--text-muted)] space-y-1.5 list-disc list-inside leading-relaxed">
              <li>
                To determine the resistance per unit length (<span className="font-mono text-[var(--text)] font-semibold">ρ_w</span>)
                of the Carey Foster&apos;s bridge wire.
              </li>
              <li>
                To determine the unknown resistance (<span className="font-mono text-[var(--text)] font-semibold">Y</span>) of a given wire specimen.
              </li>
              <li>
                To determine the specific resistance (resistivity <span className="font-mono text-[var(--text)] font-semibold">ρ</span>) of the material
                of the given wire using a micrometer screw gauge and meter scale.
              </li>
            </ul>
          </div>

          {/* Apparatus */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
              <Layers size={15} />
              <h3>Apparatus</h3>
            </div>
            <ul className="text-xs md:text-sm text-[var(--text-muted)] space-y-1 list-disc list-inside">
              <li>
                <strong className="text-[var(--text)]">Carey Foster&apos;s Bridge:</strong> 4-gap teakwood board with heavy brass strips,
                100.0 cm uniform manganin/constantan bridge wire, and 100 cm graduated meter scale.
              </li>
              <li>
                <strong className="text-[var(--text)]">Standard Fractional Resistance Box (X):</strong> 0.1 Ω to 1.0 Ω dial/plug box in 0.1 Ω steps.
              </li>
              <li>
                <strong className="text-[var(--text)]">Thick Copper Strip:</strong> High-purity copper bar of negligible resistance (0.00 Ω).
              </li>
              <li>
                <strong className="text-[var(--text)]">Unknown Resistance Wire (Y):</strong> Spool-mounted constantan, nichrome, or manganin wire.
              </li>
              <li>
                <strong className="text-[var(--text)]">Equal Ratio Coils (P, Q):</strong> Two non-inductively wound 1.0 Ω or 2.0 Ω standard resistors.
              </li>
              <li>
                <strong className="text-[var(--text)]">Moving-Coil Galvanometer:</strong> Center-zero sensitive galvanometer with protective tapping key.
              </li>
              <li>
                <strong className="text-[var(--text)]">DC Power Source:</strong> 1.5 V – 2.0 V regulated cell / battery eliminator with one-way plug key.
              </li>
              <li>
                <strong className="text-[var(--text)]">Screw Gauge &amp; Meter Ruler:</strong> 0.01 mm least-count micrometer screw gauge for diameter measurement.
              </li>
            </ul>
          </div>
        </div>

        {/* Principle & Mathematical Derivation */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Sparkles size={16} />
            <h3>Principle: Wheatstone Null Condition &amp; Exact End-Error Elimination</h3>
          </div>

          <div className="space-y-3 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            <p>
              Carey Foster&apos;s bridge is a specialized four-gap Wheatstone bridge designed specifically to measure the
              difference between two nearly equal resistances with high precision. In an ordinary meter bridge, solder contacts
              and terminal strips introduce unknown end-resistances (termed end-corrections <span className="font-mono text-[var(--text)]">α</span> and{' '}
              <span className="font-mono text-[var(--text)]">β</span>) that produce large systematic errors when measuring resistances &lt; 2 Ω.
              Carey Foster&apos;s bridge completely eliminates both <span className="font-mono text-[var(--text)]">α</span> and{' '}
              <span className="font-mono text-[var(--text)]">β</span> through gap interchange.
            </p>

            <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-2">
              <div className="font-semibold text-[var(--text)] flex items-center gap-2">
                <Binary size={15} className="text-cyan-400" />
                Mathematical Derivation of the Bridge Balance Condition:
              </div>
              <p>
                Let two equal ratio coils <span className="font-mono text-[var(--text)]">P</span> and{' '}
                <span className="font-mono text-[var(--text)]">Q</span> be connected across inner gaps 2 and 3 (<span className="font-mono text-[var(--text)]">P = Q</span>).
                Let resistance <span className="font-mono text-[var(--text)]">R₁</span> be connected in the outer left gap (Gap 1) and{' '}
                <span className="font-mono text-[var(--text)]">R₂</span> in the outer right gap (Gap 4).
                Let <span className="font-mono text-[var(--text)]">ρ_w</span> be the resistance per unit length of the 100 cm bridge wire,
                and let <span className="font-mono text-[var(--text)]">α</span> and <span className="font-mono text-[var(--text)]">β</span> be the end-resistances
                at the 0 cm and 100 cm ends respectively.
              </p>
              <p>
                When balanced at null point length <span className="font-mono text-[var(--text)]">l₁</span> from the left:
              </p>
              <div className="p-2.5 bg-[var(--surface)] rounded-lg font-mono text-center text-xs text-sky-400">
                P / Q = [ R₁ + α + l₁·ρ_w ] / [ R₂ + β + (100 - l₁)·ρ_w ]
              </div>
              <p>
                Since <span className="font-mono text-[var(--text)]">P = Q</span> (ratio = 1):
              </p>
              <div className="p-2.5 bg-[var(--surface)] rounded-lg font-mono text-center text-xs text-[var(--text)]">
                R₁ + α + l₁·ρ_w = R₂ + β + (100 - l₁)·ρ_w  &nbsp; &implies; &nbsp;
                <strong className="text-amber-400">R₁ - R₂ + (α - β) = (100 - 2l₁)·ρ_w</strong> &nbsp;— (Equation 1)
              </div>
              <p>
                Now interchange the resistances: place <span className="font-mono text-[var(--text)]">R₂</span> in the left gap and{' '}
                <span className="font-mono text-[var(--text)]">R₁</span> in the right gap. If the new null length is <span className="font-mono text-[var(--text)]">l₂</span>:
              </p>
              <div className="p-2.5 bg-[var(--surface)] rounded-lg font-mono text-center text-xs text-[var(--text)]">
                R₂ + α + l₂·ρ_w = R₁ + β + (100 - l₂)·ρ_w  &nbsp; &implies; &nbsp;
                <strong className="text-amber-400">R₂ - R₁ + (α - β) = (100 - 2l₂)·ρ_w</strong> &nbsp;— (Equation 2)
              </div>
              <p>
                Subtracting Equation 2 from Equation 1:
              </p>
              <div className="p-3 bg-[var(--surface)] rounded-lg font-mono text-center text-xs text-emerald-400 border border-emerald-500/20">
                2(R₁ - R₂) = 2(l₂ - l₁)·ρ_w &nbsp; &implies; &nbsp;
                <strong className="text-sm underline">R₁ - R₂ = ρ_w · (l₂ - l₁)</strong>
              </div>
              <p className="text-xs text-emerald-400/90 font-medium">
                &check; Notice: The end-correction terms (α - β) subtract out to exactly ZERO! The measurement depends solely on wire calibration ρ_w.
              </p>
            </div>
          </div>
        </div>

        {/* Two-Part Workflow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Part A Card */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
            <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
              <Split size={16} />
              <h3>Part A: Calibration of Wire (Finding ρ_w)</h3>
            </div>
            <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
              Connect standard fractional resistance box <span className="font-mono text-[var(--text)]">X</span> in the outer left gap and
              a thick copper strip (<span className="font-mono text-[var(--text)]">R₂ = 0.00 Ω</span>) in the outer right gap.
            </p>
            <div className="p-3 bg-[var(--bg)] rounded-lg font-mono text-xs text-center text-sky-400 space-y-1">
              <div>X - 0 = ρ_w · (l₂ - l₁)</div>
              <div className="text-emerald-400 font-bold">ρ_w = X / (l₂ - l₁) &nbsp; [Ω/cm]</div>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Plotting <span className="font-mono text-[var(--text)]">(l₂ - l₁)</span> on the y-axis vs.{' '}
              <span className="font-mono text-[var(--text)]">X</span> on the x-axis gives a straight line passing through the origin with
              slope <span className="font-mono text-[var(--text)]">m = 1 / ρ_w</span>.
            </p>
          </div>

          {/* Part B Card */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
            <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm">
              <Compass size={16} />
              <h3>Part B: Unknown Resistance Y &amp; Resistivity ρ</h3>
            </div>
            <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
              Replace the copper strip with unknown specimen wire <span className="font-mono text-[var(--text)]">Y</span>.
              Find null point <span className="font-mono text-[var(--text)]">l₁&apos;</span> (normal) and{' '}
              <span className="font-mono text-[var(--text)]">l₂&apos;</span> (interchanged).
            </p>
            <div className="p-3 bg-[var(--bg)] rounded-lg font-mono text-xs text-center text-violet-400 space-y-1">
              <div>X - Y = ρ_w · (l₂&apos; - l₁&apos;)</div>
              <div className="text-emerald-400 font-bold">Y = X - ρ_w · (l₂&apos; - l₁&apos;) &nbsp; [Ω]</div>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Specific resistance (resistivity):
            </p>
            <div className="p-2.5 bg-[var(--bg)] rounded-lg font-mono text-xs text-center text-amber-400">
              ρ = (Y · π · r²) / L = (Y · π · d²) / (4 · L) &nbsp; [Ω·m]
            </div>
          </div>
        </div>

        {/* Step-by-Step Laboratory Procedure */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 size={16} />
            <h3>Step-by-Step Laboratory Procedure</h3>
          </div>

          <ol className="text-xs md:text-sm text-[var(--text-muted)] space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              <strong className="text-[var(--text)]">Clean Terminals &amp; Ratio Arms:</strong> Clean all brass binding terminals with emery cloth.
              Insert two equal standard coils (<span className="font-mono text-[var(--text)]">P = Q = 2.0 Ω</span>) into inner gaps 2 and 3.
            </li>
            <li>
              <strong className="text-[var(--text)]">Part A Setup (Calibration):</strong> Insert fractional resistance box{' '}
              <span className="font-mono text-[var(--text)]">X</span> in the outer left gap (Gap 1) and a thick copper strip of negligible resistance
              in the outer right gap (Gap 4).
            </li>
            <li>
              <strong className="text-[var(--text)]">Normal Balance (l₁):</strong> Introduce resistance{' '}
              <span className="font-mono text-[var(--text)]">X = 0.2 Ω</span>. Close the battery key, gently touch the sliding jockey near the 50 cm mark,
              and move it left/right until the galvanometer needle shows exact null deflection (0.0 divisions). Record <span className="font-mono text-[var(--text)]">l₁</span>.
            </li>
            <li>
              <strong className="text-[var(--text)]">Interchanged Balance (l₂):</strong> Interchange the outer gap components (put copper strip in left gap and resistance box{' '}
              <span className="font-mono text-[var(--text)]">X</span> in right gap). Locate the new null point and record <span className="font-mono text-[var(--text)]">l₂</span>.
            </li>
            <li>
              <strong className="text-[var(--text)]">Repeat for Multiple X:</strong> Repeat steps 3 and 4 for{' '}
              <span className="font-mono text-[var(--text)]">X = 0.4, 0.6, 0.8, 1.0 Ω</span>. Compute <span className="font-mono text-[var(--text)]">l₂ - l₁</span> and{' '}
              <span className="font-mono text-[var(--text)]">ρ_w = X / (l₂ - l₁)</span>, and plot the calibration graph.
            </li>
            <li>
              <strong className="text-[var(--text)]">Part B Setup (Unknown Resistance Y):</strong> Remove the copper strip and connect unknown specimen wire{' '}
              <span className="font-mono text-[var(--text)]">Y</span> in its place. With <span className="font-mono text-[var(--text)]">X</span> in left gap and{' '}
              <span className="font-mono text-[var(--text)]">Y</span> in right gap, record normal null length <span className="font-mono text-[var(--text)]">l₁&apos;</span>.
            </li>
            <li>
              <strong className="text-[var(--text)]">Interchanged Balance (l₂&apos;):</strong> Interchange <span className="font-mono text-[var(--text)]">X</span> and{' '}
              <span className="font-mono text-[var(--text)]">Y</span>, then record interchanged null length <span className="font-mono text-[var(--text)]">l₂&apos;</span>.
              Calculate <span className="font-mono text-[var(--text)]">Y = X - ρ_w · (l₂&apos; - l₁&apos;)</span>.
            </li>
            <li>
              <strong className="text-[var(--text)]">Wire Diameter &amp; Resistivity:</strong> Use a micrometer screw gauge to take wire diameter readings at 3 different points
              in mutually perpendicular directions. Measure wire length <span className="font-mono text-[var(--text)]">L</span> with a meter scale and calculate specific resistance{' '}
              <span className="font-mono text-[var(--text)]">ρ</span>.
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
            <li>Never drag or scrape the sliding jockey along the bridge wire; scraping damages wire uniformity and alters cross-sectional area. Always lift and gently tap.</li>
            <li>Keep the battery circuit closed only while taking galvanometer readings to prevent Joule heating (<span className="font-mono text-[var(--text)]">I²Rt</span>), which alters resistance.</li>
            <li>All binding screws and strip connections must be clean and firmly tightened to minimize parasitic contact resistances.</li>
            <li>The ratio arm resistances <span className="font-mono text-[var(--text)]">P</span> and <span className="font-mono text-[var(--text)]">Q</span> should be closely matched to ensure maximum Wheatstone bridge sensitivity.</li>
            <li>The resistance in box <span className="font-mono text-[var(--text)]">X</span> should be chosen such that null points <span className="font-mono text-[var(--text)]">l₁</span> and <span className="font-mono text-[var(--text)]">l₂</span> lie near the middle of the bridge wire (between 30 cm and 70 cm).</li>
          </ul>
        </div>
      </div>

      {/* ── Persistent Video Demonstration & References with PiP Mini-Player ── */}
      <LabVideoPlayer
        videoId="9mmgpRDoENo"
        title="Carey Foster's Bridge | Full Experiment | Practical File — All Lab Experiments"
        headerTitle="Video Demonstration & Reference Manuals"
        fallbackWatchUrl="https://www.youtube.com/watch?v=9mmgpRDoENo"
        secondaryWatchUrl={{
          title: "Alternative Demonstration — Carey Foster's Bridge Experiment",
          url: 'https://www.youtube.com/watch?v=jwoL3zjx4bs',
        }}
        academicReferences={[
          {
            label: "Virtual Labs (Amrita / Ministry of Education) — Carey Foster's Bridge",
            url: 'https://vlab.amrita.edu/?sub=1&brch=281&sim=334&cnt=1',
          },
          {
            label: 'HyperPhysics (Georgia State University) — Wheatstone Bridge & Low Resistance Methods',
            url: 'http://hyperphysics.phy-astr.gsu.edu/hbase/electric/wheatstone.html',
          },
        ]}
      />
    </div>
  );
}
