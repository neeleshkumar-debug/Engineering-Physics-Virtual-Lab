import React from 'react';
import {
  Target,
  Layers,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Activity,
  Split,
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
              Experiment 4: Wavelength of Spectral Lines of Mercury Light using Diffraction Grating
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            Determination of the precise wavelengths (λ) of prominent spectral lines of a mercury arc vapor lamp
            (Violet 404.7 nm, Blue 435.8 nm, Green 546.1 nm, and Yellow doublet 577.0 nm / 579.1 nm)
            using a plane transmission diffraction grating and spectrometer at normal incidence.
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
              To determine the wavelengths (<span className="text-[var(--text)] font-semibold font-mono">λ</span>) of
              the prominent spectral lines of mercury light using a plane transmission diffraction grating and a spectrometer
              under the condition of normal incidence, and to determine the grating element (<span className="text-[var(--text)] font-semibold font-mono">e = a + b</span>)
              and lines per inch (<span className="text-[var(--text)] font-semibold font-mono">N</span>).
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
                <strong className="text-[var(--text)]">Spectrometer:</strong> Heavy circular base, collimator with adjustable slit,
                turntable prism table with 3 levelling screws, and rotatable telescope with circular scale ($0.5^\circ$ divisions)
                and dual verniers ($V_1, V_2$) of least count $1'$ ($0.0167^\circ$).
              </li>
              <li>
                <strong className="text-[var(--text)]">Diffraction Grating:</strong> Plane transmission grating ruled with{' '}
                <span className="font-mono tabular-nums text-[var(--text)]">N = 15,000 lines/inch</span> (e &approx; 1.693 &times; 10⁻⁴ cm)
                or 6,000 lines/inch.
              </li>
              <li>
                <strong className="text-[var(--text)]">Light Source:</strong> High-pressure Mercury Vapor Discharge Lamp with ballast enclosure.
              </li>
              <li>
                <strong className="text-[var(--text)]">Accessories:</strong> Reading magnifying lens with auxiliary lamp, spirit level, and grating holder clamp.
              </li>
            </ul>
          </div>
        </div>

        {/* Principle & Grating Equation */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <Sparkles size={16} />
            <h3>Principle: Diffraction Grating Equation & Normal Incidence</h3>
          </div>

          <div className="space-y-3 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            <p>
              A plane transmission diffraction grating consists of an optically flat glass plate with a large number of
              closely spaced, fine, equidistant, and parallel rulings drawn by a diamond stylus.
              If <span className="font-mono text-[var(--text)]">a</span> is the width of each transparent slit and{' '}
              <span className="font-mono text-[var(--text)]">b</span> is the width of each opaque line, the distance{' '}
              <span className="font-mono text-[var(--text)]">e = a + b</span> is called the{' '}
              <strong className="text-[var(--text)]">grating element</strong>:
            </p>

            <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] font-mono text-center text-xs md:text-sm text-[var(--text)]">
              <strong>e = a + b = 2.54 / N &nbsp; (cm) = 25,400,000 / N &nbsp; (nm)</strong>
            </div>

            <p>
              When a parallel beam of monochromatic light of wavelength $\lambda$ falls normally onto the grating surface,
              each slit acts as a source of secondary cylindrical wavelets (Huygens&apos; principle). The condition for constructive
              interference (principal maxima) in a direction making an angle $\theta$ with the normal is:
            </p>

            <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1.5">
              <div className="font-mono text-center text-xs md:text-sm text-cyan-400 font-semibold">
                (a + b) · sin θ = n · λ &emsp;&implies;&emsp; λ = (e · sin θ) / n
              </div>
              <p className="text-[11px] text-center text-[var(--text-muted)]">
                where <span className="font-mono text-[var(--text)]">n = 1, 2, 3...</span> is the spectral order, and{' '}
                <span className="font-mono text-[var(--text)]">θ</span> is the diffraction angle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
                  <Split size={14} className="text-indigo-400" />
                  <span>Symmetrical Orders & 2θ Measurement</span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Diffraction lines form symmetrically on both the left (<span className="font-mono">θ_L</span>) and
                  right (<span className="font-mono">θ_R</span>) of the central undiffracted white image ($n=0$).
                  Measuring the total angular span <span className="font-mono text-[var(--text)]">2θ = |θ_L - θ_R|</span> and taking{' '}
                  <span className="font-mono text-[var(--text)]">θ = 2θ / 2</span> completely eliminates any zero/index error
                  or eccentricity of the spectrometer circle!
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
                  <Activity size={14} className="text-emerald-400" />
                  <span>Resolving Power of Grating</span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  The chromatic resolving power is <span className="font-mono text-[var(--text)]">R = λ / Δλ = n · N_total</span>.
                  For the mercury yellow doublet (577.0 nm and 579.1 nm, Δλ = 2.1 nm),
                  the minimum resolving power required is &approx; 578 / 2.1 &approx; 275, which is easily exceeded by a 15,000 LPI grating.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mercury Spectrum Reference Table */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Eye size={16} />
            <h3>Prominent Spectral Lines of Mercury Arc Lamp</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                  <th className="py-2 px-3">Color</th>
                  <th className="py-2 px-3">Standard λ (nm)</th>
                  <th className="py-2 px-3">Standard λ (Å)</th>
                  <th className="py-2 px-3">1st Order Angle θ (15,000 LPI)</th>
                  <th className="py-2 px-3">2nd Order Angle θ (15,000 LPI)</th>
                  <th className="py-2 px-3">Characteristics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-mono tabular-nums text-[var(--text)]">
                <tr>
                  <td className="py-2.5 px-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8a2be2]" />
                    <span className="font-sans font-medium text-[#c084fc]">Violet</span>
                  </td>
                  <td className="py-2.5 px-3">404.7</td>
                  <td className="py-2.5 px-3">4047</td>
                  <td className="py-2.5 px-3">13° 50' (13.83°)</td>
                  <td className="py-2.5 px-3">28° 33' (28.56°)</td>
                  <td className="py-2.5 px-3 font-sans text-xs text-[var(--text-muted)]">Sharp, high frequency</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00bfff]" />
                    <span className="font-sans font-medium text-[#38bdf8]">Blue</span>
                  </td>
                  <td className="py-2.5 px-3">435.8</td>
                  <td className="py-2.5 px-3">4358</td>
                  <td className="py-2.5 px-3">14° 55' (14.91°)</td>
                  <td className="py-2.5 px-3">30° 59' (30.98°)</td>
                  <td className="py-2.5 px-3 font-sans text-xs text-[var(--text-muted)]">Prominent cyan-blue line</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00e676]" />
                    <span className="font-sans font-medium text-[#4ade80]">Green</span>
                  </td>
                  <td className="py-2.5 px-3">546.1</td>
                  <td className="py-2.5 px-3">5461</td>
                  <td className="py-2.5 px-3">18° 49' (18.82°)</td>
                  <td className="py-2.5 px-3">40° 10' (40.17°)</td>
                  <td className="py-2.5 px-3 font-sans text-xs text-[var(--text-muted)]">Most intense mercury line</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffd700]" />
                    <span className="font-sans font-medium text-[#facc15]">Yellow 1</span>
                  </td>
                  <td className="py-2.5 px-3">577.0</td>
                  <td className="py-2.5 px-3">5770</td>
                  <td className="py-2.5 px-3">19° 55' (19.92°)</td>
                  <td className="py-2.5 px-3">42° 58' (42.96°)</td>
                  <td className="py-2.5 px-3 font-sans text-xs text-[var(--text-muted)]">Doublet component 1</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff9100]" />
                    <span className="font-sans font-medium text-[#fb923c]">Yellow 2</span>
                  </td>
                  <td className="py-2.5 px-3">579.1</td>
                  <td className="py-2.5 px-3">5791</td>
                  <td className="py-2.5 px-3">20° 00' (20.00°)</td>
                  <td className="py-2.5 px-3">43° 09' (43.15°)</td>
                  <td className="py-2.5 px-3 font-sans text-xs text-[var(--text-muted)]">Doublet component 2 (Δλ = 2.1 nm)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Step-by-Step Procedure */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle2 size={16} />
            <h3>Step-by-Step Laboratory Procedure</h3>
          </div>

          <ol className="text-xs md:text-sm text-[var(--text-muted)] space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              <strong className="text-[var(--text)]">Optical Levelling & Focusing:</strong> Focus the telescope on a distant object
              or by Schuster&apos;s method until the crosswires and slit image are sharply defined with no parallax.
            </li>
            <li>
              <strong className="text-[var(--text)]">Normal Incidence Adjustment:</strong> Direct the telescope straight to view the direct slit image ($n=0$).
              Mount the grating centrally on the prism table perpendicular to the collimated beam so the direct slit coincides with $0^\circ$.
            </li>
            <li>
              <strong className="text-[var(--text)]">Observing Direct White Slit:</strong> Record the direct reading $\theta_0$ (typically adjusted to $0^\circ 00'$ or noted).
            </li>
            <li>
              <strong className="text-[var(--text)]">Left Order Spectrum ($\theta_L$):</strong> Unlock the fine tangent screw and rotate the telescope arm to the left.
              Locate the 1st order ($n=1$) spectral lines: Violet, Blue, Green, Yellow-1, and Yellow-2.
              Align the vertical crosswire exactly on the center of each line and log the Vernier $V_1$ reading ($\theta_L$).
            </li>
            <li>
              <strong className="text-[var(--text)]">Right Order Spectrum ($\theta_R$):</strong> Rotate the telescope arm to the right of the central image.
              Align on the corresponding lines in the right 1st order ($n=1$) and log the Vernier reading ($\theta_R$).
            </li>
            <li>
              <strong className="text-[var(--text)]">Second Order ($n=2$):</strong> If visible and within angular range, sweep further to $\approx 28^\circ - 44^\circ$
              to record 2nd order readings.
            </li>
            <li>
              <strong className="text-[var(--text)]">Analysis:</strong> Calculate 2θ = |θ_L - θ_R|, θ = 2θ / 2, sin θ, and
              solve λ = (e · sin θ) / n. Plot sin θ vs. λ to verify grating line density N.
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
            <li>Never touch the ruled face of the diffraction grating with fingers or cloth. Always hold by the ground glass edges.</li>
            <li>The collimator slit should be made as narrow as possible to produce sharp, distinct, and finely resolved spectral lines.</li>
            <li>The grating plane must be strictly normal to the incident light; oblique incidence violates $(a+b)\sin\theta = n\lambda$.</li>
            <li>Readings must be taken with the same vernier scale ($V_1$) to prevent index offset errors, or by averaging both $V_1$ and $V_2$.</li>
            <li>Use the fine adjustment tangent screw to align the vertical crosswire on the center of each line without backlash.</li>
          </ul>
        </div>
      </div>

      {/* ── Persistent Video Demonstration & References with PiP Mini-Player ── */}
      <LabVideoPlayer
        videoId="RM7Ijt9q4_I"
        title="Diffraction Grating Experiment — Sachin Tanwade & Mridula Chandola"
        headerTitle="Video Demonstration & Reference Manuals"
        fallbackWatchUrl="https://www.youtube.com/watch?v=RM7Ijt9q4_I"
        secondaryWatchUrl={{
          title: 'Alternative Demonstration — Spectrometer & Grating',
          url: 'https://www.youtube.com/watch?v=N0lxwqANsd4',
        }}
        academicReferences={[
          {
            label: 'Virtual Labs (Amrita / Ministry of Education) — Diffraction Grating',
            url: 'https://vlab.amrita.edu/?sub=1&brch=281&sim=334&cnt=1',
          },
          {
            label: 'HyperPhysics (Georgia State University) — Diffraction Grating & Spectral Dispersion',
            url: 'http://hyperphysics.phy-astr.gsu.edu/hbase/phyopt/grating.html',
          },
        ]}
      />
    </div>
  );
}
