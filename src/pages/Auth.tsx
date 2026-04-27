import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { StoreHeader } from "@/components/StoreHeader";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { BrandMark } from "@/components/BrandMark";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";

/**
 * Auth — sign-in / sign-up flow with email-password and Google.
 * Backed by Lovable Cloud. Redirects to /account on success.
 */
const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  // Already signed in? Bounce to account.
  useEffect(() => {
    if (!loading && user) navigate("/account", { replace: true });
  }, [user, loading, navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/account",
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Welcome to Wajose!", { description: "Account created — you're signed in." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Karibu tena!", { description: "You're signed in." });
      }
      navigate("/account", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/account",
      });
      if (result.error) {
        toast.error(result.error instanceof Error ? result.error.message : "Google sign-in failed");
        return;
      }
      if (result.redirected) return; // Browser is navigating away
      navigate("/account", { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 texture-paper">
      <StoreHeader />

      <section className="container mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 text-xs font-grotesk uppercase tracking-wider text-muted-foreground">
          <Link to="/" className="flex items-center gap-1 hover:text-primary transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-secondary font-bold">{mode === "signin" ? "Sign in" : "Create account"}</span>
        </div>
      </section>

      <main className="container mx-auto px-4 mt-5 max-w-md">
        <div className="bg-card rounded-2xl border border-border shadow-elevated p-5 sm:p-7">
          <div className="flex items-center gap-3 mb-5">
            <BrandMark size={40} />
            <div className="leading-tight">
              <h1 className="font-display text-2xl font-black text-secondary">
                {mode === "signin" ? "Karibu back" : "Join Wajose"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {mode === "signin"
                  ? "Sign in to track orders and save favourites."
                  : "Create your account in seconds."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2.5 bg-background hover:bg-muted/40 border-2 border-secondary/20 text-secondary font-grotesk font-bold uppercase tracking-wider text-xs px-4 py-3 rounded-full transition disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.6 6.1 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.6 6.1 29 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5 0 9.5-1.9 12.9-5l-6-5.1c-2 1.4-4.4 2.2-6.9 2.2-5.3 0-9.7-3.1-11.3-7.4l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6 5.1C40.7 35.7 44 30.4 44 24c0-1.2-.1-2.3-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>

          <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] font-grotesk text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            or with email
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="text-[11px] font-grotesk font-bold uppercase tracking-wider text-secondary">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Asha Mwangi"
                  className="mt-1 w-full px-4 py-2.5 rounded-xl bg-background border-2 border-border focus:border-primary outline-none text-sm transition"
                />
              </div>
            )}
            <div>
              <label className="text-[11px] font-grotesk font-bold uppercase tracking-wider text-secondary">
                Email
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@wajose.co.ke"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border-2 border-border focus:border-primary outline-none text-sm transition"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-grotesk font-bold uppercase tracking-wider text-secondary">
                Password
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border-2 border-border focus:border-primary outline-none text-sm transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-primary hover:bg-primary-dark text-primary-foreground font-grotesk font-bold uppercase tracking-wider text-xs px-4 py-3 rounded-full transition shadow-card flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            {mode === "signin" ? "New to Wajose?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-primary font-bold hover:underline"
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>

        <p className="text-center text-[10px] text-muted-foreground font-grotesk mt-4 px-4">
          By continuing you agree to our Terms & Privacy Policy.
        </p>
      </main>

      <MobileBottomNav />
    </div>
  );
};

export default Auth;
