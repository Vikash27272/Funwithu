"use client";

import { motion } from "framer-motion";

interface ParticleBurstProps {
  trigger: boolean;
}

const PARTICLES = [
  { x: -20, y: -22, size: "h-1.5 w-1.5", color: "bg-yellow-300", delay: 0 },
  { x: 10, y: -28, size: "h-2 w-2", color: "bg-white", delay: 0.02 },
  { x: 24, y: -18, size: "h-1.5 w-1.5", color: "bg-yellow-400", delay: 0.04 },
  { x: -28, y: -8, size: "h-2 w-2", color: "bg-white", delay: 0.01 },
  { x: 30, y: -2, size: "h-1.5 w-1.5", color: "bg-yellow-300", delay: 0.06 },
  { x: -18, y: 10, size: "h-2 w-2", color: "bg-yellow-400", delay: 0.03 },
  { x: 18, y: 12, size: "h-1.5 w-1.5", color: "bg-white", delay: 0.05 },
  { x: -8, y: 24, size: "h-1.5 w-1.5", color: "bg-yellow-300", delay: 0.07 },
  { x: 8, y: 26, size: "h-2 w-2", color: "bg-white", delay: 0.08 },
  { x: -32, y: 4, size: "h-1.5 w-1.5", color: "bg-yellow-400", delay: 0.02 },
  { x: 0, y: -32, size: "h-2 w-2", color: "bg-white", delay: 0.05 },
  { x: 32, y: 8, size: "h-1.5 w-1.5", color: "bg-yellow-300", delay: 0.09 },
];

export default function ParticleBurst({ trigger }: ParticleBurstProps) {
  if (!trigger) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      {PARTICLES.map((particle, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.2, 1, 0.35],
            x: particle.x,
            y: particle.y,
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
            delay: particle.delay,
          }}
          className={`absolute rounded-full shadow-[0_0_10px_rgba(255,234,150,0.65)] ${particle.size} ${particle.color}`}
        />
      ))}
    </div>
  );
}
