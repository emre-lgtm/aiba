"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";
import { HERO_SLIDES as FALLBACK_SLIDES } from "@/lib/constants";
import { springs, easings } from "@/lib/motion";
import { Magnetic } from "@/components/motion/magnetic";
import { cn } from "@/lib/utils";

type HeroSlide = { id: string; title: string; accent: string; description: string; image_url: string; sort_order?: number };

const textVariants = {
  hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, delay, ease: easings.enter },
  }),
  exit: {
    opacity: 0,
    y: -30,
    filter: "blur(6px)",
    transition: { duration: 0.35, ease: easings.exit },
  },
};

const lineVariants = {
  hidden: { scaleX: 0 },
  visible: (delay: number) => ({
    scaleX: 1,
    transition: { duration: 0.8, delay, ease: easings.enter },
  }),
  exit: { scaleX: 0, transition: { duration: 0.3 } },
};

const slideContentVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.8 } },
  exit: { opacity: 0, transition: { duration: 0.4 } },
};

export function HeroSection() {
  const [[currentSlide, direction], setSlide] = useState([0, 0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, 80]);
  const overlayGradient = useTransform(
    scrollYProgress,
    [0, 0.5],
    [
      "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.65) 100%)",
      "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.85) 100%)",
    ]
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/hero");
        const data = await res.json();
        if (!active) return;
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data);
        } else {
          setSlides(FALLBACK_SLIDES.map((s) => ({ ...s, id: String(s.id), image_url: s.image })));
        }
      } catch {
        if (active) setSlides(FALLBACK_SLIDES.map((s) => ({ ...s, id: String(s.id), image_url: s.image })));
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const paginate = useCallback(
    (newDirection: number) => {
      if (slides.length === 0) return;
      setSlide([
        (currentSlide + newDirection + slides.length) % slides.length,
        newDirection,
      ]);
    },
    [currentSlide, slides.length]
  );

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;
    const timer = setInterval(() => paginate(1), 6000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, paginate, slides.length]);

  const slide = slides[currentSlide];

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-screen min-h-[700px] overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-[-12%]">
        <video
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
            videoLoaded ? "opacity-100" : "opacity-0"
          )}
        >
          <source src="/video.mp4" type="video/mp4" />
        </video>

        {!videoLoaded && slide && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image_url})`, backgroundColor: "#3d3a36" }}
          />
        )}

        {slides.length > 1 && (
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideContentVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0"
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-0"
                style={{ backgroundImage: `url(${slide?.image_url})`, backgroundColor: "#3d3a36" }}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      <motion.div
        style={{ background: overlayGradient }}
        className="absolute inset-0 z-[1]"
      />

      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="absolute inset-0 z-10 flex items-center"
      >
        <div className="container-luxury">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-3xl"
            >
              <motion.div
                custom={0.1}
                variants={lineVariants}
                className="w-20 h-[2px] bg-gradient-to-r from-bronze-400 to-transparent mb-8 origin-left"
              />

              <motion.span
                custom={0.15}
                variants={textVariants}
                className="inline-flex items-center gap-3 text-bronze-300 text-sm md:text-base font-medium tracking-[0.25em] uppercase mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-bronze-400 animate-pulse" />
                AIBA STONE
              </motion.span>

              <motion.h1
                custom={0.25}
                variants={textVariants}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] mb-6"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {slide?.title || "Natural Stone"}
                <br />
                <span className="text-gradient">{slide?.accent || "Excellence"}</span>
              </motion.h1>

              <motion.p
                custom={0.45}
                variants={textVariants}
                className="text-white/65 text-lg md:text-xl max-w-xl leading-relaxed mb-10"
              >
                {slide?.description || "Premium natural stone and marble solutions for luxury spaces."}
              </motion.p>

              <motion.div
                custom={0.6}
                variants={textVariants}
                className="flex flex-wrap gap-4"
              >
                <Magnetic strength={0.15}>
                  <motion.a
                    href="#portfolio"
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(168, 108, 45, 0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2.5 bg-gradient-to-r from-bronze-500 to-bronze-700 hover:from-bronze-400 hover:to-bronze-600 text-white px-9 py-4 rounded-full font-medium transition-all text-base"
                  >
                    View Our Projects
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      →
                    </motion.span>
                  </motion.a>
                </Magnetic>
                <Magnetic strength={0.15}>
                  <motion.a
                    href="#contact"
                    whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.5)" }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 border-2 border-white/25 text-white px-9 py-4 rounded-full font-medium transition-all hover:bg-white/10 text-base backdrop-blur-sm"
                  >
                    Get a Quote
                  </motion.a>
                </Magnetic>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide([i, i > currentSlide ? 1 : -1])}
              className="relative h-2 rounded-full overflow-hidden cursor-pointer"
              aria-label={`Slide ${i + 1}`}
            >
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  i === currentSlide ? "bg-bronze-400" : "bg-white/25"
                )}
                animate={{ width: i === currentSlide ? 44 : 10 }}
                transition={springs.smooth}
              />
              {i === currentSlide && isAutoPlaying && (
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-full origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 6, ease: "linear" }}
                  key={`prog-${currentSlide}`}
                />
              )}
            </button>
          ))}
        </div>
      )}

      <Magnetic strength={0.2}>
        <motion.button
          onClick={() => paginate(-1)}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
          whileTap={{ scale: 0.9 }}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10 cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
      </Magnetic>
      <Magnetic strength={0.2}>
        <motion.button
          onClick={() => paginate(1)}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
          whileTap={{ scale: 0.9 }}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3.5 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10 cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </Magnetic>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-medium">Scroll</span>
        <div className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center p-1.5">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-1.5 bg-bronze-400 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
