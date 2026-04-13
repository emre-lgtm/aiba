"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";
import { HERO_SLIDES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 1.1,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95,
  }),
};

const textVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export function HeroSection() {
  const [[currentSlide, direction], setSlide] = useState([0, 0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const paginate = useCallback(
    (newDirection: number) => {
      setSlide([
        (currentSlide + newDirection + HERO_SLIDES.length) %
          HERO_SLIDES.length,
        newDirection,
      ]);
    },
    [currentSlide]
  );

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => paginate(1), 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, paginate]);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section
      id="hero"
      className="relative h-screen min-h-[700px] overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.6 },
            scale: { duration: 0.8 },
          }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundColor: "#3d3a36",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-10 flex items-center">
        <div className="container-luxury">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-3xl"
            >
              <motion.span
                custom={0.1}
                variants={textVariants}
                className="inline-block text-bronze-300 text-sm md:text-base font-medium tracking-[0.2em] uppercase mb-6"
              >
                AIBA STONE
              </motion.span>

              <motion.h1
                custom={0.2}
                variants={textVariants}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {slide.title}
                <br />
                <span className="text-gradient">{slide.accent}</span>
              </motion.h1>

              <motion.p
                custom={0.4}
                variants={textVariants}
                className="text-white/70 text-lg md:text-xl max-w-xl leading-relaxed mb-10"
              >
                {slide.description}
              </motion.p>

              <motion.div
                custom={0.6}
                variants={textVariants}
                className="flex flex-wrap gap-4"
              >
                <a
                  href="#portfolio"
                  className="inline-flex items-center gap-2 bg-bronze-600 hover:bg-bronze-700 text-white px-8 py-4 rounded-full font-medium transition-all hover:shadow-lg hover:shadow-bronze-600/25"
                >
                  Projelerimizi İnceleyin
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-8 py-4 rounded-full font-medium transition-all hover:bg-white/10"
                >
                  Teklif Alın
                </a>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide([i, i > currentSlide ? 1 : -1])}
            className={cn(
              "transition-all duration-500 rounded-full",
              i === currentSlide
                ? "w-10 h-2.5 bg-bronze-400"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/60"
            )}
            aria-label={`Slayt ${i + 1}`}
          />
        ))}
      </div>

      <button
        onClick={() => paginate(-1)}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
        aria-label="Önceki slayt"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => paginate(1)}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
        aria-label="Sonraki slayt"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 text-white/50"
      >
        <ArrowDown className="w-5 h-5" />
      </motion.div>
    </section>
  );
}
