"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import Icon from "../../components/Icon";

// Blocks open redirects by resolving with the browser's own URL parser and requiring the same origin;
// string checks miss parser quirks such as "/\t/evil.com" (tab stripped, becomes "//evil.com").
// A same-origin URL can still normalize to a "//host" path ("/.//evil.com"), which the router treats as external.
function safeRedirect(raw: string | null, origin: string): string {
  try {
    const url = new URL(raw || "/", origin);
    const path = url.pathname + url.search + url.hash;
    return url.origin === origin && !path.startsWith("//") ? path : "/";
  } catch {
    return "/";
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result =
      mode === "login"
        ? await login(email, password)
        : await register(name, email, password);

    setSubmitting(false);
    if (result.success) {
      router.push(safeRedirect(searchParams.get("redirect"), window.location.origin));
    } else {
      setError(result.error || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="glass-strong rounded-3xl p-8 animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 bg-[#e3b341] text-[#0a0f1c] rounded-full flex items-center justify-center">
              <Icon name="plane" size={26} />
            </div>
            <h1 className="text-2xl font-bold font-display text-white">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              {mode === "login"
                ? "Sign in to manage your bookings"
                : "Join Wanderlust and start exploring"}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex glass rounded-xl p-1 mb-6">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-300 ${
                  mode === m ? "btn-gradient" : "text-slate-400 hover:text-white"
                }`}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-dark w-full px-4 py-3 rounded-xl"
                  placeholder="John Doe"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-dark w-full px-4 py-3 rounded-xl"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-dark w-full px-4 py-3 rounded-xl"
                placeholder={mode === "register" ? "Min. 6 characters" : "Your password"}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-gradient py-3.5 rounded-xl font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            {mode === "login" ? (
              <>Don&apos;t have an account?{" "}
                <button onClick={() => setMode("register")} className="text-[#e3b341] hover:text-[#f0c75e] font-medium">Sign up</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => setMode("login")} className="text-[#e3b341] hover:text-[#f0c75e] font-medium">Sign in</button>
              </>
            )}
          </p>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
            &larr; Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-xl text-slate-400">Loading...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
