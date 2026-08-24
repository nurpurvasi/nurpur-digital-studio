import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { consumeOAuthReturn } from "@/lib/oauth-return";

import { Loader2, LogIn, UserPlus, Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — NurpurVasi Digitals" },
      { name: "description", content: "Sign in to manage NurpurVasi Digitals content." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Handle the OAuth full-page redirect return trip before anything else,
    // otherwise the guard sees no session and bounces back to this page.
    (async () => {
      const result = await consumeOAuthReturn();
      if (!mounted) return;
      if (result.error) {
        setError(result.error.message);
        setLoading(false);
      }
      const { data } = await supabase.auth.getSession();
      if (mounted && data.session) navigate({ to: "/admin", replace: true });
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (mounted && session) navigate({ to: "/admin", replace: true });
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        // Return to the public auth route: it consumes the broker response,
        // persists the session, and only then opens the protected admin area.
        redirect_uri: `${window.location.origin}/auth`,
      });
      if (result.error) throw result.error;
      if (!result.redirected) navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1000px 600px at 15% 10%, color-mix(in oklab, var(--royal) 18%, transparent), transparent 60%), radial-gradient(800px 500px at 85% 90%, color-mix(in oklab, var(--purple) 16%, transparent), transparent 60%), linear-gradient(180deg,#ffffff,#f7f8fc)",
        }}
      />
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          ← Back to site
        </Link>
        <div
          className="rounded-3xl border border-border bg-white/80 p-8 backdrop-blur-xl sm:p-10"
          style={{ boxShadow: "var(--shadow-elegant)" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="grid h-10 w-10 place-items-center rounded-2xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Admin Access</h1>
              <p className="text-xs text-muted-foreground">Manage every section of the site.</p>
            </div>
          </div>

          <div className="mt-8 flex rounded-full border border-border bg-background p-1 text-xs font-medium">
            <button
              onClick={() => setMode("signin")}
              className={`flex-1 rounded-full px-4 py-2 transition-all ${mode === "signin" ? "text-white" : "text-muted-foreground"}`}
              style={mode === "signin" ? { background: "var(--gradient-brand)" } : undefined}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-full px-4 py-2 transition-all ${mode === "signup" ? "text-white" : "text-muted-foreground"}`}
              style={mode === "signup" ? { background: "var(--gradient-brand)" } : undefined}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-ring"
                placeholder="you@brand.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-ring"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="h-px w-full bg-border" /></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-white/80 px-3 text-muted-foreground">or</span>
            </div>
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            First account created becomes the site admin.
          </p>
        </div>
      </div>
    </div>
  );
}
