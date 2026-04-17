"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Images,
  Tags,
  LogOut,
  Gem,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Portfolio", href: "/admin/portfolio", icon: Images },
  { label: "Categories", href: "/admin/categories", icon: Tags },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900">
          <Gem className="h-5 w-5 text-bronze-400" />
        </div>
        <div>
          <p className="font-semibold text-sm">AIBA STONE</p>
          <p className="text-xs text-stone-500">Admin Panel</p>
        </div>
      </div>

      <Separator />

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-stone-200"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="px-3 py-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-stone-600 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-stone-200">
        {sidebarContent}
      </div>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-900">
            <Gem className="h-4 w-4 text-bronze-400" />
          </div>
          <span className="font-semibold text-sm">AIBA STONE</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div className="w-64 h-full bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="pt-16">{sidebarContent}</div>
          </div>
        </div>
      )}

      <div className="lg:hidden h-14" />
    </>
  );
}
