"use client";

import { useState, useEffect } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { Logo } from "@/components/logo";
import { SITE as FALLBACK_SITE, NAV_LINKS as FALLBACK_NAV } from "@/lib/constants";

export function Footer() {
  const [siteName, setSiteName] = useState(FALLBACK_SITE.name);
  const [phone, setPhone] = useState("+90 500 123 45 67");
  const [email, setEmail] = useState("info@aibastone.com");
  const [address, setAddress] = useState(FALLBACK_SITE.address);
  const [navLinks, setNavLinks] = useState(FALLBACK_NAV);
  const [footerText, setFooterText] = useState("Premium Natural Stone & Marble Solutions");
  const [siteDescription, setSiteDescription] = useState("Premium natural stone and marble solutions adding value to your spaces. Quality, aesthetics, and reliability.");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
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
  }, []);

  return (
    <footer className="bg-stone-900 text-stone-300">
      <div className="container-luxury section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
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
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-stone-400 hover:text-bronze-400 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-bronze-500 mt-0.5 shrink-0" />
                <span className="text-stone-400">{address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-bronze-500 shrink-0" />
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="text-stone-400 hover:text-bronze-400 transition-colors"
                >
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-bronze-500 shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="text-stone-400 hover:text-bronze-400 transition-colors"
                >
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-stone-500 text-sm">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <p className="text-stone-600 text-xs">
            {footerText}
          </p>
        </div>
      </div>
    </footer>
  );
}
