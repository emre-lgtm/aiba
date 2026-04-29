"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, type Variants } from "framer-motion";

const MotionDiv = motion.div;
const MotionSection = motion.section;
const MotionArticle = motion.article;
const MotionHeader = motion.header;
const MotionFooter = motion.footer;
const MotionSpan = motion.span;

const COMPONENT_MAP = {
  div: MotionDiv,
  section: MotionSection,
  article: MotionArticle,
  header: MotionHeader,
  footer: MotionFooter,
  span: MotionSpan,
} as const;

type MotionRevealProps = {
  children: ReactNode;
  variants?: Variants;
  delay?: number;
  className?: string;
  once?: boolean;
  margin?: string;
  as?: keyof typeof COMPONENT_MAP;
};

export function MotionReveal({
  children,
  variants,
  delay = 0,
  className,
  once = true,
  margin = "-80px",
  as = "div",
}: MotionRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: margin as "-80px" });
  const Component = COMPONENT_MAP[as];

  return (
    <Component
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      custom={delay}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </Component>
  );
}
