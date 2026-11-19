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
  RotateCw,
  FlaskConical,
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
              Experiment 7: Specific Rotation of Sugar Solution using Half-Shade Polarimeter
            </h2>
          </div>
          <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            AKTU Applied Physics Laboratory (AAS151 / AAS251) syllabus practical. Determination of the
            specific rotatory power (S or [α]λᵗ) of cane sugar (sucrose) in aqueous solution
            using Laurent&apos;s half-shade polarimeter with a sodium vapor light source (λ = 589.3 nm),
            and estimation of the unknown concentration of a given sugar solution.
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
              1. To determine the specific rotation (<span className="text-[var(--text)] font-semibold font-mono">S</span>)
              of cane sugar (sucrose) in aqueous solution using Laurent&apos;s half-shade polarimeter.<br />
              2. To plot a calibration graph of optical rotation (<span className="text-[var(--text)] font-semibold font-mono">Δθ</span>)
              versus sugar concentration (<span className="text-[var(--text)] font-semibold font-mono">c</span>) and deduce S from the slope.<br />
              3. To determine the unknown concentration of a given sugar solution using the calibration curve.
            </p>
          </div>

          {/* Apparatus */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
              <Layers size={15} />
              <h3>Apparatus</h3>
            </div>
            <ul className="text-xs md:text-sm text-[var(--text-muted)] space-y-1 list-disc list-inside leading-relaxed">
              <li>Laurent&apos;s half-shade polarimeter with rotatable analyzer and circular vernier scale (least count 0.05° / 3&apos;)</li>
              <li>Monochromatic sodium vapor discharge lamp (λ = 589.3 nm) with collimating lens</li>
              <li>Polarimeter tube of known path length L (10 cm = 1.0 dm, 20 cm = 2.0 dm) with central bubble reservoir</li>
              <li>Analytical digital chemical balance, 100 mL volumetric flasks, and pipettes</li>
              <li>Pure cane sugar (commercial sucrose, C₁₂H₂₂O₁₁) and distilled water</li>
            </ul>
          </div>
        </div>

        {/* Principle & Mathematical Formula */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
            <RotateCw size={15} />
            <h3>Principle & Formula</h3>
          </div>

          <div className="space-y-3 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
            <p>
              <strong className="text-[var(--text)]">1. Optical Activity & Biot&apos;s Law:</strong> Certain substances containing
              asymmetric (chiral) carbon atoms possess the inherent property of rotating the plane of vibration of linearly polarized
              light when light travels through them. Such substances are called <em className="text-[var(--text)]">optically active</em>.
              Cane sugar (sucrose) is <em className="text-emerald-400 font-medium">dextrorotatory</em> (rotates the polarization plane clockwise looking towards the light source).
            </p>

            <p>
              According to Biot&apos;s empirical law, the optical rotation angle Δθ (in degrees) is directly proportional to
              the path length of the solution L (in decimeters) and the concentration c (in g/cm³ or g/mL):
            </p>

            <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-center font-mono text-xs md:text-sm text-[var(--accent)] font-semibold">
              Δθ = S · L · c &emsp;&iff;&emsp; S = Δθ / (L · c)
            </div>

            <p>
              Where:
              <br />• <span className="font-mono text-[var(--text)]">Δθ = |θ - θ₀|</span> is the net angle of optical rotation in degrees (observed sugar reading θ minus reference water reading θ₀).
              <br />• <span className="font-mono text-[var(--text)]">L</span> is the length of the polarimeter tube in decimeters (1 dm = 10 cm = 0.1 m).
              <br />• <span className="font-mono text-[var(--text)]">c</span> is the concentration of sugar in g/cm³ (or g/mL). For example, a 10% solution corresponds to c = 0.10 g/cm³.
              <br />• <span className="font-mono text-[var(--text)]">S</span> (or [α]D²⁰) is the specific rotation of sucrose, whose standard reference value at 20°C for sodium D-line light is <span className="font-mono text-emerald-400 font-semibold">+66.5° dm⁻¹ (g/cm³)⁻¹</span>.
            </p>

            <p>
              <strong className="text-[var(--text)]">2. Laurent&apos;s Half-Shade Plate Principle:</strong> A simple polarimeter using two crossed
              Nicol prisms is inaccurate because the human eye cannot judge the point of absolute extinction accurately. Laurent introduced a
              semicircular quartz plate of thickness t = λ / [2(μₑ - μₒ)] (half-wave retardation plate cut parallel to optic axis)
              covering half the circular field of view, while the other half is covered by an optical glass plate of identical light absorption.
            </p>

            <p>
              The linearly polarized light passing through the quartz half undergoes a reflection of its polarization vector across the optic axis,
              creating two beams with plane of vibrations inclined symmetrically at angle 2α. As the analyzer is rotated, the relative
              luminance of the two semicircles changes continuously. At the exact balance position, both halves exhibit
              <strong className="text-[var(--text)]"> equal dim illumination (sensitive tint)</strong>, where any fractional rotation of 0.05°
              immediately renders one half darker and the other brighter.
            </p>
          </div>
        </div>

        {/* Optical Bench Ray Path Diagram */}
        <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
            <Activity size={15} />
            <h3>Optical Bench Ray Train</h3>
          </div>
          <div className="p-4 rounded-lg bg-[var(--bg)] border border-[var(--border)] font-mono text-[11px] md:text-xs text-[var(--text-muted)] overflow-x-auto">
            <div className="whitespace-pre text-center leading-relaxed">
{`[Sodium Lamp (λ=589.3nm)] ──▶ [Collimating Lens] ──▶ [Fixed Nicol Polarizer]
                                                               │
                                                               ▼
[Eyepiece & Vernier] ◀── [Rotatable Analyzer Nicol] ◀── [Polarimeter Tube (L, c)] ◀── [Laurent Half-Shade Plate]`}
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Monochromatic light from a sodium vapor burner is collimated and linearly polarized by the polarizer Nicol.
            The beam passes through Laurent&apos;s half-shade plate, enters the optically active sugar solution in the glass tube of length L,
            undergoes polarization rotation Δθ = S · L · c, and is analyzed by the rotatable circular analyzer.
          </p>
        </div>

        {/* Procedure & Precautions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Procedure */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs tracking-wider uppercase">
              <CheckCircle2 size={15} />
              <h3>Step-by-Step Procedure</h3>
            </div>
            <ol className="text-xs md:text-sm text-[var(--text-muted)] space-y-2 list-decimal list-inside leading-relaxed">
              <li>Turn on the sodium vapor lamp and allow 10 minutes for full amber emission (λ = 589.3 nm).</li>
              <li>Thoroughly rinse the polarimeter tube with pure distilled water, fill completely, and ensure no air bubbles obstruct the optical path.</li>
              <li>Place the water tube in the trough, rotate the analyzer slowly until both semicircular halves show equal illumination, and record the zero reference reading θ₀.</li>
              <li>Prepare sugar solutions of known concentrations: 5%, 10%, 15%, and 20% (5 g, 10 g, 15 g, 20 g in 100 mL water).</li>
              <li>Rinse and fill the tube with each sugar solution in ascending order, re-balance to equal brightness, and record the analyzer angle θ.</li>
              <li>Calculate Δθ = |θ - θ₀| and S = Δθ / (L · c) for each reading.</li>
              <li>Plot Δθ vs c and verify that the line passes through the origin with slope m = S · L.</li>
            </ol>
          </div>

          {/* Precautions */}
          <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
              <ShieldCheck size={15} />
              <h3>Precautions & Good Practice</h3>
            </div>
            <ul className="text-xs md:text-sm text-[var(--text-muted)] space-y-2 list-disc list-inside leading-relaxed">
              <li>The polarimeter tube must be filled to the brim. If a bubble persists, tilt the tube so the bubble is trapped safely in the enlarged central reservoir bulb.</li>
              <li>Never overtighten the end caps; mechanical pressure on cover glasses induces stress birefringence which artificially rotates polarization.</li>
              <li>Always rotate the analyzer in the same clockwise direction when approaching the match point to eliminate backlash error in the graduated circle.</li>
              <li>Clean the outer glass surfaces with soft lens tissue before placing the tube into the trough.</li>
              <li>Read both verniers ($V_1$ and $V_2$) or use the same vernier consistently to eliminate scale eccentricity errors.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Persistent Video Demonstration & References with PiP Mini-Player ── */}
      <LabVideoPlayer
        videoId="DT9VdIpj5sc"
        title="Specific Rotation of Sugar Solution using Half-Shade Polarimeter | Engineering Physics"
        headerTitle="Video Demonstration & Reference Manuals"
        fallbackWatchUrl="https://www.youtube.com/watch?v=DT9VdIpj5sc"
        secondaryWatchUrl={{
          title: 'Alternate Demonstration: Polarimeter Practical by Rohit Gupta Physics',
          url: 'https://www.youtube.com/watch?v=ddFtwGL3UlQ',
        }}
        academicReferences={[
          {
            label: 'Virtual Labs (Amrita / Ministry of Education) — Half Shade Polarimeter',
            url: 'https://vlab.amrita.edu/?sub=1&brch=281&sim=1477&cnt=1',
          },
          {
            label: 'HyperPhysics (Georgia State University) — Optical Activity & Polarimetry',
            url: 'http://hyperphysics.phy-astr.gsu.edu/hbase/phyopt/polar.html#c3',
          },
        ]}
      />
    </div>
  );
}
