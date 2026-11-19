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
} from 'lucide-react';
import type { VivaQA, QuizQuestion } from '../types';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Why is the Hall voltage in semiconductors orders of magnitude larger and easier to measure than in metals?',
    options: [
      'Metals have lower electrical conductivity than semiconductors',
      'Hall voltage is inversely proportional to carrier concentration (V_H ∝ 1/n), and semiconductors have much lower n than metals',
      'Electrons in metals experience zero magnetic Lorentz force',
      'Metals have larger wafer thickness that cancels out the transverse voltage',
    ],
    correctIndex: 1,
    explanation:
      'Since V_H = (I·B) / (n·q·t), Hall voltage is inversely proportional to carrier density n. Metals have huge electron densities (n ≈ 10²⁸ m⁻³), yielding tiny sub-microvolt Hall voltages. Semiconductors have much lower carrier densities (n ≈ 10²¹ m⁻³), producing easily measurable millivolt signals (mV).',
  },
  {
    id: 2,
    question: 'In an n-type semiconductor with current flowing along the +x direction and magnetic field along the +z direction, in which direction do electrons deflect?',
    options: [
      'Along the +y direction',
      'Along the -y direction',
      'Along the +z direction',
      'They do not deflect because electrons have negative charge',
    ],
    correctIndex: 1,
    explanation:
      'Current is along +x, so electron drift velocity v_d is along -x. The Lorentz magnetic force is F = q(v_d × B) = (-e)[(-x̂) × (+ẑ)] = (-e)(+ŷ) = -ŷ. Thus, electrons deflect toward the -y face, making that lateral face negatively charged relative to the opposite face.',
  },
  {
    id: 3,
    question: 'What is the sign of the Hall coefficient (R_H) for p-type and n-type semiconductors, respectively?',
    options: [
      'Positive for p-type, negative for n-type',
      'Negative for p-type, positive for n-type',
      'Positive for both',
      'Zero for both intrinsic and extrinsic semiconductors',
    ],
    correctIndex: 0,
    explanation:
      'R_H = 1 / (n·q). For holes in p-type semiconductors, q = +e, so R_H > 0 (positive). For electrons in n-type semiconductors, q = -e, so R_H < 0 (negative).',
  },
  {
    id: 4,
    question: 'Which of the following physical quantities CANNOT be directly determined from a standard Hall effect measurement?',
    options: [
      'Carrier concentration (n)',
      'Type of majority charge carriers (electrons or holes)',
      'Carrier mobility (μ)',
      'Dielectric constant of the crystal lattice (ε_r)',
    ],
    correctIndex: 3,
    explanation:
      'Hall effect directly yields the Hall coefficient R_H, from which carrier concentration (n = 1/|R_H|e), carrier type (sign of R_H), and carrier mobility (μ = |R_H|/ρ) are computed. Dielectric constant requires capacitive or optical measurements.',
  },
  {
    id: 5,
    question: 'How is the probe misalignment voltage (offset voltage) eliminated during practical Hall measurements in the lab?',
    options: [
      'By increasing the wafer thickness to 10 cm',
      'By recording readings with both normal and reversed magnetic field (or current) directions and taking the average',
      'By turning off the sample current generator',
      'By switching from Germanium to an insulator like Diamond',
    ],
    correctIndex: 1,
    explanation:
      'If the two Hall probes are not exactly opposite each other on the equipotential line, an IR drop exists even at B = 0. By reversing the magnetic field direction, the true Hall voltage reverses sign while the misalignment resistive IR drop does not, allowing clean cancellation: V_H = [V(+B) - V(-B)] / 2.',
  },
];

const VIVA_QUESTIONS: VivaQA[] = [
  {
    tag: 'Fundamental Principle',
    q: 'What is the Hall effect and what causes the transverse potential difference?',
    a: 'When a magnetic field B is applied perpendicular to the direction of current I flowing through a conductor or semiconductor, the moving charge carriers experience a sideways Lorentz force F = q(v_d × B). This deflects carriers toward one lateral edge, creating a transverse electric field (Hall field E_H). The potential difference resulting from this charge separation is known as the Hall voltage (V_H).',
  },
  {
    tag: 'Carrier Distinction',
    q: 'How does the Hall effect conclusively distinguish between n-type and p-type semiconductors?',
    a: 'Both electrons (in n-type) and holes (in p-type) drift in opposite longitudinal directions under an applied electric field, but because both their charge q and drift velocity v_d reverse sign, the Lorentz force F = q(v_d × B) acts in the SAME spatial lateral direction for both! However, since electrons deposit negative charges while holes deposit positive charges on that same edge, the resulting transverse Hall voltage V_H has opposite polarity: V_H < 0 for n-type and V_H > 0 for p-type.',
  },
  {
    tag: 'Semiconductor Advantage',
    q: 'Why are semiconductors preferred over metals for measuring the Hall effect and fabricating Hall sensors?',
    a: 'Hall voltage is inversely proportional to carrier concentration: V_H = (I·B) / (n·q·t). Metals have massive free electron densities (~10²⁸ m⁻³), producing miniscule Hall voltages on the order of fractions of a microvolt (difficult to detect without cryogenic amplifiers). In contrast, doped semiconductors have carrier concentrations several orders of magnitude smaller (~10²¹ m⁻³), producing robust, noise-immune millivolt signals (5–50 mV) at room temperature.',
  },
  {
    tag: 'Stray Potentials',
    q: 'What is the Ettingshausen effect and how does it introduce systematic error?',
    a: 'When charge carriers are deflected by the magnetic field, fast-moving carriers (carrying higher thermal energy) deflect differently from slower ones, establishing a transverse temperature gradient across the specimen. This transverse temperature difference gives rise to a thermoelectric Seebeck voltage at the Hall probe contacts known as the Ettingshausen voltage, which superimposes onto the true Hall voltage.',
  },
  {
    tag: 'Offset Elimination',
    q: 'Why does an offset voltage appear at B = 0 and how is it compensated?',
    a: 'In practice, it is mechanically impossible to solder or contact the two transverse Hall probe tips on the exact same equipotential line. As current flows longitudinally, a small Ohmic IR drop exists between the probes even when B = 0. This is eliminated by either zero-trimming the meter with an opposing bridge potentiometer at B = 0, or by reversing the magnetic field and taking V_H = [V(+B) - V(-B)] / 2.',
  },
  {
    tag: 'Gaussmeter Principle',
    q: 'How does a digital Gaussmeter probe measure magnetic flux density?',
    a: 'The Gaussmeter probe contains an ultra-thin miniature Hall element (typically Indium Arsenide, InAs, or InSb) with a factory-calibrated Hall coefficient. A stable internal constant current is passed through the sensor, and the output Hall voltage is directly digitized and scaled by the microprocessor to display magnetic field in Gauss, kiloGauss, or Tesla.',
  },
  {
    tag: 'Wafer Geometry',
    q: 'Why must the semiconductor wafer be manufactured as thin as possible (t ≈ 0.5 mm)?',
    a: 'The Hall voltage formula V_H = (R_H·I·B) / t shows that V_H is inversely proportional to thickness t. Decreasing the thickness concentrates the current into a thin cross-section, increasing drift velocity v_d and maximizing the transverse voltage for a given input current, thereby optimizing measurement sensitivity.',
  },
  {
    tag: 'Mobility Relation',
    q: 'How is carrier mobility (μ) calculated from the Hall coefficient and resistivity?',
    a: 'Electrical conductivity is σ = n·e·μ = 1/ρ. Substituting carrier density n = 1 / (|R_H|·e) gives σ = (|R_H|·e)⁻¹ · e · μ = μ / |R_H|. Rearranging yields mobility: μ = |R_H|·σ = |R_H| / ρ. In SI units, μ is in m²/(V·s); multiplying by 10⁴ converts it into practical lab units of cm²/(V·s).',
  },
];

export function VivaContent() {
  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<boolean>(false);

  // Accordion state (null = all closed)
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
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

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  const score = calculateScore();

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 text-[var(--text)]">
      {/* ── Part 1: Interactive Self-Quiz ──────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <BookCheck size={18} className="text-[var(--accent)]" />
            <div>
              <h3 className="text-base font-bold text-[var(--text)]">
                Hall Effect Self-Assessment Quiz
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Test your mastery of Lorentz force, Hall coefficient polarity, and carrier transport.
              </p>
            </div>
          </div>

          {showResults && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                <Award size={14} />
                <span>
                  Score: {score} / {QUIZ_QUESTIONS.length} ({Math.round((score / QUIZ_QUESTIONS.length) * 100)}%)
                </span>
              </div>
              <button
                onClick={handleResetQuiz}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                <RotateCcw size={12} />
                <span>Retry</span>
              </button>
            </div>
          )}
        </div>

        {/* Questions list */}
        <div className="space-y-5">
          {QUIZ_QUESTIONS.map((q, idx) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const isCorrect = selectedAnswers[q.id] === q.correctIndex;

            return (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[var(--surface)] text-[var(--accent)] font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5 border border-[var(--border)]">
                    {idx + 1}
                  </span>
                  <p className="text-xs md:text-sm font-medium text-[var(--text)] leading-relaxed">
                    {q.question}
                  </p>
                </div>

                {/* Options list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[q.id] === optIdx;
                    let optionStyle =
                      'p-2.5 rounded-lg text-xs border transition-all text-left flex items-start gap-2 ';

                    if (showResults) {
                      if (optIdx === q.correctIndex) {
                        optionStyle += 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-medium';
                      } else if (isSelected) {
                        optionStyle += 'bg-rose-500/15 border-rose-500/40 text-rose-400';
                      } else {
                        optionStyle += 'bg-[var(--surface)]/50 border-[var(--border)] text-[var(--text-muted)] opacity-60';
                      }
                    } else if (isSelected) {
                      optionStyle += 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--text)] font-medium shadow-sm';
                    } else {
                      optionStyle += 'bg-[var(--surface)] border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface)]/80 hover:border-slate-500 cursor-pointer';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={showResults}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={optionStyle}
                      >
                        <span className="font-mono text-[11px] text-[var(--text-muted)] mt-0.5">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span className="flex-1 leading-snug">{opt}</span>
                        {showResults && optIdx === q.correctIndex && (
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        {showResults && isSelected && optIdx !== q.correctIndex && (
                          <XCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                {showResults && (
                  <div className="ml-7 p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-muted)] leading-relaxed space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider text-[var(--text)]">
                      <Sparkles size={12} className="text-amber-400" />
                      <span>Explanation</span>
                    </div>
                    <p>{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Quiz Button */}
        {!showResults && (
          <button
            onClick={() => setShowResults(true)}
            disabled={Object.keys(selectedAnswers).length === 0}
            className="w-full py-2.5 rounded-xl font-medium text-xs bg-[var(--accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            Submit Quiz ({Object.keys(selectedAnswers).length} of {QUIZ_QUESTIONS.length} Answered)
          </button>
        )}
      </div>

      {/* ── Part 2: Viva Voce Accordion Q&A ────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm pb-2.5 border-b border-[var(--border)]">
          <HelpCircle size={16} />
          <h3>Viva Voce Questions & Answers (8 Q&As)</h3>
        </div>

        <div className="space-y-2">
          {VIVA_QUESTIONS.map((qa, index) => {
            const isOpen = openAccordion === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenAccordion(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-3.5 text-left hover:bg-[var(--surface)]/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 pr-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] shrink-0 font-mono">
                      {qa.tag}
                    </span>
                    <span className="font-medium text-xs md:text-sm text-[var(--text)]">
                      {qa.q}
                    </span>
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="p-3.5 pt-1 text-xs text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)]/60 bg-[var(--surface)]/20">
                    {qa.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Part 3: Sources of Experimental Error & Analysis ───────────────── */}
      <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
        <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
          <AlertOctagon size={16} />
          <h3>Sources of Experimental Error & Systematic Offsets</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[var(--text-muted)] leading-relaxed">
          <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
            <h4 className="font-semibold text-[var(--text)]">
              1. Probe Misalignment IR Drop (Offset Voltage)
            </h4>
            <p>
              If the two transverse Hall contacts are slightly staggered longitudinally, a resistive IR drop appears across them even at zero magnetic field. Eliminate this by recording readings under both positive and negative magnetic fields: <span className="font-mono">V_H = [V(+B) - V(-B)] / 2</span>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
            <h4 className="font-semibold text-[var(--text)]">
              2. Ettingshausen & Nernst Effects
            </h4>
            <p>
              The magnetic deflection of charge carriers causes a transverse temperature gradient (Ettingshausen effect), producing a thermoelectric Seebeck voltage at the Hall probe junctions. Reversing both current and magnetic field cancels these odd-order thermal voltages.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
            <h4 className="font-semibold text-[var(--text)]">
              3. Non-Uniform Magnetic Air Gap
            </h4>
            <p>
              If the electromagnet pole faces are not parallel or the Hall probe is tilted, the normal component <span className="font-mono">B_⊥</span> is reduced. Keep the probe centered and perpendicular to the pole axis using the rigid probe stand.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-1">
            <h4 className="font-semibold text-[var(--text)]">
              4. Specimen Joule Self-Heating
            </h4>
            <p>
              Continuous high sample currents (<span className="font-mono">I &gt; 15 mA</span>) induce internal Joule heating (<span className="font-mono">I²R</span>), which increases intrinsic carrier generation and alters resistivity. Keep current below 10 mA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
