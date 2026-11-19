import React, { useState } from 'react';
import {
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  BookCheck,
  AlertOctagon,
  Sparkles,
  Calculator,
  RotateCw,
} from 'lucide-react';
import type { VivaQA, QuizQuestion } from '../types';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question:
      'What is the defining formula and standard laboratory unit for specific rotation (S or [α]λᵗ) of an optically active solute in solution?',
    options: [
      'S = θ / (L · c), measured in deg · dm⁻¹ · (g/cm³)⁻¹ (or deg · dm⁻¹ · (g/mL)⁻¹)',
      'S = (L · c) / θ, measured in cm · g⁻¹',
      'S = θ · L · c, measured in deg · m · kg',
      'S = θ / (L² · c), measured in deg · cm⁻²',
    ],
    correctIndex: 0,
    explanation:
      'Specific rotation is defined by Biot’s law as S = θ / (L · c), where θ is the optical rotation in degrees, L is the tube length in decimeters (dm), and c is the concentration in g/cm³ (or g/mL). The standard unit is deg · dm⁻¹ · (g/cm³)⁻¹.',
  },
  {
    id: 2,
    question:
      'What is the optical construction and thickness (t) of the quartz plate in Laurent’s half-shade device?',
    options: [
      'A semicircular quartz plate cut parallel to the optic axis of thickness t = λ / [2(μₑ - μₒ)], introducing a phase difference of π (half-wave retardation)',
      'A full circular quartz plate of thickness t = λ / [4(μₑ - μₒ)]',
      'A glass plate coated with polarizing polaroid film',
      'A quarter-wave plate cut perpendicular to the optic axis',
    ],
    correctIndex: 0,
    explanation:
      'Laurent’s half-shade plate consists of a semicircular quartz plate cut parallel to the optic axis with thickness t = λ / [2(μₑ - μₒ)] (half-wave plate, phase difference π or path difference λ/2) covering one half of the circular field, and a glass plate of equal absorption covering the other half.',
  },
  {
    id: 3,
    question:
      'Why is a half-shade polarimeter significantly more sensitive and accurate than a simple two-Nicol polarimeter?',
    options: [
      'Because according to the Weber-Fechner law, the human eye cannot accurately judge absolute extinction (darkness), but is remarkably sensitive to subtle contrast between two adjacent matched fields',
      'Because the half-shade plate doubles the wavelength of sodium light',
      'Because it amplifies the intensity of light by total internal reflection',
      'Because Nicol prisms cannot transmit monochromatic sodium yellow light',
    ],
    correctIndex: 0,
    explanation:
      'In a simple two-Nicol polarimeter, finding the point of minimum illumination is ambiguous because the human eye has poor sensitivity near absolute darkness. In Laurent’s device, two adjacent semicircles change brightness oppositely; the eye readily detects a luminance imbalance of even 0.05° across the sharp boundary.',
  },
  {
    id: 4,
    question:
      'How does the optical rotation angle (Δθ) depend on the wavelength (λ) of the incident light (Biot’s law of rotatory dispersion)?',
    options: [
      'Δθ is approximately inversely proportional to the square of wavelength: Δθ ∝ 1 / λ²',
      'Δθ is directly proportional to wavelength: Δθ ∝ λ',
      'Δθ is completely independent of wavelength',
      'Δθ is proportional to λ⁴',
    ],
    correctIndex: 0,
    explanation:
      'According to Biot’s law of rotatory dispersion, optical rotation varies inversely with the square of the wavelength (Δθ ∝ 1 / λ²). Consequently, shorter wavelengths like violet light undergo much larger rotation than longer wavelengths like sodium yellow or red light.',
  },
  {
    id: 5,
    question:
      'Pure cane sugar (sucrose, C₁₂H₂₂O₁₁) in aqueous solution rotates the plane of polarization in which direction, and what is its standard specific rotation [α]D²⁰?',
    options: [
      'Clockwise looking towards the source (dextrorotatory / (+)), with [α]D²⁰ ≈ +66.5° dm⁻¹ (g/cm³)⁻¹',
      'Counter-clockwise (levorotatory / (-)), with [α]D²⁰ ≈ -92.4° dm⁻¹ (g/cm³)⁻¹',
      'It produces zero net rotation because sucrose is racemic',
      'Clockwise, with [α]D²⁰ ≈ +180.0° dm⁻¹ (g/cm³)⁻¹',
    ],
    correctIndex: 0,
    explanation:
      'Commercial cane sugar (sucrose) is strongly dextrorotatory ((+) or d-rotatory), turning the polarization plane clockwise when viewed looking into the beam. At 20°C for sodium D-line light (589.3 nm), pure sucrose has [α]D²⁰ = +66.5° dm⁻¹ (g/cm³)⁻¹.',
  },
];

const VIVA_QA_LIST: VivaQA[] = [
  {
    tag: 'Fundamental Definition',
    q: '1. What is optical activity, and what is meant by the specific rotation of an optically active substance?',
    a: 'Optical activity is the phenomenon by which certain asymmetric substances rotate the plane of vibration of linearly polarized light passing through them. Specific rotation [α]λᵗ is defined as the optical rotation in degrees produced by a solution column of path length 1 decimeter (10 cm) containing 1 gram of active solute per cm³ (1 mL) of solution, at temperature t°C for light of wavelength λ. The governing formula is S = θ / (L · c).',
  },
  {
    tag: 'Instrumental Sensitivity',
    q: '2. Why is a Laurent half-shade polarimeter much more sensitive than a simple polarimeter consisting of two Nicol prisms?',
    a: 'In a simple two-Nicol polarimeter, the user attempts to identify the angle of maximum darkness (extinction). The human eye has very poor discrimination near complete extinction, so settings can easily vary by 2° to 3°. Laurent’s device splits the field into two semicircles with vibration directions inclined at a small half-shade angle 2α. As the analyzer rotates through the balance angle, one half rapidly brightens while the other dims. The eye easily detects even a 0.05° luminance contrast between adjacent matched fields (Weber-Fechner law).',
  },
  {
    tag: 'Chirality & Stereochemistry',
    q: '3. What is the difference between dextrorotatory and levorotatory substances? Give examples.',
    a: 'A substance that rotates the plane of polarization clockwise (as seen looking against the incoming ray) is called dextrorotatory, symbolized by (+) or "d-". Cane sugar (sucrose, [α] = +66.5°) and dextrose (d-glucose, [α] = +52.7°) are dextrorotatory. A substance that rotates the plane counter-clockwise is called levorotatory, symbolized by (-) or "l-". Fruit sugar (fructose/levulose, [α] = -92.4°) is strongly levorotatory.',
  },
  {
    tag: 'Biot’s Laws',
    q: '4. What are Biot’s laws of optical rotation in solutions?',
    a: '1. Optical rotation Δθ is directly proportional to the path length L of the solution: Δθ ∝ L.\n2. Optical rotation Δθ is directly proportional to the concentration c of the active solute: Δθ ∝ c.\n3. The combined relation is Δθ = S · L · c.\n4. Optical rotation varies inversely with the square of the wavelength (Δθ ∝ 1 / λ²), known as normal rotatory dispersion.',
  },
  {
    tag: 'Physical Dependencies',
    q: '5. How does specific rotation depend on temperature and wavelength?',
    a: '1. Temperature Dependence: Specific rotation generally decreases slightly with increasing temperature (typically by ~0.02% per °C for sucrose) due to thermal expansion of the solution (which lowers volumetric concentration c) and molecular conformation changes.\n2. Wavelength Dependence: Specific rotation increases sharply as wavelength decreases (Cauchy/Biot dispersion S ∝ 1/λ²). Hence monochromatic sodium D-line light (589.3 nm) is standard.',
  },
  {
    tag: 'Bubble Interference',
    q: '6. Why must air bubbles be completely eliminated from the polarimeter tube, and how does the tube design prevent them?',
    a: 'An air bubble in the central optical aperture creates a curved air-liquid meniscus. This meniscus acts like an irregular lens, refracting and scattering light out of the optical axis, depolarizing the beam, and creating distorting glare patches that obscure the half-shade dividing line. Modern polarimeter tubes have an enlarged central bulb reservoir: any residual bubble is tilted into this reservoir so the optical path remains purely liquid-filled.',
  },
  {
    tag: 'Laurent Plate Optics',
    q: '7. Explain the construction and working of Laurent’s half-shade plate.',
    a: 'Laurent’s plate is made of two semicircles joined along a diameter: one half is a quartz plate cut parallel to the optic axis of thickness t = λ / [2(μₑ - μₒ)] (half-wave plate introducing a phase difference of π), and the other half is an optical glass plate of identical transmission and thickness. When linearly polarized light hits the quartz half, the component perpendicular to the optic axis is reversed in phase, rotating the plane of polarization symmetrically across the optic axis by 2α. The glass half transmits light without altering its polarization plane.',
  },
  {
    tag: 'Error Cancellation',
    q: '8. What are the main sources of error in this experiment, and why do we subtract the reference zero reading θ₀?',
    a: '1. Zero/Index Error: The graduated circle 0° may not coincide exactly with the polarizer axis; subtracting reference reading θ₀ (measured with pure distilled water) gives Δθ = |θ - θ₀|, completely cancelling zero offset.\n2. Cover Glass Strain: Overtightening screw caps produces mechanical stress birefringence in the end glass windows, which rotates polarization; finger-tightening with rubber gaskets avoids this.\n3. Vernier Backlash: Always approach the balance point from the same rotational direction (clockwise) to avoid gear play.',
  },
];

export function VivaContent() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const handleSelectAnswer = (questionId: number, optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const score = QUIZ_QUESTIONS.reduce((acc, q) => {
    return selectedAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 text-[var(--text)]">
      {/* ── Section 1: Self-Assessment MCQ Quiz ────────────────────────────── */}
      <div className="p-5 md:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <BookCheck size={18} className="text-[var(--accent)]" />
            <h2 className="text-base font-semibold text-[var(--text)] tracking-tight">
              Interactive Self-Quiz: Polarimetry & Optical Activity
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {submitted && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Award size={13} />
                <span>Score: {score} / {QUIZ_QUESTIONS.length}</span>
              </div>
            )}
            <button
              onClick={handleResetQuiz}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-all"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {QUIZ_QUESTIONS.map((q, qIdx) => {
            const chosen = selectedAnswers[q.id];
            const isAnswered = chosen !== undefined;
            const isCorrect = chosen === q.correctIndex;

            return (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[10px] font-bold shrink-0 text-[var(--text-muted)] font-mono">
                    {qIdx + 1}
                  </span>
                  <p className="text-xs md:text-sm font-medium text-[var(--text)] leading-relaxed">
                    {q.question}
                  </p>
                </div>

                {/* Options */}
                <div className="space-y-1.5 pl-7">
                  {q.options.map((opt, optIdx) => {
                    let optStyle =
                      'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--border)]/40 hover:text-[var(--text)]';

                    if (submitted) {
                      if (optIdx === q.correctIndex) {
                        optStyle = 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-medium';
                      } else if (chosen === optIdx && !isCorrect) {
                        optStyle = 'bg-rose-500/15 border-rose-500/50 text-rose-300';
                      }
                    } else if (chosen === optIdx) {
                      optStyle = 'bg-sky-500/15 border-sky-500/50 text-sky-300 font-medium';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectAnswer(q.id, optIdx)}
                        disabled={submitted}
                        className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between gap-2 ${optStyle}`}
                      >
                        <span>{opt}</span>
                        {submitted && optIdx === q.correctIndex && (
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        )}
                        {submitted && chosen === optIdx && !isCorrect && (
                          <XCircle size={14} className="text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {submitted && (
                  <div className="mt-3 p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1 pl-7">
                    <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles size={13} />
                      <span>Explanation:</span>
                    </div>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Quiz Button */}
        {!submitted && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(selectedAnswers).length === 0}
              className={`
                flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-md
                ${Object.keys(selectedAnswers).length > 0
                  ? 'bg-[var(--accent)] hover:opacity-90 text-white cursor-pointer active:scale-95'
                  : 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed opacity-50'
                }
              `}
            >
              <CheckCircle2 size={14} />
              <span>Submit Self-Assessment</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Section 2: AKTU Official Viva Voce Questions & Answers ─────────── */}
      <div className="p-5 md:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <HelpCircle size={18} className="text-cyan-400" />
          <h2 className="text-base font-semibold text-[var(--text)] tracking-tight">
            AKTU Applied Physics Viva Voce Q&amp;A (AAS151 / AAS251)
          </h2>
        </div>

        <div className="space-y-3">
          {VIVA_QA_LIST.map((qa, index) => {
            const isOpen = openAccordion === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenAccordion(isOpen ? null : index)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-[var(--surface)]/50 transition-colors"
                >
                  <div className="space-y-1">
                    <span className="inline-block text-[10px] font-mono tracking-wider uppercase font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {qa.tag}
                    </span>
                    <h3 className="text-xs md:text-sm font-semibold text-[var(--text)] leading-snug">
                      {qa.q}
                    </h3>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="p-4 pt-1 border-t border-[var(--border)]/60 bg-[var(--surface)]/30 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                    {qa.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Error Analysis & Uncertainty Propagation ────────────── */}
      <div className="p-5 md:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <Calculator size={18} className="text-amber-400" />
          <h2 className="text-base font-semibold text-[var(--text)] tracking-tight">
            Error Analysis &amp; Experimental Limitations
          </h2>
        </div>

        <div className="space-y-3 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
          <p>
            <strong className="text-[var(--text)]">1. Maximum Fractional Error Formula:</strong>
            <br />
            Since specific rotation is given by S = Δθ / (L · c), taking natural logarithms yields ln S = ln(Δθ) - ln L - ln c.
            Differentiating partially gives the maximum permissible fractional error:
          </p>

          <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-center font-mono text-xs md:text-sm text-amber-400 font-semibold">
            δS / S = δ(Δθ) / Δθ + δL / L + δc / c
          </div>

          <p>
            <strong className="text-[var(--text)]">2. Primary Experimental Uncertainties:</strong>
            <br />• <span className="font-semibold text-[var(--text)]">Angular Vernier Error (δθ):</span> Least count of the polarimeter graduated circle is typically 0.05° (3 arcminutes). For a rotation Δθ ≈ 13.3°, δθ / Δθ ≈ 0.05 / 13.3 ≈ 0.38%.
            <br />• <span className="font-semibold text-[var(--text)]">Length Measurement (δL):</span> Measured with a standard metric vernier caliper (L = 20.0 ± 0.05 cm = 2.000 ± 0.005 dm), giving δL / L ≈ 0.25%.
            <br />• <span className="font-semibold text-[var(--text)]">Solution Concentration (δc):</span> Governed by weighing balance uncertainty (±0.005 g) and volumetric flask calibration (±0.1 mL for 100 mL), giving δc / c ≈ 0.3%.
            <br />• <span className="font-semibold text-[var(--text)]">Combined Standard Laboratory Uncertainty:</span> Typically δS / S ≤ 1.5% to 2.0%, well within our platform&apos;s 2% verification threshold.
          </p>
        </div>
      </div>
    </div>
  );
}
