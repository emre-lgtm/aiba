"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: "up" | "down";
  offset?: [number, number];
};

export function useParallax(scrollRange: [number, number] = [0, 1], outputRange: [number, number] = [-100, 100]) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, scrollRange, outputRange);
  return { ref, y, scrollYProgress };
}

export function Parallax({
  children,
  className,
  speed = 0.5,
  direction = "up",
}: ParallaxProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "up"
      ? [100 * speed, -100 * speed]
      : [-100 * speed, 100 * speed]
  );

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

type ScaleOnScrollProps = {
  children: ReactNode;
  className?: string;
  inputRange?: [number, number];
  outputRange?: [number, number];
};

export function ScaleOnScroll({
  children,
  className,
  inputRange = [0, 0.5],
  outputRange = [0.8, 1],
}: ScaleOnScrollProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const scale = useTransform(scrollYProgress, inputRange, outputRange);
  const opacity = useTransform(scrollYProgress, inputRange, [0, 1]);

  return (
    <motion.div ref={ref} style={{ scale, opacity }} className={className}>
      {children}
    </motion.div>
  );
}

type HorizontalScrollProps = {
  children: ReactNode;
  className?: string;
  distance?: number;
};

export function HorizontalScroll({
  children,
  className,
  distance = 200,
}: HorizontalScrollProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <motion.div ref={ref} style={{ x }} className={className}>
      {children}
    </motion.div>
  );
}

export { type MotionValue };
