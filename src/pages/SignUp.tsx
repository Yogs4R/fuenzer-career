import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock sign-up — just navigate home
    navigate("/");
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm bg-white rounded-xl border border-border shadow-lg p-8 animate-fade-in-up">
        <h1 className="font-heading text-2xl font-bold text-foreground text-center">
          Create Your Account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          Sign up to track your progress and get personalised feedback.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-foreground mb-1">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
              placeholder="Min. 8 characters"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="signup-confirm" className="block text-sm font-medium text-foreground mb-1">
              Confirm Password
            </label>
            <input
              id="signup-confirm"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-shadow"
              placeholder="Re-enter password"
            />
          </div>

          {/* Create Account */}
          <button
            type="submit"
            className="btn-active w-full py-2.5 rounded-md bg-primary hover:bg-primary/90 text-white font-semibold text-sm shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
          >
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <span className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <span className="flex-1 h-px bg-border" />
        </div>

        {/* Google sign-up */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md border border-border text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-all duration-200"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign up with Google
        </button>

        {/* Continue as Guest */}
        <Link
          to="/"
          className="block mt-3 w-full text-center py-2.5 rounded-md border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-all duration-200"
        >
          Continue as Guest
        </Link>

        {/* Bottom text */}
        <p className="mt-6 text-xs text-muted-foreground text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:text-accent/80 font-medium underline underline-offset-2 transition-colors">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}