"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
  };

  return (
    <div className="flex min-h-screen bg-[#1c1917]">
      <div className="relative hidden items-center justify-center bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#1c1917] lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-[url('/images/hero/hero-1.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 px-12 text-center">
          <span className="mx-auto mb-8 flex w-fit items-center justify-center rounded-2xl bg-white p-3 shadow-2xl shadow-bronze-600/30">
            <Logo className="h-14 w-auto max-w-40" />
          </span>
          <h1
            className="mb-3 text-4xl font-bold text-white"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            AIBA STONE
          </h1>
          <p className="text-lg text-stone-400">Premium Natural Stone & Marble</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <span className="flex items-center justify-center rounded-xl bg-white p-1.5">
              <Logo className="h-8 w-auto max-w-24" />
            </span>
            <span className="text-xl font-bold text-white">AIBA STONE</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="mt-2 text-stone-500">Sign in to manage your materials</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-stone-400">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@aibastone.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-stone-700 bg-stone-800/50 text-white placeholder:text-stone-600 focus:border-bronze-500 focus:ring-bronze-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-stone-400">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 border-stone-700 bg-stone-800/50 text-white placeholder:text-stone-600 focus:border-bronze-500 focus:ring-bronze-500/20"
              />
            </div>
            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/50 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full bg-gradient-to-r from-bronze-600 to-bronze-500 font-medium text-white shadow-lg shadow-bronze-600/20 transition-all duration-300 hover:from-bronze-500 hover:to-bronze-400"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
