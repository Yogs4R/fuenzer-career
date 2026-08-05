import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { handleSectionLink } from "../lib/sectionLink";
import { useInterviewSession } from "../lib/InterviewSession";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";

const languages = [
  { code: "EN", label: "English" },
  { code: "ID", label: "Bahasa Indonesia" },
  { code: "JP", label: "日本語" },
  { code: "DE", label: "Deutsch" },
  { code: "FR", label: "Français" },
];

const PAGE_SIZE = 5;

/* ── Types ── */
interface HistoryItem {
  id: string;
  role: string;
  overall_score: number;
  created_at: string;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

/* ── Pagination component (fixed/sticky at top) ── */
function PaginationBarFixed({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (total <= 1) return null;
  const getPageNumbers = () => {
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, 5];
    if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
    return [current - 2, current - 1, current, current + 1, current + 2];
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <button onClick={() => onChange(current - 1)} disabled={current === 1}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        aria-label="Previous page">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {getPageNumbers().map((pageNum) => (
        <button key={pageNum} onClick={() => onChange(pageNum)}
          className={`w-7 h-7 rounded-md text-xs font-medium cursor-pointer transition-colors border ${
            pageNum === current
              ? "bg-accent text-white border-accent"
              : "bg-white text-foreground border-border/70 hover:bg-muted hover:border-border"
          }`}
          aria-label={`Page ${pageNum}`}>{pageNum}</button>
      ))}
      <button onClick={() => onChange(current + 1)} disabled={current === total}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
        aria-label="Next page">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

/* ── Modal overlay component with fixed pagination bar ── */
function ModalOverlay({
  open, onClose, title, icon, children,
  currentPage, totalPages, onPageChange,
}: {
  open: boolean; onClose: () => void; title: string; icon: React.ReactNode; children: React.ReactNode;
  currentPage?: number; totalPages?: number; onPageChange?: (page: number) => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const onClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div ref={modalRef} role="dialog" aria-modal="true" aria-label={title}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-scale-in flex flex-col max-h-[70vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">{icon}<h2 className="font-heading text-base font-semibold text-foreground">{title}</h2></div>
          <button onClick={onClose} className="p-1.5 rounded-md text-foreground hover:bg-muted cursor-pointer transition-colors" aria-label="Close">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {currentPage && totalPages && totalPages > 1 && (
          <div className="px-5 pt-3 pb-2 border-b border-border shrink-0">
            <PaginationBarFixed current={currentPage} total={totalPages} onChange={onPageChange!} />
          </div>
        )}
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

export default function NavBar() {
  const navigate = useNavigate();
  const { setLanguage } = useInterviewSession();
  const { user, signOut, deleteAccount } = useAuth();
  const [lang, setLang] = useState("EN");
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const langCode = lang.toLowerCase();
    if (langCode === "en" || langCode === "id") setLanguage(langCode);
  }, [lang, setLanguage]);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [notifPage, setNotifPage] = useState(1);
  const [expandedNotif, setExpandedNotif] = useState<string | null>(null);

  /* ── Alpha announcement (always shown when no DB notifications exist) ── */
  const ALPHA_NOTIFICATION: NotificationItem = {
    id: "alpha-release",
    title: "🚀 We're in Alpha!",
    description:
      "Welcome to Fuenzer Career Alpha! We're actively building the platform — you may encounter rough edges as we iterate. Features like progress tracking, history, and personalized notifications are coming soon. Your feedback helps us improve, so don't hesitate to share your thoughts!",
    created_at: new Date().toISOString(),
  };

  /* ── Real data from Supabase (no mock data) ── */
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [notifItems, setNotifItems] = useState<NotificationItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!user) { setHistoryItems([]); return; }
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase.from("interview_history")
        .select("id, role, overall_score, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      setHistoryItems(data || []);
    } catch { setHistoryItems([]); }
    finally { setLoadingHistory(false); }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) { setNotifItems([]); return; }
    setLoadingNotifs(true);
    try {
      const { data, error } = await supabase.from("notifications")
        .select("id, title, description, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      setNotifItems(data || []);
    } catch { setNotifItems([]); }
    finally { setLoadingNotifs(false); }
  }, [user]);

  const openHistory = useCallback(() => {
    setHistoryPage(1); setHistoryOpen(true); if (user) fetchHistory();
  }, [user, fetchHistory]);

  const openNotif = useCallback(() => {
    setNotifPage(1); setExpandedNotif(null); setNotifOpen(true); if (user) fetchNotifications();
  }, [user, fetchNotifications]);

  /* Combine DB notifications with the alpha announcement */
  const notifItemsWithAlpha = useMemo<NotificationItem[]>(() => {
    if (notifItems.length === 0) return [ALPHA_NOTIFICATION];
    return notifItems;
  }, [notifItems]);

  const historyTotal = Math.max(1, Math.ceil(historyItems.length / PAGE_SIZE));
  const notifTotal = Math.max(1, Math.ceil(notifItemsWithAlpha.length / PAGE_SIZE));

  const paginatedHistory = useMemo(() => historyItems.slice((historyPage - 1) * PAGE_SIZE, historyPage * PAGE_SIZE), [historyItems, historyPage]);
  const paginatedNotifs = useMemo(() => notifItemsWithAlpha.slice((notifPage - 1) * PAGE_SIZE, notifPage * PAGE_SIZE), [notifItemsWithAlpha, notifPage]);

  useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => { if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [langOpen]);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => { if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const selectedLanguage = languages.find((l) => l.code === lang) ?? languages[0];

  const userInitials = user?.user_metadata?.full_name
    ? (user.user_metadata.full_name as string).split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "U";

  const userAvatarUrl = user?.user_metadata?.avatar_url as string | undefined;

  const handleSignOut = async () => { try { await signOut(); } catch {} setProfileOpen(false); };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    setDeleting(true);
    try { await deleteAccount(); } catch { alert("Failed to delete account. Please try again."); }
    finally { setDeleting(false); setProfileOpen(false); }
  };

  return (
    <nav className="bg-primary text-on-primary shadow-md sticky top-0 z-50">
      <div className="w-full px-2 sm:px-4 lg:px-6 h-14 flex items-center gap-1 sm:gap-2 relative">
        <button onClick={() => setMobileOpen((p) => !p)}
          className="sm:hidden p-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 cursor-pointer transition-all duration-200"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileOpen}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
          </svg>
        </button>

        <Link to="/" className="font-heading text-sm sm:text-lg md:text-xl font-semibold tracking-tight cursor-pointer transition-opacity duration-200 hover:opacity-90 whitespace-nowrap">Fuenzer Career</Link>
        <div className="flex-1 sm:hidden" />

        <div className="hidden sm:flex items-center justify-center flex-1 gap-3 lg:gap-5">
          <a href="/#trending" onClick={(e) => handleSectionLink(e, "trending", navigate)}
            className="text-white/70 hover:text-white transition-colors duration-200 text-xs lg:text-sm whitespace-nowrap cursor-pointer">Trending</a>
          <a href="/#how-it-works" onClick={(e) => handleSectionLink(e, "how-it-works", navigate)}
            className="text-white/70 hover:text-white transition-colors duration-200 text-xs lg:text-sm whitespace-nowrap cursor-pointer">How It Works</a>
          <a href="/#testimonials" onClick={(e) => handleSectionLink(e, "testimonials", navigate)}
            className="text-white/70 hover:text-white transition-colors duration-200 text-xs lg:text-sm whitespace-nowrap cursor-pointer">Testimonials</a>
          <a href="/#faq" onClick={(e) => handleSectionLink(e, "faq", navigate)}
            className="text-white/70 hover:text-white transition-colors duration-200 text-xs lg:text-sm whitespace-nowrap cursor-pointer">FAQ</a>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 text-sm font-medium text-white/80">
          <button onClick={openHistory}
            className="hidden sm:inline-flex p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition-all duration-200"
            aria-label="History" title="History">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button onClick={openNotif}
            className="hidden sm:inline-flex relative p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition-all duration-200"
            aria-label="Notifications" title="Notifications">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {notifItemsWithAlpha.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-destructive" aria-hidden="true" />}
          </button>

          <div ref={langRef} className="relative hidden md:block">
            <button onClick={() => setLangOpen((p) => !p)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-md border border-white/20 text-xs font-semibold cursor-pointer transition-all duration-200 hover:border-white/40 hover:bg-white/10"
              aria-haspopup="listbox" aria-expanded={langOpen} aria-label="Select language">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
              {selectedLanguage.code}
              <svg className={`w-3 h-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langOpen && (
              <ul role="listbox" aria-label="Select language" className="absolute right-0 mt-1.5 w-44 bg-white rounded-lg shadow-xl border border-border py-1 z-50 overflow-hidden">
                {languages.map((l) => (
                  <li key={l.code} role="option" aria-selected={lang === l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors duration-100 ${lang === l.code ? "bg-accent/10 text-accent font-medium" : "text-foreground hover:bg-muted"}`}>
                    <span>{l.label}</span>
                    {lang === l.code && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {user ? (
            <div ref={profileRef} className="relative">
              <button onClick={() => setProfileOpen((p) => !p)}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/30 hover:border-white/70 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="User profile" aria-expanded={profileOpen}>
                {userAvatarUrl ? (
                  <img src={userAvatarUrl} alt={user.user_metadata?.full_name || "Profile"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-accent flex items-center justify-center text-white text-xs font-bold">{userInitials}</div>
                )}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl border border-border py-2 z-50 overflow-hidden">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-foreground truncate">{user.user_metadata?.full_name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <button onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted cursor-pointer transition-colors">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Sign Out
                  </button>
                  <button onClick={handleDeleteAccount} disabled={deleting}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-red-50 cursor-pointer transition-colors disabled:opacity-50">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    {deleting ? "Deleting..." : "Delete Account"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="inline-flex items-center px-2 sm:px-4 py-1 sm:py-1.5 rounded-md border border-white/30 text-white/80 hover:bg-white/10 hover:text-white font-semibold text-xs sm:text-sm cursor-pointer transition-all duration-200">Sign In</Link>
              <Link to="/signup" className="inline-flex items-center px-2 sm:px-4 py-1 sm:py-1.5 rounded-md bg-accent hover:bg-accent/90 text-white font-semibold text-xs sm:text-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-sm">Sign Up</Link>
            </>
          )}
        </div>
      </div>

      {/* ── History Modal ── */}
      <ModalOverlay open={historyOpen} onClose={() => setHistoryOpen(false)} title="Practice History"
        icon={<svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        currentPage={historyPage} totalPages={historyTotal} onPageChange={setHistoryPage}>
        {loadingHistory ? (
          <div className="flex items-center justify-center py-10">
            <svg className="w-6 h-6 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : paginatedHistory.length === 0 ? (
          <div className="text-center py-10">
            <svg className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-muted-foreground">No practice sessions yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Complete an interview to see your history here.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {paginatedHistory.map((item) => (
              <li key={item.id} role="button" tabIndex={0}
                onClick={() => { setHistoryOpen(false); navigate(`/report?id=${item.id}`); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setHistoryOpen(false); navigate(`/report?id=${item.id}`); } }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.role}</p>
                  <p className="text-xs text-gray-600">{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-sm font-bold ${item.overall_score >= 75 ? "text-green-600" : item.overall_score >= 50 ? "text-amber-600" : "text-destructive"}`}>
                  {item.overall_score}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </ModalOverlay>

      {/* ── Notifications Modal ── */}
      <ModalOverlay open={notifOpen} onClose={() => setNotifOpen(false)} title="Notifications"
        icon={<svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>}
        currentPage={notifPage} totalPages={notifTotal} onPageChange={setNotifPage}>
        {loadingNotifs ? (
          <div className="flex items-center justify-center py-10">
            <svg className="w-6 h-6 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : paginatedNotifs.length === 0 ? (
          <div className="text-center py-10">
            <svg className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {paginatedNotifs.map((item) => {
              const isExpanded = expandedNotif === item.id;
              return (
                <li key={item.id} role="button" tabIndex={0}
                  onClick={() => setExpandedNotif(isExpanded ? null : item.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpandedNotif(isExpanded ? null : item.id); } }}
                  className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer" aria-expanded={isExpanded}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <span className="text-xs text-muted-foreground shrink-0">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className={`text-sm text-gray-600 mt-1 transition-all duration-200 ${isExpanded ? "" : "line-clamp-2"}`}>{item.description}</p>
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
      </ModalOverlay>

      {/* ── Mobile slide-in panel ── */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 sm:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 sm:hidden flex flex-col animate-slide-in-nav">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border">
              <span className="font-heading text-lg font-semibold text-foreground">Fuenzer Career</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors" aria-label="Close navigation menu">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 px-3 py-4 space-y-1">
              <a href="/#trending" onClick={(e) => { handleSectionLink(e, "trending", navigate); setMobileOpen(false); }}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">Trending Skills</a>
              <a href="/#how-it-works" onClick={(e) => { handleSectionLink(e, "how-it-works", navigate); setMobileOpen(false); }}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">How It Works</a>
              <a href="/#testimonials" onClick={(e) => { handleSectionLink(e, "testimonials", navigate); setMobileOpen(false); }}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">Testimonials</a>
              <a href="/#faq" onClick={(e) => { handleSectionLink(e, "faq", navigate); setMobileOpen(false); }}
                className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">FAQ</a>
            </div>
            <div className="px-3 pb-4 pt-2 border-t border-border space-y-1">
              <button onClick={() => { openHistory(); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                History
              </button>
              <button onClick={() => { openNotif(); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                Notifications
              </button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}