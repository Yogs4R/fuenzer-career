import { useNavigate } from "react-router-dom";

const skillMatchData = [
  { skill: "React", level: 85 },
  { skill: "TypeScript", level: 70 },
  { skill: "API Integration", level: 60 },
  { skill: "Performance Optimisation", level: 90 },
];

const hesitationData = [
  { type: "Filler words (um, uh)", count: 4, severity: "Low" },
  { type: "Long pauses (>3s)", count: 1, severity: "Low" },
  { type: "Repetition", count: 2, severity: "Low" },
];

export default function EvaluationReport() {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    navigate("/");
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Report Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            Evaluation Complete
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            Your Interview Report
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Here's how you performed on your mock interview.
          </p>
        </div>

        {/* Score Ring */}
        <div className="flex justify-center mb-8 sm:mb-10 animate-scale-in">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36">
            {/* Background ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="oklch(0.9288 0.0126 255.51)"
                strokeWidth="2.5"
              />
              {/* Progress arc — 85/100 */}
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="oklch(0.52 0.17 255)"
                strokeWidth="2.5"
                strokeDasharray="97.39"
                strokeDashoffset="14.61"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-3xl sm:text-4xl font-bold text-primary">
                85
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                / 100
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Cards */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {/* Skill Match Card */}
          <div className="bg-white rounded-xl border border-border shadow-md p-5 sm:p-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-5 h-5 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Skill Match
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              How your answer aligned with market-demanded skills
            </p>
            <div className="space-y-3">
              {skillMatchData.map((item) => (
                <div key={item.skill}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-foreground">
                      {item.skill}
                    </span>
                    <span className="text-muted-foreground">{item.level}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all duration-500"
                      style={{ width: `${item.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Overall:
                </span>{" "}
                Strong technical alignment. Consider deepening your API
                integration knowledge.
              </p>
            </div>
          </div>

          {/* Confidence & Delivery Card */}
          <div className="bg-white rounded-xl border border-border shadow-md p-5 sm:p-6 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-5 h-5 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Confidence &amp; Delivery
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Detected speech patterns during your response
            </p>
            <div className="space-y-3">
              {hesitationData.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.severity === "Low"
                          ? "bg-green-500"
                          : item.severity === "Medium"
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm text-foreground">
                      {item.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-foreground">
                      {item.count}x
                    </span>
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        item.severity === "Low"
                          ? "bg-green-100 text-green-700"
                          : item.severity === "Medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  Tip:
                </span>{" "}
                You sound confident overall. Reducing filler words will make
                your answers even more polished.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={handleTryAgain}
            className="btn-active px-8 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-base shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-0.5 animate-fade-in-up"
            style={{ animationDelay: '550ms' }}
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