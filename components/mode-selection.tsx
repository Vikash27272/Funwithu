"use client";

import { motion } from "framer-motion";
import { ChevronLeft, FileSpreadsheet, Play } from "lucide-react";
import type { Difficulty } from "@/types/game";
import { DIFFICULTY_META, getDeckStats } from "@/utils/game-logic";
import { useGameStore } from "@/utils/game-store";

interface ModeSelectionProps {
  onBack: () => void;
}

export function ModeSelection({ onBack }: ModeSelectionProps) {
  const difficulty = useGameStore((state) => state.difficulty);
  const entryMode = useGameStore((state) => state.entryMode);
  const onlineRoom = useGameStore((state) => state.onlineRoom);
  const startGame = useGameStore((state) => state.startGame);
  const setDifficulty = useGameStore((state) => state.setDifficulty);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-[#e4bcc4] bg-white px-4 py-2 text-sm text-[#83404f]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <p className="text-xs uppercase tracking-[0.28em] text-[#d3a1ac]">
          Dirty Dice Setup
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5 rounded-[2rem] border border-[#d9a8b1]/40 bg-[linear-gradient(180deg,rgba(255,253,253,0.94),rgba(255,241,244,0.94))] p-6 shadow-[0_24px_70px_rgba(88,18,33,0.10)]">
          <div className="rounded-[1.75rem] border border-[#ebcad0] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#a25f6d]">
              Difficulty Sheets
            </p>
            <h2 className="mt-3 font-display text-4xl text-[#5f1626]">
              Choose the Dirty Dice deck.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#85505c]">
              Every difficulty pulls tasks from the matching Excel sheet: easy, fun,
              medium, hard, and extreme.
            </p>
          </div>

          <div className="grid gap-3">
            {(Object.entries(DIFFICULTY_META) as Array<
              [string, (typeof DIFFICULTY_META)[Difficulty]]
            >).map(([level, meta]) => {
              const numericLevel = Number(level) as Difficulty;
              const deckStats = getDeckStats(numericLevel);
              const selected = difficulty === numericLevel;

              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(numericLevel)}
                  className={`rounded-[1.5rem] border p-4 text-left transition ${
                    selected
                      ? "border-[#d99aa8] bg-white"
                      : "border-[#ebcad0] bg-[#fff8f9]"
                  }`}
                >
                  <div className={`mb-3 h-2 rounded-full bg-gradient-to-r ${meta.accent}`} />
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-2xl text-[#5f1626]">
                      {level}. {meta.label}
                    </h3>
                    {selected ? (
                      <span className="rounded-full border border-[#edc4cc] bg-[#fff2f5] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#9c4f60]">
                        Selected
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#85505c]">{meta.vibe}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-[#9c5b68]">
                    <span className="rounded-full bg-[#fff2f5] px-3 py-1">
                      Pool {deckStats.availableCount.male} male / {deckStats.availableCount.female} female
                    </span>
                    <span className="rounded-full bg-[#fff2f5] px-3 py-1">
                      Draw {deckStats.actualDrawCount.male} male / {deckStats.actualDrawCount.female} female
                    </span>
                    {deckStats.actualDrawCount.male !== deckStats.configuredDrawCount.male ||
                    deckStats.actualDrawCount.female !== deckStats.configuredDrawCount.female ? (
                      <span className="rounded-full bg-[#fff2f5] px-3 py-1">
                        Target {deckStats.configuredDrawCount.male} / {deckStats.configuredDrawCount.female}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={startGame}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#c84d63,#7f1d2d)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(127,29,45,0.22)]"
          >
            <Play className="h-4 w-4" />
            {entryMode === "online" ? "Start Dirty Dice Match" : "Start Dirty Dice"}
          </button>
        </div>

        <div className="space-y-5 rounded-[2rem] border border-[#d9a8b1]/40 bg-[linear-gradient(180deg,rgba(255,253,253,0.94),rgba(255,241,244,0.94))] p-6 shadow-[0_24px_70px_rgba(88,18,33,0.10)]">
          <div className="rounded-[1.75rem] border border-[#ebcad0] bg-white p-5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,#ffe1e7,#ffc5d0)] text-[#9b4154]">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-[#a25f6d]">
              Excel Source
            </p>
            <h3 className="mt-2 font-display text-4xl text-[#5f1626]">
              One workbook controls all tasks.
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#85505c]">
              Update `data/decks.xlsx`, keep one sheet per difficulty, then import it
              into the game deck file. Each difficulty can keep a larger source pool and
              randomly build a smaller male/female draw set for the match.
            </p>
          </div>

          {entryMode === "online" && onlineRoom ? (
            <div className="rounded-[1.5rem] border border-[#ebcad0] bg-white p-5 text-sm leading-7 text-[#85505c]">
              <span className="font-semibold text-[#6f2536]">{onlineRoom.name}</span> is
              live on room code <span className="font-semibold text-[#6f2536]">{onlineRoom.code}</span>.
              Pick the sheet difficulty, then start the shared Dirty Dice board.
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[1.5rem] border border-[#ebcad0] bg-white p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[#a25f6d]">Board</p>
              <p className="mt-3 text-base leading-7 text-[#85505c]">
                One shared board. Roll, move, land, and resolve the next task.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[#ebcad0] bg-white p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[#a25f6d]">Win Rule</p>
              <p className="mt-3 text-base leading-7 text-[#85505c]">
                The first player to reach tile 50 wins the round.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[#ebcad0] bg-white p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[#a25f6d]">Skips</p>
              <p className="mt-3 text-base leading-7 text-[#85505c]">
                Every player gets two skips before accept becomes the only option.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
