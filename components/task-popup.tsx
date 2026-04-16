"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SkipForward } from "lucide-react";
import Image from "next/image";
import type { PendingTask, PlayerState } from "@/types/game";
import { getDisplayName, getSkipAllowance } from "@/utils/game-logic";

interface TaskPopupProps {
  pendingTask: PendingTask | null;
  players: Record<"male" | "female", PlayerState>;
  clearedPlayers: Record<"male" | "female", boolean>;
  onAccept: () => void;
  onSkip: () => void;
}

export function TaskPopup({
  pendingTask,
  players,
  clearedPlayers,
  onAccept,
  onSkip,
}: TaskPopupProps) {
  const canSkip =
    pendingTask !== null &&
    players[pendingTask.player].skipsUsed <
      getSkipAllowance(pendingTask.player, clearedPlayers);

  if (!pendingTask) {
    return null;
  }

  const taskGiver = pendingTask.task.author;
  const taskDoer = pendingTask.task.target;
  const isFemaleDominant = taskGiver === "female";
  const duoImagePath = isFemaleDominant
    ? "/images/profiles/female-sample-profile.jpg"
    : "/images/profiles/male-sample-profile.jpg";
  const dominantLabel = isFemaleDominant ? "Queen leads" : "King leads";
  const performerLabel = taskDoer === "female" ? "Queen performs" : "King performs";
  const theme = isFemaleDominant
    ? {
        frame: "bg-[linear-gradient(135deg,#ef6b82,#7f1d2d)]",
        shell:
          "bg-[linear-gradient(180deg,rgba(255,246,248,0.97),rgba(255,231,237,0.95))]",
        merged:
          "border-[#f2c7d0] bg-[linear-gradient(135deg,#fff8fa_0%,#ffe8ee_50%,#fff8fa_100%)]",
        divider: "border-[#f4d8de]",
        title: "text-[#6b2032]",
        eyebrow: "text-[#b86d7d]",
        meta: "text-[#b16476]",
        spot: "border-[#f0cbd3] bg-white/88 text-[#974b5c]",
        primary: "bg-[linear-gradient(135deg,#c84d63,#7f1d2d)]",
        secondary: "border-[#efc7d0] text-[#894453]",
        chip: "bg-[linear-gradient(135deg,#d85f77,#8f1732)]",
      }
    : {
        frame: "bg-[linear-gradient(135deg,#70a1ff,#2d55cc)]",
        shell:
          "bg-[linear-gradient(180deg,rgba(246,250,255,0.97),rgba(231,240,255,0.95))]",
        merged:
          "border-[#cfddff] bg-[linear-gradient(135deg,#f8fbff_0%,#e9f2ff_50%,#f8fbff_100%)]",
        divider: "border-[#dde8ff]",
        title: "text-[#2347aa]",
        eyebrow: "text-[#7187c3]",
        meta: "text-[#607ac1]",
        spot: "border-[#cdddff] bg-white/88 text-[#2d55cc]",
        primary: "bg-[linear-gradient(135deg,#5a8fff,#2d55cc)]",
        secondary: "border-[#cdddff] text-[#2d55cc]",
        chip: "bg-[linear-gradient(135deg,#5a8fff,#2442a9)]",
      };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(18,3,7,0.34)] p-3 backdrop-blur-sm sm:p-5"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 14 }}
          transition={{ type: "spring", stiffness: 130, damping: 16 }}
          className={`w-full max-w-6xl rounded-[2rem] p-[2px] shadow-[0_38px_110px_rgba(88,18,33,0.24)] ${theme.frame}`}
        >
          <div
            className={`rounded-[calc(2rem-2px)] border border-white/60 p-4 backdrop-blur-xl sm:p-6 ${theme.shell}`}
          >
            <div className="mb-4">
              <p className={`text-xs uppercase tracking-[0.24em] ${theme.eyebrow}`}>
                Premium Task Card
              </p>
              <h3 className={`mt-2 font-display text-3xl sm:text-4xl ${theme.title}`}>
                {getDisplayName(taskDoer, players[taskDoer].name)}, your move
              </h3>
            </div>

            <div
              className={`overflow-hidden rounded-[1.95rem] border shadow-[0_24px_48px_rgba(88,18,33,0.10)] ${theme.merged}`}
            >
              <div className="grid lg:min-h-[27rem] lg:grid-cols-[1fr_1.35fr]">
                <div className="relative min-h-[18rem] lg:min-h-full">
                  <Image
                    src={duoImagePath}
                    alt={`${taskGiver === "female" ? "Female" : "Male"} dominant sample task card image`}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 38vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04),rgba(255,255,255,0.00))]" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white ${theme.chip}`}
                    >
                      {dominantLabel}
                    </span>
                    <span className="rounded-full border border-white/80 bg-white/88 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[#6f4251]">
                      {performerLabel}
                    </span>
                  </div>
                </div>

                <div
                  className={`flex flex-col justify-center border-t px-5 py-6 text-center lg:border-l lg:border-t-0 sm:px-8 ${theme.divider}`}
                >
                  <p className={`text-xs uppercase tracking-[0.22em] ${theme.meta}`}>
                    {dominantLabel} | {performerLabel}
                  </p>
                  <div className="mt-5 flex justify-center">
                    <span
                      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] ${theme.spot}`}
                    >
                      Spot {pendingTask.task.position}
                    </span>
                  </div>
                  <p className="mt-5 text-lg font-medium leading-9 text-black sm:text-[2rem] sm:leading-[3rem]">
                    {pendingTask.task.task ||
                      "This slot is empty. Use this turn as a free romantic improv moment."}
                  </p>
                  <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={onAccept}
                      className={`rounded-full px-7 py-3 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(127,29,45,0.18)] ${theme.primary}`}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={onSkip}
                      disabled={!canSkip}
                      className={`inline-flex items-center gap-2 rounded-full border bg-white/84 px-7 py-3 text-sm font-semibold backdrop-blur-md disabled:cursor-not-allowed disabled:opacity-40 ${theme.secondary}`}
                    >
                      <SkipForward className="h-4 w-4" />
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
