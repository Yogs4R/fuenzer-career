import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { handleSectionLink } from "../lib/sectionLink";

const languages = [
  { code: "EN", label: "English" },
  { code: "ID", label: "Bahasa Indonesia" },
  { code: "JP", label: "日本語" },
  { code: "DE", label: "Deutsch" },
  { code: "FR", label: "Français" },
];

const PAGE_SIZE = 5;

/* ── Mock data generators ── */
const mockHistoryItems = Array.from({ length: 13 }, (_, i) => ({
  id: i + 1,
  role: ["Frontend Developer", "Backend Engineer", "Full Stack Dev", "DevOps Lead", "Data Analyst", "UX Designer", "Product Manager", "QA Engineer", "Tech Lead", "Engineering Manager", "Software Architect", "Mobile Dev", "Cloud Engineer"][i % 13],
  date: `2025-0${(i % 9) + 1}-${String((i * 3) % 28 + 1).padStart(2, "0")}`,
  score: 60 + (i * 3) % 35,
}));

const mockNotifications = Array.from({ length: 11 }, (_, i) => ({
  id: i + 1,
  title: ["New role added", "Practice reminder", "Score milestone", "Tip of the day", "New feature", "Leaderboard update", "Challenge available", "Badge earned", "Peer review", "Session saved", "Achievement unlocked"][i % 11],
  description:
    i % 3 === 0
      ? `Notification message ${i + 1} — click to view the full details of this update. We've added more context so you know exactly what changed and what action, if any, is needed from you.`
      : `Notification message ${i + 1} — click to view details.`,
  date: `2025-0${(i % 9) + 1}-${String((i * 2) % 28 + 1).padStart(2, "0")}`,
}));

/* ── Pagination component ── */
function PaginationBar({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-border">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        aria-label="Previous page"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => onChange(i + 1)}
          className={`w-7 h-7 rounded-md text-xs font-medium cursor-pointer transition-colors ${
            i + 1 === current
              ? "bg-accent text-white"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          aria-label={`Page ${i + 1}`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        aria-label="Next page"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

/* ── Modal overlay component ── */
function ModalOverlay({
  open,
  onClose,
  title,
  icon,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-scale-in"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="font-heading text-base font-semibold text-foreground">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-foreground hover:bg-muted cursor-pointer transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default function NavBar() {
  const [lang, setLang] = useState("EN");
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  /* ── Modal state ── */
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [notifPage, setNotifPage] = useState(1);
  const [expandedNotif, setExpandedNotif] = useState<number | null>(null);

  /* ── Paginated data ── */
  const historyTotal = Math.ceil(mockHistoryItems.length / PAGE_SIZE);
  const notifTotal = Math.ceil(mockNotifications.length / PAGE_SIZE);

  const paginatedHistory = useMemo(
    () => mockHistoryItems.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE),
    [historyPage],
  );
  const paginatedNotifs = useMemo(
    () => mockNotifications.slice((notifPage - 1) * PAGE_SIZE, notifPage * PAGE_SIZE),
    [notifPage],
  );

  /* Reset page when opening modal */
  const openHistory = () => {
    setHistoryPage(1);
    setHistoryOpen(true);
  };
  const openNotif = () => {
    setNotifPage(1);
    setExpandedNotif(null);
    setNotifOpen(true);
  };

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
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center gap-1 sm:gap-2 justify-between relative">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
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
            className="font-heading text-sm sm:text-lg md:text-xl font-semibold tracking-tight cursor-pointer transition-opacity duration-200 hover:opacity-90 whitespace-nowrap"
          >
            Fuenzer Career
          </Link>
        </div>

        {/* Desktop nav links — centered between logo and icon controls via equal flex spacers */}
        <div className="hidden sm:block flex-1" aria-hidden="true" />
        <div className="hidden sm:flex items-center gap-3 lg:gap-5">
          <a
            href="/#trending"
            onClick={(e) => handleSectionLink(e, "trending")}
            className="text-white/70 hover:text-white transition-colors duration-200 text-xs lg:text-sm whitespace-nowrap"
          >
            Trending
          </a>
          <a
            href="/#how-it-works"
            onClick={(e) => handleSectionLink(e, "how-it-works")}
            className="text-white/70 hover:text-white transition-colors duration-200 text-xs lg:text-sm whitespace-nowrap"
          >
            How It Works
          </a>
          <a
            href="/#testimonials"
            onClick={(e) => handleSectionLink(e, "testimonials")}
            className="text-white/70 hover:text-white transition-colors duration-200 text-xs lg:text-sm whitespace-nowrap"
          >
            Testimonials
          </a>
          <a
            href="/#faq"
            onClick={(e) => handleSectionLink(e, "faq")}
            className="text-white/70 hover:text-white transition-colors duration-200 text-xs lg:text-sm whitespace-nowrap"
          >
            FAQ
          </a>
        </div>
        <div className="hidden sm:block flex-1" aria-hidden="true" />

        {/* Right: icons + controls */}
        <div className="flex items-center gap-1 sm:gap-2 text-sm font-medium text-white/80 shrink-0">
          {/* History icon */}
          <button
            onClick={openHistory}
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
            onClick={openNotif}
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
          <div ref={langRef} className="relative hidden md:block">
            <button
              onClick={() => setLangOpen((p) => !p)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-md border border-white/20 text-xs font-semibold cursor-pointer transition-all duration-200 hover:border-white/40 hover:bg-white/10"
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

          {/* Sign In — ghost/outline */}
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center px-4 py-1.5 rounded-md border border-white/30 text-white/80 hover:bg-white/10 hover:text-white font-semibold text-sm cursor-pointer transition-all duration-200"
          >
            Sign In
          </Link>

          {/* Sign Up — solid accent */}
          <Link
            to="/signup"
            className="hidden md:inline-flex items-center px-4 py-1.5 rounded-md bg-accent hover:bg-accent/90 text-white font-semibold text-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* ── History Modal ── */}
      <ModalOverlay
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Practice History"
        icon={
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      >
        {paginatedHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No practice sessions yet.</p>
        ) : (
          <ul className="space-y-2">
            {paginatedHistory.map((item) => (
              <li key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.role}</p>
                  <p className="text-xs text-gray-600">{item.date}</p>
                </div>
                <span className="text-sm font-bold text-accent">{item.score}%</span>
              </li>
            ))}
          </ul>
        )}
        <PaginationBar current={historyPage} total={historyTotal} onChange={setHistoryPage} />
      </ModalOverlay>

      {/* ── Notifications Modal ── */}
      <ModalOverlay
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        title="Notifications"
        icon={
          <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        }
      >
        {paginatedNotifs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No notifications yet.</p>
        ) : (
          <ul className="space-y-2">
            {paginatedNotifs.map((item) => {
              const isExpanded = expandedNotif === item.id;
              return (
                <li
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedNotif(isExpanded ? null : item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpandedNotif(isExpanded ? null : item.id);
                    }
                  }}
                  className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{item.date}</span>
                  </div>
                  <p className={`text-sm text-gray-600 mt-1 transition-all duration-200 ${isExpanded ? "" : "line-clamp-2"}`}>
                    {item.description}
                  </p>
                  <p className="text-xs font-medium text-accent mt-1.5 flex items-center gap-1">
                    {isExpanded ? "Show less" : "Show more"}
                    <svg className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
        <PaginationBar current={notifPage} total={notifTotal} onChange={setNotifPage} />
      </ModalOverlay>

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
                href="/#trending"
                onClick={(e) => { handleSectionLink(e, "trending"); setMobileOpen(false); }}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Trending Skills
              </a>
              <a
                href="/#how-it-works"
                onClick={(e) => { handleSectionLink(e, "how-it-works"); setMobileOpen(false); }}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                How It Works
              </a>
              <a
                href="/#testimonials"
                onClick={(e) => { handleSectionLink(e, "testimonials"); setMobileOpen(false); }}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Testimonials
              </a>
              <a
                href="/#faq"
                onClick={(e) => { handleSectionLink(e, "faq"); setMobileOpen(false); }}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                FAQ
              </a>
              <hr className="my-3 border-border" />
              <button
                onClick={() => { setMobileOpen(false); openHistory(); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History
              </button>
              <button
                onClick={() => { setMobileOpen(false); openNotif(); }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                Notifications
              </button>
            </div>

            {/* Panel footer — Sign In + Sign Up */}
            <div className="px-3 py-4 border-t border-border space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm transition-all duration-200 hover:bg-primary/90"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg bg-accent text-white font-semibold text-sm transition-all duration-200 hover:bg-accent/90"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}