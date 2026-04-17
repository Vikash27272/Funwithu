"use client";

import { motion } from "framer-motion";
import { Heart, Radio } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface LandingHeroProps {
  onStartOffline: () => void;
  onStartOnline: () => void;
}

export function LandingHero({
  onStartOffline,
  onStartOnline,
}: LandingHeroProps) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      <Image
        src="/images/usage/hero/landing-hero-couple__required-1200x1600.jpg"
        alt="Romantic couple background"
        fill
        priority
        unoptimized
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <Image
        src="/images/hero-floating-hearts-bg.jpg"
        alt="Soft heart glow texture"
        fill
        unoptimized
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover object-center opacity-20 mix-blend-screen"
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.64)_0%,rgba(0,0,0,0.42)_28%,rgba(10,0,6,0.62)_60%,rgba(0,0,0,0.82)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,74,133,0.18),transparent_26%),radial-gradient(circle_at_bottom,rgba(255,74,133,0.16),transparent_34%)]" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff3e80]/10 blur-[140px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-[3rem] bg-white/6 blur-[110px]" />

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 py-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <motion.div
            whileHover={{ scale: 1.015, y: -2 }}
            transition={{ duration: 0.2 }}
            className="relative mt-16 overflow-visible rounded-[2rem] border border-white/20 bg-white/10 px-6 pb-6 pt-12 shadow-[0_0_30px_rgba(255,0,100,0.15),0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.03)_55%,rgba(255,255,255,0.04)_100%)]" />
            <div className="pointer-events-none absolute inset-[1px] rounded-[calc(2rem-1px)] border border-white/8" />

            <div className="relative flex w-full flex-col items-center justify-center gap-4">
              <motion.div
                animate={{
                  scale: [1, 1.04, 1],
                  opacity: [0.9, 1, 0.9],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2"
              >
                {logoFailed ? (
                  <svg
                    width="144"
                    height="144"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-label="Fun With U logo fallback"
                    className="drop-shadow-[0_0_20px_rgba(255,255,255,0.98)]"
                  >
                    <path
                      d="M12 21s-6-4.35-9-8.5C-1 7 3 2 7.5 5.5L12 9l4.5-3.5C21 2 25 7 21 12.5 18 16.65 12 21 12 21z"
                      fill="url(#hero-logo-gradient)"
                    />
                    <defs>
                      <linearGradient
                        id="hero-logo-gradient"
                        x1="0"
                        y1="0"
                        x2="24"
                        y2="24"
                      >
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="55%" stopColor="#ffe6f1" />
                        <stop offset="100%" stopColor="#ff6aa6" />
                      </linearGradient>
                    </defs>
                  </svg>
                ) : (
                  <motion.img
                    src="/images/logo-heart.jpg"
                    alt="Fun With U logo"
                    className="h-32 w-32 object-contain opacity-100 brightness-[1.28] contrast-[1.12] saturate-[0.7] drop-shadow-[0_0_18px_rgba(255,255,255,0.98)] sm:h-40 sm:w-40"
                    style={{
                      filter:
                        "brightness(1.28) contrast(1.12) saturate(0.7) drop-shadow(0 0 18px rgba(255,255,255,0.98)) drop-shadow(0 0 34px rgba(255,255,255,0.78)) drop-shadow(0 0 52px rgba(255,210,232,0.62))",
                    }}
                    onError={() => setLogoFailed(true)}
                  />
                )}
              </motion.div>

              <div className="flex w-full flex-col items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-white/84 sm:text-sm">
                  FUN WITH U
                </p>

                <h1 className="max-w-[12ch] text-4xl font-black leading-[0.9] tracking-[-0.05em] text-white [text-shadow:0_8px_28px_rgba(0,0,0,0.45)] sm:text-5xl">
                  Couple games together.
                </h1>
              </div>

              <div className="flex w-full max-w-sm flex-col gap-3 pt-2">
                <motion.button
                  type="button"
                  onClick={onStartOffline}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 px-6 py-2.5 text-base font-semibold text-white shadow-[0_0_25px_rgba(255,0,100,0.5),0_16px_34px_rgba(236,72,153,0.4)]"
                >
                  <Heart className="h-4 w-4" />
                  Play Offline
                </motion.button>

                <motion.button
                  type="button"
                  onClick={onStartOnline}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-base font-semibold text-white/92 shadow-[0_12px_28px_rgba(0,0,0,0.28)] backdrop-blur-md"
                >
                  <Radio className="h-4 w-4" />
                  Play Online
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
