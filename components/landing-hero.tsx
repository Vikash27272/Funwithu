"use client";

import { motion } from "framer-motion";
import { Heart, Radio, Sparkles } from "lucide-react";

interface LandingHeroProps {
  onStartOffline: () => void;
  onStartOnline: () => void;
}

export function LandingHero({
  onStartOffline,
  onStartOnline,
}: LandingHeroProps) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.07),transparent_18%),radial-gradient(circle_at_50%_100%,rgba(35,10,16,0.42),transparent_44%)]" />
        <div className="absolute inset-x-[8%] top-[8%] h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
      </div>

      <div className="relative flex h-full w-full items-center justify-center">
        <div className="pointer-events-none absolute left-1/2 top-[calc(50%+clamp(124px,18vh,176px))] h-[clamp(180px,24vw,300px)] w-[min(78vw,820px)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.34)_0%,rgba(59,130,246,0.20)_24%,rgba(244,63,94,0.28)_56%,rgba(127,29,29,0.10)_76%,transparent_100%)] opacity-90 blur-[64px] home-glow-pulse" />

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="home-card-breathe relative w-full max-w-[1040px] overflow-hidden rounded-[28px] border border-white/14 bg-[linear-gradient(160deg,rgba(255,255,255,0.14),rgba(255,255,255,0.07))] px-6 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-[22px] sm:px-8 sm:py-9 md:grid md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-8 lg:px-12 lg:py-11"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.10),transparent_24%)]" />
          <div className="pointer-events-none absolute inset-[1px] rounded-[27px] border border-white/8" />

          <div className="relative flex min-h-0 flex-col items-center text-center md:items-start md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.34em] text-white/72 backdrop-blur-md">
              <Heart className="h-4 w-4 text-[#fda4af]" />
              Fun With U
            </div>

            <h1 className="mt-6 max-w-[10ch] text-[clamp(2.85rem,9vw,6.1rem)] font-black leading-[0.88] tracking-[-0.06em] text-white">
              Couple games together.
            </h1>

            <p className="mt-4 max-w-xl text-[clamp(0.96rem,2.5vw,1.12rem)] leading-relaxed text-white/72">
              Pick a mode and jump into your game.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              {["For Two", "Truth", "Dare"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-black/12 px-3 py-2 text-xs uppercase tracking-[0.22em] text-white/60"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <motion.button
                type="button"
                onClick={onStartOffline}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                className="group inline-flex min-h-[3.25rem] items-center justify-center gap-3 rounded-full bg-[linear-gradient(135deg,#ffd7df,#ff8aa2_18%,#ff4d72_58%,#cf1f46_100%)] px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(255,77,114,0.34)]"
              >
                <Heart className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Play Offline
              </motion.button>

              <motion.button
                type="button"
                onClick={onStartOnline}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                className="group inline-flex min-h-[3.25rem] items-center justify-center gap-3 rounded-full border border-white/14 bg-white/10 px-7 py-3 text-sm font-semibold text-white/92 shadow-[0_12px_30px_rgba(0,0,0,0.20)] backdrop-blur-md"
              >
                <Radio className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                Play Online
              </motion.button>
            </div>
          </div>

          <div className="relative mt-8 hidden min-h-[22rem] md:flex md:items-center md:justify-center">
            <div className="absolute h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.16),rgba(255,255,255,0.04)_45%,transparent_72%)] blur-xl" />
            <div className="absolute h-[12rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.18),rgba(244,63,94,0.16)_56%,transparent_80%)] blur-3xl" />

            <div className="relative grid w-full max-w-[24rem] gap-4">
              <div className="rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.07))] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.20)] backdrop-blur-xl">
                <p className="text-[0.68rem] uppercase tracking-[0.32em] text-white/55">
                  Start Here
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { label: "Offline", tone: "from-[#fda4af] to-[#fb7185]" },
                    { label: "Online", tone: "from-[#7dd3fc] to-[#60a5fa]" },
                    { label: "Games", tone: "from-[#fca5a5] to-[#ef4444]" },
                    { label: "Couple", tone: "from-[#93c5fd] to-[#38bdf8]" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[18px] border border-white/10 bg-black/10 p-3"
                    >
                      <div className={`h-1.5 rounded-full bg-gradient-to-r ${item.tone}`} />
                      <p className="mt-3 text-sm font-medium text-white/84">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-[22px] border border-white/10 bg-black/12 px-5 py-4 backdrop-blur-md">
                <div>
                  <p className="text-[0.64rem] uppercase tracking-[0.28em] text-white/46">
                    Game Hub
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    Tap and open the next screen.
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <Sparkles className="h-5 w-5 text-white/84" />
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
