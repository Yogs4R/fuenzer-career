import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "error">("processing");
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;

    let cancelled = false;

    async function handleCallback() {
      // 1. First check if a session already exists (URL hash may have been
      //    processed by the client during initialization).
      const {
        data: { session: existingSession },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (existingSession) {
        handledRef.current = true;
        window.history.replaceState(
          window.history.state,
          "",
          window.location.pathname,
        );
        navigate("/", { replace: true });
        return;
      }

      // 2. No session yet — listen for it via onAuthStateChange.
      //    The SDK emits INITIAL_SESSION to every newly registered listener,
      //    so this catches cases where the session was stored between the
      //    client init and the component mount.
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (cancelled || handledRef.current) return;
        if (
          session &&
          (event === "SIGNED_IN" || event === "INITIAL_SESSION")
        ) {
          handledRef.current = true;
          subscription.unsubscribe();
          window.history.replaceState(
            window.history.state,
            "",
            window.location.pathname,
          );
          navigate("/", { replace: true });
        }
      });

      // 3. Also re-check getSession after a short tick to handle edge cases
      //    where the event fires but the session reference is stale.
      const retryTimer = setTimeout(async () => {
        if (cancelled || handledRef.current) return;
        const {
          data: { session: retrySession },
        } = await supabase.auth.getSession();
        if (retrySession && !cancelled && !handledRef.current) {
          handledRef.current = true;
          subscription.unsubscribe();
          window.history.replaceState(
            window.history.state,
            "",
            window.location.pathname,
          );
          navigate("/", { replace: true });
        }
      }, 2000);

      // 4. Timeout: if nothing picks up the session after 15s, show the error.
      const timeoutId = setTimeout(() => {
        if (!cancelled && !handledRef.current) {
          subscription.unsubscribe();
          setStatus("error");
        }
      }, 15000);

      return () => {
        clearTimeout(retryTimer);
        clearTimeout(timeoutId);
      };
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
          <p className="text-muted-foreground text-sm mb-6">
            We couldn&apos;t finish signing you in. This is often caused by a
            misconfiguration — try again or contact support.
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