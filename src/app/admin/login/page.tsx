"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gem, Loader2, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen flex bg-[#1c1917]">
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#1c1917]">
        <div className="absolute inset-0 bg-[url('/images/hero/hero-1.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative z-10 text-center px-12">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-bronze-400 to-bronze-600 shadow-2xl shadow-bronze-600/30">
            <Gem className="h-10 w-10 text-white" />
          </div>
          <h1
            className="text-4xl font-bold text-white mb-3"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            AIBA STONE
          </h1>
          <p className="text-stone-400 text-lg">
            Premium Natural Stone & Marble
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-bronze-400 to-bronze-600">
              <Gem className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-white text-xl">AIBA STONE</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-stone-500 mt-2">Sign in to manage your portfolio</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-stone-400 text-xs font-medium uppercase tracking-wider">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@aibastone.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-stone-800/50 border-stone-700 text-white placeholder:text-stone-600 focus:border-bronze-500 focus:ring-bronze-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-stone-400 text-xs font-medium uppercase tracking-wider">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-stone-800/50 border-stone-700 text-white placeholder:text-stone-600 focus:border-bronze-500 focus:ring-bronze-500/20"
              />
            </div>
            {error && (
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-900/50">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-bronze-600 to-bronze-500 hover:from-bronze-500 hover:to-bronze-400 text-white font-medium shadow-lg shadow-bronze-600/20 transition-all duration-300"
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
