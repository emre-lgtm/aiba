"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Images,
  Tags,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Sliders,
  Wrench,
  Settings,
  Building2,
} from "lucide-react";

const navSections = [
  {
    label: "Content",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Hero Slides", href: "/admin/hero", icon: Sliders },
      { label: "Services", href: "/admin/services", icon: Wrench },
      { label: "Portfolio", href: "/admin/portfolio", icon: Images },
      { label: "Categories", href: "/admin/categories", icon: Tags },
      { label: "About Us", href: "/admin/about", icon: Building2 },
    ],
  },
  {
    label: "System",
    items: [{ label: "Settings", href: "/admin/settings", icon: Settings }],
  },
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
    <div className="flex h-full flex-col bg-[#1c1917]">
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <span className="flex shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-lg shadow-bronze-600/20">
            <Logo className="h-7 w-auto max-w-24" />
          </span>
          <div>
            <p className="font-bold tracking-tight text-white">AIBA STONE</p>
            <p className="text-[11px] uppercase tracking-wider text-stone-500">Admin Panel</p>
          </div>
        </div>
      </div>

      <div className="mx-4 h-px bg-stone-800" />

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-stone-600">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
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
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-bronze-600/20 to-bronze-500/10 text-bronze-400 shadow-sm"
                        : "text-stone-400 hover:bg-stone-800/50 hover:text-stone-200"
                    )}
                  >
                    <item.icon
                      className={cn("h-[18px] w-[18px]", isActive && "text-bronze-400")}
                    />
                    {item.label}
                    {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-bronze-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mx-4 h-px bg-stone-800" />

      <div className="space-y-1 px-3 py-4">
        <a
          href="https://aibastone.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-800/50 hover:text-stone-300"
        >
          <ExternalLink className="h-[18px] w-[18px]" />
          View Site
        </a>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-500 transition-colors hover:bg-red-950/30 hover:text-red-400"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="z-50 hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        {sidebarContent}
      </div>

      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between bg-[#1c1917] px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <span className="flex shrink-0 items-center justify-center rounded-lg bg-white p-1">
            <Logo className="h-6 w-auto max-w-20" />
          </span>
          <span className="text-sm font-bold text-white">AIBA STONE</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-stone-400 transition-colors hover:text-white"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="h-full w-64" onClick={(e) => e.stopPropagation()}>
            <div className="pt-14">{sidebarContent}</div>
          </div>
        </div>
      )}

      <div className="h-14 lg:hidden" />
    </>
  );
}
