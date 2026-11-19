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
} from 'lucide-react';
import type { VivaQA, QuizQuestion } from '../types';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'What is the grating element (e) of a plane diffraction grating having N = 15,000 lines per inch?',
    options: [
      'e = 15,000 cm',
      'e = 2.54 / 15,000 cm ≈ 1.693 × 10⁻⁴ cm (1693.3 nm)',
      'e = 15,000 / 2.54 cm ≈ 5905 cm',
      'e = 1 / 15,000 inch = 0.00067 cm',
    ],
    correctIndex: 1,
    explanation:
      'If N is the number of lines per inch, the grating element e = a + b = 1/N inch = 2.54 / N cm. For N = 15,000 LPI, e = 2.54 / 15000 = 1.6933 × 10⁻⁴ cm = 1693.3 nm.',
  },
  {
    id: 2,
    question: 'Why is the diffraction grating adjusted for normal incidence in the spectrometer experiment?',
    options: [
      'To make the diffracted rays brighter only on the right side',
      'Because the grating equation (a+b) sin θ = nλ holds strictly for normal incidence, and it ensures symmetric diffraction orders on both sides',
      'To prevent light reflection from the front glass surface',
      'To eliminate the need for using the telescope eyepiece',
    ],
    correctIndex: 1,
    explanation:
      'At normal incidence (angle of incidence i = 0°), the path difference simplifies strictly to (a+b) sin θ = nλ. Oblique incidence adds a term (a+b)(sin i + sin θ) = nλ which introduces asymmetry and complicates angular reduction.',
  },
  {
    id: 3,
    question: 'Why do we measure the angular position on both the left (θ_L) and right (θ_R) diffraction orders to find 2θ = |θ_L - θ_R|?',
    options: [
      'It doubles the measured angle so the relative percentage error in vernier reading is halved, and it completely eliminates zero-error/index-error of the spectrometer circle',
      'Because diffracted light is polarized differently on the left and right',
      'To verify that the speed of light is the same in both directions',
      'Because only one side of the spectrometer main scale is graduated',
    ],
    correctIndex: 0,
    explanation:
      'Measuring symmetrical orders on both sides gives 2θ = |θ_L - θ_R|. If the spectrometer scale has a zero offset or index error ε (i.e. θ_L = θ + ε and θ_R = -θ + ε), the difference |θ_L - θ_R| = 2θ cancels out ε entirely! Moreover, dividing 2θ by 2 halves the reading error.',
  },
  {
    id: 4,
    question: 'What is the condition for missing (absent) orders in a plane transmission diffraction grating?',
    options: [
      '(a + b) / a = n / m (where n is grating order and m is single-slit diffraction minimum order)',
      'n = m · λ',
      '(a + b) · cos θ = 0',
      'a = b',
    ],
    correctIndex: 0,
    explanation:
      'If a principal maximum of the grating spectrum coincides with a single-slit diffraction minimum, that order will be absent: (a+b) sin θ = nλ and a sin θ = mλ. Dividing the two equations yields (a+b)/a = n/m.',
  },
  {
    id: 5,
    question: 'Why does the central fringe (n = 0) appear white when polychromatic mercury light is used?',
    options: [
      'Because mercury only emits white light at the center',
      'At θ = 0°, path difference Δ = (a+b) sin 0° = 0 for ALL wavelengths; all colors interfere constructively at the center to reconstruct white light',
      'Because the diffraction grating absorbs all colors except white at zero degrees',
      'Due to total internal reflection inside the collimator lens',
    ],
    correctIndex: 1,
    explanation:
      'For the central maximum (n = 0), the path difference is zero for all wavelengths (Δ = 0). Therefore, all spectral components of mercury light arrive in phase at θ = 0° and recombine to form a bright white image of the slit.',
  },
];

const VIVA_QA_LIST: VivaQA[] = [
  {
    tag: 'Fundamental Principle',
    q: '1. What is a plane transmission diffraction grating, and what is meant by the grating element?',
    a: 'A plane transmission diffraction grating is an optically flat glass plate upon which a large number of equidistant, parallel, fine opaque lines are ruled with a fine diamond stylus. The transparent space between two adjacent lines is of width "a" (slit) and the opaque ruled line is of width "b". The combined width e = a + b is called the grating element. If N is the number of rulings per inch, then e = 2.54 / N cm.',
  },
  {
    tag: 'Experimental Setting',
    q: '2. Why is it essential to set the grating in the normal incidence position before taking readings?',
    a: 'Under normal incidence (i = 0°), the optical path difference between rays from corresponding points of adjacent slits is simply Δ = (a + b) sin θ. The diffraction equation becomes (a+b) sin θ = nλ. If the grating is inclined at an angle i, the path difference is (a+b)(sin i ± sin θ) = nλ, which makes the spectrum asymmetric, distorts dispersion, and invalidates the standard calculation formula.',
  },
  {
    tag: 'Error Cancellation',
    q: '3. Why do we determine the diffraction angle from 2θ = |θ_Left - θ_Right| instead of measuring directly from the central 0° slit?',
    a: 'Measuring 2θ by reading both the left and right orders has three major advantages:\n(1) It eliminates any zero-error or index offset of the circular spectrometer scale.\n(2) It eliminates errors caused by slight eccentricity between the axis of rotation of the telescope and the graduated circle.\n(3) By measuring an angle twice as large (2θ) and dividing by 2, the proportional reading error of the vernier scale is halved.',
  },
  {
    tag: 'Spectral Features',
    q: '4. Why does the yellow line of the mercury spectrum appear as a distinct doublet (577.0 nm and 579.1 nm)?',
    a: 'In a mercury discharge, atomic electrons undergo transitions from excited triplet and singlet energy states (specifically 6¹P₁ → 6¹D₂ and 6³P₂ → 6³D₃/6³D₂). Because of fine-structure spin-orbit coupling, these energy levels are split into two closely spaced states separated by only 2.1 nm (576.96 nm and 579.07 nm). A grating with high line density (e.g. 15,000 LPI) provides sufficient chromatic resolving power to clearly separate this doublet.',
  },
  {
    tag: 'Diffraction Theory',
    q: '5. What are "missing orders" or absent spectra in a diffraction grating, and what is their condition?',
    a: 'Missing orders occur when the condition for a grating principal interference maximum ((a+b) sin θ = nλ) coincides with the condition for a single-slit diffraction minimum (a sin θ = mλ). When this happens, zero intensity is diffracted in that direction, so the nth order spectrum disappears completely. The condition is (a+b)/a = n/m.',
  },
  {
    tag: 'Instrument Comparison',
    q: '6. What is the difference between dispersive power and resolving power of a diffraction grating?',
    a: 'Dispersive power (dθ / dλ = n / [e cos θ]) measures the angular separation per unit difference in wavelength (i.e. how far apart two spectral lines are spread across the field of view). Resolving power (R = λ / Δλ = n · N_total) is the ability of the grating to reveal two closely adjacent spectral lines as separate and distinct according to Rayleigh\'s criterion.',
  },
  {
    tag: 'Grating Comparison',
    q: '7. How would the observed spectrum change if a grating with 6,000 LPI is used instead of 15,000 LPI?',
    a: 'With N = 6,000 LPI, the grating element e = 2.54 / 6000 is larger (4233 nm vs 1693 nm). Since sin θ = nλ / e, a larger grating element e means smaller diffraction angles θ. The spectral lines will be compressed closer to the central white slit. However, higher diffraction orders (3rd, 4th, 5th) become physically visible because sin θ remains < 1 up to higher values of n.',
  },
  {
    tag: 'Optics & Color',
    q: '8. Why is the central fringe (n = 0) white, while all higher orders (n = 1, 2) are dispersed into rainbow spectra?',
    a: 'At θ = 0°, the path difference Δ = (a+b) sin 0° = 0 for every wavelength present in the mercury lamp. Therefore, all wavelengths arrive in identical phase and constructively interfere to recreate the original white slit image. For n ≥ 1, sin θ = nλ/e depends directly on wavelength, causing violet light (shorter λ) to diffract at smaller angles and yellow/red light (longer λ) at larger angles, dispersing light into discrete color lines.',
  },
];

export function VivaContent() {
  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Accordion state (first two open by default)
  const [openAccordions, setOpenAccordions] = useState<Record<number, boolean>>({
    0: true,
    1: true,
  });

  const toggleAccordion = (idx: number) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleSelectAnswer = (qId: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optIdx,
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
              Interactive Self-Quiz: Diffraction Grating & Spectrometry
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
                      <Sparkles size={12} />
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
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(selectedAnswers).length === 0}
              className="px-5 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit & Check Answers
            </button>
          </div>
        )}
      </div>

      {/* ── Section 2: Viva Voce Standard Questions ───────────────────────── */}
      <div className="p-5 md:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <HelpCircle size={18} className="text-cyan-400" />
          <h2 className="text-base font-semibold text-[var(--text)] tracking-tight">
            AKTU Applied Physics Viva Voce Questions & Model Answers
          </h2>
        </div>

        <div className="space-y-2.5">
          {VIVA_QA_LIST.map((item, idx) => {
            const isOpen = !!openAccordions[idx];

            return (
              <div
                key={idx}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-3 hover:bg-[var(--surface)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--surface)] border border-[var(--border)] text-cyan-400">
                      {item.tag}
                    </span>
                    <span className="text-xs md:text-sm font-semibold text-[var(--text)]">
                      {item.q}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="p-4 pt-1 border-t border-[var(--border)] text-xs md:text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line bg-[var(--surface)]/30">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Error Analysis & Uncertainty Budget ────────────────── */}
      <div className="p-5 md:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)] text-rose-400">
          <AlertOctagon size={18} />
          <h2 className="text-base font-semibold text-[var(--text)] tracking-tight">
            Error Analysis & Instrumental Uncertainty Budget
          </h2>
        </div>

        <div className="space-y-3 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
          <p>
            In the determination of wavelength <span className="font-mono text-[var(--text)]">λ = (e · sin θ) / n</span>, the experimental uncertainty arises from
            both the manufacturing tolerance of the grating element <span className="font-mono text-[var(--text)]">e</span> and angular uncertainty in the spectrometer Vernier scale:
          </p>

          <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] font-mono text-center text-xs md:text-sm text-[var(--text)]">
            <strong className="text-rose-400">Maximum Proportional Error Formula:</strong>
            <div className="mt-1 text-sky-400">
              (Δλ / λ) = (Δe / e) + cot θ · Δθ
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1">
              <div className="text-xs font-semibold text-[var(--text)]">1. Vernier Least Count Limit (Δθ)</div>
              <p className="text-xs text-[var(--text-muted)]">
                The spectrometer circular vernier scale has a least count of <span className="font-mono text-[var(--text)]">LC = 1&apos; = (1/60)° = 0.00029 rad</span>.
                Since <span className="font-mono text-[var(--text)]">d(sin θ)/dθ = cos θ</span>, the fractional error contribution is <span className="font-mono text-[var(--text)]">cot θ · Δθ</span>.
                Because <span className="font-mono text-[var(--text)]">cot θ</span> is larger at smaller angles, higher diffraction orders (e.g. n = 2) yield lower percentage errors!
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1">
              <div className="text-xs font-semibold text-[var(--text)]">2. Non-Normal Incidence Error</div>
              <p className="text-xs text-[var(--text-muted)]">
                If the grating normal deviates from the collimator axis by a tilt angle α &ne; 0, the grating equation
                becomes e(sin α &plusmn; sin θ) = nλ. This shifts left and right spectral orders unequally, though taking
                2θ = |θ_L - θ_R| provides first-order compensation.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1">
              <div className="text-xs font-semibold text-[var(--text)]">3. Finite Slit Width & Parallax</div>
              <p className="text-xs text-[var(--text-muted)]">
                A wider collimator slit broadens the spectral line image, introducing ambiguity in locating the exact line center.
                Always narrow the slit until lines are razor-thin, and adjust telescope focus to eliminate crosshair parallax.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1">
              <div className="text-xs font-semibold text-[var(--text)]">4. Thermal Expansion of Grating</div>
              <p className="text-xs text-[var(--text-muted)]">
                Glass substrates have a linear expansion coefficient α &approx; 8 &times; 10⁻⁶ /K. Under ordinary
                laboratory room temperature variations (ΔT &approx; 5°C), the thermal grating expansion is &lt; 0.004%,
                which is negligible compared to the 0.05% - 0.1% vernier least count error.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
