"use client";

import { motion } from "framer-motion";
import { Heart, Radio } from "lucide-react";
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
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <img
        src="/images/hero-couple.jpg"
        alt="Couple"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_34%),radial-gradient(circle_at_bottom,rgba(255,184,198,0.18),transparent_36%)]" />

      <div className="pointer-events-none absolute inset-x-0 bottom-[-14%] mx-auto h-[18rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.25),rgba(255,160,190,0.18)_48%,transparent_72%)] blur-3xl sm:h-[22rem] sm:w-[32rem]" />

      <div className="relative flex h-full w-full items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          className="absolute h-72 w-72 rounded-full bg-pink-500/30 blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          style={{ top: "20%", left: "10%" }}
        />
        <motion.div
          className="absolute h-72 w-72 rounded-full bg-red-500/30 blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          style={{ bottom: "10%", right: "10%" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.12)_54%,rgba(255,255,255,0.06)_100%)] p-6 text-center shadow-[0_10px_40px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-[16px] sm:p-8"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.05))]" />
          <div className="pointer-events-none absolute inset-[1px] rounded-[calc(1.5rem-1px)] border border-white/8" />

          <div className="relative flex flex-col items-center space-y-5">
            {logoFailed ? (
              <motion.div
                className="mb-3 flex min-h-16 justify-center"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.9, 1, 0.9],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-label="Fun With U logo fallback"
                  className="drop-shadow-[0_0_20px_rgba(255,0,100,0.8)]"
                >
                  <path
                    d="M12 21s-6-4.35-9-8.5C-1 7 3 2 7.5 5.5L12 9l4.5-3.5C21 2 25 7 21 12.5 18 16.65 12 21 12 21z"
                    fill="url(#hero-logo-gradient)"
                  />
                  <defs>
                    <linearGradient id="hero-logo-gradient" x1="0" y1="0" x2="24" y2="24">
                      <stop offset="0%" stopColor="#ff4d6d" />
                      <stop offset="100%" stopColor="#ff1e56" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            ) : (
              <motion.img
                src="/images/logo-heart.jpg"
                alt="Fun With U logo"
                className="mx-auto mb-3 h-16 w-16 object-contain drop-shadow-[0_0_20px_rgba(255,0,100,0.8)]"
                onError={() => setLogoFailed(true)}
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.9, 1, 0.9],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="space-y-4"
            >
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.38em] text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]">
                FUN WITH U
              </p>

              <h1 className="font-display text-[clamp(2.35rem,7vw,3.8rem)] leading-[0.94] tracking-[-0.04em] text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]">
                Couple games together.
              </h1>

              <p className="mx-auto max-w-sm text-sm leading-7 text-white/80 [text-shadow:0_1px_6px_rgba(0,0,0,0.4)] sm:text-base">
                Pick a mode and jump into your game.
              </p>
            </motion.div>

            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {["FOR TWO", "TRUTH", "DARE"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className="rounded-full border border-white/30 bg-white/8 px-4 py-1 text-sm font-medium tracking-[0.18em] text-white/82 transition hover:border-white/50 hover:bg-white/14 hover:shadow-[0_0_24px_rgba(255,110,146,0.18)]"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex w-full flex-col gap-3">
              <motion.button
                type="button"
                onClick={onStartOffline}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[linear-gradient(135deg,#ff3b5c,#ff6b81)] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_25px_rgba(255,59,92,0.3)] transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Heart className="h-4 w-4" />
                Play Offline
              </motion.button>

              <motion.button
                type="button"
                onClick={onStartOnline}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-white/30 bg-white/15 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Radio className="h-4 w-4" />
                Play Online
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
