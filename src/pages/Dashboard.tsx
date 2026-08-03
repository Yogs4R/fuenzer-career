import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleCombobox from "../components/RoleCombobox";

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

const faqItems = [
  {
    question: "Is this free?",
    answer:
      "Yes! Phase 1 is completely free. No account or credit card needed — just type a role and start practising.",
  },
  {
    question: "Do I need a microphone?",
    answer:
      "For the best experience, yes. You can still explore the platform without one, but voice practice is where the real magic happens.",
  },
  {
    question: "How does the AI feedback work?",
    answer:
      "Our AI analyses your speech patterns, filler word usage, and how well your answers match the target role's required skills.",
  },
  {
    question: "Can I save my progress?",
    answer:
      "Account features and progress tracking are coming soon. For now, everything works instantly without sign-up.",
  },
];

const testimonials = [
  {
    quote:
      "I felt so much more confident after just three practice sessions. The feedback on my filler words was eye-opening.",
    author: "Sarah K.",
    role: "Fresh Graduate",
  },
  {
    quote:
      "The trending skills section helped me tailor my resume. Landed my first dev role in 3 weeks.",
    author: "Alex M.",
    role: "Frontend Developer",
  },
  {
    quote:
      "Finally, a tool that lets me practice speaking, not just typing answers. Game changer.",
    author: "Priya R.",
    role: "Product Manager",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  /* ── Hero combobox state ── */
  const [heroRole, setHeroRole] = useState("");
  const [bottomRole, setBottomRole] = useState("");

  /* ── FAQ accordion state ── */
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleStart = () => navigate("/interview");
  const handleBottomStart = () => navigate("/interview");

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      {/* ================================================================ */}
      {/* HERO SECTION                                                    */}
      {/* ================================================================ */}
      <section className="bg-gradient-to-br from-primary via-primary to-secondary text-on-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Nail Your Next Interview
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
            Research trending skills in your target role, practise with voice
            interviews, and get AI-powered feedback — all in one place.
          </p>

          <div className="mt-8 sm:mt-10 max-w-lg mx-auto">
            <RoleCombobox
              value={heroRole}
              onChange={setHeroRole}
              onSubmit={handleStart}
              variant="hero"
            />
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* TRENDING SKILLS SECTION                                         */}
      {/* ================================================================ */}
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
                Type or select your target role above and click "Start Target
                Research" to begin a mock interview simulation. No account
                needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* HOW IT WORKS SECTION                                            */}
      {/* ================================================================ */}
      <section className="bg-muted/50 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center text-foreground">
            How It Works
          </h2>
          <p className="mt-2 text-muted-foreground text-center max-w-md mx-auto">
            Three simple steps to level up your interview game.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div
              className="hidden md:block absolute top-16 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-0.5 border-t-2 border-dashed border-border -z-0"
              aria-hidden="true"
            />

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
                <svg
                  className="w-8 h-8 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
              </div>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent text-white text-xs font-bold mb-3">
                1
              </span>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Choose a Target Role
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-[260px]">
                Pick from trending roles like Frontend Developer, Data
                Scientist, or enter your own.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
                <svg
                  className="w-8 h-8 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                  />
                </svg>
              </div>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent text-white text-xs font-bold mb-3">
                2
              </span>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Practice with Voice
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-[260px]">
                Answer realistic interview questions using your microphone. No
                account needed.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
                <svg
                  className="w-8 h-8 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                  />
                </svg>
              </div>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent text-white text-xs font-bold mb-3">
                3
              </span>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Get AI-Powered Feedback
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-[260px]">
                View your score, skill match analysis, and delivery insights
                instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* WHY FUENZER CAREER / FEATURES SECTION                           */}
      {/* ================================================================ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center text-foreground">
          Why Fuenzer Career
        </h2>
        <p className="mt-2 text-muted-foreground text-center max-w-md mx-auto">
          Built to give you an edge before you step into the room.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="rounded-xl bg-white border border-border shadow-sm p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                />
              </svg>
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Market-Driven Research
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Know which skills employers are looking for in your target role
              before you walk into the interview.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-xl bg-white border border-border shadow-sm p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground">
              Voice Interview Practice
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Practice aloud with realistic questions. Build muscle memory for
              your actual interview.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-xl bg-white border border-border shadow-sm p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground">
              AI-Powered Insights
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Get instant feedback on your confidence, hesitation patterns,
              and skill alignment.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* WHAT USERS SAY / TESTIMONIALS SECTION                           */}
      {/* ================================================================ */}
      <section className="bg-muted/50 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center text-foreground">
            What Users Say
          </h2>
          <p className="mt-2 text-muted-foreground text-center max-w-md mx-auto">
            Hear from people who have used Fuenzer Career.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="rounded-xl bg-white border border-border shadow-sm p-6 flex flex-col transition-all duration-200 hover:shadow-md"
              >
                {/* Decorative quote icon */}
                <svg
                  className="w-8 h-8 text-accent/20 mb-3 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.69 11 13.151 11 15c0 1.93-1.57 3.5-3.5 3.5-1.246 0-2.28-.62-2.917-1.179zM15.583 17.321C14.553 16.227 14 15 14 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C20.591 11.69 22 13.151 22 15c0 1.93-1.57 3.5-3.5 3.5-1.246 0-2.28-.62-2.917-1.179z" />
                </svg>
                <blockquote className="text-sm text-foreground leading-relaxed flex-1">
                  "{t.quote}"
                </blockquote>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="font-semibold text-sm text-foreground">
                    {t.author}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FAQ SECTION (ACCORDION)                                         */}
      {/* ================================================================ */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center text-foreground">
          Frequently Asked Questions
        </h2>
        <p className="mt-2 text-muted-foreground text-center max-w-md mx-auto mb-12">
          Everything you need to know before getting started.
        </p>

        <div className="space-y-3">
          {faqItems.map((item, i) => {
            const isOpen = openFaq === i;
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-btn-${i}`;

            return (
              <div
                key={i}
                className="rounded-xl bg-white border border-border shadow-sm overflow-hidden transition-all duration-200"
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer transition-colors duration-150 hover:bg-muted/50"
                  >
                    <span className="font-heading text-sm sm:text-base font-semibold text-foreground pr-4">
                      {item.question}
                    </span>
                    <svg
                      className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`transition-all duration-200 ease-in-out overflow-hidden ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================ */}
      {/* BOTTOM CTA SECTION                                              */}
      {/* ================================================================ */}
      <section className="bg-gradient-to-br from-primary via-primary to-secondary text-on-primary">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
            Ready to Nail Your Interview?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/70 max-w-lg mx-auto">
            Pick your target role and get instant access to voice practice, skill
            insights, and AI coaching.
          </p>

          <div className="mt-8 max-w-lg mx-auto">
            <RoleCombobox
              value={bottomRole}
              onChange={setBottomRole}
              onSubmit={handleBottomStart}
              variant="default"
            />
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FOOTER                                                          */}
      {/* ================================================================ */}
      <footer className="bg-muted border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              Fuenzer Career
            </span>{" "}
            — Nail Your Next Interview
          </p>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Fuenzer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}