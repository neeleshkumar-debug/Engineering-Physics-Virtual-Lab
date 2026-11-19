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
    question: "Why is Carey Foster's bridge specifically preferred over a standard meter bridge for measuring low resistances (< 2 Ω)?",
    options: [
      'Because it uses an alternating current source',
      'Because the contact resistances (end-corrections α and β) at the soldered wire terminals are eliminated completely by interchanging the gap resistances',
      'Because the galvanometer is connected directly across the battery terminals',
      'Because the wire length is 200 cm instead of 100 cm',
    ],
    correctIndex: 1,
    explanation:
      'In an ordinary meter bridge, end-resistances α and β of the copper connecting strips can be 0.05–0.15 Ω, which introduces massive errors (>10%) when measuring small resistances. In Carey Foster\'s bridge, interchanging the outer gap resistances cancels (α - β) entirely in the subtraction (R1 - R2) = ρ_w(l2 - l1).',
  },
  {
    id: 2,
    question: "What is the mathematical condition for the bridge null points l₁ and l₂ to fall within the 100 cm graduated wire?",
    options: [
      '|R₁ - R₂| must be less than the total resistance of the bridge wire (100 · ρ_w)',
      'R₁ must equal R₂ exactly',
      'P + Q must exceed 100 Ω',
      'The battery voltage must be exactly 10 V',
    ],
    correctIndex: 0,
    explanation:
      'Since R₁ - R₂ = ρ_w (l₂ - l₁) and the maximum possible difference (l₂ - l₁) on a 1-meter wire is 100 cm, the maximum resistance difference that can be measured is (100 · ρ_w). If |R₁ - R₂| > 100 ρ_w, the balance point falls off the wire.',
  },
  {
    id: 3,
    question: 'Why must the ratio arm resistances P and Q be closely matched (P ≈ Q)?',
    options: [
      'To prevent the galvanometer needle from vibrating',
      'A Wheatstone bridge achieves maximum galvanometer deflection sensitivity when the resistances in all four arms are approximately of the same order of magnitude',
      'To double the battery current flowing through the bridge wire',
      'To make the bridge independent of temperature',
    ],
    correctIndex: 1,
    explanation:
      'According to the Wheatstone bridge sensitivity criterion, the galvanometer current for a given slight fractional imbalance is maximized when all four bridge arms (P, Q, R_left, R_right) are approximately equal. When P = Q, the ratio is 1:1 and null detection is sharpest.',
  },
  {
    id: 4,
    question: 'Why should the sliding jockey never be dragged or scraped along the bridge wire?',
    options: [
      'It creates electrostatic charge on the wooden ruler',
      'Dragging creates sparks that damage the galvanometer coil',
      'Dragging or scraping wears off the wire non-uniformly, altering its cross-sectional area and destroying the constancy of resistance per unit length (ρ_w)',
      'It magnetizes the manganin wire',
    ],
    correctIndex: 2,
    explanation:
      'The Carey Foster formula assumes that the bridge wire has a perfectly uniform cross-sectional area so that resistance per unit length ρ_w is constant throughout the wire. Scraping creates kinks and flat spots, causing local variations in ρ_w.',
  },
  {
    id: 5,
    question: 'In the formula for resistivity ρ = (Y · π · d²) / (4 · L), which variable contributes the largest proportional error to Δρ / ρ?',
    options: [
      'The length of the specimen wire L',
      'The bridge wire resistance per unit length ρ_w',
      'The wire diameter d, because its fractional error is doubled due to the squared term (2 · Δd / d)',
      'The ratio resistance P',
    ],
    correctIndex: 2,
    explanation:
      'Taking logarithms of ρ = (Y · π · d²) / (4 · L) yields ln(ρ) = ln(Y) + ln(π/4) + 2·ln(d) - ln(L). Differentiating gives (Δρ / ρ) = (ΔY / Y) + 2(Δd / d) + (ΔL / L). Since d is small (~0.6 mm) and its uncertainty is multiplied by 2, diameter measurement contributes the largest error.',
  },
];

const VIVA_QA_LIST: VivaQA[] = [
  {
    tag: 'Fundamental Principle',
    q: "1. What is Carey Foster's bridge, and how does it differ from an ordinary meter bridge?",
    a: "Carey Foster's bridge is a modified four-gap Wheatstone bridge designed to compare two nearly equal resistances with high precision. In an ordinary meter bridge there are only two gaps, and the resistance of the brass copper strips at the ends (end-corrections α and β) causes significant error. In Carey Foster's bridge there are four gaps; by interchanging the two resistances being compared between the outer gaps, the end-corrections α and β are mathematically eliminated.",
  },
  {
    tag: 'Mathematical Proof',
    q: '2. Mathematically explain how interchanging the gap resistances eliminates end-corrections α and β.',
    a: "Let R₁ and R₂ be the resistances in the outer gaps with P = Q. With R₁ in left gap and R₂ in right gap:\nR₁ + α + l₁·ρ_w = R₂ + β + (100 - l₁)·ρ_w  =>  R₁ - R₂ + (α - β) = (100 - 2l₁)·ρ_w  --- (1)\nWhen R₂ and R₁ are interchanged:\nR₂ + α + l₂·ρ_w = R₁ + β + (100 - l₂)·ρ_w  =>  R₂ - R₁ + (α - β) = (100 - 2l₂)·ρ_w  --- (2)\nSubtracting (2) from (1):\n2(R₁ - R₂) = 2(l₂ - l₁)·ρ_w  =>  R₁ - R₂ = ρ_w · (l₂ - l₁).\nNotice that the end-error term (α - β) subtracts out to exactly zero!",
  },
  {
    tag: 'Bridge Sensitivity',
    q: '3. Why must the ratio arm resistances P and Q be nearly equal (P = Q)?',
    a: 'The sensitivity of a Wheatstone bridge is maximum when the resistances in all four arms are of comparable magnitude (P ≈ Q ≈ R₁ ≈ R₂). Furthermore, when P = Q, the balance points lie near the central portion of the 100 cm wire (between 35 cm and 65 cm), where the reading error is minimal and the galvanometer deflection per unit displacement of the jockey is highest.',
  },
  {
    tag: 'Wire Materials',
    q: '4. Why is the bridge wire made of manganin or constantan rather than copper?',
    a: 'Manganin and constantan alloys possess two essential properties:\n(1) High specific resistance (resistivity ~ 4.9 × 10⁻⁷ Ω·m), giving the 1-meter wire a measurable resistance (~ 3 to 4 Ω).\n(2) Extremely low temperature coefficient of resistance (α_temp ≈ 10⁻⁵ K⁻¹), so its resistance does not change significantly when current passes through it or ambient room temperature fluctuates.',
  },
  {
    tag: 'Experimental Technique',
    q: '5. Why should current not be allowed to flow continuously through the bridge?',
    a: 'Continuous passage of electric current causes Joule heating (H = I²·R·t). This heats up the bridge wire and the resistance coils, changing their resistances and introducing thermal drift. Therefore, a plug key is provided in the battery circuit and is closed only during the moment of tapping the jockey.',
  },
  {
    tag: 'Jockey Handling',
    q: '6. Why should the jockey not be slid or scraped along the bridge wire?',
    a: 'Dragging the sharp knife-edge of the jockey wears away metal from the bridge wire, forming kinks, grooves, and uneven flat spots. This destroys the uniformity of the wire\'s cross-section, which invalidates the fundamental assumption that the resistance per unit length (ρ_w) is constant along the entire 100 cm scale.',
  },
  {
    tag: 'Instrument Design',
    q: '7. How are fractional resistance box coils constructed to prevent inductive and capacitive errors?',
    a: 'The resistance coils in a fractional resistance box are wound non-inductively. The manganin or eureka resistance wire is first doubled upon itself (bifilar winding) and then wound onto a non-metallic spool. In this configuration, the current flows in opposite directions in adjacent wires, so their magnetic fields cancel out, completely eliminating self-inductance.',
  },
  {
    tag: 'Bridge Limitations',
    q: "8. What are the practical limitations of Carey Foster's bridge?",
    a: "Carey Foster's bridge can only measure the difference between two resistances (R₁ - R₂) that is strictly less than the total resistance of the 100 cm bridge wire (100 · ρ_w ≈ 3 to 4 Ω). If |R₁ - R₂| > 100 ρ_w, the balance point falls beyond the physical ends of the wire. Hence, it is ideally suited for comparing low, nearly equal resistances.",
  },
];

export function VivaContent() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const handleSelectOption = (qId: number, optIdx: number) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowResults(false);
  };

  const score = Object.entries(selectedAnswers).reduce((acc, [qId, optIdx]) => {
    const q = QUIZ_QUESTIONS.find((item) => item.id === parseInt(qId, 10));
    return q && q.correctIndex === optIdx ? acc + 1 : acc;
  }, 0);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 text-[var(--text)]">
      {/* ── Section 1: Interactive Self-Quiz ──────────────────────────────── */}
      <div className="p-5 md:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--accent)]" />
            <h2 className="text-base font-semibold text-[var(--text)] tracking-tight">
              Interactive Self-Assessment Quiz (AKTU Exam Pattern)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {showResults && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Award size={14} />
                <span>Score: {score} / {QUIZ_QUESTIONS.length}</span>
              </div>
            )}
            <button
              onClick={handleResetQuiz}
              className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] transition-colors"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {QUIZ_QUESTIONS.map((q, idx) => {
            const userAnswer = selectedAnswers[q.id];
            const isAnswered = userAnswer !== undefined;

            return (
              <div key={q.id} className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-3">
                <div className="flex items-start gap-2.5 text-xs md:text-sm font-medium text-[var(--text)]">
                  <span className="w-5 h-5 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[10px] font-mono text-[var(--accent)] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{q.question}</span>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userAnswer === optIdx;
                    const isCorrect = q.correctIndex === optIdx;

                    let btnStyles =
                      'p-2.5 rounded-lg text-xs text-left transition-all border flex items-center justify-between ';

                    if (showResults) {
                      if (isCorrect) {
                        btnStyles += 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold';
                      } else if (isSelected && !isCorrect) {
                        btnStyles += 'bg-rose-500/15 border-rose-500/50 text-rose-300 font-semibold';
                      } else {
                        btnStyles += 'bg-[var(--surface)]/40 border-[var(--border)] text-[var(--text-muted)] opacity-60';
                      }
                    } else if (isSelected) {
                      btnStyles += 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--text)] font-medium';
                    } else {
                      btnStyles += 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--accent)]/40';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={showResults}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={btnStyles}
                      >
                        <span>{opt}</span>
                        {showResults && isCorrect && (
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0 ml-2" />
                        )}
                        {showResults && isSelected && !isCorrect && (
                          <XCircle size={14} className="text-rose-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {showResults && (
                  <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-muted)] leading-relaxed space-y-1">
                    <span className="font-semibold text-[var(--accent)]">Explanation: </span>
                    <span>{q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!showResults && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowResults(true)}
              disabled={Object.keys(selectedAnswers).length === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--accent)] hover:opacity-90 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Submit Quiz &amp; View Explanations
            </button>
          </div>
        )}
      </div>

      {/* ── Section 2: AKTU Viva Voce Questions & Answers ──────────────────── */}
      <div className="p-5 md:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <BookCheck size={18} className="text-amber-400" />
          <h2 className="text-base font-semibold text-[var(--text)] tracking-tight">
            Comprehensive AKTU Viva Voce Questions &amp; Detailed Answers
          </h2>
        </div>

        <div className="space-y-2.5">
          {VIVA_QA_LIST.map((item, idx) => {
            const isOpen = openAccordion === idx;

            return (
              <div
                key={idx}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenAccordion(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs md:text-sm font-medium text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[var(--surface)] text-[var(--accent)] border border-[var(--border)] shrink-0">
                      {item.tag}
                    </span>
                    <span>{item.q}</span>
                  </div>
                  <ChevronDown
                    size={15}
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
            Error Analysis &amp; Uncertainty Propagation Budget
          </h2>
        </div>

        <div className="space-y-3 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
          <p>
            In the determination of specific resistance <span className="font-mono text-[var(--text)]">ρ = (Y · π · d²) / (4 · L)</span>,
            experimental uncertainties propagate from resistance <span className="font-mono text-[var(--text)]">Y</span>,
            wire diameter <span className="font-mono text-[var(--text)]">d</span>, and specimen length <span className="font-mono text-[var(--text)]">L</span>:
          </p>

          <div className="p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] font-mono text-center text-xs md:text-sm text-[var(--text)]">
            <strong className="text-rose-400">Maximum Proportional Fractional Error:</strong>
            <div className="mt-1 text-sky-400">
              (Δρ / ρ) = (ΔY / Y) + 2·(Δd / d) + (ΔL / L)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1">
              <div className="text-xs font-semibold text-[var(--text)]">1. Screw Gauge Uncertainty (Δd)</div>
              <p className="text-xs text-[var(--text-muted)]">
                The micrometer least count is <span className="font-mono text-[var(--text)]">Δd = 0.01 mm = 0.001 cm</span>.
                Because the wire diameter is squared in the cross-sectional area <span className="font-mono text-[var(--text)]">A = π·d²/4</span>,
                its fractional error is multiplied by <strong className="text-rose-400">2</strong>, dominating the total uncertainty budget.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1">
              <div className="text-xs font-semibold text-[var(--text)]">2. Meter Scale Least Count (Δl)</div>
              <p className="text-xs text-[var(--text-muted)]">
                The bridge wire graduated meter scale has a least count of <span className="font-mono text-[var(--text)]">0.1 cm (1 mm)</span>.
                For a difference <span className="font-mono text-[var(--text)]">|l₂ - l₁| ≈ 15 cm</span>, the reading error is approximately{' '}
                <span className="font-mono text-[var(--text)]">2 × 0.1 / 15 ≈ 1.3%</span>.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1">
              <div className="text-xs font-semibold text-[var(--text)]">3. Length Measurement (ΔL)</div>
              <p className="text-xs text-[var(--text-muted)]">
                The specimen wire length <span className="font-mono text-[var(--text)]">L ≈ 60.0 cm</span> is measured with a standard ruler
                (<span className="font-mono text-[var(--text)]">ΔL = 0.1 cm</span>). Its fractional contribution is{' '}
                <span className="font-mono text-[var(--text)]">0.1 / 60 ≈ 0.17%</span>, which is very small.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
