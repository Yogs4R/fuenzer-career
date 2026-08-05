import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import RoleCombobox from "../components/RoleCombobox";
import { handleSectionLink } from "../lib/sectionLink";
import { supabase } from "../lib/supabaseClient";
import { useInterviewSession } from "../lib/InterviewSession";
import { usePageTitle } from "../hooks/usePageTitle";

/* ── Fallback skills (used when market-agent fails) ── */
const fallbackSkills = [
  /* ── Tech ── */
  { name: "React", count: 85 },
  { name: "TypeScript", count: 72 },
  { name: "Python", count: 78 },
  { name: "Node.js", count: 65 },
  { name: "AWS", count: 60 },
  { name: "SQL", count: 55 },
  { name: "Docker", count: 58 },
  { name: "Git", count: 50 },
  { name: "Agile", count: 45 },
  { name: "API Integration", count: 52 },
  { name: "Kubernetes", count: 48 },
  { name: "CI/CD", count: 55 },
  { name: "Terraform", count: 42 },
  { name: "GraphQL", count: 40 },
  { name: "Redis", count: 35 },
  { name: "MongoDB", count: 52 },
  { name: "PostgreSQL", count: 58 },
  { name: "Next.js", count: 60 },
  { name: "Vue.js", count: 38 },
  { name: "Angular", count: 42 },
  { name: "Java", count: 55 },
  { name: "Go", count: 48 },
  { name: "Rust", count: 30 },
  { name: "Machine Learning", count: 52 },
  { name: "DevOps", count: 56 },
  { name: "Microservices", count: 50 },
  { name: "System Design", count: 45 },
  { name: "Testing", count: 48 },
  { name: "Security", count: 42 },
  { name: "Performance", count: 38 },
  /* ── Non-tech / Soft skills ── */
  { name: "Communication", count: 88 },
  { name: "Leadership", count: 82 },
  { name: "Problem Solving", count: 86 },
  { name: "Team Collaboration", count: 80 },
  { name: "Project Management", count: 75 },
  { name: "Time Management", count: 72 },
  { name: "Critical Thinking", count: 78 },
  { name: "Adaptability", count: 70 },
  { name: "Emotional Intelligence", count: 65 },
  { name: "Public Speaking", count: 60 },
  { name: "Data Analysis", count: 74 },
  { name: "CRM", count: 58 },
  { name: "Sales Strategy", count: 62 },
  { name: "Customer Success", count: 68 },
  { name: "Negotiation", count: 55 },
  { name: "Conflict Resolution", count: 52 },
  { name: "Mentoring", count: 48 },
  { name: "Cross-functional Collaboration", count: 66 },
  { name: "Strategic Planning", count: 64 },
  { name: "Stakeholder Management", count: 62 },
];

const faqItems = [
  {
    question: "Is this free?",
    answer: "Yes! Phase 1 is completely free. No account or credit card needed — just type a role and start practising.",
  },
  {
    question: "Do I need a microphone?",
    answer: "For the best experience, yes. You can still explore the platform without one, but voice practice is where the real magic happens.",
  },
  {
    question: "How does the AI feedback work?",
    answer: "Our AI analyses your speech patterns, filler word usage, and how well your answers match the target role’s required skills.",
  },
  {
    question: "Can I save my progress?",
    answer: "Yes! Create a free account and your interview history, scores, and feedback are automatically saved. You can review past sessions anytime from the history panel.",
  },
  {
    question: "Do I need an account to use Fuenzer Career?",
    answer: "Nope! You can practise as a guest with no sign-up required. Creating an account just unlocks history tracking, saved reports, and personalised notifications.",
  },
];

const testimonials = [
  {
    quote: "I felt so much more confident after just three practice sessions. The feedback on my filler words was eye-opening.",
    author: "Sarah K.",
    role: "Fresh Graduate",
    avatar: "SK",
    color: "bg-blue-500",
  },
  {
    quote: "The trending skills section helped me tailor my resume. Landed my first dev role in 3 weeks.",
    author: "Alex M.",
    role: "Frontend Developer",
    avatar: "AM",
    color: "bg-emerald-500",
  },
  {
    quote: "Finally, a tool that lets me practice speaking, not just typing answers. Game changer.",
    author: "Priya R.",
    role: "Product Manager",
    avatar: "PR",
    color: "bg-purple-500",
  },
  {
    quote: "The AI feedback pinpointed exactly where I was hesitating. Fixed it in two sessions.",
    author: "James L.",
    role: "Backend Developer",
    avatar: "JL",
    color: "bg-amber-500",
  },
  {
    quote: "I used to freeze in interviews. Now I walk in knowing exactly what to say. Unreal tool.",
    author: "Maya T.",
    role: "UX Designer",
    avatar: "MT",
    color: "bg-rose-500",
  },
  {
    quote: "The history feature is a lifesaver \u2014 I can track my improvement across every single practice session.",
    author: "David C.",
    role: "Data Analyst",
    avatar: "DC",
    color: "bg-teal-500",
  },
  {
    quote: "I love that I can practise as a guest and still get full AI feedback. No barriers, just results.",
    author: "Emma W.",
    role: "Marketing Manager",
    avatar: "EW",
    color: "bg-pink-500",
  },
  {
    quote: "The STAR-method guidance reshaped how I answer behavioural questions. Huge confidence boost.",
    author: "Carlos G.",
    role: "Engineering Manager",
    avatar: "CG",
    color: "bg-indigo-500",
  },
];

const agents = [
  {
    title: "Market Job Agent",
    subtitle: "Scrapes live job listings to identify trending skills, salary ranges, and role requirements in real time.",
    accent: "from-blue-400 to-blue-600",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
  {
    title: "Interviewer Agent",
    subtitle: "Generates contextual interview questions based on the role and guides you through STAR-method responses.",
    accent: "from-accent to-blue-500",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    title: "Evaluation Agent",
    subtitle: "Analyses your voice responses for clarity, confidence, skill alignment, and actionable improvement tips.",
    accent: "from-green-400 to-emerald-600",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

type DashboardStep = "idle" | "loading_market" | "keyword_selection" | "loading_prep" | "done";

export default function Dashboard() {
  usePageTitle("AI Interview Coach");
  const navigate = useNavigate();
  const location = useLocation();
  const { session, setRole, setKeywords, setQuestions, setError, reset } =
    useInterviewSession();

  const [heroRole, setHeroRole] = useState("");

  /* Clear session error whenever the user edits the role input */
  const handleRoleChange = (val: string) => {
    setHeroRole(val);
    if (session.error) setError(null);
  };
  const [step, setStep] = useState<DashboardStep>("idle");
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [liveKeywords, setLiveKeywords] = useState<{ name: string; count: number }[]>([]);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [prepError, setPrepError] = useState<string | null>(null);
  const [keywordsMinError, setKeywordsMinError] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [loadingElapsed, setLoadingElapsed] = useState(0);

  const isLoading = step === "loading_market" || step === "loading_prep";

  /* Hard‑coded fallback skills used when the Market Agent cannot be reached. */

  /* ── Trending skills search / filter / sort ── */
  const [trendSearch, setTrendSearch] = useState("");
  const [trendFilter, setTrendFilter] = useState<"all" | "high" | "mid" | "low">("all");
  const [trendSort, setTrendSort] = useState<"count_desc" | "count_asc" | "name">("count_desc");

  const displaySkillsRaw = liveKeywords.length > 0
    ? liveKeywords
    : fallbackSkills;

  const filteredSortedSkills = useMemo(() => {
    let skills = displaySkillsRaw;
    /* Search */
    if (trendSearch.trim()) {
      const q = trendSearch.toLowerCase();
      skills = skills.filter((s) => s.name.toLowerCase().includes(q));
    }
    /* Filter */
    if (trendFilter === "high") skills = skills.filter((s) => s.count > 70);
    else if (trendFilter === "mid") skills = skills.filter((s) => s.count > 40 && s.count <= 70);
    else if (trendFilter === "low") skills = skills.filter((s) => s.count <= 40);
    /* Sort */
    if (trendSort === "count_desc") skills = [...skills].sort((a, b) => b.count - a.count);
    else if (trendSort === "count_asc") skills = [...skills].sort((a, b) => a.count - b.count);
    else if (trendSort === "name") skills = [...skills].sort((a, b) => a.name.localeCompare(b.name));
    return skills;
  }, [displaySkillsRaw, trendSearch, trendFilter, trendSort]);

  /* Scroll to hash target after navigation */
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      const t = setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 80);
      return () => clearTimeout(t);
    }
  }, [location.hash]);

  /* Auto-rotate testimonials */
  useEffect(() => {
    if (!autoRotate) return;
    const t = setInterval(() => {
      setTestimonialIndex((p) => (p + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(t);
  }, [autoRotate]);

  /* Loading elapsed timer for "still working..." message */
  useEffect(() => {
    if (!isLoading) {
      setLoadingElapsed(0);
      return;
    }
    const t = setInterval(() => {
      setLoadingElapsed((p) => p + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [isLoading]);

  const nextTestimonial = () => {
    setAutoRotate(false);
    setTestimonialIndex((p) => (p + 1) % testimonials.length);
  };
  const prevTestimonial = () => {
    setAutoRotate(false);
    setTestimonialIndex((p) => (p - 1 + testimonials.length) % testimonials.length);
  };

  /* ── Timeouts ── */
  const FETCH_TIMEOUT_MS = 30_000; // 30 seconds for market agent (Bright Data has its own rate limit)
  const FETCH_TIMEOUT_MS_PREP = 30_000; // 30 seconds for question generation

  /* ── Rate limiters ── */
  const marketCallRef = useRef(0);
  const MARKET_COOLDOWN_MS = 15_000; // 15 seconds between market-research calls (Bright Data costs credits)
  const prepCallRef = useRef(0);
  const PREP_COOLDOWN_MS = 20_000; // 20 seconds between question-gen calls

  /* ── Step 1: Market Research ── */
  const handleStart = async () => {
    if (step !== "idle") return;
    const role = heroRole.trim();
    if (!role) return;

    /* Rate limiter — prevent rapid market-research calls (Bright Data costs credits) */
    const now = Date.now();
    if (now - marketCallRef.current < MARKET_COOLDOWN_MS) {
      const remaining = Math.ceil((MARKET_COOLDOWN_MS - (now - marketCallRef.current)) / 1000);
      setMarketError(`Please wait ${remaining} second${remaining > 1 ? "s" : ""} before searching again.`);
      return;
    }
    marketCallRef.current = now;

    reset();
    setRole(role);
    setStep("loading_market");
    setMarketError(null);
    setPrepError(null);

    /* Create a timeout promise */
    const timeoutPromise = new Promise<"timeout">((_, reject) => {
      setTimeout(() => reject(new Error("TIMEOUT")), FETCH_TIMEOUT_MS);
    });

    try {
      const fetchPromise = supabase.functions.invoke<{
        keywords: { name: string; count: number }[];
        error?: string;
      }>("market-agent", {
        body: { role, language: session.language || "en" },
      });

      const result = await Promise.race([fetchPromise, timeoutPromise]);

      if (result === "timeout") throw new Error("TIMEOUT");

      const { data, error } = result;

      if (error) throw new Error(error.message);

      if (data?.keywords && data.keywords.length > 0) {
        setLiveKeywords(data.keywords);
        setKeywords(data.keywords);
        setSelectedKeywords(new Set(data.keywords.slice(0, 5).map((k) => k.name)));
      } else {
        const fallback = fallbackSkills.slice(0, 10).map((s, i) => ({ name: s.name, count: 100 - i * 5 }));
        setLiveKeywords(fallback);
        setKeywords(fallback);
        if (data?.error) setMarketError(data.error);
      }
      setStep("keyword_selection");
      /* Auto-scroll to trending section where the keywords panel appears */
      setTimeout(() => {
        document.getElementById("trending")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err) {
      const isTimeout = err instanceof Error && err.message === "TIMEOUT";
      setMarketError(
        isTimeout
          ? "This search is taking longer than expected. Try a different role or check back later."
          : "Live data temporarily unavailable. Using general skills.",
      );
      const fallback = fallbackSkills.slice(0, 10).map((s, i) => ({ name: s.name, count: 100 - i * 5 }));
      setLiveKeywords(fallback);
      setKeywords(fallback);
      setSelectedKeywords(new Set(fallback.slice(0, 5).map((s) => s.name)));
      setStep("keyword_selection");
    }
  };

  const toggleKeyword = (name: string) => {
    setSelectedKeywords((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
    setKeywordsMinError(false);
  };

  /* ── Step 2: Generate questions ── */
  const handleConfirmKeywords = async () => {
    if (step !== "keyword_selection") return;
    const chosenKeywords = liveKeywords.filter((k) => selectedKeywords.has(k.name));
    if (chosenKeywords.length < 3) {
      setKeywordsMinError(true);
      return;
    }

    /* Rate limiter — prevent rapid question-gen clicks */
    const now = Date.now();
    if (now - prepCallRef.current < PREP_COOLDOWN_MS) {
      const remaining = Math.ceil((PREP_COOLDOWN_MS - (now - prepCallRef.current)) / 1000);
      setPrepError(`Please wait ${remaining} second${remaining > 1 ? "s" : ""} before generating again.`);
      return;
    }
    prepCallRef.current = now;
    setKeywordsMinError(false);
    setPrepError(null);
    setStep("loading_prep");

    const timeoutPromise = new Promise<"timeout">((_, reject) => {
      setTimeout(() => reject(new Error("TIMEOUT")), FETCH_TIMEOUT_MS_PREP);
    });

    try {
      const fetchPromise = supabase.functions.invoke<{
        questions: string[];
      }>("interview-prep", {
        body: {
          role: session.role,
          language: session.language || "en",
          keywords: chosenKeywords,
        },
      });

      const result = await Promise.race([fetchPromise, timeoutPromise]);
      if (result === "timeout") throw new Error("TIMEOUT");

      const { data, error } = result;

      if (error) throw new Error(error.message);
      const questions = data?.questions ?? [];
      if (questions.length === 0) throw new Error("No questions generated");

      setQuestions(questions);
      setStep("done");
      navigate("/interview");
    } catch (err: unknown) {
      const isTimeout = err instanceof Error && err.message === "TIMEOUT";
      const msg = isTimeout
        ? "The question generation is taking too long. Try again with fewer skills selected."
        : err instanceof Error ? err.message : "Failed to generate questions";
      setPrepError(msg);
      setStep("keyword_selection");
    }
  };

  const handleSkipKeywords = async () => {
    setSelectedKeywords(new Set(liveKeywords.slice(0, 5).map((k) => k.name)));
    await handleConfirmKeywords();
  };

  const displaySkills = filteredSortedSkills.length > 0
    ? [...filteredSortedSkills, ...filteredSortedSkills]
    : filteredSortedSkills;

  /* ── FAQ JSON-LD Schema ── */
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-jsonld";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems.map((item) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": { "@type": "Answer", "text": item.answer },
      })),
    });
    const existing = document.getElementById("faq-jsonld");
    if (existing) existing.remove();
    document.head.appendChild(script);
    return () => { const e = document.getElementById("faq-jsonld"); if (e) e.remove(); };
  }, []);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <svg className="w-12 h-12 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="font-heading text-base sm:text-lg font-semibold text-foreground mt-6 px-4 text-center leading-snug">
            {step === "loading_market"
              ? "Agent is fetching live market data…"
              : "Agent is generating interview questions…"}
          </p>
          {/* Live timer counting from 0 */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-4xl sm:text-5xl font-mono font-bold text-accent tabular-nums">
              {loadingElapsed}
            </span>
            <span className="text-sm text-muted-foreground font-medium">
              second{loadingElapsed !== 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3">
            {loadingElapsed < 10
              ? "Searching the market..."
              : loadingElapsed < 30
              ? "Still working — fetching live data."
              : "This is taking a while — thanks for your patience."}
          </p>
        </div>
      )}

      {/* ========= HERO SECTION ========= */}
      <section id="hero" className="bg-gradient-to-br from-primary via-primary to-secondary text-on-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-32 sm:pt-36 sm:pb-44 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
            Nail Your Next Interview
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
            Discover trending skills for your target role, practise with voice-driven mock interviews, track your progress over time, and get AI-powered feedback — all from one dashboard.
          </p>
          <div className={`mt-8 sm:mt-10 max-w-lg mx-auto transition-all duration-200 ${isLoading ? "pointer-events-none opacity-50" : ""}`}>
            <RoleCombobox value={heroRole} onChange={handleRoleChange} onSubmit={handleStart} variant="hero" />
          </div>
        </div>
      </section>

      {/* ========= TRENDING SKILLS SECTION ========= */}
      <section id="trending" className="py-12 sm:py-16 overflow-hidden scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h2 className="font-heading text-xl sm:text-2xl font-semibold text-foreground">Trending Skills</h2>
            <span className="ml-auto text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
              {liveKeywords.length > 0 ? "Live market data" : "General trends"}
            </span>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base mb-6">
            {liveKeywords.length > 0
              ? `Based on current job listings for "${session.role || "your target role"}"`
              : "Start by typing a role above to fetch live data."}
          </p>

          {/* Market error banner */}
          {marketError && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {marketError}
            </div>
          )}

          <div className="relative group">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            <div className="overflow-hidden rounded-xl">
              <div className="flex gap-3 animate-carousel hover:animate-carousel-paused w-max">
                {displaySkills.map((skill, i) => (
                  <div
                    key={`${skill.name}-${i}`}
                    className="flex items-center gap-2.5 bg-white border border-border rounded-lg px-4 py-2.5 shadow-sm shrink-0 transition-all duration-200 hover:border-accent/40 hover:shadow-md"
                  >
                    <span className="font-medium text-sm text-foreground whitespace-nowrap">{skill.name}</span>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                      skill.count > 70
                        ? "text-green-600 bg-green-50"
                        : skill.count > 40
                        ? "text-amber-600 bg-amber-50"
                        : "text-blue-600 bg-blue-50"
                    }`}>
                      +{skill.count}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Trending skills search / filter / sort ── */}
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text" value={trendSearch} onChange={(e) => setTrendSearch(e.target.value)}
                placeholder="Search skills..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-white text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200"
              />
            </div>
            <select value={trendFilter} onChange={(e) => setTrendFilter(e.target.value as "all" | "high" | "mid" | "low")}
              className="px-3 py-2 rounded-lg border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer transition-all duration-200">
              <option value="all">All levels</option>
              <option value="high">High demand (&gt;70)</option>
              <option value="mid">Medium (40–70)</option>
              <option value="low">Low (&lt;40)</option>
            </select>
            <select value={trendSort} onChange={(e) => setTrendSort(e.target.value as "count_desc" | "count_asc" | "name")}
              className="px-3 py-2 rounded-lg border border-border bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer transition-all duration-200">
              <option value="count_desc">Highest first</option>
              <option value="count_asc">Lowest first</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
          {filteredSortedSkills.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">No skills match your search criteria.</p>
          )}

          {/* Keyword Selection Panel */}
          {step === "keyword_selection" && liveKeywords.length > 0 && (
            <div className="mt-8 p-5 sm:p-6 rounded-xl bg-white border border-border shadow-sm animate-fade-in-up">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Select the skills you want to practise in your interview
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Choose the most relevant skills for your target role. Top 5 are pre-selected.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {liveKeywords.map((sk) => {
                  const isSelected = selectedKeywords.has(sk.name);
                  return (
                    <button
                      key={sk.name}
                      onClick={() => toggleKeyword(sk.name)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 border ${
                        isSelected
                          ? "bg-accent text-white border-accent shadow-sm"
                          : "bg-white text-foreground border-border hover:border-accent/40 hover:bg-muted"
                      }`}
                    >
                      {sk.name}
                      {isSelected && (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={handleConfirmKeywords}
                  className="btn-active px-6 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  Next: Generate Questions ({selectedKeywords.size} skills)
                </button>
                <button
                  onClick={handleSkipKeywords}
                  className="btn-active px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground border border-border hover:border-accent cursor-pointer transition-all duration-200"
                >
                  Skip → Auto-pick top 5
                </button>
              </div>
              {keywordsMinError && (
                <p className="mt-2 text-xs text-destructive flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  Select at least 3 skills to continue.
                </p>
              )}

              {/* Prep error retry banner */}
              {prepError && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <div className="flex-1">
                      <p className="font-medium">Couldn't generate questions</p>
                      <p className="mt-1 text-red-700">{prepError}</p>
                      <button
                        onClick={handleConfirmKeywords}
                        className="btn-active mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer transition-all duration-200"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                        </svg>
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Idle state CTA */}
          {step === "idle" && (
            <div className="mt-8 p-4 sm:p-5 rounded-xl bg-white border border-border shadow-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-accent mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-foreground">Practise makes progress</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Type or select your target role above and click &quot;Start Target Research&quot; to begin an interview simulation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========= AGENT WORKFLOW SECTION ========= */}
      <section id="how-it-works" className="bg-muted/50 py-16 sm:py-20 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center text-foreground">
            How It Works
          </h2>
          <p className="mt-2 text-muted-foreground text-center max-w-md mx-auto">
            Three intelligent agents work together to give you an edge.
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-5 gap-4 items-center relative">
            {agents.map((agent, i) => (
              <div key={agent.title} className={`relative z-10 flex flex-col items-center text-center ${i === 0 ? "md:col-start-1" : i === 1 ? "md:col-start-3" : "md:col-start-5"}`}>
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${agent.accent} flex items-center justify-center mb-5 shadow-lg`}>
                  <div className="text-white">{agent.icon}</div>
                </div>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent text-white text-xs font-bold mb-3">
                  {i + 1}
                </span>
                <h3 className="font-heading text-lg font-semibold text-foreground">{agent.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground max-w-[260px] leading-relaxed">{agent.subtitle}</p>
              </div>
            ))}
            
          </div>
        </div>
      </section>

      {/* ========= WHY FUENZER CAREER ========= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center text-foreground">Why Fuenzer Career</h2>
        <p className="mt-2 text-muted-foreground text-center max-w-md mx-auto">
          Built to give you an edge before you step into the room.
        </p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Market-Driven Research",
              desc: "Know which skills employers are looking for in your target role before you walk into the interview.",
              icon: (
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              ),
            },
            {
              title: "Voice Interview Practice",
              desc: "Practice aloud with realistic questions. Build muscle memory for your actual interview.",
              icon: (
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              ),
            },
            {
              title: "AI-Powered Insights",
              desc: "Get instant feedback on your confidence, hesitation patterns, and skill alignment.",
              icon: (
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              ),
            },
          ].map((feat) => (
            <div key={feat.title} className="rounded-xl bg-white border border-border shadow-sm p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">{feat.icon}</div>
              <h3 className="font-heading text-lg font-semibold text-foreground">{feat.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ========= WHAT USERS SAY — Carousel ========= */}
      <section id="testimonials" className="bg-muted/50 py-16 sm:py-20 scroll-mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center text-foreground">What Users Say</h2>
          <p className="mt-2 text-muted-foreground text-center max-w-md mx-auto">Hear from people who have used Fuenzer Career.</p>
          <div className="mt-12 relative">
            <div className="max-w-lg mx-auto">
              <div className="rounded-xl bg-white border border-border shadow-md p-8 transition-all duration-300">
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-full ${testimonials[testimonialIndex].color} flex items-center justify-center text-white font-bold text-sm`}>
                    {testimonials[testimonialIndex].avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{testimonials[testimonialIndex].author}</p>
                    <p className="text-xs text-muted-foreground">{testimonials[testimonialIndex].role}</p>
                  </div>
                </div>
                <svg className="w-8 h-8 text-accent/20 mb-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.69 11 13.151 11 15c0 1.93-1.57 3.5-3.5 3.5-1.246 0-2.28-.62-2.917-1.179zM15.583 17.321C14.553 16.227 14 15 14 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C20.591 11.69 22 13.151 22 15c0 1.93-1.57 3.5-3.5 3.5-1.246 0-2.28-.62-2.917-1.179z" />
                </svg>
                <blockquote className="text-sm sm:text-base text-foreground leading-relaxed">
                  &ldquo;{testimonials[testimonialIndex].quote}&rdquo;
                </blockquote>
                <div className="flex items-center justify-center gap-2 mt-6">
                  {testimonials.map((_, i) => (
                    <button key={i} onClick={() => { setAutoRotate(false); setTestimonialIndex(i); }}
                      className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-200 ${i === testimonialIndex ? "bg-accent w-4" : "bg-muted hover:bg-accent/40"}`}
                      aria-label={`Go to testimonial ${i + 1}`} />
                  ))}
                </div>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button onClick={prevTestimonial} className="p-2 rounded-full bg-muted hover:bg-accent/10 text-muted-foreground hover:text-accent cursor-pointer transition-all duration-200" aria-label="Previous testimonial">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button onClick={nextTestimonial} className="p-2 rounded-full bg-muted hover:bg-accent/10 text-muted-foreground hover:text-accent cursor-pointer transition-all duration-200" aria-label="Next testimonial">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========= FAQ SECTION ========= */}
      <section id="faq" className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20 scroll-mt-16">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center text-foreground">Frequently Asked Questions</h2>
        <p className="mt-2 text-muted-foreground text-center max-w-md mx-auto mb-12">Everything you need to know before getting started.</p>
        <div className="space-y-3">
          {faqItems.map((item, i) => {
            const isOpen = openFaq === i;
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-btn-${i}`;
            return (
              <div key={i} className="rounded-xl bg-white border border-border shadow-sm overflow-hidden transition-all duration-200">
                <h3>
                  <button id={buttonId} type="button" onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen} aria-controls={panelId}
                    className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer transition-colors duration-150 hover:bg-muted/50"
                  >
                    <span className="font-heading text-sm sm:text-base font-semibold text-foreground pr-4">{item.question}</span>
                    <svg className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </h3>
                <div id={panelId} role="region" aria-labelledby={buttonId}
                  className={`transition-all duration-200 ease-in-out overflow-hidden ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{item.answer}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========= BOTTOM CTA ========= */}
      <section className="bg-gradient-to-br from-primary via-primary to-secondary text-on-primary">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">Ready to Nail Your Interview?</h2>
          <p className="mt-3 text-sm sm:text-base text-white/70 max-w-lg mx-auto">
            Start your interview practice today and get AI-powered feedback instantly.
          </p>
          <button
            onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-active mt-8 inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-accent hover:bg-accent/90 text-white font-semibold text-base shadow-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6 6m6-6l6 6" />
            </svg>
            Get Started Now
          </button>
        </div>
      </section>

      {/* ========= FOOTER ========= */}
      <footer className="bg-muted border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">Fuenzer Career</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                Nail Your Next Interview — practise with voice, get AI feedback, and land the role.
              </p>
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-foreground mb-3">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/#trending" onClick={(e) => handleSectionLink(e, "trending", navigate)} className="text-sm text-muted-foreground hover:text-accent transition-colors">Trending Skills</a></li>
                <li><a href="/#how-it-works" onClick={(e) => handleSectionLink(e, "how-it-works", navigate)} className="text-sm text-muted-foreground hover:text-accent transition-colors">How It Works</a></li>
                <li><a href="/#testimonials" onClick={(e) => handleSectionLink(e, "testimonials", navigate)} className="text-sm text-muted-foreground hover:text-accent transition-colors">Testimonials</a></li>
                <li><a href="/#faq" onClick={(e) => handleSectionLink(e, "faq", navigate)} className="text-sm text-muted-foreground hover:text-accent transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-foreground mb-3">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-foreground mb-3">Connect</h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://github.com/Yogs4R/fuenzer-career" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="mailto:fuenzerofficial@gmail.com"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    fuenzerofficial@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Fuenzer Career. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}