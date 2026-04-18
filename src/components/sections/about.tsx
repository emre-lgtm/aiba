"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Users,
  Globe,
  TrendingUp,
  Gem,
  Ruler,
  Home,
  Truck,
  Palette,
  ShieldCheck,
  Wrench,
  Hammer,
  Paintbrush,
  Droplets,
  Layers,
  Eye,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Award, Users, Globe, TrendingUp, Gem, Ruler, Home, Truck, Palette, ShieldCheck, Wrench, Hammer, Paintbrush, Droplets, Layers, Eye,
};

type Stat = { icon: string; value: string; label: string };

const DEFAULT_ABOUT = {
  subtitle: "About Us",
  title: "Crafting Timeless Beauty",
  title_accent: "Timeless",
  description: "For over 15 years, AIBA STONE has been the premier destination for luxury natural stone. We source the world's finest marble, travertine, and limestone to transform your vision into reality.",
  image_url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
  badge_value: "15+",
  badge_label: "Years of Excellence",
  section_title: "From Quarry to Your Space",
  section_p1: "We partner directly with quarries in Italy, Turkey, India, and Brazil to bring you the rarest and most exquisite natural stones. Every slab is hand-selected by our expert team to ensure uncompromising quality.",
  section_p2: "Our master craftsmen combine traditional techniques with cutting-edge CNC technology to deliver precision results that exceed expectations. From concept to installation, we handle every detail.",
  features: ["Premium Quality Materials", "Expert Craftsmanship", "Global Sourcing", "Turnkey Solutions"],
  stats: [
    { icon: "Award", value: "15+", label: "Years Experience" },
    { icon: "Users", value: "500+", label: "Happy Clients" },
    { icon: "Globe", value: "30+", label: "Countries Served" },
    { icon: "TrendingUp", value: "2000+", label: "Projects Completed" },
  ],
};

export function AboutSection() {
  const [about, setAbout] = useState(DEFAULT_ABOUT);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.about) setAbout({ ...DEFAULT_ABOUT, ...data.about });
        }
      } catch {}
    };
    load();
  }, []);

  return (
    <section id="about" className="section-padding bg-stone-50">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-bronze-600 text-sm font-semibold tracking-[0.2em] uppercase">
            {about.subtitle}
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mt-4 mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {about.title.split(about.title_accent)[0]}
            <span className="text-gradient"> {about.title_accent}</span>
            {about.title.split(about.title_accent)[1]}
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">
            {about.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${about.image_url})`,
                    backgroundColor: "#3d3a36",
                  }}
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-bronze-600 rounded-2xl flex items-center justify-center text-white">
                <div className="text-center">
                  <span
                    className="text-4xl font-bold block"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {about.badge_value}
                  </span>
                  <span className="text-sm opacity-90">{about.badge_label}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <h3
              className="text-2xl md:text-3xl font-bold text-stone-900 mb-6"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {about.section_title}
            </h3>
            <p className="text-stone-500 leading-relaxed mb-6">{about.section_p1}</p>
            <p className="text-stone-500 leading-relaxed mb-8">{about.section_p2}</p>
            <div className="flex flex-wrap gap-4">
              {about.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-stone-600">
                  <div className="w-2 h-2 rounded-full bg-bronze-500" />
                  {f}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {about.stats.map((stat: Stat) => {
            const Icon = ICON_MAP[stat.icon] || Award;
            return (
              <div key={stat.label} className="text-center group">
                <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-bronze-100 to-bronze-200 rounded-xl flex items-center justify-center group-hover:from-bronze-500 group-hover:to-bronze-700 transition-all duration-500">
                  <Icon className="w-7 h-7 text-bronze-700 group-hover:text-white transition-colors duration-500" />
                </div>
                <span
                  className="text-3xl md:text-4xl font-bold text-stone-900 block"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {stat.value}
                </span>
                <span className="text-stone-500 text-sm mt-1 block">{stat.label}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
