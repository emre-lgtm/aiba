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
  ExternalLink,
  Sliders,
  Wrench,
  Settings,
  Building2,
} from "lucide-react";
import { useState } from "react";

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
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
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
    <div className="flex flex-col h-full bg-[#1c1917]">
      <div className="px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-bronze-400 to-bronze-600 shadow-lg shadow-bronze-600/20">
            <Gem className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white tracking-tight">AIBA STONE</p>
            <p className="text-[11px] text-stone-500 tracking-wider uppercase">Admin Panel</p>
          </div>
        </div>
      </div>

      <div className="mx-4 h-px bg-stone-800" />

      <nav className="flex-1 px-3 py-5 space-y-5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-stone-600">{section.label}</p>
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
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-bronze-600/20 to-bronze-500/10 text-bronze-400 shadow-sm"
                        : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
                    )}
                  >
                    <item.icon className={cn("h-[18px] w-[18px]", isActive && "text-bronze-400")} />
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

      <div className="px-3 py-4 space-y-1">
        <a
          href="https://aibastone.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-500 hover:text-stone-300 hover:bg-stone-800/50 transition-colors"
        >
          <ExternalLink className="h-[18px] w-[18px]" />
          View Site
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-50">
        {sidebarContent}
      </div>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#1c1917] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-bronze-400 to-bronze-600">
            <Gem className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white text-sm">AIBA STONE</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-stone-400 hover:text-white transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="w-64 h-full" onClick={(e) => e.stopPropagation()}>
            <div className="pt-14">{sidebarContent}</div>
          </div>
        </div>
      )}

      <div className="lg:hidden h-14" />
    </>
  );
}
