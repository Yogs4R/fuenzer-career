import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "error">("processing");

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      // 1. Register the listener FIRST — before any async checks.
      //    This prevents a race where the SDK finishes processing the hash
      //    between our getSession() call and registering the listener.
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (cancelled) return;
        if (session && event === "SIGNED_IN") {
          subscription.unsubscribe();
          window.history.replaceState(
            window.history.state,
            "",
            window.location.pathname,
          );
          navigate("/", { replace: true });
        }
      });

      // 2. Now check — the SDK may have already processed the hash.
      const { data } = await supabase.auth.getSession();
      if (!cancelled && data?.session) {
        subscription.unsubscribe();
        window.history.replaceState(
          window.history.state,
          "",
          window.location.pathname,
        );
        navigate("/", { replace: true });
        return;
      }

      // 3. Timeout: if neither getSession nor the listener fired after 10s.
      setTimeout(() => {
        if (!cancelled) {
          subscription.unsubscribe();
          setStatus("error");
        }
      }, 10000);
    }

    handleCallback();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (status === "error") {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground mb-2">
            Sign-in incomplete
          </h2>
          <p className="text-muted-foreground text-sm mb-2">
            We couldn't finish signing you in. This is often caused by a
            misconfiguration — try again or contact support.
          </p>
          <p className="text-muted-foreground text-xs mb-6">
            If the Google consent screen shows "Supabase" instead of "Fuenzer
            Career", update your{" "}
            <strong>Google Cloud Console → OAuth consent screen</strong>{" "}
            application name.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-white font-semibold text-sm cursor-pointer transition-all duration-200 hover:bg-accent/90 active:scale-[0.97]"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <svg
          className="w-10 h-10 mx-auto mb-4 animate-spin text-accent"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p className="text-muted-foreground text-sm mt-4">
          Completing sign-in…
        </p>
      </div>
    </div>
  );
}
