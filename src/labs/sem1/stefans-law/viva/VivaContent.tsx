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
} from 'lucide-react';

interface VivaQA {
  q: string;
  a: string;
  tag: string;
}

const VIVA_QUESTIONS: VivaQA[] = [
  {
    tag: 'Principle',
    q: "State Stefan-Boltzmann's Law of Radiation.",
    a: "Stefan's Law states that the total radiant energy emitted per second per unit surface area of a blackbody is directly proportional to the fourth power of its absolute thermodynamic temperature: E = σ · T⁴. For an enclosed non-blackbody radiator at temperature T in surroundings at T₀, net power dissipated is P = C · (Tⁿ − T₀ⁿ) ≈ C · Tⁿ when T ≫ T₀, where n ≈ 4.",
  },
  {
    tag: 'Apparatus',
    q: 'Why is a tungsten filament bulb preferred in this experiment?',
    a: 'Tungsten has an exceptionally high melting point (~3695 K), high mechanical strength, and relatively high emissivity. More crucially, its electrical resistance increases monotonically and predictably with temperature, allowing temperature to be deduced accurately from electrical resistance (Rt/R0).',
  },
  {
    tag: 'Calibration',
    q: 'What is the Draper Point and why is it used to find cold resistance R₀?',
    a: 'The Draper Point is the temperature (~527 °C or ~800 K) at which all solids first begin to emit visible electromagnetic radiation (dull cherry-red glow). Because measuring the true cold resistance at 0 °C (273 K) with a standard ohmmeter incurs lead wire contact errors and negligible sensitivity, we measure Rg at 800 K and use the established tungsten empirical ratio R800 / R0 = 3.9 to deduce R0 = Rg / 3.9.',
  },
  {
    tag: 'Error Analysis',
    q: 'Why does the experimentally determined slope n often lie between 3.8 and 4.2 rather than exactly 4.00?',
    a: 'Two primary physical factors cause minor deviations: (1) Conduction and convection losses through the filament support molybdenum lead wires and residual inert gas in the bulb. (2) Tungsten is not an ideal black body; its spectral emissivity ε(λ, T) varies slightly with temperature rather than being strictly constant.',
  },
  {
    tag: 'Safety & Physics',
    q: 'Why must the bulb be evacuated or filled with an inert gas like Argon/Nitrogen?',
    a: 'If air (oxygen) were present inside the glass envelope, the tungsten filament would immediately oxidize and burn out within milliseconds at red heat. An inert gas atmosphere suppresses tungsten evaporation and prevents oxidation while inhibiting electrical arcing.',
  },
  {
    tag: 'Mathematics',
    q: 'Why do we plot log₁₀(P) vs log₁₀(T) instead of plotting P vs T directly?',
    a: 'A direct plot of P vs T yields a steep quartic curve (T⁴) where finding the power exponent n directly is difficult. By taking logarithms: log₁₀(P) = n · log₁₀(T) + log₁₀(C), the power relation transforms into a straight line equation (y = mx + c) where the slope m directly equals the exponent n and the intercept gives log₁₀(C).',
  },
  {
    tag: 'Measurement',
    q: 'Why can we neglect the ambient temperature term T₀⁴ in P = C(T⁴ - T₀⁴)?',
    a: 'At operating incandescent temperatures, T ranges from ~800 K to 2500 K. Since room temperature T₀ ≈ 300 K, T⁴ is between (800/300)⁴ ≈ 50 times to (2500/300)⁴ ≈ 4800 times larger than T₀⁴. Thus, T₀⁴ is negligible within experimental measurement precision.',
  },
  {
    tag: 'Instrumentation',
    q: 'Why is the voltmeter connected in parallel across the bulb while the ammeter is in series?',
    a: 'An ammeter has very low internal resistance and is connected in series so all circuit current flows through it without dropping significant voltage. A voltmeter has very high internal resistance and is placed in parallel across the bulb to measure the true potential drop across the filament without drawing significant shunt current.',
  },
];

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "According to Stefan-Boltzmann's law, how does radiant power (P) scale with absolute temperature (T)?",
    options: ['P ∝ T', 'P ∝ T²', 'P ∝ T³', 'P ∝ T⁴'],
    correctIndex: 3,
    explanation: "Stefan-Boltzmann's law states that total radiated power is proportional to the fourth power of absolute temperature (P = σ·A·ε·T⁴).",
  },
  {
    id: 2,
    question: 'The Draper Point (~800 K) corresponds to the temperature where a solid:',
    options: [
      'Begins to melt into liquid',
      'First begins to emit visible dull-red radiation',
      'Reaches absolute zero resistance',
      'Emits pure white light',
    ],
    correctIndex: 1,
    explanation: 'The Draper Point (approx. 527 °C or 800 K) is the universal threshold temperature where heated solids first emit visible dull red glow.',
  },
  {
    id: 3,
    question: 'In the formula T = 157.12 · (Rₜ / R₀) + 167.33, what does R₀ represent?',
    options: [
      'Resistance at burning temperature',
      'Internal resistance of the DC power supply',
      'Cold resistance of the tungsten filament at 273 K (0 °C)',
      'Resistance of the variable rheostat',
    ],
    correctIndex: 2,
    explanation: 'R₀ is the reference cold resistance of the tungsten filament at 273 K (0 °C), derived from the glowing resistance Rg / 3.9.',
  },
  {
    id: 4,
    question: 'In a graph of log₁₀(P) on the Y-axis vs log₁₀(T) on the X-axis, the slope of the line equals:',
    options: [
      "The Stefan constant 'σ'",
      "The exponent 'n' in the power law P = C·Tⁿ",
      'The filament cold resistance R₀',
      'The electrical efficiency of the bulb',
    ],
    correctIndex: 1,
    explanation: 'Since log₁₀(P) = n·log₁₀(T) + log₁₀(C) matches y = mx + c, the slope m represents the exponent n (which should be close to 4.0).',
  },
  {
    id: 5,
    question: 'Which of the following is a legitimate cause for the experimental slope n being slightly under 4.0 (e.g. 3.85)?',
    options: [
      'Conductive heat dissipation through the filament support lead wires',
      'Photons traveling too slowly in the laboratory room',
      'Excess friction in the voltmeter needle bearings',
      'The power supply frequency being 50 Hz AC instead of DC',
    ],
    correctIndex: 0,
    explanation: 'Heat conduction through metallic molybdenum support leads carries away non-radiative heat, slightly lowering the apparent radiative exponent n from 4.0.',
  },
];

export function VivaContent() {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSelectOption = (qId: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const score = calculateScore();

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-10 text-[var(--text)]">
      {/* ─── Part 1: Interactive Self-Quiz ─────────────────────────────────── */}
      <section className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400">
              <BookCheck size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Interactive Viva MCQ Self-Quiz</h2>
              <p className="text-xs text-[var(--text-muted)]">5 Rapid-fire questions to test your practical mastery</p>
            </div>
          </div>

          {submitted && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <Award size={14} /> Score: {score} / {QUIZ_QUESTIONS.length} ({((score / QUIZ_QUESTIONS.length) * 100).toFixed(0)}%)
              </span>
              <button
                onClick={handleResetQuiz}
                className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <RotateCcw size={12} /> Retake
              </button>
            </div>
          )}
        </div>

        {/* Questions list */}
        <div className="space-y-5">
          {QUIZ_QUESTIONS.map((q, idx) => {
            const chosen = selectedAnswers[q.id];
            const isCorrect = chosen === q.correctIndex;

            return (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-3"
              >
                <p className="text-sm font-semibold text-[var(--text)] leading-snug">
                  <span className="text-[var(--accent)] font-mono font-bold mr-1.5">Q{idx + 1}.</span>
                  {q.question}
                </p>

                {/* Option choices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = chosen === optIdx;
                    let style = 'border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--border)]/40';

                    if (submitted) {
                      if (optIdx === q.correctIndex) {
                        style = 'border-emerald-500 bg-emerald-500/15 text-emerald-400 font-semibold';
                      } else if (isSelected && !isCorrect) {
                        style = 'border-red-500 bg-red-500/15 text-red-400';
                      }
                    } else if (isSelected) {
                      style = 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] font-semibold';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={submitted}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`p-3 text-left rounded-lg text-xs border transition-all flex items-start gap-2.5 ${style}`}
                      >
                        <span className="w-4 h-4 rounded-full border border-current shrink-0 flex items-center justify-center text-[10px] mt-0.5">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback explanation after submit */}
                {submitted && (
                  <div
                    className={`p-3 rounded-lg text-xs leading-relaxed flex items-start gap-2 ${
                      isCorrect
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/10 border border-red-500/20 text-red-300'
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold">{isCorrect ? 'Correct!' : 'Incorrect.'}</p>
                      <p className="mt-0.5 opacity-90">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Quiz button */}
        {!submitted && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(selectedAnswers).length < QUIZ_QUESTIONS.length}
              className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 text-xs font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Quiz ({Object.keys(selectedAnswers).length} / {QUIZ_QUESTIONS.length} Answered)
            </button>
          </div>
        )}
      </section>

      {/* ─── Part 2: Viva Q&A Accordion ───────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle size={20} className="text-[var(--accent)]" />
          <h2 className="text-lg font-bold tracking-tight">University Viva Voce Questions & Answers</h2>
        </div>
        <p className="text-xs md:text-sm text-[var(--text-muted)]">
          Standard questions asked by external practical examiners during university physics lab evaluations.
        </p>

        <div className="space-y-3 pt-2">
          {VIVA_QUESTIONS.map((item, idx) => {
            const isOpen = openAccordion === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenAccordion(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-[var(--bg)]/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--bg)] border border-[var(--border)] text-[var(--accent)] uppercase tracking-wider shrink-0">
                      {item.tag}
                    </span>
                    <span className="font-semibold text-sm text-[var(--text)] leading-snug truncate">
                      {item.q}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-[var(--text-muted)] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)]/60 bg-[var(--bg)]/30">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Part 3: Common Experimental Errors ───────────────────────────── */}
      <section className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
          <AlertOctagon size={18} />
          <h3>Sources of Experimental Error & How to Minimize Them</h3>
        </div>
        <ul className="text-xs md:text-sm text-[var(--text-muted)] space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong className="text-[var(--text)]">Draper Point Subjectivity:</strong> Human eyes detect dull red glow differently depending on room illumination. Always dim ambient lights when noting the just-glowing point $R_g$.
          </li>
          <li>
            <strong className="text-[var(--text)]">Thermal Lag:</strong> Tungsten requires 1–2 seconds to reach steady-state thermodynamic equilibrium after a slider step. Do not record readings instantaneously while sliding the rheostat.
          </li>
          <li>
            <strong className="text-[var(--text)]">Meter Burden Voltage:</strong> Ensure the voltmeter is connected directly across the bulb terminals rather than across the power supply to avoid including the series lead wire drop.
          </li>
        </ul>
      </section>
    </div>
  );
}
