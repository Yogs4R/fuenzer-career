import { useState, useEffect } from "react";

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
  const [consent, setConsent] = useState<Consent>(null);
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
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
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
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-fade-in-up"
    >
      <div className="mx-auto max-w-2xl bg-white dark:bg-gray-900 rounded-2xl border border-border shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">We value your privacy</p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
            We use Google Analytics to understand how you use Fuenzer Career so we can improve it.
            Your data is anonymised and never sold.{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 underline underline-offset-2 transition-colors"
            >
              Learn more
            </a>
            .
          </p>
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          <button
            onClick={handleReject}
            className="btn-active px-4 py-2 rounded-lg border-2 border-border text-muted-foreground hover:text-foreground hover:border-accent text-sm font-medium cursor-pointer transition-all duration-200"
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            className="btn-active px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
