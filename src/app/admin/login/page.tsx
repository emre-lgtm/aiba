"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("E-posta veya şifre hatalı.");
      setLoading(false);
      return;
    }

    const redirectTo = params.get("redirectTo") || "/admin";
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen bg-[#1c1917]">
      {/* Left panel */}
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-[#1c1917] via-[#292524] to-[#1c1917]">
        <div className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/images/hero/hero-1.jpg')" }} />
        <div className="relative z-10 px-12 text-center">
          <span className="mx-auto mb-8 flex w-fit items-center justify-center rounded-2xl bg-white p-3 shadow-2xl shadow-amber-600/30">
            <Logo className="h-14 w-auto max-w-40" />
          </span>
          <h1 className="mb-3 text-4xl font-bold text-white" style={{ fontFamily: "var(--font-playfair)" }}>
            AIBA STONE
          </h1>
          <p className="text-lg text-stone-400">Premium Natural Stone & Marble</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
            <span className="flex items-center justify-center rounded-xl bg-white p-1.5">
              <Logo className="h-8 w-auto max-w-24" />
            </span>
            <span className="text-xl font-bold text-white">AIBA STONE</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Admin Paneli</h2>
            <p className="mt-2 text-stone-500">Giriş yaparak içerikleri yönetin</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-stone-400">E-posta</Label>
              <Input id="email" type="email" placeholder="admin@aibastone.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required
                className="h-11 border-stone-700 bg-stone-800/50 text-white placeholder:text-stone-600 focus:border-amber-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-stone-400">Şifre</Label>
              <Input id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)} required
                className="h-11 border-stone-700 bg-stone-800/50 text-white focus:border-amber-500" />
            </div>

            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/50 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading}
              className="h-11 w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 font-medium text-white shadow-lg">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Giriş Yap <ArrowRight className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
