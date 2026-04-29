import type { Transition, Variants } from "framer-motion";

export const springs = {
  gentle: { type: "spring" as const, stiffness: 120, damping: 14, mass: 1 },
  snappy: { type: "spring" as const, stiffness: 300, damping: 25, mass: 0.8 },
  bouncy: { type: "spring" as const, stiffness: 400, damping: 15, mass: 0.6 },
  heavy: { type: "spring" as const, stiffness: 80, damping: 20, mass: 1.2 },
  smooth: { type: "spring" as const, stiffness: 180, damping: 22, mass: 1 },
} satisfies Record<string, Transition>;

export const easings = {
  smooth: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
  enter: [0.16, 1, 0.3, 1] as [number, number, number, number],
  exit: [0.7, 0, 0.84, 0] as [number, number, number, number],
  anticipate: [0.68, -0.6, 0.32, 1.6] as [number, number, number, number],
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: easings.enter },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, delay, ease: easings.smooth },
  }),
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, delay, ease: easings.enter },
  }),
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, delay, ease: easings.enter },
  }),
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay, ease: easings.enter },
  }),
};

export const staggerContainer = (
  stagger: number = 0.08,
  delayChildren: number = 0
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: easings.enter },
  },
};

export const sectionHeader: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easings.enter },
  },
};

export const slideIn = (direction: number): Variants => ({
  enter: {
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 1.05,
  },
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: springs.gentle,
      opacity: { duration: 0.5 },
      scale: { duration: 0.6, ease: easings.smooth },
    },
  },
  exit: {
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.4, ease: easings.exit },
  },
});

export const textRevealLine: Variants = {
  hidden: { y: "100%" },
  visible: (delay: number = 0) => ({
    y: 0,
    transition: { duration: 0.8, delay, ease: easings.enter },
  }),
};

export const drawLine: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.5, ease: easings.smooth },
  },
};

export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -8,
    transition: springs.snappy,
  },
};
