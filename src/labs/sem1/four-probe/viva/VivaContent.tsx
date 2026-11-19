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

interface VivaQA {
  tag: string;
  q: string;
  a: string;
}

const VIVA_QUESTIONS: VivaQA[] = [
  {
    tag: 'Apparatus Principle',
    q: 'Why is a four-probe arrangement used instead of a standard two-probe method for semiconductors?',
    a: 'In a standard two-probe method, metal-semiconductor contacts create non-ohmic Schottky barriers with very large contact resistance (R_contact) that often dwarfs the crystal sample resistance. In the four-probe method, current flows through the outer probes (1 & 4) while an ultra-high impedance voltmeter measures the voltage across the inner probes (2 & 3). Because the voltmeter draws virtually zero current (I_voltmeter ≈ 0), the contact voltage drop across the inner probes (I_voltmeter · R_contact) is zero, ensuring true bulk resistivity is measured without contact resistance errors.',
  },
  {
    tag: 'Apparatus Role',
    q: 'What is the purpose of placing the semiconductor slice on a mica sheet?',
    a: 'The mica sheet serves as an electrical insulator with high thermal conductivity. It prevents the electrical current flowing through the crystal from leaking or short-circuiting to the metal base of the heating oven, while simultaneously allowing rapid, uniform heat conduction from the oven hotplate to the crystal slice.',
  },
  {
    tag: 'Physics Concept',
    q: 'Why does electrical resistivity decrease exponentially with temperature in semiconductors, whereas in metals it increases?',
    a: 'In metals, carrier concentration is constant; increasing temperature intensifies lattice thermal vibrations (phonons), increasing electron scattering and hence resistivity (positive temperature coefficient). In semiconductors, thermal energy excites electrons across the forbidden energy gap from the valence to the conduction band, increasing carrier concentration exponentially [nᵢ ∝ exp(-E_g / 2kT)]. This exponential surge in charge carriers far outweighs any decrease in mobility, causing resistivity to drop sharply (negative temperature coefficient).',
  },
  {
    tag: 'Conduction Regimes',
    q: 'What is the difference between intrinsic and extrinsic temperature regimes in a semiconductor?',
    a: 'At lower temperatures (extrinsic regime), conduction is governed by ionization of donor or acceptor impurity atoms. As temperature rises past a threshold (~40 °C to 50 °C for Germanium), the thermally generated intrinsic electron-hole pairs overwhelmingly outnumber dopant carriers. Above this temperature, the semiconductor behaves as an intrinsic semiconductor, allowing the band gap (E_g) to be extracted accurately.',
  },
  {
    tag: 'Material Physics',
    q: 'Why is Germanium (E_g ≈ 0.67 eV) preferred over Silicon (E_g ≈ 1.12 eV) for this laboratory experiment?',
    a: 'Germanium has a narrower forbidden gap (E_g ≈ 0.67 eV) compared to Silicon (1.12 eV). Because of its lower band gap, Germanium enters the intrinsic conduction regime at accessible laboratory temperatures (~40 °C to 160 °C). Silicon requires temperatures upwards of 200 °C to 250 °C to exhibit intrinsic behavior, which would exceed standard student oven limits and risk probe oxidation.',
  },
  {
    tag: 'Correction Factor',
    q: 'What is the significance of the correction factor G₇(w/s) and when does thin-slice approximation apply?',
    a: 'For a semi-infinite bulk semiconductor, current spreads spherically outward giving ρ₀ = (V/I)·2πs. However, when the semiconductor slice thickness w is significantly smaller than the probe spacing s (w/s < 0.5), current flow is constrained into a quasi-two-dimensional sheet. The boundary condition factor G₇(w/s) = (2s/w)·ln 2 corrects for this geometry, giving ρ = ρ₀ / G₇(w/s) = [(π·w) / ln 2] · (V/I).',
  },
  {
    tag: 'Instrumentation',
    q: 'Why must a constant current source be used rather than a constant voltage source?',
    a: 'As the semiconductor heats up, its resistance drops by orders of magnitude (from hundreds of Ohms down to a few Ohms). If a constant voltage were applied, the circuit current would surge exponentially according to Ohm\'s law (I = V/R), causing catastrophic Joule heating (I²R) and thermal runaway that would destroy the crystal. A constant current source guarantees a steady, safe current (1–5 mA) regardless of sample resistance changes.',
  },
  {
    tag: 'Error Analysis',
    q: 'What are the main experimental sources of error and how are they minimized?',
    a: '(1) Non-uniform probe spacing: spring tips must be precisely aligned and equidistant (s = 0.2 cm). (2) Thermal lag: the thermometer bulb must be in intimate thermal contact with the crystal environment; readings should be logged only after the temperature stabilizes. (3) Excessive probe pressure: Germanium is fragile and brittle; probes must be spring-loaded to provide gentle, repeatable contact without micro-cracking the slice.',
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
    question: 'In the Four-Probe method, which probes measure the potential drop V?',
    options: [
      'Probes 1 and 4 (the outer probes)',
      'Probes 2 and 3 (the inner probes)',
      'Probes 1 and 2',
      'Probes 3 and 4',
    ],
    correctIndex: 1,
    explanation:
      'Inner probes 2 and 3 measure the floating potential drop V across high-impedance voltmeter terminals, while outer probes 1 and 4 supply the constant current I.',
  },
  {
    id: 2,
    question:
      'The four-probe method is superior to the two-probe method for semiconductors because it completely eliminates errors caused by:',
    options: [
      'Contact resistance and lead resistance at probe contacts',
      'Atmospheric pressure variations',
      'Earth’s magnetic field',
      'High melting point of the crystal',
    ],
    correctIndex: 0,
    explanation:
      'Because the digital voltmeter has very high input resistance (> 10 MΩ), virtually no current flows through inner probes 2 and 3, rendering the contact resistance drop (I·R_contact ≈ 0) negligible.',
  },
  {
    id: 3,
    question:
      'When plotting log₁₀(ρ) versus 1000/T for an intrinsic semiconductor, the slope of the resulting straight line is proportional to:',
    options: [
      'Dielectric constant (ε)',
      'Energy band gap (E_g)',
      'Crystal density (d)',
      'Thermal expansion coefficient (α)',
    ],
    correctIndex: 1,
    explanation:
      'From ρ(T) = ρ₀·exp(E_g / 2kT), taking common log gives log₁₀(ρ) = const + [E_g / (2·2.3026·k·1000)] · (1000/T). Hence the slope directly equals E_g / (2·2.3026·k·1000).',
  },
  {
    id: 4,
    question:
      'What is the typical value of the energy band gap E_g for Germanium (Ge) at room temperature (~300 K)?',
    options: ['0.25 eV', '0.67 eV', '1.12 eV', '3.20 eV'],
    correctIndex: 1,
    explanation:
      'Germanium has an indirect energy band gap of E_g ≈ 0.67 eV at room temperature (compared to 1.12 eV for Silicon and 1.42 eV for Gallium Arsenide).',
  },
  {
    id: 5,
    question:
      'Why is a non-conducting mica sheet placed directly underneath the Germanium crystal slice in the oven?',
    options: [
      'To increase the crystal melting point',
      'To reflect ambient light into the sensor',
      'To electrically isolate the crystal from the metallic oven base while conducting heat',
      'To act as a n-type dopant source during heating',
    ],
    correctIndex: 2,
    explanation:
      'The mica sheet provides electrical isolation so that probe current stays inside the crystal and does not short-circuit to the metallic heating oven base, while providing good thermal contact.',
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

  const score = Object.entries(selectedAnswers).reduce((acc, [qId, optIdx]) => {
    const q = QUIZ_QUESTIONS.find((item) => item.id === Number(qId));
    return q && q.correctIndex === optIdx ? acc + 1 : acc;
  }, 0);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 text-[var(--text)]">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
        <div className="flex items-center gap-2.5 text-[var(--text)] mb-2">
          <BookCheck size={18} className="text-[var(--accent)]" />
          <h2 className="text-lg font-semibold tracking-tight">
            Viva Voce & Conceptual Evaluation
          </h2>
        </div>
        <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
          Standard practical viva voce questions on semiconductor transport, contact resistance elimination, and self-assessment quiz for AKTU AAS151/ASS251.
        </p>
      </div>

      {/* Part 1: Interactive MCQ Self-Quiz */}
      <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Sparkles size={16} />
            <h3>Technical Assessment Quiz (5 Questions)</h3>
          </div>

          {submitted && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] font-mono tabular-nums">
                <Award size={13} className="text-amber-400" />
                Score: {score} / {QUIZ_QUESTIONS.length} ({Math.round((score / QUIZ_QUESTIONS.length) * 100)}%)
              </span>
              <button
                onClick={handleResetQuiz}
                className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] px-2 py-1 rounded border border-[var(--border)] hover:bg-[var(--bg)] transition-colors"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {QUIZ_QUESTIONS.map((q, idx) => {
            const chosen = selectedAnswers[q.id];
            const isCorrect = submitted && chosen === q.correctIndex;
            const isWrong = submitted && chosen !== undefined && chosen !== q.correctIndex;

            return (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-2.5"
              >
                <div className="flex items-start gap-2 text-xs md:text-sm font-semibold text-[var(--text)]">
                  <span className="text-[var(--accent)] font-mono tabular-nums">Q{idx + 1}.</span>
                  <p>{q.question}</p>
                </div>

                {/* MCQ Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = chosen === optIdx;
                    let optStyle =
                      'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/40 hover:text-[var(--text)]';

                    if (submitted) {
                      if (optIdx === q.correctIndex) {
                        optStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-semibold';
                      } else if (isSelected) {
                        optStyle = 'bg-rose-500/20 border-rose-500 text-rose-400 font-semibold';
                      } else {
                        optStyle = 'bg-[var(--surface)] border-[var(--border)] opacity-40';
                      }
                    } else if (isSelected) {
                      optStyle = 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)] font-semibold';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        disabled={submitted}
                        className={`text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${optStyle}`}
                      >
                        <span>{opt}</span>
                        {submitted && optIdx === q.correctIndex && (
                          <CheckCircle2 size={13} className="text-emerald-400 shrink-0 ml-2" />
                        )}
                        {submitted && isSelected && optIdx !== q.correctIndex && (
                          <XCircle size={13} className="text-rose-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Card upon submit */}
                {submitted && (
                  <div
                    className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                      isCorrect
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                    }`}
                  >
                    <strong>Explanation: </strong>
                    <span className="text-[var(--text)]">{q.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!submitted && (
          <button
            onClick={() => setSubmitted(true)}
            disabled={Object.keys(selectedAnswers).length < QUIZ_QUESTIONS.length}
            className="w-full py-2.5 rounded-lg bg-[var(--accent)] hover:opacity-90 text-white font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit Quiz ({Object.keys(selectedAnswers).length} of {QUIZ_QUESTIONS.length} Answered)
          </button>
        )}
      </div>

      {/* Part 2: Viva Voce Accordion Q&A */}
      <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
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
                className="rounded-lg border border-[var(--border)] bg-[var(--bg)] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenAccordion(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-3.5 text-left hover:bg-[var(--surface)]/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5 pr-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] shrink-0">
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

      {/* Part 3: Error Analysis & Precision Notes */}
      <div className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
        <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
          <AlertOctagon size={16} />
          <h3>Sources of Experimental Error</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[var(--text-muted)] leading-relaxed">
          <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1">
            <h4 className="font-semibold text-[var(--text)]">
              1. Sample Boundary Proximity
            </h4>
            <p>
              The formula <span className="font-mono">ρ = (π·w / ln 2) · (V/I)</span> assumes the crystal slice diameter is large relative to probe spacing (<span className="font-mono">d ≫ s</span>). Probes must be centered on the crystal to prevent edge distortion of field lines.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1">
            <h4 className="font-semibold text-[var(--text)]">
              2. Temperature Stabilization Lag
            </h4>
            <p>
              The thermometer measures ambient chamber temperature. If heating is too rapid, the semiconductor crystal temperature lags behind the sensor. Stabilize for 1–2 minutes before logging.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1">
            <h4 className="font-semibold text-[var(--text)]">
              3. Current Joule Heating (I²R)
            </h4>
            <p>
              Current passing through the crystal dissipates electrical power as heat. If <span className="font-mono">I &gt; 5 mA</span>, local heating skews resistivity readings. Maintain steady current between 2–3 mA.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] space-y-1">
            <h4 className="font-semibold text-[var(--text)]">
              4. Extrinsic Conduction Zone
            </h4>
            <p>
              Below 40 °C, dopants contribute to conductivity, slightly curving the <span className="font-mono">log₁₀(ρ) vs 1000/T</span> line. Only data points in the linear intrinsic regime (50 °C – 160 °C) should be included in the slope fit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
