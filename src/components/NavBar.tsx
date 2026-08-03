import { useState } from "react";
import { Link } from "react-router-dom";

export default function NavBar() {
  const [lang, setLang] = useState<"EN" | "ID">("EN");
  const toggleLang = () => setLang((p) => (p === "EN" ? "ID" : "EN"));

  return (
    <nav className="bg-primary text-on-primary shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="font-heading text-lg sm:text-xl font-semibold tracking-tight cursor-pointer transition-opacity duration-200 hover:opacity-90"
        >
          Fuenzer Career
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium text-white/80">
          <span className="hidden sm:inline">Interview Coach</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          {/* Language toggle with sliding pill */}
          <button
            onClick={toggleLang}
            aria-pressed={lang === "ID"}
            className="relative flex items-center gap-1 px-2 py-1 rounded-md border border-white/20 text-xs font-semibold cursor-pointer transition-all duration-200 hover:border-white/40 hover:bg-white/10"
          >
            {/* Sliding active pill */}
            <span
              className={`absolute inset-y-0 w-1/2 bg-white/15 rounded-md transition-all duration-200 ${
                lang === "EN" ? "left-0" : "left-1/2"
              }`}
              aria-hidden="true"
            />
            <span className="relative z-10 px-0.5" style={{ color: lang === "EN" ? "#fff" : "rgba(255,255,255,0.4)" }}>
              EN
            </span>
            <span className="relative z-10 text-white/20">/</span>
            <span className="relative z-10 px-0.5" style={{ color: lang === "ID" ? "#fff" : "rgba(255,255,255,0.4)" }}>
              ID
            </span>
          </button>
          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          <span>Beta</span>
        </div>
      </div>
    </nav>
  );
}