import React from 'react';
import {
  Target,
  Layers,
  Sparkles,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Activity,
  Split,
  ChevronRight,
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
              Experiment 6: Wavelength of Sodium Light using Newton's Rings
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            Determination of the wavelength (&lambda;) of monochromatic sodium yellow light (&approx; 589.3 nm / 5893 &Aring;)
            using division-of-amplitude interference fringes (Newton&apos;s rings) formed in a thin wedge-shaped air film enclosed
            between a plano-convex lens and an optically plane glass plate.
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
              To determine the wavelength (<span className="text-[var(--text)] font-semibold font-mono">λ</span>) of
              monochromatic light emitted by a sodium vapor lamp by measuring the diameters of Newton's dark interference rings
              with a traveling microscope, and to verify the linear relationship between diameter squared (<span className="text-[var(--text)] font-semibold font-mono">D_n^2</span>)
              and ring order (<span className="text-[var(--text)] font-semibold font-mono">n</span>).
            </p>
          </div>

          {/* Apparatus */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
              <Layers size={15} />
              <h3>Apparatus</h3>
            </div>
            <ul className="text-xs md:text-sm text-[var(--text-muted)] space-y-1 list-disc list-inside">
              <li>
                <strong className="text-[var(--text)]">Sodium Vapor Lamp:</strong> Monochromatic yellow emission (&lambda; &approx; 589.3 nm) housed with a pinhole/slit enclosure.
              </li>
              <li>
                <strong className="text-[var(--text)]">Plano-Convex Lens:</strong> Large radius of curvature (R &approx; 90 cm &ndash; 120 cm) clean optical glass.
              </li>
              <li>
                <strong className="text-[var(--text)]">Optically Flat Glass Plate:</strong> High-tolerance bottom reflection substrate.
              </li>
              <li>
                <strong className="text-[var(--text)]">Inclined Beam-Splitter:</strong> Glass plate mounted at 45&deg; to turn collimated light down at normal incidence.
              </li>
              <li>
                <strong className="text-[var(--text)]">Traveling Microscope:</strong> Horizontal vernier motion (Least Count = 0.001 cm = 0.01 mm), rack-and-pinion vertical focus, and crosshair reticle.
              </li>
              <li>
                <strong className="text-[var(--text)]">Collimating Lens & Reading Lens:</strong> Converging lens for parallel illumination and magnifier for vernier scales.
              </li>
            </ul>
          </div>
        </div>

        {/* Principle & Mathematical Derivation */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Sparkles size={16} />
            <h3>Principle: Division of Amplitude in an Air Wedge</h3>
          </div>

          <div className="space-y-3 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            <p>
              When a plano-convex lens of large radius of curvature $R$ is placed on an optically flat glass plate, a thin
              air film of variable thickness $t$ is formed between the curved lower surface of the lens and the flat top surface
              of the plate. The thickness $t$ is zero at the point of contact and increases symmetrically outwards with radial distance $r$.
            </p>

            <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-2">
              <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide">
                1. Optical Path Difference ($\Delta$) in Reflected Light
              </h4>
              <p>
                Light incident normally ($\cos r = 1$) on the upper curved surface of the air film is partially reflected at the
                glass-air boundary (no phase change) and partially transmitted through the air film of thickness $t$, then reflected
                at the lower air-glass boundary. Because reflection at the lower plate occurs from the surface of a denser medium,
                an abrupt phase shift of $\pi$ (corresponding to an additional path difference of $\lambda/2$) is introduced:
              </p>
              <div className="font-mono text-center text-xs md:text-sm text-[var(--text)] py-1">
                <strong>Δ = 2 μ t cos(r) + λ/2 = 2t + λ/2 &nbsp; (for air film μ = 1, normal incidence cos r = 1)</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-2">
              <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide">
                2. Dark Rings Condition (Destructive Interference)
              </h4>
              <p>
                Destructive interference takes place when the net path difference is an odd multiple of half-wavelengths:
              </p>
              <div className="font-mono text-center text-xs md:text-sm text-[var(--text)] py-1">
                <strong>Δ = (2n + 1) · (λ / 2) &implies; 2t + λ/2 = (2n + 1) · (λ / 2) &implies; 2t = nλ &nbsp; (n = 0, 1, 2, ...)</strong>
              </div>
              <p>
                At the central contact point ($r = 0, t = 0$), the path difference is $\Delta = \lambda/2$. Hence, the
                <strong className="text-[var(--text)]"> central spot is always dark</strong> in reflected light.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-2">
              <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide">
                3. Relation between Film Thickness $t$, Ring Radius $r_n$, and Lens Radius $R$
              </h4>
              <p>
                From the geometry of a sphere of radius of curvature $R$, if $r_n$ is the radius of the $n$-th dark ring:
              </p>
              <div className="font-mono text-center text-xs md:text-sm text-[var(--text)] py-1">
                <strong>r_n^2 = t(2R - t) &approx; 2 R t &implies; 2t = r_n^2 / R = D_n^2 / (4R)</strong>
              </div>
              <p>
                Equating with the dark ring condition $2t = n\lambda$:
              </p>
              <div className="font-mono text-center text-xs md:text-sm text-[var(--text)] py-1 text-emerald-400">
                <strong>D_n^2 = 4 n λ R &emsp; or &emsp; r_n = √(n λ R)</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-2">
              <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide">
                4. Cancellation of Contact Error ($D_0^2$) by Difference Method
              </h4>
              <p>
                In practical setups, perfect zero-thickness contact at the center is rarely obtained due to minute air gaps, dust particles,
                or elastic contact deformation. If $t_0$ is the residual central thickness, $D_n^2 = 4n\lambda R + D_0^2$.
                Directly computing $\lambda = D_n^2 / (4nR)$ would introduce significant systematic error.
                By taking the difference between the squared diameters of the $(n+p)$-th and $n$-th dark rings:
              </p>
              <div className="font-mono text-center text-xs md:text-sm text-[var(--text)] py-1">
                <strong>D_(n+p)² - D_n² = [4(n + p)λR + D₀²] - [4nλR + D₀²] = 4pλR</strong>
              </div>
              <p>
                The contact offset D₀² cancels out identically! Therefore:
              </p>
              <div className="font-mono text-center text-sm md:text-base text-amber-400 font-bold py-2 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                λ = ( D_(n+p)² - D_n² ) / ( 4 · p · R )
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-Step Procedure */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Activity size={16} />
            <h3>Step-by-Step Experimental Procedure</h3>
          </div>
          <ol className="text-xs md:text-sm text-[var(--text-muted)] space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              <strong className="text-[var(--text)]">Cleaning & Optical Alignment:</strong> Thoroughly clean the plano-convex lens and flat glass plate with lens tissue. Place the convex surface of the lens on the plane glass plate.
            </li>
            <li>
              <strong className="text-[var(--text)]">Illumination:</strong> Position the sodium vapor lamp in front of the collimating lens to obtain a parallel horizontal beam. Mount the glass plate at $45^\circ$ above the lens arrangement to reflect parallel light vertically downwards onto the air film.
            </li>
            <li>
              <strong className="text-[var(--text)]">Eyepiece & Reticle Focus:</strong> Focus the traveling microscope eyepiece on its crosshairs, then adjust the vertical rack-and-pinion screw until distinct concentric circular rings with a dark central spot come into sharp focus.
            </li>
            <li>
              <strong className="text-[var(--text)]">Traversing Across Rings:</strong> Rotate the horizontal micrometer screw in one continuous direction (to avoid backlash error) until the vertical crosshair moves to the outermost ring on one side (e.g., $16$-th dark ring on the left).
            </li>
            <li>
              <strong className="text-[var(--text)]">Recording Left Readings ($x_L$):</strong> Carefully align the vertical crosshair tangentially on the center of the dark ring. Log the Main Scale Reading (MSR) and Vernier Scale Reading (VSR) to determine $x_L$. Repeat for rings $n = 16, 14, 12, 10, 8, 6, 4, 2$.
            </li>
            <li>
              <strong className="text-[var(--text)]">Passing the Center:</strong> Continue turning the micrometer in the same direction across the central dark spot to the right side, recording $x_R$ for rings $n = 2, 4, 6, 8, 10, 12, 14, 16$.
            </li>
            <li>
              <strong className="text-[var(--text)]">Data Analysis:</strong> Compute ring diameters D_n = |x_L - x_R|, diameter squared D_n², differences D_(n+p)² - D_n², and solve for &lambda;. Plot D_n² vs. n and calculate &lambda; = Slope / (4R).
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
            <li>The plano-convex lens and glass plate must be optically clean and completely free from dust particles, grease, or moisture.</li>
            <li>The traveling microscope micrometer screw must be turned strictly in one direction across the entire measurement sweep to eliminate backlash error.</li>
            <li>The beam-splitter glass plate must be oriented at exactly 45&deg; so that light strikes the air film at normal incidence (cos r = 1).</li>
            <li>A lens with large radius of curvature (R &ge; 100 cm) must be used so that ring diameters are sufficiently large to be resolved by the microscope.</li>
            <li>The vertical crosshair must be set tangentially along the center of the dark fringe, not on the bright fringe, because dark fringes have sharper contrast.</li>
          </ul>
        </div>
      </div>

      {/* ── Persistent Video Demonstration & References with PiP Mini-Player ── */}
      <LabVideoPlayer
        videoId="n7YavgJPkuw"
        title="Newton's Rings Experiment — Sachin Tanwade & Mridula Chandola"
        headerTitle="Video Demonstration & Reference Manuals"
        fallbackWatchUrl="https://youtu.be/n7YavgJPkuw?si=L11vyAzHw2CO6AAf"
        academicReferences={[
          {
            label: "Virtual Labs (Amrita / Ministry of Education) — Newton's Rings Wavelength of Light",
            url: 'https://vlab.amrita.edu/?sub=1&brch=281&sim=335&cnt=1',
          },
          {
            label: "HyperPhysics (Georgia State University) — Newton's Rings & Interference in Thin Films",
            url: 'http://hyperphysics.phy-astr.gsu.edu/hbase/phyopt/newtring.html',
          },
        ]}
      />
    </div>
  );
}
