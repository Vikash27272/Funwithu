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
  acceptDisabled?: boolean;
  skipDisabled?: boolean;
  footerNote?: string | null;
}

export function TaskPopup({
  pendingTask,
  players,
  clearedPlayers,
  onAccept,
  onSkip,
  acceptDisabled = false,
  skipDisabled = false,
  footerNote = null,
}: TaskPopupProps) {
  const canSkip =
    pendingTask !== null &&
    players[pendingTask.player].skipsUsed <
      getSkipAllowance(pendingTask.player, clearedPlayers);

  if (!pendingTask) {
    return null;
  }

  const performer = pendingTask.task.performer;
  const performerName = getDisplayName(performer, players[performer].name);
  const imageSrc =
    pendingTask.task.image ||
    (performer === "female"
      ? "/images/usage/task-popup/task-popup-female-performer__required-1600x740.jpg"
      : "/images/usage/task-popup/task-popup-male-performer__required-1600x740.jpg");
  const usesGeneratedArtwork = imageSrc.startsWith("data:image/");
  const roleLabel =
    pendingTask.task.role === "leader" ? "Leader" : "Submissive";
  const theme =
    performer === "female"
      ? {
          frame: "bg-[linear-gradient(135deg,#ef6b82,#7f1d2d)]",
          shell:
            "bg-[linear-gradient(180deg,rgba(255,246,248,0.92),rgba(255,231,237,0.82))]",
          chip: "bg-[linear-gradient(135deg,#d85f77,#8f1732)]",
          overlay:
            "bg-[linear-gradient(180deg,rgba(28,4,10,0.04),rgba(28,4,10,0.18)_34%,rgba(28,4,10,0.58)_78%,rgba(28,4,10,0.74)_100%)]",
          text: "text-white",
          meta: "text-[#f8d5dd]",
          primary: "bg-[linear-gradient(135deg,#c84d63,#7f1d2d)]",
          secondary: "border-[#efc7d0] text-[#894453]",
          note: "text-[#9f5566]",
          backdropPosition: "50% 16%",
          artworkPosition: "center bottom",
        }
      : {
          frame: "bg-[linear-gradient(135deg,#70a1ff,#2d55cc)]",
          shell:
            "bg-[linear-gradient(180deg,rgba(246,250,255,0.92),rgba(231,240,255,0.82))]",
          chip: "bg-[linear-gradient(135deg,#5a8fff,#2442a9)]",
          overlay:
            "bg-[linear-gradient(180deg,rgba(7,20,54,0.04),rgba(7,20,54,0.18)_34%,rgba(7,20,54,0.58)_78%,rgba(7,20,54,0.74)_100%)]",
          text: "text-white",
          meta: "text-[#d9e8ff]",
          primary: "bg-[linear-gradient(135deg,#5a8fff,#2d55cc)]",
          secondary: "border-[#cdddff] text-[#2d55cc]",
          note: "text-[#5f79bf]",
          backdropPosition: "68% 24%",
          artworkPosition: "center center",
        };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[rgba(18,3,7,0.34)] p-2 backdrop-blur-sm sm:p-5"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 14 }}
          transition={{ type: "spring", stiffness: 130, damping: 16 }}
          className={`my-auto w-full max-w-4xl rounded-[2rem] p-[2px] shadow-[0_38px_110px_rgba(88,18,33,0.24)] ${theme.frame}`}
        >
          <div
            className={`max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-[calc(2rem-2px)] border border-white/60 p-3 backdrop-blur-xl sm:max-h-[calc(100dvh-2.5rem)] sm:p-5 ${theme.shell}`}
          >
            <div className="space-y-4 sm:space-y-5">
              <div className="overflow-hidden rounded-[1.85rem] border border-white/65 shadow-[0_20px_40px_rgba(88,18,33,0.12)]">
                <div className="relative min-h-[15rem] bg-[rgba(18,3,7,0.22)] sm:min-h-[21rem] lg:min-h-[26rem]">
                  <div className="absolute inset-0 overflow-hidden">
                    <Image
                      src={imageSrc}
                      alt=""
                      fill
                      aria-hidden="true"
                      unoptimized
                      sizes="(min-width: 1024px) 56vw, 100vw"
                      className="object-cover opacity-40 blur-[10px]"
                      style={{ objectPosition: theme.backdropPosition }}
                    />
                  </div>
                  <div className="absolute inset-3 z-[1] overflow-hidden rounded-[1.5rem] border border-white/18 shadow-[0_18px_40px_rgba(0,0,0,0.14)] sm:inset-4">
                    <Image
                      src={imageSrc}
                      alt={pendingTask.task.title}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 56vw, 100vw"
                      className={usesGeneratedArtwork ? "object-cover" : "object-contain"}
                      style={{
                        objectPosition: usesGeneratedArtwork
                          ? "center center"
                          : theme.artworkPosition,
                      }}
                    />
                  </div>
                  <div className={`absolute inset-0 ${theme.overlay}`} />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_24%)]" />

                  <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-5 lg:p-7">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_10px_20px_rgba(0,0,0,0.18)] ${theme.chip}`}
                      >
                        {performerName}
                      </span>
                      <span className="rounded-full border border-white/28 bg-white/16 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-md">
                        {roleLabel}
                      </span>
                      <span className="rounded-full border border-white/24 bg-black/18 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/92 backdrop-blur-md">
                        Tile {pendingTask.position}
                      </span>
                    </div>

                    <div className="w-fit max-w-[min(100%,30rem)] rounded-[1.35rem] border border-white/14 bg-black/28 px-4 py-3.5 shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:px-5 sm:py-[1.125rem]">
                      <p className={`text-[10px] font-semibold uppercase tracking-[0.24em] ${theme.meta}`}>
                        {roleLabel} task
                      </p>
                      <h3 className={`mt-2.5 font-display text-2xl leading-none sm:text-3xl lg:text-[2.65rem] ${theme.text}`}>
                        {pendingTask.task.title}
                      </h3>
                      <p className={`mt-3.5 max-w-[30rem] text-sm leading-6 sm:text-base sm:leading-7 lg:text-[1.05rem] lg:leading-8 ${theme.text}`}>
                        {pendingTask.task.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 sm:gap-4">
                <div className="flex w-full flex-col items-stretch justify-center gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                  <button
                    type="button"
                    onClick={onAccept}
                    disabled={acceptDisabled}
                    className={`w-full rounded-full px-7 py-3 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(127,29,45,0.18)] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto ${theme.primary}`}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={onSkip}
                    disabled={!canSkip || skipDisabled}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-full border bg-white/84 px-7 py-3 text-sm font-semibold backdrop-blur-md disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto ${theme.secondary}`}
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip
                  </button>
                </div>

                {footerNote ? (
                  <p className={`text-center text-sm leading-6 ${theme.note}`}>{footerNote}</p>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
