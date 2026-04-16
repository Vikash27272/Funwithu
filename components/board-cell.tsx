"use client";

import { motion } from "framer-motion";
import type { PlayerKey } from "@/types/game";

interface BoardCellProps {
  number: number;
  opened: boolean;
  opening: boolean;
  femaleHere: boolean;
  maleHere: boolean;
  highlightedPlayer: PlayerKey | null;
  activePlayer: PlayerKey;
}

function BoardToken({
  player,
  active,
}: {
  player: PlayerKey;
  active: boolean;
}) {
  const icon = player === "female" ? "\u{1F451}" : "\u{1F934}";

  return (
    <motion.div
      layout
      layoutId={`board-token-${player}`}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      className="relative"
    >
      <span
        className={`relative inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] text-white shadow-[0_6px_14px_rgba(38,16,20,0.18)] sm:h-6 sm:w-6 sm:text-[11px] lg:h-7 lg:w-7 lg:text-xs ${
          player === "female"
            ? "border-[#ef90a4] bg-[linear-gradient(145deg,#ffc1cf,#d4516b)]"
            : "border-[#93b6ff] bg-[linear-gradient(145deg,#80a9ff,#2d55cc)]"
        } ${active ? "ring-2 ring-white/70" : ""}`}
      >
        {icon}
      </span>
    </motion.div>
  );
}

export function BoardCell({
  number,
  opened,
  opening,
  femaleHere,
  maleHere,
  highlightedPlayer,
  activePlayer,
}: BoardCellProps) {
  const tokens: PlayerKey[] = [];

  if (femaleHere) {
    tokens.push("female");
  }

  if (maleHere) {
    tokens.push("male");
  }

  return (
    <motion.div
      animate={
        opening
          ? {
              scale: [1, 1.08, 1],
              boxShadow: [
                "0 8px 18px rgba(127,29,45,0.06)",
                "0 0 0 4px rgba(255,255,255,0.34)",
                "0 8px 18px rgba(127,29,45,0.06)",
              ],
            }
          : {
              scale: 1,
              boxShadow: "0 6px 14px rgba(127,29,45,0.04)",
            }
      }
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-[0.8rem] text-[10px] font-semibold sm:rounded-[0.95rem] sm:text-xs"
    >
      <div
        className={`absolute inset-0 rounded-[0.8rem] border transition-colors sm:rounded-[0.95rem] ${
          opened
            ? "border-white/90 bg-white/28"
            : "border-white/72 bg-white/10"
        }`}
      />
      <div
        className={`absolute inset-[3px] rounded-[0.65rem] sm:rounded-[0.8rem] ${
          opened
            ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.26),rgba(255,255,255,0.12))]"
            : "bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04))]"
        }`}
      />
      <span
        className={`relative z-10 inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-white/85 bg-white/96 px-1.5 text-[9px] font-semibold text-black shadow-[0_8px_16px_rgba(39,16,22,0.12)] sm:h-7 sm:min-w-7 sm:text-[10px] lg:h-8 lg:min-w-8 lg:text-xs ${
          opened
            ? "ring-2 ring-white/45"
            : ""
        }`}
      >
        {number}
      </span>

      <div
        className="absolute inset-x-0 bottom-1 z-20 flex items-center justify-center gap-0.5 sm:bottom-1.5 sm:gap-1"
      >
        {tokens.map((player) => (
          <BoardToken
            key={`${number}-${player}`}
            player={player}
            active={player === activePlayer || player === highlightedPlayer}
          />
        ))}
      </div>
    </motion.div>
  );
}
