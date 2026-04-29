"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowDown } from "lucide-react";
import { HERO_SLIDES as FALLBACK_SLIDES } from "@/lib/constants";
import { springs, easings } from "@/lib/motion";
import { Magnetic } from "@/components/motion/magnetic";
import { cn } from "@/lib/utils";

type HeroSlide = { id: string; title: string; accent: string; description: string; image_url: string; sort_order?: number };

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 1.08,
    filter: "blur(8px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      x: springs.gentle,
      opacity: { duration: 0.6 },
      scale: { duration: 1, ease: easings.smooth },
      filter: { duration: 0.8 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95,
    filter: "blur(4px)",
    transition: { duration: 0.5, ease: easings.exit },
  }),
};

const textVariants = {
  hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.9,
      delay,
      ease: easings.enter,
    },
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
  exit: {
    scaleX: 0,
    transition: { duration: 0.3 },
  },
};

export function HeroSection() {
  const [[currentSlide, direction], setSlide] = useState([0, 0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, 80]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.4]);

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

  if (!slide) return null;

  return (
    <section
      ref={sectionRef}
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
          className="absolute inset-0"
        >
          <motion.div
            style={{ y: bgY, scale: bgScale }}
            className="absolute inset-[-15%]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${slide.image_url})`,
                backgroundColor: "#3d3a36",
              }}
            />
          </motion.div>
          <motion.div
            style={{ opacity: overlayOpacity }}
            className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70"
          />
        </motion.div>
      </AnimatePresence>

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
                className="w-16 h-[2px] bg-bronze-400 mb-8 origin-left"
              />

              <motion.span
                custom={0.15}
                variants={textVariants}
                className="inline-block text-bronze-300 text-sm md:text-base font-medium tracking-[0.2em] uppercase mb-6"
              >
                AIBA STONE
              </motion.span>

              <motion.h1
                custom={0.25}
                variants={textVariants}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {slide.title}
                <br />
                <span className="text-gradient">{slide.accent}</span>
              </motion.h1>

              <motion.p
                custom={0.45}
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
                <Magnetic strength={0.15}>
                  <motion.a
                    href="#portfolio"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 bg-bronze-600 hover:bg-bronze-700 text-white px-8 py-4 rounded-full font-medium transition-colors shadow-lg shadow-bronze-900/20"
                  >
                    View Our Projects
                  </motion.a>
                </Magnetic>
                <Magnetic strength={0.15}>
                  <motion.a
                    href="#contact"
                    whileHover={{ scale: 1.04, borderColor: "rgba(255,255,255,0.6)" }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-full font-medium transition-colors hover:bg-white/10"
                  >
                    Get a Quote
                  </motion.a>
                </Magnetic>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
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
                i === currentSlide ? "bg-bronze-400" : "bg-white/30"
              )}
              animate={{
                width: i === currentSlide ? 40 : 10,
              }}
              transition={springs.smooth}
            />
            {i === currentSlide && isAutoPlaying && (
              <motion.div
                className="absolute inset-0 bg-bronze-300/40 rounded-full origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 6, ease: "linear" }}
                key={`progress-${currentSlide}`}
              />
            )}
          </button>
        ))}
      </div>

      <Magnetic strength={0.2}>
        <motion.button
          onClick={() => paginate(-1)}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.25)" }}
          whileTap={{ scale: 0.9 }}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 text-white backdrop-blur-sm cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
      </Magnetic>
      <Magnetic strength={0.2}>
        <motion.button
          onClick={() => paginate(1)}
          whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.25)" }}
          whileTap={{ scale: 0.9 }}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 text-white backdrop-blur-sm cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </motion.button>
      </Magnetic>

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
