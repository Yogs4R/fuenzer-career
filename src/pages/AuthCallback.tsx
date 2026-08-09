import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "error">("processing");

  useEffect(() => {
    // Supabase client automatically picks up the PKCE code from the URL
    // and exchanges it for a session via its internal initialization.
    // We just need to wait for the session to be ready and redirect.
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Auth callback error:", error.message);
        setStatus("error");
        return;
      }
      if (session) {
        navigate("/", { replace: true });
      } else {
        // No session found — maybe the code exchange is still happening
        // or there was no code. Redirect to login.
        navigate("/login", { replace: true });
      }
    });
  }, [navigate]);

  if (status === "error") {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="font-heading text-xl font-bold text-foreground mb-2">Sign-in failed</h2>
          <p className="text-muted-foreground text-sm mb-6">
            We couldn't complete the sign-in. Please try again.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-white font-semibold text-sm cursor-pointer transition-all duration-200 hover:bg-accent/90 hover:-translate-y-0.5"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <svg className="w-10 h-10 mx-auto mb-4 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-muted-foreground text-sm">Completing sign-in...</p>
      </div>
    </div>
  );
}
