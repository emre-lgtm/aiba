"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { NAV_LINKS as FALLBACK_NAV, SITE as FALLBACK_SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [siteName, setSiteName] = useState(FALLBACK_SITE.name);
  const [navLinks, setNavLinks] = useState(FALLBACK_NAV);
  const [phone, setPhone] = useState("+90 500 123 45 67");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.site_name) setSiteName(data.site_name);
          if (data.nav_links?.length) setNavLinks(data.nav_links);
          if (data.phone) setPhone(data.phone);
        }
      } catch {}
    };
    load();
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled ? "glass shadow-sm" : "bg-transparent"
      )}
    >
      <nav className="container-luxury flex items-center justify-between h-20">
        <a href="#hero" className="flex items-center gap-3 group">
          <span
            className={cn(
              "flex items-center justify-center rounded-lg p-1.5 shadow-sm transition-colors",
              isScrolled
                ? "bg-white ring-1 ring-stone-200"
                : "bg-white/95 ring-1 ring-white/20"
            )}
          >
            <Logo className="h-7 w-auto max-w-24" />
          </span>
          <div>
            <span
              className={cn(
                "text-xl font-bold tracking-tight transition-colors",
                isScrolled ? "text-stone-900" : "text-white"
              )}
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {siteName}
            </span>
          </div>
        </a>

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium tracking-wide transition-colors hover:text-bronze-600",
                isScrolled ? "text-stone-600" : "text-white/80 hover:text-white"
              )}
            >
              {link.label}
            </a>
          ))}
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="flex items-center gap-2 bg-bronze-600 hover:bg-bronze-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call Us
          </a>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className={cn(
            "lg:hidden p-2 transition-colors",
            isScrolled ? "text-stone-900" : "text-white"
          )}
          aria-label="Menu"
        >
          {isMobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden glass border-t border-stone-200/50"
          >
            <div className="container-luxury py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="text-stone-700 hover:text-bronze-600 font-medium py-2 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex items-center justify-center gap-2 bg-bronze-600 text-white px-5 py-3 rounded-full font-medium mt-2"
              >
                <Phone className="w-4 h-4" />
                Call Us
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
