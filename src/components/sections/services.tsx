"use client";

import { motion } from "framer-motion";
import {
  Gem,
  Ruler,
  Home,
  Truck,
  Palette,
  ShieldCheck,
} from "lucide-react";
import { SERVICES } from "@/lib/constants";

const ICON_MAP = {
  Gem,
  Ruler,
  Home,
  Truck,
  Palette,
  ShieldCheck,
} as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  },
};

export function ServicesSection() {
  return (
    <section id="services" className="section-padding bg-white">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-bronze-600 text-sm font-semibold tracking-[0.2em] uppercase">
            What We Do
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mt-4 mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Our <span className="text-gradient">Services</span>
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">
            With our expertise in the natural stone world, we are with you at
            every stage of your project. Comprehensive solutions from supply to
            installation.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {SERVICES.map((service, index) => {
            const Icon = ICON_MAP[service.icon];
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className="group relative p-8 rounded-2xl bg-stone-50 border border-stone-100 hover:border-bronze-200 hover:shadow-xl hover:shadow-bronze-100/50 transition-all duration-500"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-bronze-100 to-bronze-200 rounded-xl flex items-center justify-center mb-6 group-hover:from-bronze-500 group-hover:to-bronze-700 transition-all duration-500">
                  <Icon className="w-7 h-7 text-bronze-700 group-hover:text-white transition-colors duration-500" />
                </div>

                <h3
                  className="text-xl font-bold text-stone-900 mb-3"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {service.title}
                </h3>

                <p className="text-stone-500 leading-relaxed">
                  {service.description}
                </p>

                <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-bronze-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
