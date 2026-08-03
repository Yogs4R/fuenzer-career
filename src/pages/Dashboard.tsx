import { useState } from "react";
import { useNavigate } from "react-router-dom";

const trendingSkills = [
  "React",
  "TypeScript",
  "API Integration",
  "Python",
  "Node.js",
  "SQL",
  "Docker",
  "AWS",
  "Git",
  "Agile",
];

export default function Dashboard() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/interview");
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary to-secondary text-on-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Nail Your Next Interview
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
            Research trending skills in your target role, practise with voice
            interviews, and get AI-powered feedback — all in one place.
          </p>

          {/* Input Section */}
          <div className="mt-8 sm:mt-10 max-w-lg mx-auto">
            <label htmlFor="role-input" className="sr-only">
              Target job role
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="role-input"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Developer"
                className="flex-1 px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/50 text-base focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-200"
              />
              <button
                onClick={handleStart}
                className="btn-active px-6 py-3 rounded-lg bg-accent hover:bg-accent/90 text-white font-semibold text-base shadow-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              >
                Start Target Research
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Skills Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-center gap-2 mb-6">
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
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          <h2 className="font-heading text-xl sm:text-2xl font-semibold text-foreground">
            Trending Skills
          </h2>
          <span className="ml-auto text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium">
            Live market data
          </span>
        </div>

        <p className="text-muted-foreground text-sm sm:text-base mb-5">
          Based on current job listings for frontend and full-stack roles.
        </p>

        <div className="flex flex-wrap gap-2.5">
          {trendingSkills.map((skill) => (
            <span
              key={skill}
              className="inline-block px-3.5 py-1.5 rounded-full bg-white border border-border text-sm font-medium text-foreground shadow-sm cursor-default transition-all duration-200 hover:border-accent hover:text-accent hover:shadow-md"
            >
              {skill}
            </span>
          ))}
        </div>

        {/* Trust note */}
        <div className="mt-10 p-4 sm:p-5 rounded-xl bg-white border border-border shadow-sm">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-accent mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Practise makes progress
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Type your target role above and click "Start Target Research" to
                begin a mock interview simulation. No account needed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}