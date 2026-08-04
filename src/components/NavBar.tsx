import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const languages = [
  { code: "EN", label: "English" },
  { code: "ID", label: "Bahasa Indonesia" },
  { code: "JP", label: "日本語" },
  { code: "DE", label: "Deutsch" },
  { code: "FR", label: "Français" },
];

export default function NavBar() {
  const [lang, setLang] = useState("EN");
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  /* ── Close language dropdown on outside click ── */
  useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [langOpen]);

  /* ── Close mobile nav on Escape ── */
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  /* ── Lock body scroll when mobile nav is open ── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const selectedLanguage = languages.find((l) => l.code === lang) ?? languages[0];

  return (
    <nav className="bg-primary text-on-primary shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          {/* Hamburger (mobile) */}
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="sm:hidden p-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition-all duration-200"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>

          <Link
            to="/"
            className="font-heading text-lg sm:text-xl font-semibold tracking-tight cursor-pointer transition-opacity duration-200 hover:opacity-90"
          >
            Fuenzer Career
          </Link>
        </div>

        {/* Right: icons + controls */}
        <div className="flex items-center gap-2 sm:gap-3 text-sm font-medium text-white/80">
          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-4 mr-2">
            <a
              href="#trending"
              className="text-white/70 hover:text-white transition-colors duration-200 text-sm"
            >
              Trending
            </a>
            <a
              href="#how-it-works"
              className="text-white/70 hover:text-white transition-colors duration-200 text-sm"
            >
              How It Works
            </a>
          </div>

          {/* History icon */}
          <button
            className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition-all duration-200"
            aria-label="History"
            title="History"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Notification icon */}
          <button
            className="relative p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition-all duration-200"
            aria-label="Notifications"
            title="Notifications"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-destructive" aria-hidden="true" />
          </button>

          {/* Language dropdown */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen((p) => !p)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-white/20 text-xs font-semibold cursor-pointer transition-all duration-200 hover:border-white/40 hover:bg-white/10"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label="Select language"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              {selectedLanguage.code}
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {langOpen && (
              <ul
                role="listbox"
                aria-label="Select language"
                className="absolute right-0 mt-1.5 w-44 bg-white rounded-lg shadow-xl border border-border py-1 z-50 overflow-hidden"
              >
                {languages.map((l) => (
                  <li
                    key={l.code}
                    role="option"
                    aria-selected={lang === l.code}
                    onClick={() => {
                      setLang(l.code);
                      setLangOpen(false);
                    }}
                    className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors duration-100 ${
                      lang === l.code
                        ? "bg-accent/10 text-accent font-medium"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{l.label}</span>
                    {lang === l.code && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Sign In / Sign Up */}
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-white/15 hover:bg-white/25 text-white font-semibold text-xs cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign In
          </Link>
        </div>
      </div>

      {/* ── Mobile slide-in nav panel ── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40 sm:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 sm:hidden flex flex-col ${
              mobileOpen ? "animate-slide-in-nav" : "animate-slide-out-nav"
            }`}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-border">
              <span className="font-heading text-lg font-semibold text-foreground">Fuenzer Career</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                aria-label="Close navigation menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <div className="flex-1 px-3 py-4 space-y-1">
              <a
                href="#trending"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Trending Skills
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                How It Works
              </a>
              <a
                href="#testimonials"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#faq"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                FAQ
              </a>
            </div>

            {/* Panel footer — Sign In */}
            <div className="px-3 py-4 border-t border-border">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm transition-all duration-200 hover:bg-primary/90"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Sign In / Sign Up
              </Link>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}