"use client";

import { useRef, useCallback, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  tiltStrength?: number;
  glareOpacity?: number;
  scaleOnHover?: number;
};

export function TiltCard({
  children,
  className,
  tiltStrength = 15,
  glareOpacity = 0.15,
  scaleOnHover = 1.03,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 25, mass: 0.5 });
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 25, mass: 0.5 });

  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const springGlareX = useSpring(glareX, { stiffness: 200, damping: 20 });
  const springGlareY = useSpring(glareY, { stiffness: 200, damping: 20 });

  const glareBackground = useTransform(
    [springGlareX, springGlareY],
    ([gx, gy]) =>
      `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,${glareOpacity}), transparent 60%)`
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      rotateX.set((y - 0.5) * -tiltStrength);
      rotateY.set((x - 0.5) * tiltStrength);
      glareX.set(x * 100);
      glareY.set(y * 100);
    },
    [rotateX, rotateY, glareX, glareY, tiltStrength]
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    glareX.set(50);
    glareY.set(50);
  }, [rotateX, rotateY, glareX, glareY]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      whileHover={{ scale: scaleOnHover }}
      transition={{ scale: { type: "spring", stiffness: 300, damping: 20 } }}
      className={className}
    >
      {children}
      <motion.div
        style={{ background: glareBackground }}
        className="absolute inset-0 rounded-2xl pointer-events-none"
      />
    </motion.div>
  );
}
