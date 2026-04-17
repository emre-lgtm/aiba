"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Loader2 } from "lucide-react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/admin/login");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
          <p className="text-sm text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f8f7f4]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto lg:ml-64">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
