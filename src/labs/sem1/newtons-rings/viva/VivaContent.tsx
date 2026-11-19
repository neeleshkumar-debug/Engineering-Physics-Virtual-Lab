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
  Layers,
} from 'lucide-react';
import type { VivaQA, QuizQuestion } from '../types';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Why does the central spot of Newton's rings appear dark in reflected light?",
    options: [
      "Because the glass plate absorbs all the reflected yellow light",
      "Because the thickness of the air film at the point of contact is virtually zero (t = 0), and an extra phase difference of π (path difference of λ/2) occurs upon reflection from the top surface of the bottom denser glass plate, causing destructive interference",
      "Because light rays undergo total internal reflection inside the plano-convex lens",
      "Because the traveling microscope lens blocks normal incidence rays",
    ],
    correctIndex: 1,
    explanation:
      "At the central point of contact, film thickness t = 0. The geometrical path difference 2t = 0. However, reflection at the lower air-to-glass interface (rarer to denser) introduces an electromagnetic Stokes phase shift of π (path shift of λ/2). Hence, the total optical path difference is Δ = 0 + λ/2 = λ/2, satisfying the condition for destructive interference (darkness).",
  },
  {
    id: 2,
    question: "Why must a plano-convex lens with a very large radius of curvature (R ≈ 100 cm) be used in this experiment?",
    options: [
      "To increase the magnification power of the traveling microscope",
      "Because a large R creates a very small wedge angle and large ring diameters (Dn = 2√(nλR)) that can be accurately measured with a traveling microscope",
      "To polarize the sodium light along the optical axis",
      "To focus the sodium vapor lamp onto the plane glass plate",
    ],
    correctIndex: 1,
    explanation:
      "Since Dn = 2√(nλR), the ring diameter is proportional to √R. If a lens of small radius of curvature (e.g., R = 10 cm) were used, the rings would be extremely small and clustered so tightly together that they could not be resolved or measured with the micrometer screw.",
  },
  {
    id: 3,
    question: "Why do Newton's interference rings get progressively closer and closer together as the ring order (n) increases?",
    options: [
      "Because the ring radius rn is proportional to √n; the radial separation Δr = r_{n+1} - rn ≈ 1 / (2√n) decreases with increasing order",
      "Because the wavelength of sodium light decreases radially outward",
      "Because the traveling microscope suffers from spherical aberration",
      "Because the air film becomes thinner towards the outer edges",
    ],
    correctIndex: 0,
    explanation:
      "Since rn = √(nλR), the rate of increase of radius with respect to order is dr/dn = (1/2)√(λR/n) ∝ 1/√n. As n increases, the separation between adjacent fringes becomes smaller and smaller, causing outer rings to appear crowded together.",
  },
  {
    id: 4,
    question: "Why do we calculate the wavelength using the difference formula λ = (D_{n+p}² - D_n²) / (4pR) instead of the single-order formula λ = D_n² / (4nR)?",
    options: [
      "Because the difference formula cancels out any constant central contact offset error (D₀²) caused by dust particles, air cushion, or pressure deformation",
      "Because single-order calculation is illegal under AKTU examination guidelines",
      "Because sodium light only produces interference for pairs of rings",
      "Because traveling microscope readings cannot be squared individually",
    ],
    correctIndex: 0,
    explanation:
      "In practice, the lens and plate rarely achieve ideal zero-thickness mathematical contact due to minute dust particles or elastic deformation (D_n² = 4nλR + D₀²). By taking the difference D_{n+p}² - D_n² = 4pλR, the contact offset D₀² cancels out identically, eliminating a major source of systematic error.",
  },
  {
    id: 5,
    question: "If the air film between the lens and glass plate is replaced with water (refractive index μ = 1.33), what happens to the diameter of Newton's rings?",
    options: [
      "The rings expand and become broader",
      "The rings contract (diameters decrease by a factor of 1/√μ ≈ 1/√1.33 ≈ 0.867)",
      "The rings disappear completely",
      "The central spot becomes bright and rings turn into straight fringes",
    ],
    correctIndex: 1,
    explanation:
      "For a medium of refractive index μ, the dark ring condition becomes 2μt = nλ => D_n² = 4nλR / μ. Therefore, D_n(liquid) = D_n(air) / √μ. Since μ > 1, the diameters of all rings contract symmetrically.",
  },
];

const VIVA_QA_LIST: VivaQA[] = [
  {
    tag: 'Fundamental Principle',
    q: "1. Why is the central spot of Newton's rings dark in reflected light even though the geometric path difference is zero?",
    a: "At the point of contact between the plano-convex lens and the plane glass plate, the air film thickness is virtually zero (t = 0). The geometric path difference is 2t = 0. However, the light beam reflected from the lower surface of the air film reflects off the upper boundary of the denser glass plate. According to Stokes' principle of reversibility, reflection from a denser medium introduces an abrupt phase change of π radians, equivalent to an optical path difference of λ/2. Therefore, the total optical path difference at the center is Δ = 2t + λ/2 = λ/2. This satisfies the condition for destructive interference: Δ = (2n + 1)λ/2 with n = 0, causing the central spot to be dark.",
  },
  {
    tag: 'Apparatus Design',
    q: "2. Why is a plano-convex lens of large radius of curvature (R ≈ 100 cm) used instead of an ordinary convex lens?",
    a: "The diameter of the n-th dark ring is given by D_n = 2√(nλR). The ring diameter is directly proportional to √R. If an ordinary convex lens with small radius of curvature (e.g. R = 10 cm or 20 cm) were used, the air film thickness would increase very rapidly with radial distance, producing rings of microscopic diameter clustered together too tightly to be measured with a traveling microscope. A large radius of curvature (R = 100 cm) ensures a very thin, gentle air wedge with large, well-spaced rings (diameters of several millimeters) that can be easily resolved and measured.",
  },
  {
    tag: 'Fringe Geometry',
    q: "3. Why do Newton's interference rings get closer together as the ring order (n) increases?",
    a: "The radius of the n-th dark ring is r_n = √(nλR). The difference between the radii of two consecutive rings is: Δr = r_{n+1} - r_n = √(λR) · [√(n+1) - √n] ≈ √(λR) / (2√n). Because this difference is inversely proportional to √n, as the order n increases, the radial spacing between consecutive rings becomes progressively smaller. Consequently, outer fringes appear much narrower and more crowded together than central fringes.",
  },
  {
    tag: 'Error Cancellation',
    q: "4. Why do we compute wavelength from the difference formula λ = (D_{n+p}² - D_n²) / (4pR) instead of measuring from the central spot as λ = D_n² / (4nR)?",
    a: "In practical laboratory conditions, it is virtually impossible to achieve perfect zero-thickness contact at the center due to minute dust particles, microscopic surface roughness, or elastic deformation under mounting pressure. Consequently, the actual air film thickness at the center is t_0, modifying the diameter equation to D_n² = 4nλR + D_0². If we calculate λ from a single ring order, the D_0² / (4nR) error would significantly distort the result. By taking the difference between the (n+p)-th and n-th rings, D_{n+p}² - D_n² = [4(n+p)λR + D_0²] - [4nλR + D_0²] = 4pλR, the central contact error D_0² is completely eliminated.",
  },
  {
    tag: 'Liquid Replacement',
    q: "5. What happens if a drop of liquid of refractive index μ is placed between the lens and the glass plate?",
    a: "When a liquid of refractive index μ replaces the air film (where μ_air = 1), the path difference in the liquid film becomes 2μt + λ/2. The dark ring condition becomes 2μt = nλ. Since t = r_n² / (2R), we get 2μ(r_n² / 2R) = nλ => D_n² = 4nλR / μ. Therefore, the new ring diameter is D_n' = D_n / √μ. Because μ > 1, all rings contract in size. This property is routinely used in practical optics to determine the refractive index of unknown transparent liquids: μ = (D_{n+p}² - D_n²)_air / (D_{n+p}² - D_n²)_liquid.",
  },
  {
    tag: 'Light Source',
    q: "6. Why is an extended monochromatic light source used rather than a point source?",
    a: "An extended light source (such as a sodium vapor lamp placed behind a diffuser or broad aperture) emits light rays in all directions. When collimated and turned by the 45° glass plate, it ensures that light rays enter the entire surface of the lens-plate air film at normal incidence. This allows a broad field of view through the microscope eyepiece, making the entire circular interference pattern visible simultaneously across several centimeters of travel.",
  },
  {
    tag: 'Instrumental Precision',
    q: "7. What is backlash error in a traveling microscope micrometer screw, and how is it avoided?",
    a: "Backlash error arises from mechanical play or loose fit between the screw threads and the nut of the traveling microscope carriage when the direction of rotation is reversed. If the experimenter rotates the micrometer screw back and forth, the carriage does not move immediately upon reversal, leading to false position readouts. To avoid backlash error, the micrometer screw must be turned continuously in ONE direction throughout the entire series of readings (e.g. Starting from the 16th ring on the left, moving continuously past the center to the 16th ring on the right).",
  },
  {
    tag: 'White Light Behavior',
    q: "8. What happens if white light is used instead of monochromatic sodium yellow light?",
    a: "White light is a polychromatic mixture of wavelengths ranging from violet (≈ 400 nm) to red (≈ 700 nm). At the central point of contact, path difference is λ/2 for all wavelengths, so the central spot remains dark. For higher orders, each wavelength produces its own set of rings with radii r_n = √(nλR). Because λ_violet < λ_red, the violet rings are smaller than the red rings. Only a few colored rings (with violet on the inside and red on the outside) are seen near the center. At higher orders, rings of different colors overlap completely, producing uniform white illumination.",
  },
];

export function VivaContent() {
  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Accordion state
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
              Interactive Self-Quiz: Newton&apos;s Rings & Interference
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
                        optStyle = 'bg-rose-500/15 border-rose-500/50 text-rose-300 font-medium';
                      }
                    } else if (chosen === optIdx) {
                      optStyle = 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)] font-medium';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectAnswer(q.id, optIdx)}
                        disabled={submitted}
                        className={`w-full p-2.5 rounded-lg border text-xs text-left transition-all flex items-start gap-2 ${optStyle}`}
                      >
                        <span className="font-mono uppercase text-[10px] mt-0.5 opacity-70">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span className="flex-1 leading-relaxed">{opt}</span>
                        {submitted && optIdx === q.correctIndex && (
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        {submitted && chosen === optIdx && !isCorrect && (
                          <XCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {submitted && (
                  <div className="mt-2.5 p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1 pl-7">
                    <div className="flex items-center gap-1.5 font-semibold text-[var(--text)]">
                      <Sparkles size={12} className="text-amber-400" />
                      <span>Explanation:</span>
                    </div>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        {!submitted && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setSubmitted(true)}
              disabled={Object.keys(selectedAnswers).length < QUIZ_QUESTIONS.length}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[var(--accent)] hover:opacity-90 text-white shadow-sm transition-all disabled:opacity-40"
            >
              Submit & Check Answers ({Object.keys(selectedAnswers).length}/{QUIZ_QUESTIONS.length})
            </button>
          </div>
        )}
      </div>

      {/* ── Section 2: AKTU Viva Voce Questions & Answers ──────────────────── */}
      <div className="p-5 md:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <HelpCircle size={18} className="text-emerald-400" />
          <div>
            <h2 className="text-base font-semibold text-[var(--text)] tracking-tight">
              AKTU Viva Voce Examination Questions (Applied Physics Lab AAS151 / ASS251)
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Standard viva voce questions frequently asked by university practical examiners.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {VIVA_QA_LIST.map((item, idx) => {
            const isOpen = !!openAccordions[idx];

            return (
              <div
                key={idx}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg)] overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-[var(--surface)]/50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-[var(--surface)] border border-[var(--border)] text-[var(--accent)] font-mono">
                      {item.tag}
                    </span>
                    <span className="text-xs md:text-sm font-semibold text-[var(--text)]">
                      {item.q}
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[var(--text)]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)]/50 bg-[var(--surface)]/20 whitespace-pre-line">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Error Analysis & Precision Notes ────────────────────── */}
      <div className="p-5 md:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <AlertOctagon size={18} className="text-rose-400" />
          <h2 className="text-base font-semibold text-[var(--text)] tracking-tight">
            Error Analysis & Laboratory Precision
          </h2>
        </div>

        <div className="space-y-4 text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
          {/* Formula for Error */}
          <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-2">
            <h4 className="font-semibold text-[var(--text)] text-xs uppercase tracking-wide">
              1. Percentage Error Formula
            </h4>
            <div className="font-mono text-xs md:text-sm text-center text-amber-300 py-1">
              Percentage Error = [ |λ_exp - λ_standard| / λ_standard ] &times; 100%
            </div>
            <p>
              Standard wavelength for sodium yellow D-lines: <span className="font-mono text-[var(--text)]">λ_standard = 589.3 nm = 5893 &Aring;</span>.
              In standard AKTU laboratory evaluations, an experimental error &le; 2.0% is considered excellent.
            </p>
          </div>

          {/* Sources of Error */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-2">
              <h4 className="font-semibold text-rose-300 text-xs uppercase tracking-wide">
                Systematic Errors
              </h4>
              <ul className="space-y-1 list-disc list-inside text-xs">
                <li><strong className="text-[var(--text)]">Backlash Error:</strong> Reversing micrometer motion during a run introduces screw backlash.</li>
                <li><strong className="text-[var(--text)]">Non-Normal Incidence:</strong> If the 45&deg; glass plate is tilted, light strikes obliquely and distorting ring circularity into ellipses.</li>
                <li><strong className="text-[var(--text)]">Curvature Uncertainty:</strong> Inaccuracy in the spherometer measurement of lens radius of curvature R propagates directly into &lambda;.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] space-y-2">
              <h4 className="font-semibold text-sky-300 text-xs uppercase tracking-wide">
                Random & Observational Errors
              </h4>
              <ul className="space-y-1 list-disc list-inside text-xs">
                <li><strong className="text-[var(--text)]">Crosshair Alignment:</strong> Dark fringe minimum has a finite width; setting the crosswire slightly off center creates ±0.002 cm uncertainty.</li>
                <li><strong className="text-[var(--text)]">Least Count Limitation:</strong> Traveling microscope vernier least count is 0.001 cm (10 &mu;m).</li>
                <li><strong className="text-[var(--text)]">Dust Particles:</strong> Dust specks under the lens distort circular symmetry into irregular fringes.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
