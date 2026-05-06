"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Gem, Ruler, Home, Truck, Palette, ShieldCheck,
  Wrench, Hammer, Paintbrush, Droplets, Layers, Eye,
} from "lucide-react";
import { SERVICES as FALLBACK_SERVICES } from "@/lib/constants";
import { staggerContainer, staggerItem, sectionHeader, springs, easings } from "@/lib/motion";
import { TiltCard } from "@/components/motion/tilt-card";
import { useSettings } from "@/hooks/use-settings";

import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = { Gem, Ruler, Home, Truck, Palette, ShieldCheck, Wrench, Hammer, Paintbrush, Droplets, Layers, Eye };

export function ServicesSection() {
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const { sections } = useSettings();
  const sec = sections.services;

  // Split title into base + accent for gradient highlight
  const titleBase = sec.title.replace(sec.title_accent, "").trim();
  const titleAccentFirst = sec.title.startsWith(sec.title_accent);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        if (!active) return;
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        }
      } catch {}
    };
    load();
    return () => { active = false; };
  }, []);

  return (
    <section id="services" className="section-padding bg-white">
      <div className="container-luxury">
        <motion.div
          variants={sectionHeader}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-bronze-600 text-sm font-semibold tracking-[0.2em] uppercase">
            {sec.subtitle}
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mt-4 mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {titleAccentFirst ? (
              <><span className="text-gradient">{sec.title_accent}</span>{" "}{titleBase}</>
            ) : (
              <>{titleBase}{" "}<span className="text-gradient">{sec.title_accent}</span></>
            )}
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">
            {sec.description}
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          style={{ perspective: "1200px" }}
        >
          {services.map((service, index) => {
            const Icon = (ICON_MAP[service.icon] || Gem) as React.ComponentType<{ className?: string }>;
            return (
              <motion.div
                key={index}
                variants={staggerItem}
              >
                <TiltCard tiltStrength={12} scaleOnHover={1.02}>
                  <div className="group relative p-8 rounded-2xl bg-stone-50 border border-stone-100 hover:border-bronze-200 hover:shadow-xl hover:shadow-bronze-100/50 transition-all duration-500 h-full">
                    <motion.div
                      className="w-14 h-14 bg-gradient-to-br from-bronze-100 to-bronze-200 rounded-xl flex items-center justify-center mb-6"
                      whileHover={{
                        background: "linear-gradient(135deg, #a86c2d, #8c5525)",
                        transition: springs.snappy,
                      }}
                    >
                      <Icon className="w-7 h-7 text-bronze-700 group-hover:text-white transition-colors duration-500" />
                    </motion.div>

                    <h3
                      className="text-xl font-bold text-stone-900 mb-3"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {service.title}
                    </h3>

                    <p className="text-stone-500 leading-relaxed">
                      {service.description}
                    </p>

                    <motion.div
                      className="absolute bottom-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-bronze-400 to-transparent"
                      initial={{ scaleX: 0, opacity: 0 }}
                      whileInView={{ scaleX: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.8, ease: easings.enter }}
                    />
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
