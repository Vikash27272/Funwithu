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
      className="mx-auto max-w-4xl rounded-[2rem] border border-[#d9a7b1]/40 bg-[linear-gradient(180deg,rgba(255,253,253,0.94),rgba(255,241,244,0.94))] p-6 shadow-[0_24px_70px_rgba(88,18,33,0.10)] backdrop-blur sm:p-8"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-[#e8c4cb] bg-white px-4 py-2 text-sm text-[#84424f]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#ecc4cb] bg-white px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#8d4858]">
          <HeartHandshake className="h-4 w-4" />
          Couple Setup
        </div>
      </div>

      <div className="mb-8 space-y-3">
        <h2 className="font-display text-4xl text-[#5f1626]">Name both players</h2>
        <p className="max-w-2xl text-sm leading-7 text-[#85505c] sm:text-base">
          These names personalize the board, the custom editor, and the in-game
          prompts. You can always edit tasks again later before or during the match.
        </p>
      </div>

      <form
        className="grid gap-5 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          setPlayerNames(maleName, femaleName);
          onContinue();
        }}
      >
        <label className="space-y-2">
          <span className="text-sm font-medium text-[#8a4958]">Male Name</span>
          <input
            value={maleName}
            onChange={(event) => setMaleName(event.target.value)}
            placeholder="Aarav"
            className="w-full rounded-2xl border border-[#ebc8cf] bg-white px-4 py-3 text-[#4b1824] outline-none transition placeholder:text-[#c39ba4] focus:border-[#c85f73]"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[#8a4958]">Female Name</span>
          <input
            value={femaleName}
            onChange={(event) => setFemaleName(event.target.value)}
            placeholder="Anaya"
            className="w-full rounded-2xl border border-[#ebc8cf] bg-white px-4 py-3 text-[#4b1824] outline-none transition placeholder:text-[#c39ba4] focus:border-[#c85f73]"
          />
        </label>

        <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            className="rounded-full bg-[linear-gradient(135deg,#c84d63,#7f1d2d)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(127,29,45,0.22)]"
          >
            Continue To Game Selection
          </button>
        </div>
      </form>
    </motion.section>
  );
}
