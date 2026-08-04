import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const metrics = [
  { label: "Communication", score: 82 },
  { label: "Clarity", score: 78 },
  { label: "Relevance", score: 90 },
  { label: "Completeness", score: 74 },
  { label: "Confidence", score: 85 },
];

const overallScore = 85;

const mockTranscripts = [
  '"I was working on a large e-commerce platform where we had severe performance issues during peak traffic. The homepage was taking over eight seconds to load... I identified the main bottleneck was unoptimised images and excessive API calls on initial render. I implemented lazy loading, moved to a CDN for static assets, and debounced the search endpoints. After the changes, load time dropped to under two seconds and bounce rate decreased by 23%."',
  '"During my time at Company X, we had a critical deadline for a client launch. I coordinated with design, QA, and backend teams to break the work into sprints... I prioritised the must-haves and we shipped on time with zero critical bugs."',
  '"I collaborated with a cross-functional team on a mobile app release. My role was bridging the gap between design and engineering... I set up weekly syncs and a shared component library which cut integration time by 40%."',
  '"A senior engineer once pointed out my code reviews were too vague. Instead of defending myself, I asked for examples and started using the Socratic review style... My review acceptance rate improved and the team adopted the style."',
  '"I spent two days on a memory leak I could not reproduce. I wrote a small profiler script to capture heap snapshots over time... eventually I found the leak in a cached event listener and fixed it within an hour."',
  '"I noticed our support team kept answering the same questions, so I took the initiative to build an internal FAQ bot... It now deflects 60% of repetitive tickets, saving roughly five hours per week."',
  '"I explained a complex microservices migration to non-technical stakeholders using a simple train-and-station analogy... The leadership team approved the plan within the same week."',
  '"A teammate and I disagreed on the database schema design. We ran a quick benchmark comparing both approaches with real data... The data proved one option 2x faster, so we went with it and moved on."',
  '"The project I am most proud of is rebuilding our analytics dashboard. I led the redesign from data model to UI... Monthly active users on the dashboard grew by 45% and support questions about metrics dropped significantly."',
  '"If I started my current role again, I would ask more questions earlier. In the first month I assumed too much and reworked a feature twice... Now I always confirm requirements with a written one-liner before starting."',
];

/* ── Animated bar component ── */
function AnimatedBar({ score, delay }: { score: number; delay: number }) {
  const [width, setWidth] = useState(0);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const timer = setTimeout(() => setWidth(score), delay);
    return () => clearTimeout(timer);
  }, [score, delay]);

  return (
    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-accent transition-all duration-1000 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export default function EvaluationReport() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState(0);

  const handleTryAgain = () => {
    navigate("/");
  };

  /* Compute the circle dashoffset for the score ring */
  const circumference = 2 * Math.PI * 42;
  const dashoffset = circumference - (overallScore / 100) * circumference;

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
            Evaluation Complete
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Your Interview Dashboard</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Detailed breakdown of your mock interview performance.
          </p>
        </div>

        {/* ======================== */}
        {/* SCORE GAUGE + SUMMARY    */}
        {/* ======================== */}
        <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 mb-10 bg-white rounded-xl border border-border shadow-md p-6 sm:p-8 animate-fade-in-up">
          {/* Circular gauge */}
          <div className="relative shrink-0">
            <svg className="w-32 h-32 sm:w-40 sm:h-40 -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle cx="50" cy="50" r="42" fill="none" stroke="oklch(0.9288 0.0126 255.51)" strokeWidth="7" />
              {/* Foreground arc */}
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                className="transition-all duration-700"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="oklch(0.52 0.17 255)" />
                  <stop offset="100%" stopColor="oklch(0.6 0.18 179)" />
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
            <h2 className="font-heading text-xl font-semibold text-foreground">Great performance!</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              You demonstrated strong technical knowledge and clear communication. 
              Focus on deepening your API integration stories and reducing filler words for an even stronger impact.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
                Top 15% of candidates
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                2 areas to improve
              </span>
            </div>
          </div>
        </div>

        {/* ======================== */}
        {/* METRIC CARDS             */}
        {/* ======================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className="bg-white rounded-xl border border-border shadow-sm p-5 animate-fade-in-up"
              style={{ animationDelay: `${150 + i * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading text-sm font-semibold text-foreground">{m.label}</h3>
                <span className="text-lg font-bold text-accent">{m.score}%</span>
              </div>
              <AnimatedBar score={m.score} delay={300 + i * 150} />
              <p className="mt-2 text-xs text-muted-foreground">
                {m.score >= 85
                  ? "Excellent — keep it up!"
                  : m.score >= 75
                  ? "Good — minor room for improvement"
                  : "Needs attention — practise more"}
              </p>
            </div>
          ))}
        </div>

        {/* ======================== */}
        {/* TRANSCRIPT + FEEDBACK    */}
        {/* ======================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Transcript */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-5 sm:p-6 animate-fade-in-up" style={{ animationDelay: "350ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <h2 className="font-heading text-lg font-semibold text-foreground">Transcript</h2>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 max-h-48 overflow-y-auto">
              <p className="text-sm text-foreground leading-relaxed">{mockTranscripts[question]}</p>
            </div>
            {/* Question pagination — numbered tabs + prev/next */}
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                onClick={() => setQuestion((q) => Math.max(0, q - 1))}
                disabled={question === 0}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                aria-label="Previous question"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                {mockTranscripts.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setQuestion(i)}
                    className={`w-7 h-7 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                      i === question
                        ? "bg-accent text-white"
                        : "text-muted-foreground bg-muted hover:text-foreground hover:bg-muted/70"
                    }`}
                    aria-label={`Question ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setQuestion((q) => Math.min(mockTranscripts.length - 1, q + 1))}
                disabled={question === mockTranscripts.length - 1}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                aria-label="Next question"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground text-right">
              Question {question + 1} of {mockTranscripts.length} &mdash; abridged
            </p>
          </div>

          {/* Recommendation */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-5 sm:p-6 animate-fade-in-up" style={{ animationDelay: "450ms" }}>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <h2 className="font-heading text-lg font-semibold text-foreground">Recommendations</h2>
            </div>
            <ul className="space-y-3">
              {[
                { tip: "Add specific metrics to your project stories (e.g., \"23% improvement\")", priority: "High" },
                { tip: "Reduce filler words (\"um\", \"uh\") — try pausing instead", priority: "Medium" },
                { tip: "Structure answers with STAR format for complex questions", priority: "Medium" },
                { tip: "Practise 2–3 more mock sessions before the real interview", priority: "Low" },
              ].map((item) => (
                <li key={item.tip} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                      item.priority === "High"
                        ? "bg-destructive"
                        : item.priority === "Medium"
                        ? "bg-amber-500"
                        : "bg-green-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{item.tip}</p>
                    <p className="text-xs text-muted-foreground">{item.priority} priority</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ======================== */}
        {/* CTA                      */}
        {/* ======================== */}
        <div className="text-center">
          <button
            onClick={handleTryAgain}
            className="btn-active px-8 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-base shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-0.5 animate-fade-in-up"
            style={{ animationDelay: "550ms" }}
          >
            Try Another Role
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            Ready for another round? Practise makes progress.
          </p>
        </div>
      </div>
    </div>
  );
}