"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { springs, easings } from "@/lib/motion";
import { Magnetic } from "@/components/motion/magnetic";
import { cn } from "@/lib/utils";

type HeroButton = { label: string; href: string; style: "primary" | "outline" };
type HeroSlide  = {
  id: string; title: string; accent: string;
  description: string; image_url: string;
  sort_order?: number; buttons?: HeroButton[];
};

const DEFAULT_BUTTONS: HeroButton[] = [
  { label: "View Our Projects", href: "#portfolio", style: "primary" },
  { label: "Get a Quote",       href: "#contact",   style: "outline"  },
];

const textVariants = {
  hidden:  { opacity: 0, y: 40, filter: "blur(8px)" },
  visible: (delay: number) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.8, delay, ease: easings.enter },
  }),
  exit: {
    opacity: 0, y: -20, filter: "blur(4px)",
    transition: { duration: 0.3, ease: easings.exit },
  },
};

const lineVariants = {
  hidden:  { scaleX: 0 },
  visible: (d: number) => ({ scaleX: 1, transition: { duration: 0.7, delay: d, ease: easings.enter } }),
  exit:    { scaleX: 0, transition: { duration: 0.2 } },
};

export function HeroSection() {
  const [slides,        setSlides]        = useState<HeroSlide[]>([]);
  const [heroVideoUrl,  setHeroVideoUrl]  = useState("/video.mp4");
  const [videoReady,    setVideoReady]    = useState(false);
  const [activeSlide,   setActiveSlide]   = useState(0);

  const sectionRef  = useRef<HTMLElement>(null);
  const stickyRef   = useRef<HTMLDivElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);

  // ── Data fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/hero").then(r => r.json()),
      fetch("/api/settings").then(r => r.json()),
    ]).then(([heroData, settings]) => {
      if (!active) return;
      if (Array.isArray(heroData) && heroData.length > 0) setSlides(heroData);
      if (settings?.hero_video_url) setHeroVideoUrl(settings.hero_video_url);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  // ── Video: robust autoplay ──────────────────────────────────────────────
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const tryPlay = () => {
      vid.play().catch(() => {
        // Retry once after a short delay (mobile policy)
        setTimeout(() => vid.play().catch(() => {}), 300);
      });
    };

    const onCanPlay = () => { setVideoReady(true); tryPlay(); };

    vid.addEventListener("canplaythrough", onCanPlay);
    vid.addEventListener("loadeddata",     () => { setVideoReady(true); tryPlay(); });

    // If already loaded (cached)
    if (vid.readyState >= 3) { setVideoReady(true); tryPlay(); }

    vid.load(); // force reload when src changes
    return () => {
      vid.removeEventListener("canplaythrough", onCanPlay);
    };
  }, [heroVideoUrl]);

  // ── Scroll-driven slide progression ────────────────────────────────────
  // Section is (slides.length) × 100vh tall so each slide gets one viewport of scroll
  const { scrollYProgress } = useScroll({
    target:  sectionRef,
    offset:  ["start start", "end end"],
  });

  // Which slide index based on scroll
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (slides.length === 0) return;
    const idx = Math.min(
      slides.length - 1,
      Math.floor(v * slides.length)
    );
    setActiveSlide(idx);
  });

  // Parallax & fade for the sticky container as section ends
  const stickyOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0]);
  const stickyScale   = useTransform(scrollYProgress, [0.85, 1], [1, 0.95]);

  // Within-slide progress (0→1 for each slide)
  const slideProgress = useTransform(scrollYProgress, (v) => {
    if (slides.length === 0) return 0;
    const perSlide = 1 / slides.length;
    const localV = (v % perSlide) / perSlide;
    return localV;
  });

  // Overlay darkens slightly mid-scroll
  const overlayOpacity = useTransform(slideProgress, [0, 0.4, 1], [0.55, 0.45, 0.65]);

  const slide = slides[activeSlide];

  // Manual prev/next (also scroll the page)
  const goTo = useCallback((idx: number) => {
    if (!sectionRef.current || slides.length === 0) return;
    const sectionTop = sectionRef.current.offsetTop;
    const sectionH   = sectionRef.current.offsetHeight;
    const perSlide   = sectionH / slides.length;
    window.scrollTo({ top: sectionTop + perSlide * idx + 1, behavior: "smooth" });
  }, [slides.length]);

  const numSlides = Math.max(slides.length, 1);

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{ height: `${numSlides * 100}vh` }}
      className="relative w-full"
    >
      {/* ── Sticky viewport ─────────────────────────────────────────────── */}
      <motion.div
        ref={stickyRef}
        style={{ opacity: stickyOpacity, scale: stickyScale }}
        className="sticky top-0 left-0 w-full h-screen overflow-hidden"
      >
        {/* ── Video background ────────────────────────────────────────── */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            key={heroVideoUrl}
            src={heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
              videoReady ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Poster fallback while video loads */}
          {!videoReady && slide?.image_url && (
            <div
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
              style={{ backgroundImage: `url(${slide.image_url})` }}
            />
          )}
          {!videoReady && !slide?.image_url && (
            <div className="absolute inset-0 bg-stone-900" />
          )}
        </div>

        {/* ── Slide image overlay (cross-fade on slide change) ─────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-cover bg-center mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: slide?.image_url ? `url(${slide.image_url})` : undefined,
              opacity: 0.18,
            }}
          />
        </AnimatePresence>

        {/* ── Gradient overlay ────────────────────────────────────────── */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/60 pointer-events-none"
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* ── Content ─────────────────────────────────────────────────── */}
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="container-luxury px-5 sm:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="max-w-3xl"
              >
                <motion.div
                  custom={0.05}
                  variants={lineVariants}
                  className="w-14 md:w-20 h-[2px] bg-gradient-to-r from-bronze-400 to-transparent mb-5 md:mb-8 origin-left"
                />
                <motion.span
                  custom={0.1}
                  variants={textVariants}
                  className="inline-flex items-center gap-3 text-bronze-300 text-xs md:text-sm font-medium tracking-[0.25em] uppercase mb-4 md:mb-6"
                >
                  <span className="w-2 h-2 rounded-full bg-bronze-400 animate-pulse" />
                  AIBA STONE
                </motion.span>

                <motion.h1
                  custom={0.2}
                  variants={textVariants}
                  className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] mb-4 md:mb-6"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {slide?.title || "Natural Stone"}
                  <br />
                  <span className="text-gradient">{slide?.accent || "Excellence"}</span>
                </motion.h1>

                <motion.p
                  custom={0.38}
                  variants={textVariants}
                  className="text-white/65 text-sm md:text-lg max-w-xl leading-relaxed mb-7 md:mb-10"
                >
                  {slide?.description || "Premium natural stone and marble solutions."}
                </motion.p>

                <motion.div custom={0.52} variants={textVariants} className="flex flex-wrap gap-3">
                  {(slide?.buttons?.length ? slide.buttons : DEFAULT_BUTTONS).map((btn, i) =>
                    btn.style === "primary" ? (
                      <Magnetic key={i} strength={0.12}>
                        <motion.a
                          href={btn.href}
                          whileHover={{ scale: 1.05, boxShadow: "0 16px 36px -8px rgba(168,108,45,0.45)" }}
                          whileTap={{ scale: 0.97 }}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-bronze-500 to-bronze-700 hover:from-bronze-400 hover:to-bronze-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-medium text-sm md:text-base transition-all"
                        >
                          {btn.label}
                          <motion.span
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                          >→</motion.span>
                        </motion.a>
                      </Magnetic>
                    ) : (
                      <Magnetic key={i} strength={0.12}>
                        <motion.a
                          href={btn.href}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.97 }}
                          className="inline-flex items-center gap-2 border-2 border-white/25 hover:border-white/50 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-medium text-sm md:text-base transition-all hover:bg-white/10 backdrop-blur-sm"
                        >
                          {btn.label}
                        </motion.a>
                      </Magnetic>
                    )
                  )}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Slide indicators + nav ───────────────────────────────────── */}
        {slides.length > 1 && (
          <>
            {/* Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="relative h-2 rounded-full overflow-hidden cursor-pointer"
                  aria-label={`Slide ${i + 1}`}
                >
                  <motion.div
                    className={cn("h-full rounded-full", i === activeSlide ? "bg-bronze-400" : "bg-white/30")}
                    animate={{ width: i === activeSlide ? 44 : 10 }}
                    transition={springs.smooth}
                  />
                </button>
              ))}
            </div>

            {/* Arrows */}
            <Magnetic strength={0.15}>
              <motion.button
                onClick={() => goTo(Math.max(0, activeSlide - 1))}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.9 }}
                disabled={activeSlide === 0}
                className="hidden sm:flex absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10 items-center justify-center disabled:opacity-30 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
            </Magnetic>
            <Magnetic strength={0.15}>
              <motion.button
                onClick={() => goTo(Math.min(slides.length - 1, activeSlide + 1))}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.9 }}
                disabled={activeSlide === slides.length - 1}
                className="hidden sm:flex absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/10 items-center justify-center disabled:opacity-30 transition-opacity"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </Magnetic>
          </>
        )}

        {/* ── Scroll hint ─────────────────────────────────────────────── */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:flex absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-2"
        >
          <span className="text-white/35 text-[10px] tracking-[0.3em] uppercase">
            {activeSlide < slides.length - 1 ? "Scroll" : "Continue"}
          </span>
          <div className="w-5 h-8 rounded-full border border-white/25 flex items-start justify-center p-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-1.5 bg-bronze-400 rounded-full"
            />
          </div>
        </motion.div>

        {/* ── Slide number ─────────────────────────────────────────────── */}
        {slides.length > 1 && (
          <div className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-3">
            {slides.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => goTo(i)}
                animate={{ opacity: i === activeSlide ? 1 : 0.3, scale: i === activeSlide ? 1.2 : 1 }}
                className="w-1 h-6 rounded-full bg-white cursor-pointer"
              />
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}
