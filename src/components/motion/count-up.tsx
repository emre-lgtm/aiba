"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { springs } from "@/lib/motion";

type CountUpProps = {
  target: string;
  duration?: number;
  className?: string;
  suffix?: string;
};

function parseNumericValue(val: string): { num: number; prefix: string; suffix: string } {
  const match = val.match(/^([^0-9]*)(\d+)(.*)$/);
  if (!match) return { num: 0, prefix: "", suffix: "" };
  return { num: parseInt(match[2], 10), prefix: match[1], suffix: match[3] };
}

export function CountUp({ target, duration = 2, className, suffix }: CountUpProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState<string | null>(null);
  const { num, prefix, suffix: parsedSuffix } = parseNumericValue(target);
  const finalSuffix = suffix ?? parsedSuffix;

  useEffect(() => {
    if (!isInView) return;
    if (num === 0) return;

    let start: number | null = null;
    let rafId: number;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * num);
      setDisplay(`${prefix}${current}${finalSuffix}`);

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, num, duration, prefix, finalSuffix]);

  const output = display ?? (isInView ? target : `${prefix}0${finalSuffix}`);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={springs.bouncy}
    >
      {output}
    </motion.span>
  );
}
