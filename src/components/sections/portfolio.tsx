"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import {
  PORTFOLIO_ITEMS as FALLBACK_ITEMS,
  PORTFOLIO_CATEGORIES as FALLBACK_CATEGORIES,
  type PortfolioCategory,
} from "@/lib/constants";
import { springs, staggerContainer, staggerItem, sectionHeader, easings } from "@/lib/motion";
import { Magnetic } from "@/components/motion/magnetic";
import { cn } from "@/lib/utils";

type PortfolioItem = {
  id: string;
  title: string;
  stone_type: string;
  image_url: string;
  description: string | null;
  category: { id: string; name: string; slug: string } | null;
};

type Category = { id: string; name: string; slug: string };

function toUiItem(item: PortfolioItem) {
  return {
    id: item.id,
    title: item.title,
    category: (item.category?.name || "All") as PortfolioCategory,
    description: item.description || "",
    image: item.image_url,
    stone: item.stone_type,
  };
}

const categoryVariants = {
  inactive: { backgroundColor: "rgba(255,255,255,1)", color: "#57534e" },
  active: {
    backgroundColor: "#a86c2d",
    color: "#ffffff",
    scale: 1.05,
    boxShadow: "0 10px 25px -5px rgba(168, 108, 45, 0.3)",
    transition: springs.snappy,
  },
};

const lightboxItemVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: springs.gentle,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.3, ease: easings.exit },
  }),
};

export function PortfolioSection() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxDirection, setLightboxDirection] = useState(0);
  const [items, setItems] = useState<ReturnType<typeof toUiItem>[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const [portfolioRes, categoriesRes] = await Promise.all([
          fetch("/api/portfolio"),
          fetch("/api/categories"),
        ]);
        const portfolioData = await portfolioRes.json();
        const categoriesData = await categoriesRes.json();
        if (!active) return;

        if (Array.isArray(portfolioData) && portfolioData.length > 0) {
          setItems(portfolioData.map(toUiItem));
          const catNames = ["All", ...categoriesData.map((c: Category) => c.name)];
          setCategories(catNames);
        } else {
          setItems(
            FALLBACK_ITEMS.map((item) => ({
              id: String(item.id),
              title: item.title,
              category: item.category,
              description: item.description,
              image: item.image,
              stone: item.stone,
            }))
          );
          setCategories([...FALLBACK_CATEGORIES]);
        }
      } catch {
        if (!active) return;
        setItems(
          FALLBACK_ITEMS.map((item) => ({
            id: String(item.id),
            title: item.title,
            category: item.category,
            description: item.description,
            image: item.image,
            stone: item.stone,
          }))
        );
        setCategories([...FALLBACK_CATEGORIES]);
      }
    };
    fetchData();
    return () => { active = false; };
  }, []);

  const filteredItems =
    activeCategory === "All"
      ? items
      : items.filter((item) => item.category === activeCategory);

  const openLightbox = (index: number) => {
    setLightboxDirection(1);
    setLightboxIndex(index);
  };
  const closeLightbox = () => setLightboxIndex(null);

  const navigateLightbox = useCallback(
    (newDirection: number) => {
      if (lightboxIndex === null) return;
      setLightboxDirection(newDirection);
      const newIndex =
        (lightboxIndex + newDirection + filteredItems.length) %
        filteredItems.length;
      setLightboxIndex(newIndex);
    },
    [lightboxIndex, filteredItems.length]
  );

  const handleLightboxDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 80;
      if (info.offset.x > threshold) {
        navigateLightbox(-1);
      } else if (info.offset.x < -threshold) {
        navigateLightbox(1);
      }
    },
    [navigateLightbox]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigateLightbox(-1);
      if (e.key === "ArrowRight") navigateLightbox(1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [lightboxIndex, navigateLightbox]);

  return (
    <section id="portfolio" className="section-padding bg-stone-50">
      <div className="container-luxury">
        <motion.div
          variants={sectionHeader}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="text-bronze-600 text-sm font-semibold tracking-[0.2em] uppercase">
            Materials
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mt-4 mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Featured <span className="text-gradient">Materials</span>
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed">
            Every project is a work of art that brings the unique beauty of
            natural stone to life in your spaces.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <motion.div key={category} variants={staggerItem}>
              <motion.button
                onClick={() => setActiveCategory(category)}
                variants={categoryVariants}
                animate={activeCategory === category ? "active" : "inactive"}
                whileHover={
                  activeCategory !== category
                    ? { scale: 1.05, borderColor: "#d49a4e", color: "#a86c2d" }
                    : {}
                }
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-medium border cursor-pointer",
                  activeCategory !== category && "border-stone-200"
                )}
              >
                {category}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                layoutId={`portfolio-${item.id}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ ...springs.smooth, delay: index * 0.04 }}
                className="group cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={springs.snappy}
                  className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-stone-200"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${item.image})`,
                      backgroundColor: "#c9c4bd",
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    transition={springs.snappy}
                  >
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white" />
                    </div>
                  </motion.div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <span className="text-bronze-300 text-xs font-semibold tracking-wider uppercase">
                      {item.stone}
                    </span>
                    <h3
                      className="text-white text-lg font-bold mt-1"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-white/60 text-sm mt-1">
                      {item.description}
                    </p>
                  </div>

                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white text-xs font-medium">
                      {item.category}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && filteredItems[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <motion.button
              onClick={closeLightbox}
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white z-10 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </motion.button>

            <Magnetic strength={0.15}>
              <motion.button
                onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.9 }}
                className="absolute left-4 md:left-8 p-3 rounded-full bg-white/10 text-white z-10 cursor-pointer"
                aria-label="Previous"
              >
                <ChevronLeft className="w-8 h-8" />
              </motion.button>
            </Magnetic>
            <Magnetic strength={0.15}>
              <motion.button
                onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.9 }}
                className="absolute right-4 md:right-8 p-3 rounded-full bg-white/10 text-white z-10 cursor-pointer"
                aria-label="Next"
              >
                <ChevronRight className="w-8 h-8" />
              </motion.button>
            </Magnetic>

            <AnimatePresence initial={false} custom={lightboxDirection} mode="wait">
              <motion.div
                key={lightboxIndex}
                custom={lightboxDirection}
                variants={lightboxItemVariants}
                initial="enter"
                animate="center"
                exit="exit"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleLightboxDragEnd}
                className="max-w-5xl max-h-[85vh] mx-4 cursor-grab active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="w-full aspect-[16/10] rounded-2xl bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${filteredItems[lightboxIndex].image})`,
                    backgroundColor: "#3d3a36",
                  }}
                />
                <div className="mt-6 text-center">
                  <span className="text-bronze-400 text-sm font-semibold tracking-wider uppercase">
                    {filteredItems[lightboxIndex].stone}
                  </span>
                  <h3
                    className="text-white text-2xl md:text-3xl font-bold mt-2"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {filteredItems[lightboxIndex].title}
                  </h3>
                  <p className="text-white/60 mt-2">
                    {filteredItems[lightboxIndex].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
