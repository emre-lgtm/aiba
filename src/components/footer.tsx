"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import { Logo } from "@/components/logo";
import { SITE as FALLBACK_SITE, NAV_LINKS as FALLBACK_NAV } from "@/lib/constants";
import { staggerContainer, staggerItem, springs, easings } from "@/lib/motion";

const footerLinkVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: easings.enter },
  },
};

export function Footer() {
  const [siteName, setSiteName] = useState(FALLBACK_SITE.name);
  const [phone, setPhone] = useState("+90 500 123 45 67");
  const [email, setEmail] = useState("info@aibastone.com");
  const [address, setAddress] = useState(FALLBACK_SITE.address);
  const [navLinks, setNavLinks] = useState(FALLBACK_NAV);
  const [footerText, setFooterText] = useState("Premium Natural Stone & Marble Solutions");
  const [siteDescription, setSiteDescription] = useState("Premium natural stone and marble solutions adding value to your spaces. Quality, aesthetics, and reliability.");
  const footerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });

  const footerOpacity = useTransform(scrollYProgress, [0, 0.3], [0.6, 1]);
  const footerY = useTransform(scrollYProgress, [0, 0.3], [30, 0]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (!active) return;
          if (data.site_name) setSiteName(data.site_name);
          if (data.phone) setPhone(data.phone);
          if (data.email) setEmail(data.email);
          if (data.address && data.address !== "Antalya, Turkey") setAddress(data.address);
          if (data.nav_links?.length) setNavLinks(data.nav_links);
          if (data.footer_text) setFooterText(data.footer_text);
          if (data.site_description) setSiteDescription(data.site_description);
        }
      } catch {}
    };
    load();
    return () => { active = false; };
  }, []);

  return (
    <footer ref={footerRef} className="bg-stone-900 text-stone-300 overflow-hidden">
      <motion.div
        style={{ opacity: footerOpacity, y: footerY }}
        className="container-luxury section-padding"
      >
        <motion.div
          variants={staggerContainer(0.08, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
        >
          <motion.div variants={staggerItem} className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex items-center justify-center rounded-lg bg-white p-1.5 shadow-sm">
                <Logo className="h-7 w-auto max-w-24" />
              </span>
              <span
                className="text-2xl font-bold text-white"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {siteName}
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed max-w-md">
              {siteDescription}
            </p>
          </motion.div>

          <motion.div variants={staggerItem}>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {navLinks.map((item) => (
                <motion.li key={item.href} variants={footerLinkVariants}>
                  <motion.a
                    href={item.href}
                    className="text-stone-400 hover:text-bronze-400 transition-colors inline-block"
                    whileHover={{ x: 6, transition: springs.snappy }}
                  >
                    {item.label}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={staggerItem}>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-4">
              <motion.li
                className="flex items-start gap-3"
                whileHover={{ x: 4, transition: springs.snappy }}
              >
                <MapPin className="w-5 h-5 text-bronze-500 mt-0.5 shrink-0" />
                <span className="text-stone-400">{address}</span>
              </motion.li>
              <motion.li
                className="flex items-center gap-3"
                whileHover={{ x: 4, transition: springs.snappy }}
              >
                <Phone className="w-5 h-5 text-bronze-500 shrink-0" />
                <a
                  href={`https://wa.me/${phone.replace(/[^0-9]/g, "").replace(/^0/, "")}`}
                  className="text-stone-400 hover:text-bronze-400 transition-colors"
                >
                  {phone}
                </a>
              </motion.li>
              <motion.li
                className="flex items-center gap-3"
                whileHover={{ x: 4, transition: springs.snappy }}
              >
                <Mail className="w-5 h-5 text-bronze-500 shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="text-stone-400 hover:text-bronze-400 transition-colors"
                >
                  {email}
                </a>
              </motion.li>
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-stone-500 text-sm">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <p className="text-stone-600 text-xs">
            {footerText}
          </p>
        </motion.div>
      </motion.div>
    </footer>
  );
}
