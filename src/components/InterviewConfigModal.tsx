import { useState, useEffect, useRef, useCallback, type FormEvent } from "react";
import {
  LANGUAGES,
  DIFFICULTIES,
  type Language,
  type Difficulty,
} from "../lib/InterviewSession";

interface InterviewConfigModalProps {
  open: boolean;
  role: string;
  keywords: string[];
  initialLanguage: Language;
  initialDifficulty: Difficulty;
  initialDifficultyCustom: string;
  initialQuestionCount: number;
  onConfirm: (config: {
    language: Language;
    difficulty: Difficulty;
    difficultyCustom: string;
    questionCount: number;
  }) => void;
  onCancel: () => void;
}

export default function InterviewConfigModal({
  open,
  role,
  keywords,
  initialLanguage,
  initialDifficulty,
  initialDifficultyCustom,
  initialQuestionCount,
  onConfirm,
  onCancel,
}: InterviewConfigModalProps) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);
  const [difficultyCustom, setDifficultyCustom] = useState(initialDifficultyCustom);
  const [questionCount, setQuestionCount] = useState(initialQuestionCount);

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  /* Reset form when modal opens (pre-fill from current session values) */
  useEffect(() => {
    if (open) {
      setLanguage(initialLanguage);
      setDifficulty(initialDifficulty);
      setDifficultyCustom(initialDifficultyCustom);
      setQuestionCount(initialQuestionCount);
      triggerRef.current = document.activeElement as HTMLElement | null;
      /* Focus the first interactive element after a tick */
      requestAnimationFrame(() => {
        const firstInput = modalRef.current?.querySelector<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled])',
        );
        firstInput?.focus();
      });
    }
  }, [open, initialLanguage, initialDifficulty, initialDifficultyCustom, initialQuestionCount]);

  /* Focus trap & Escape */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  /* Return focus to trigger on close */
  useEffect(() => {
    if (!open && triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [open]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      onConfirm({ language, difficulty, difficultyCustom, questionCount });
    },
    [language, difficulty, difficultyCustom, questionCount, onConfirm],
  );

  const countLabel = questionCount === 1
    ? "1 question"
    : `${questionCount} questions`;

  const selectedLang = LANGUAGES.find((l) => l.code === language);

  const difficultyLabel =
    difficulty === "custom"
      ? difficultyCustom || "Custom"
      : DIFFICULTIES.find((d) => d.value === difficulty)?.label ?? difficulty;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="config-modal-title"
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in"
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-border">
            <h2
              id="config-modal-title"
              className="font-heading text-lg font-semibold text-foreground"
            >
              Configure Your Interview
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Customise how the AI generates your questions.
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-6">
            {/* ── Language ── */}
            <fieldset>
              <legend className="text-sm font-semibold text-foreground mb-3">
                Language
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((lang) => (
                  <label
                    key={lang.code}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all duration-200 ${
                      language === lang.code
                        ? "border-accent bg-accent/5 shadow-sm"
                        : "border-border hover:border-accent/40 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="language"
                      value={lang.code}
                      checked={language === lang.code}
                      onChange={() => setLanguage(lang.code)}
                      className="sr-only"
                    />
                    <span className="text-base">{lang.flag}</span>
                    <span className="text-sm font-medium text-foreground">
                      {lang.label}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Questions will be generated in{" "}
                {selectedLang?.label ?? "English"}.
              </p>
            </fieldset>

            {/* ── Difficulty ── */}
            <fieldset>
              <legend className="text-sm font-semibold text-foreground mb-3">
                Difficulty Level
              </legend>
              <div className="space-y-2">
                {DIFFICULTIES.map((d) => (
                  <label
                    key={d.value}
                    className={`flex items-start gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      difficulty === d.value
                        ? "border-accent bg-accent/5 shadow-sm"
                        : "border-border hover:border-accent/40 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={d.value}
                      checked={difficulty === d.value}
                      onChange={() => setDifficulty(d.value)}
                      className="sr-only"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-foreground">
                        {d.label}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {d.description}
                      </p>
                    </div>
                    <div
                      className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200 ${
                        difficulty === d.value
                          ? "border-accent"
                          : "border-muted"
                      }`}
                    >
                      {difficulty === d.value && (
                        <div className="w-2 h-2 rounded-full bg-accent" />
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {/* Custom difficulty text input */}
              {difficulty === "custom" && (
                <div className="mt-3 ml-1">
                  <label
                    htmlFor="custom-difficulty"
                    className="text-xs font-medium text-foreground"
                  >
                    Describe your difficulty level
                  </label>
                  <input
                    id="custom-difficulty"
                    type="text"
                    value={difficultyCustom}
                    onChange={(e) => setDifficultyCustom(e.target.value)}
                    placeholder='e.g. "Mid-level with AWS focus"'
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-white text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
                  />
                </div>
              )}
            </fieldset>

            {/* ── Question Count ── */}
            <fieldset>
              <legend className="text-sm font-semibold text-foreground mb-3">
                Number of Questions
              </legend>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setQuestionCount((c) => Math.max(1, c - 1))
                  }
                  disabled={questionCount <= 1}
                  className="btn-active w-10 h-10 rounded-lg border border-border bg-white text-foreground font-bold text-lg flex items-center justify-center cursor-pointer hover:bg-muted hover:border-accent/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                  aria-label="Decrease question count"
                >
                  −
                </button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold text-foreground tabular-nums">
                    {questionCount}
                  </span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {countLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setQuestionCount((c) => Math.min(10, c + 1))
                  }
                  disabled={questionCount >= 10}
                  className="btn-active w-10 h-10 rounded-lg border border-border bg-white text-foreground font-bold text-lg flex items-center justify-center cursor-pointer hover:bg-muted hover:border-accent/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                  aria-label="Increase question count"
                >
                  +
                </button>
              </div>
            </fieldset>

            {/* ── Summary ── */}
            <div className="rounded-xl bg-muted/50 border border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-accent shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Summary
                </span>
              </div>
              <div className="space-y-1.5">
                <p className="text-sm text-foreground">
                  <span className="font-medium">Role:</span>{" "}
                  {role || "Not selected"}
                </p>
                <p className="text-sm text-foreground">
                  <span className="font-medium">Skills:</span>{" "}
                  {keywords.length > 0
                    ? keywords.join(", ")
                    : "None selected"}
                </p>
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                The AI will generate{" "}
                <strong className="text-foreground">{countLabel}</strong> in{" "}
                <strong className="text-foreground">
                  {selectedLang?.flag} {selectedLang?.label}
                </strong>{" "}
                at{" "}
                <strong className="text-foreground capitalize">
                  {difficultyLabel}
                </strong>{" "}
                level, focused on your selected skills.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="btn-active px-5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:border-accent bg-white cursor-pointer transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-active px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              Generate Questions
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
