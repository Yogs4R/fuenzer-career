import { useState, useEffect } from "react";
import { useTranslation } from "../lib/i18n";

const STORAGE_KEY = "fuenzer_cookie_consent";
const GA_ID = "G-MKSPXBHK42";

type Consent = "accepted" | "rejected" | null;

/* Inject Google Analytics into <head> — called only once on accept */
function injectGA() {
  if (document.getElementById("ga-gtag")) return; // already injected

  const script1 = document.createElement("script");
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script1.id = "ga-gtag";
  document.head.appendChild(script1);

  const script2 = document.createElement("script");
  script2.id = "ga-config";
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', '${GA_ID}', { anonymize_ip: true });
  `;
  document.head.appendChild(script2);
}

export default function CookieConsent() {
  const { t } = useTranslation();
  const [, setConsent] = useState<Consent>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Consent | null;
    if (stored === "accepted") {
      injectGA();
      setConsent("accepted");
    } else if (stored === "rejected") {
      setConsent("rejected");
    } else {
      /* Show banner after a short delay so the page renders first */
      const tmr = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(tmr);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    injectGA();
    setConsent("accepted");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(STORAGE_KEY, "rejected");
    setConsent("rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in-up"
    >
      <div className="w-full bg-primary/95 backdrop-blur-md border-t border-white/10 px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{t("cookie.title")}</p>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5 leading-relaxed">
            {t("cookie.description")}{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-white underline underline-offset-2 transition-colors"
            >
              {t("cookie.learnMore")}
            </a>
            .
          </p>
        </div>
        <div className="flex items-center gap-3 sm:shrink-0">
          <button
            onClick={handleReject}
            className="text-sm font-medium text-white/50 hover:text-white cursor-pointer transition-colors duration-200"
          >
            {t("cookie.reject")}
          </button>
          <button
            onClick={handleAccept}
            className="btn-active px-4 py-1.5 rounded-lg bg-accent hover:bg-accent/90 text-white text-sm font-semibold cursor-pointer transition-all duration-200"
          >
            {t("cookie.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
