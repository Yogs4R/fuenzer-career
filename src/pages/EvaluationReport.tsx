import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useInterviewSession, type QuestionAnswer, type EvaluationData, loadGuestSessionData } from "../lib/InterviewSession";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { useSEOMeta } from "../hooks/useSEOMeta";
import { useTranslation } from "../lib/i18n";

/* ── Animated bar component ── */
function AnimatedBar({ score, delay }: { score: number; delay: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
        style={{ width: visible ? `${score}%` : "0%" }}
      />
    </div>
  );
}

export default function EvaluationReport() {
  useSEOMeta("Evaluation Report", "meta.report.desc");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("id");
  const isHistorical = !!reportId;

  const { session, reset } = useInterviewSession();
  const { user } = useAuth();
  const { t } = useTranslation();

  /* ── Historical report data state ── */
  const [historical, setHistorical] = useState<{
    evaluation: EvaluationData;
    answers: QuestionAnswer[];
    role: string;
  } | null>(null);
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  /* ── Fetch historical report from Supabase or guest localStorage ── */
  useEffect(() => {
    if (!reportId) return;
    let cancelled = false;
    setLoadingHistorical(true);
    setFetchError(false);
    (async () => {
      try {
        /* Guest sessions stored in localStorage */
        if (reportId.startsWith("guest_")) {
          const guestData = loadGuestSessionData(reportId);
          if (guestData) {
            setHistorical({
              evaluation: guestData.evaluation,
              answers: guestData.answers,
              role: guestData.role || "Unknown",
            });
          } else {
            /* Maybe it's the current/last session stored under the default key */
            const curr = localStorage.getItem("fuenzer_interview_session");
            if (curr) {
              const parsed = JSON.parse(curr);
              if (parsed.evaluation) {
                setHistorical({
                  evaluation: parsed.evaluation,
                  answers: parsed.answers ?? [],
                  role: parsed.role || "Unknown",
                });
              } else {
                throw new Error("No guest data found");
              }
            } else {
              throw new Error("No guest data found");
            }
          }
          if (cancelled) return;
        } else {
          /* DB-backed session */
          const { data, error } = await supabase
            .from("interview_history")
            .select("*")
            .eq("id", reportId)
            .single();
          if (cancelled) return;
          if (error) throw error;
          setHistorical({
            evaluation: data.evaluation as unknown as EvaluationData,
            answers: data.answers as unknown as QuestionAnswer[],
            role: data.role || "Unknown",
          });
        }
      } catch {
        if (!cancelled) setFetchError(true);
      } finally {
        if (!cancelled) setLoadingHistorical(false);
      }
    })();
    return () => { cancelled = true; };
  }, [reportId]);

  /* ── Decide effective data ── */
  const evaluation: EvaluationData | null = isHistorical
    ? historical?.evaluation ?? null
    : session.evaluation;

  const answers: QuestionAnswer[] = isHistorical
    ? historical?.answers ?? []
    : session.answers;

  const effectiveRole: string = isHistorical
    ? historical?.role ?? ""
    : session.role;

  const [question, setQuestion] = useState(0);
  const [scoreVisible, setScoreVisible] = useState(false);

  /* ── Redirect non-historical if no evaluation data ── */
  useEffect(() => {
    if (!isHistorical && !session.evaluation) {
      navigate("/", { replace: true });
    }
  }, [isHistorical, session.evaluation, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setScoreVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  /* ── Save to interview history if authenticated (skip in historical mode) ── */
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (isHistorical) return;
    const evalToSave = session.evaluation;
    if (!evalToSave || !user || saved) return;
    const saveHistory = async () => {
      try {
        await supabase.from("interview_history").insert({
          user_id: user.id,
          role: session.role || "Unknown",
          keywords: session.keywords,
          questions: session.questions,
          answers: session.answers,
          evaluation: evalToSave,
          overall_score: evalToSave.overallScore || 0,
        });
        setSaved(true);
      } catch {
        // Silently fail — history is a bonus, not critical
      }
    };
    saveHistory();
  }, [isHistorical, session, user, saved]);

  /* ── Loading state ── */
  if (isHistorical && loadingHistorical) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-background flex items-center justify-center">
        <div className="text-center">
          <svg className="w-8 h-8 text-accent animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-muted-foreground">{t("report.loading")}</p>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (isHistorical && fetchError) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <svg className="w-12 h-12 text-destructive/60 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-2">{t("report.error.notFound")}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {t("report.error.notFoundDesc")}
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-sm cursor-pointer transition-colors"
          >
            {t("report.error.goToDashboard")}
          </button>
        </div>
      </div>
    );
  }

  if (!evaluation) return null;

  const { overallScore, perQuestion, skillMatch, delivery, fillerWords } = evaluation;

  const handleTryAnotherRole = () => {
    reset();
    navigate("/");
  };

  /* ── Score ring helpers ── */
  const circumference = 2 * Math.PI * 42;
  const dashoffset = circumference - (overallScore / 100) * circumference;
  const currentDashoffset = scoreVisible ? dashoffset : circumference;

  const gaugeColors =
    overallScore >= 90
      ? ["oklch(0.45 0.2 145)", "oklch(0.65 0.18 145)"]
      : overallScore >= 75
        ? ["oklch(0.52 0.17 255)", "oklch(0.6 0.18 179)"]
        : overallScore >= 50
          ? ["oklch(0.65 0.2 80)", "oklch(0.75 0.18 60)"]
          : ["oklch(0.6 0.22 25)", "oklch(0.72 0.2 25)"];

  const scoreLabel =
    overallScore >= 90
      ? t("report.score.excellent")
      : overallScore >= 75
        ? t("report.score.great")
        : overallScore >= 50
          ? t("report.score.good")
          : t("report.score.needsWork");

  const summaryText =
    delivery?.feedback ||
    (overallScore >= 75
      ? t("report.summary.high")
      : t("report.summary.low"));

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* ======================== */}
        {/* HEADER                   */}
        {/* ======================== */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {t("report.titleBadge")}
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">{t("report.heading")}</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            {t("report.subtitle", { role: effectiveRole ? ` ${effectiveRole}` : "" })}
          </p>
        </div>

        {/* ======================== */}
        {/* SCORE GAUGE + SUMMARY    */}
        {/* ======================== */}
        <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 mb-6 bg-white rounded-xl border border-border shadow-md p-6 sm:p-8 animate-fade-in-up">
          {/* Circular gauge */}
          <div className="relative shrink-0">
            <svg className="w-32 h-32 sm:w-40 sm:h-40 -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle cx="50" cy="50" r="42" fill="none" stroke="oklch(0.9288 0.0126 255.51)" strokeWidth="7" />
              {/* Foreground arc */}
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="url(#gaugeGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={currentDashoffset}
                className="transition-all duration-700"
              />
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={gaugeColors[0]} />
                  <stop offset="100%" stopColor={gaugeColors[1]} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-3xl sm:text-4xl font-bold text-primary">{overallScore}</span>
              <span className="text-xs text-muted-foreground font-medium">/ 100</span>
            </div>
          </div>

          {/* Summary */}
          <div className="text-center sm:text-left">
            <h2 className="font-heading text-xl font-semibold text-foreground">{scoreLabel}</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">{summaryText}</p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {overallScore >= 90 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                  </svg>
                  {t("report.recommendations.outstanding")}
                </span>
              )}
              {perQuestion.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {t("report.recommendations.skillsToDevelop", { count: skillMatch.missing.length })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ======================== */}
        {/* SKILL MATCH CARD         */}
        {/* ======================== */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-5 sm:p-6 mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <h2 className="font-heading text-lg font-semibold text-foreground">{t("report.skillMatch.heading")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">{t("report.skillMatch.demonstrated")}</p>
              <div className="flex flex-wrap gap-1.5">
                {skillMatch.matched.length > 0
                  ? skillMatch.matched.map((s) => (
                      <span
                        key={s}
                        className="text-xs font-medium bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full"
                      >
                        {s}
                      </span>
                    ))
                  : <p className="text-xs text-muted-foreground">{t("report.skillMatch.noMatch")}</p>}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">{t("report.skillMatch.focusAreas")}</p>
              <div className="flex flex-wrap gap-1.5">
                {skillMatch.missing.length > 0
                  ? skillMatch.missing.map((s) => (
                      <span
                        key={s}
                        className="text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full"
                      >
                        {s}
                      </span>
                    ))
                  : <p className="text-xs text-muted-foreground">{t("report.skillMatch.noMissing")}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* ======================== */}
        {/* PER-QUESTION BREAKDOWN   */}
        {/* ======================== */}
        {perQuestion.length > 0 && (
          <div className="mb-6">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4">{t("report.breakdown.heading")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {perQuestion.map((pq, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-border shadow-sm p-5 animate-fade-in-up"
                  style={{ animationDelay: `${200 + i * 80}ms` }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-heading text-sm font-semibold text-foreground leading-snug">
                      <span className="text-muted-foreground mr-1">Q{i + 1}.</span>
                      {pq.question}
                    </h3>
                    <span
                      className={`text-lg font-bold shrink-0 ${
                        pq.score >= 85
                          ? "text-green-600"
                          : pq.score >= 70
                            ? "text-amber-600"
                            : "text-destructive"
                      }`}
                    >
                      {pq.score}%
                    </span>
                  </div>
                  <AnimatedBar score={pq.score} delay={300 + i * 100} />
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{pq.feedback}</p>
                  {pq.tips.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {pq.tips.map((tip, j) => (
                        <li key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                          <span className="mt-0.5 w-1 h-1 rounded-full bg-accent shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================== */}
        {/* TRANSCRIPT + RECOMMENDS  */}
        {/* ======================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Transcript */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-5 sm:p-6 animate-fade-in-up" style={{ animationDelay: "350ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <h2 className="font-heading text-lg font-semibold text-foreground">{t("report.transcript.heading")}</h2>
            </div>
            {answers.length > 0 ? (
              <>
                <div className="bg-muted/30 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">{answers[question].question}</p>
                  <p className="text-sm text-foreground leading-relaxed">"{answers[question].answer}"</p>
                </div>
                {answers[question].fillerCount > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("report.transcript.fillerDetected", {
                      count: answers[question].fillerCount,
                      words: answers[question].fillerWords.join(", "),
                    })}
                  </p>
                )}
                {/* Question pagination */}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setQuestion((q) => Math.max(0, q - 1))}
                    disabled={question === 0}
                    className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    aria-label={t("report.transcript.prev")}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                    {answers.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setQuestion(i)}
                        className={`w-7 h-7 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                          i === question
                            ? "bg-accent text-white"
                            : "text-muted-foreground bg-muted hover:text-foreground hover:bg-muted/70"
                        }`}
                        aria-label={t("report.transcript.aria.question", { index: i + 1 })}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setQuestion((q) => Math.min(answers.length - 1, q + 1))}
                    disabled={question === answers.length - 1}
                    className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    aria-label={t("report.transcript.next")}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground text-right">
                  {t("report.transcript.questionCount", { current: question + 1, total: answers.length })}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground italic">{t("report.transcript.noData")}</p>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-5 sm:p-6 animate-fade-in-up" style={{ animationDelay: "450ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <h2 className="font-heading text-lg font-semibold text-foreground">{t("report.recommendations.heading")}</h2>
            </div>

            {/* Skill match insight */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>{t("report.recommendations.skillMatch")}</strong>{" "}
                {t("report.recommendations.skillMatchYou", { matched: skillMatch.matched.join(", ") || "—" })}
                {skillMatch.missing.length > 0 && (
                  <> {t("report.recommendations.skillMatchMissing", { missing: skillMatch.missing.join(", ") })}</>
                )}
              </p>
            </div>

            {/* Delivery feedback */}
            {delivery.feedback && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-xs font-semibold text-foreground mb-1">{t("report.recommendations.delivery")}</p>
                <p className="text-xs text-muted-foreground">{delivery.feedback}</p>
              </div>
            )}

            {/* Filler Word Analysis */}
            {fillerWords ? (
              <div className="mb-4 p-4 bg-amber-50/60 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38a.477.477 0 01-.611-.09 17.3 17.3 0 01-2.64-3.744l-.002-.002m6.028-8.838c.253-.962.584-1.892.985-2.783.247-.55.06-1.21-.463-1.511l-.657-.38a.477.477 0 00-.611.09 17.3 17.3 0 00-2.64 3.744l.002.002m0 0a18.95 18.95 0 00-3.464 1.754m0 0a18.94 18.94 0 003.464 1.754m0 0l.002.002" />
                  </svg>
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    {t("report.recommendations.fillerAnalysis")}
                  </h3>
                  <span className="ml-auto text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {t("report.recommendations.fillerTotal", { count: fillerWords.totalCount })}
                  </span>
                </div>

                {/* Breakdown bars */}
                {fillerWords.breakdown.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {fillerWords.breakdown.map((fw) => {
                      const maxCount = Math.max(...fillerWords.breakdown.map((b) => b.count));
                      const pct = maxCount > 0 ? (fw.count / maxCount) * 100 : 0;
                      return (
                        <div key={fw.word} className="flex items-center gap-2">
                          <span className="text-xs font-medium text-foreground w-20 shrink-0 text-right">
                            "{fw.word}"
                          </span>
                          <div className="flex-1 h-5 bg-amber-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-amber-400 transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-amber-700 w-6 text-left">
                            {fw.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* AI feedback on filler words */}
                {fillerWords.feedback && (
                  <p className="text-xs text-muted-foreground leading-relaxed bg-white/60 rounded p-2 border border-amber-100">
                    {fillerWords.feedback}
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground italic">
                  {t("report.recommendations.noFiller")}
                </p>
              </div>
            )}

            {/* Per-question tips — deduplicated */}
            {(() => {
              const allTips = perQuestion.flatMap((pq) => pq.tips);
              const uniqueTips = [...new Set(allTips)];
              return uniqueTips.length > 0 ? (
                <>
                  <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">{t("report.recommendations.tips")}</h3>
                  <ul className="space-y-2">
                    {uniqueTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 bg-amber-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{tip}</p>
                          <p className="text-xs text-muted-foreground">{t("report.recommendations.suggestion")}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">{t("report.recommendations.noTips")}</p>
              );
            })()}
          </div>
        </div>

        {/* ======================== */}
        {/* CTA                      */}
        {/* ======================== */}
        <div className="text-center">
          <button
            onClick={handleTryAnotherRole}
            className="btn-active px-8 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-base shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-0.5 animate-fade-in-up"
            style={{ animationDelay: "550ms" }}
          >
            {t("report.cta.button")}
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            {t("report.cta.subtitle")}
          </p>
        </div>
      </div>
    </div>
  );
}
