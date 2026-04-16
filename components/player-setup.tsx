"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, HeartHandshake } from "lucide-react";
import { useGameStore } from "@/utils/game-store";

interface PlayerSetupProps {
  onBack: () => void;
  onContinue: () => void;
}

export function PlayerSetup({ onBack, onContinue }: PlayerSetupProps) {
  const players = useGameStore((state) => state.players);
  const setPlayerNames = useGameStore((state) => state.setPlayerNames);
  const [maleName, setMaleName] = useState(players.male.name);
  const [femaleName, setFemaleName] = useState(players.female.name);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#b9475b]/30 bg-[linear-gradient(140deg,rgba(49,8,17,0.98),rgba(112,16,34,0.95)_42%,rgba(155,31,55,0.92)_100%)] shadow-[0_28px_80px_rgba(34,4,10,0.42)]"
    >
      <div className="relative overflow-hidden px-5 py-5 sm:px-7 sm:py-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,214,224,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,147,173,0.16),transparent_32%)]" />

        <div className="relative mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/92 backdrop-blur-md"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-[0.68rem] uppercase tracking-[0.28em] text-white/80 backdrop-blur-md">
            <HeartHandshake className="h-4 w-4" />
            Couple Setup
          </div>
        </div>

        <div className="relative grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-3">
            <p className="text-[0.7rem] uppercase tracking-[0.32em] text-[#ffd5df]">
              Offline Entry
            </p>
            <h2 className="font-display text-[clamp(2.3rem,5vw,4.5rem)] leading-[0.92] text-white">
              Add both names and jump in.
            </h2>
            <p className="max-w-xl text-sm leading-6 text-white/72 sm:text-base">
              Short names look best on the board.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Male", value: maleName.trim() || "King" },
              { label: "Female", value: femaleName.trim() || "Queen" },
            ].map((player) => (
              <div
                key={player.label}
                className="rounded-[1.5rem] border border-white/16 bg-white/10 px-4 py-4 backdrop-blur-md"
              >
                <p className="text-[0.64rem] uppercase tracking-[0.26em] text-white/58">
                  {player.label}
                </p>
                <p className="mt-3 truncate font-display text-2xl text-white sm:text-3xl">
                  {player.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <form
          className="relative mt-5 grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            setPlayerNames(maleName, femaleName);
            onContinue();
          }}
        >
          <label className="space-y-2">
            <span className="text-sm font-medium text-white/78">Male Name</span>
            <input
              value={maleName}
              onChange={(event) => setMaleName(event.target.value)}
              placeholder="Aarav"
              className="w-full rounded-[1.4rem] border border-white/16 bg-white/92 px-4 py-3 text-[#4b1824] outline-none transition placeholder:text-[#bf8f9b] focus:border-[#ffc0ce]"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-white/78">Female Name</span>
            <input
              value={femaleName}
              onChange={(event) => setFemaleName(event.target.value)}
              placeholder="Anaya"
              className="w-full rounded-[1.4rem] border border-white/16 bg-white/92 px-4 py-3 text-[#4b1824] outline-none transition placeholder:text-[#bf8f9b] focus:border-[#ffc0ce]"
            />
          </label>

          <div className="flex flex-wrap gap-3 pt-1 sm:col-span-2">
            <button
              type="submit"
              className="rounded-full border border-white/18 bg-[linear-gradient(135deg,#ff7899,#a10f2a)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(27,1,8,0.36)]"
            >
              Continue To Game Selection
            </button>
          </div>
        </form>
      </div>
    </motion.section>
  );
}
