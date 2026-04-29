"use client";

import { type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { springs, easings } from "@/lib/motion";

type PageTransitionProps = {
  children: ReactNode;
  className?: string;
};

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: easings.smooth }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

type FadeOverlayProps = {
  isVisible: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function FadeOverlay({ isVisible, children, className, onClick }: FadeOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={className}
          onClick={onClick}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type SlideInProps = {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  isVisible: boolean;
  className?: string;
};

export function SlideIn({
  children,
  direction = "up",
  isVisible,
  className,
}: SlideInProps) {
  const offsets = {
    left: { x: "-100%", y: 0 },
    right: { x: "100%", y: 0 },
    up: { x: 0, y: "100%" },
    down: { x: 0, y: "-100%" },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: offsets[direction].x, y: offsets[direction].y, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          exit={{ x: offsets[direction].x, y: offsets[direction].y, opacity: 0 }}
          transition={springs.gentle}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
