"use client";

import { motion } from "framer-motion";
import { ChevronLeft, LayoutGrid, WandSparkles } from "lucide-react";
import type { Difficulty, ModeType } from "@/types/game";
import { DIFFICULTY_META } from "@/utils/game-logic";
import { useGameStore } from "@/utils/game-store";
import { TaskEditor } from "@/components/task-editor";

interface ModeSelectionProps {
  onBack: () => void;
}

export function ModeSelection({ onBack }: ModeSelectionProps) {
  const mode = useGameStore((state) => state.mode);
  const difficulty = useGameStore((state) => state.difficulty);
  const entryMode = useGameStore((state) => state.entryMode);
  const onlineRoom = useGameStore((state) => state.onlineRoom);
  const setMode = useGameStore((state) => state.setMode);
  const setDifficulty = useGameStore((state) => state.setDifficulty);
  const startGame = useGameStore((state) => state.startGame);

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
          Select Mode
        </p>
      </div>

      {entryMode === "online" && onlineRoom ? (
        <div className="rounded-[1.5rem] border border-[#e7c2ca] bg-white/80 px-5 py-4 text-sm leading-7 text-[#85505c]">
          <span className="font-semibold text-[#6f2536]">{onlineRoom.name}</span> is live
          on room code <span className="font-semibold text-[#6f2536]">{onlineRoom.code}</span>.
          Choose the difficulty and then start the shared Dice & Dare match.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5 rounded-[2rem] border border-[#d9a8b1]/40 bg-[linear-gradient(180deg,rgba(255,253,253,0.94),rgba(255,241,244,0.94))] p-6 shadow-[0_24px_70px_rgba(88,18,33,0.10)]">
          <div className="flex flex-wrap gap-3">
            {[
              { key: "preset", icon: LayoutGrid, label: "Preset Difficulty" },
              { key: "custom", icon: WandSparkles, label: "Custom Mode" },
            ].map((item) => {
              const Icon = item.icon;
              const selected = mode === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setMode(item.key as ModeType)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selected
                      ? "bg-[linear-gradient(135deg,#c84d63,#7f1d2d)] text-white shadow-[0_14px_30px_rgba(127,29,45,0.22)]"
                      : "border border-[#e4bcc4] bg-white text-[#83404f]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="rounded-[1.75rem] border border-[#ebcad0] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#a25f6d]">
              Current Mode
            </p>
            <h2 className="mt-3 font-display text-4xl text-[#5f1626]">
              {mode === "preset" ? "Preset Deck" : "Custom Couple Board"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#85505c]">
              {mode === "preset"
                ? "Choose a preset intensity and launch instantly. Great for first-time rounds."
                : "Build your own shared board experience with two editable prompt decks."}
            </p>
          </div>

          {mode === "preset" ? (
            <div className="grid gap-3">
              {(Object.entries(DIFFICULTY_META) as Array<
                [string, (typeof DIFFICULTY_META)[Difficulty]]
              >).map(([level, meta]) => {
                const numericLevel = Number(level) as Difficulty;
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
                    <div
                      className={`mb-3 h-2 rounded-full bg-gradient-to-r ${meta.accent}`}
                    />
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
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-[#ebcad0] bg-white p-5 text-sm leading-6 text-[#85505c]">
              Both players share the same 1 to 50 board. Drag rows inside the
              editor to reorder each player&apos;s prompt deck independently.
            </div>
          )}

          <button
            type="button"
            onClick={startGame}
            className="w-full rounded-full bg-[linear-gradient(135deg,#c84d63,#7f1d2d)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(127,29,45,0.22)]"
          >
            {entryMode === "online"
              ? mode === "preset"
                ? "Start Room Match"
                : "Launch Custom Room Match"
              : mode === "preset"
                ? "Start Preset Match"
                : "Launch Custom Match"}
          </button>
        </div>

        <div className="rounded-[2rem] border border-[#d9a8b1]/40 bg-[linear-gradient(180deg,rgba(255,253,253,0.94),rgba(255,241,244,0.94))] p-6 shadow-[0_24px_70px_rgba(88,18,33,0.10)]">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#a25f6d]">
              Task Editor
            </p>
            <h3 className="mt-2 font-display text-4xl text-[#5f1626]">
              {mode === "preset" ? "Preview And Tweak Later" : "Shape Every Position"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#85505c]">
              {mode === "preset"
                ? "Preset decks are live immediately, and you can still edit any slot once the round begins."
                : "Paste tasks in bulk, import a CSV, or hand-edit rows right here before you roll."}
            </p>
          </div>

          {mode === "custom" ? (
            <TaskEditor compact />
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-[#ebcad0] bg-white p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#a25f6d]">
                  Start Rule
                </p>
                <p className="mt-3 text-base leading-7 text-[#85505c]">
                  The match starts on the first roll, and the first player to reach 50 wins.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[#ebcad0] bg-white p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#a25f6d]">
                  Board Tracks
                </p>
                <p className="mt-3 text-base leading-7 text-[#85505c]">
                  Both players move on one shared board, but each landing pulls from that player&apos;s own task deck.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-[#ebcad0] bg-white p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#a25f6d]">
                  Skip Limit
                </p>
                <p className="mt-3 text-base leading-7 text-[#85505c]">
                  Every player gets two skips. After that, only accept remains.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
