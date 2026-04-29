"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { NAV_LINKS as FALLBACK_NAV, SITE as FALLBACK_SITE } from "@/lib/constants";
import { springs, staggerContainer, staggerItem, easings } from "@/lib/motion";
import { Magnetic } from "@/components/motion/magnetic";
import { cn } from "@/lib/utils";

const mobileMenuVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.5, ease: easings.enter },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.3, ease: easings.exit },
  },
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [siteName, setSiteName] = useState(FALLBACK_SITE.name);
  const [navLinks, setNavLinks] = useState(FALLBACK_NAV);
  const [phone, setPhone] = useState("+90 500 123 45 67");
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    setIsScrolled(latest > 50);
    if (latest > 300 && latest > previous) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
    lastScrollY.current = latest;
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (!active) return;
          if (data.site_name) setSiteName(data.site_name);
          if (data.nav_links?.length) setNavLinks(data.nav_links);
          if (data.phone) setPhone(data.phone);
        }
      } catch {}
    };
    load();
    return () => { active = false; };
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: isHidden ? -100 : 0 }}
      transition={springs.snappy}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700",
        isScrolled
          ? "glass shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          : "bg-transparent"
      )}
    >
      <nav className="container-luxury flex items-center justify-between h-20">
        <Magnetic strength={0.08}>
          <a href="#hero" className="flex items-center gap-3.5 group">
            <motion.span
              layout
              className={cn(
                "flex items-center justify-center rounded-xl p-2 transition-all duration-500",
                isScrolled
                  ? "bg-white shadow-md ring-1 ring-stone-100"
                  : "bg-white/90 shadow-lg ring-1 ring-white/20"
              )}
            >
              <Logo className="h-6 w-auto max-w-20" />
            </motion.span>
            <div className="flex flex-col">
              <span
                className={cn(
                  "text-lg font-bold tracking-tight transition-colors duration-500 leading-tight",
                  isScrolled ? "text-stone-900" : "text-white"
                )}
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {siteName}
              </span>
              <span className={cn(
                "text-[10px] tracking-[0.2em] uppercase font-medium transition-colors duration-500",
                isScrolled ? "text-stone-400" : "text-white/50"
              )}>
                Premium Stone
              </span>
            </div>
          </a>
        </Magnetic>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link, i) => (
            <motion.a
              key={link.href}
              href={link.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: easings.enter }}
              className={cn(
                "relative text-[13px] font-medium tracking-wide px-4 py-2 rounded-lg transition-colors hover:text-bronze-600",
                isScrolled ? "text-stone-500" : "text-white/75 hover:text-white"
              )}
            >
              {link.label}
              <motion.span
                className="absolute bottom-0.5 left-4 right-4 h-[2px] bg-bronze-500 rounded-full origin-center"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={springs.snappy}
              />
            </motion.a>
          ))}
          <div className="w-px h-6 bg-stone-200/50 mx-3" />
          <Magnetic strength={0.12}>
            <motion.a
              href={`tel:${phone.replace(/\s/g, "")}`}
              whileHover={{ scale: 1.05, boxShadow: "0 8px 20px -4px rgba(168, 108, 45, 0.35)" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-gradient-to-r from-bronze-500 to-bronze-700 hover:from-bronze-400 hover:to-bronze-600 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              Call Us
            </motion.a>
          </Magnetic>
        </div>

        <motion.button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "lg:hidden p-2 rounded-lg transition-colors cursor-pointer",
            isScrolled ? "text-stone-900 hover:bg-stone-100" : "text-white hover:bg-white/10"
          )}
          aria-label="Menu"
        >
          <AnimatePresence mode="wait">
            {isMobileOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-6 h-6" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </nav>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="lg:hidden glass border-t border-stone-200/50 overflow-hidden"
          >
            <motion.div
              variants={staggerContainer(0.06, 0.1)}
              initial="hidden"
              animate="visible"
              className="container-luxury py-6 flex flex-col gap-1"
            >
              {navLinks.map((link) => (
                <motion.a
                  key={link.href}
                  variants={staggerItem}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="text-stone-700 hover:text-bronze-600 font-medium py-3 px-4 rounded-xl hover:bg-bronze-50 transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.a
                variants={staggerItem}
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-bronze-500 to-bronze-700 text-white px-5 py-3 rounded-full font-medium mt-2"
              >
                <Phone className="w-4 h-4" />
                Call Us
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
