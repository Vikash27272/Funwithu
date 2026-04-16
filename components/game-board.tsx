"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { DoorOpen, PencilLine, ScrollText, X } from "lucide-react";
import Image from "next/image";
import { BoardCell } from "@/components/board-cell";
import BoardWrapper from "@/components/board-wrapper";
import { Dice } from "@/components/dice";
import { TaskEditor } from "@/components/task-editor";
import { TaskPopup } from "@/components/task-popup";
import { useGameSounds } from "@/hooks/useGameSounds";
import { getSkipAllowance, getTrackRows } from "@/utils/game-logic";
import { useGameStore } from "@/utils/game-store";
import { vibrate } from "@/utils/haptics";

const trackRows = getTrackRows();
const QUEEN_ICON = "\u{1F451}";
const KING_ICON = "\u{1F934}";
const FILLED_HEART = "\u{1F496}";
const BROKEN_HEART = "\u{1F494}";

function getSkipDisplay(skipsUsed: number, maxSkips: number): string {
  return Array.from({ length: maxSkips }, (_, index) =>
    index < maxSkips - skipsUsed ? FILLED_HEART : BROKEN_HEART,
  ).join(" ");
}

function PlayerPanel({
  role,
  name,
  position,
  skipsUsed,
  maxSkips,
  active,
}: {
  role: "queen" | "king";
  name: string;
  position: number;
  skipsUsed: number;
  maxSkips: number;
  active: boolean;
}) {
  const icon = role === "queen" ? QUEEN_ICON : KING_ICON;
  const theme =
    role === "queen"
      ? {
          image: "/images/profiles/female-sample-profile.jpg",
          border: active ? "border-[#f3bcc9]" : "border-[#efcdd6]",
          glow: active
            ? "0 24px 46px rgba(196,59,96,0.28)"
            : "0 18px 40px rgba(89,32,44,0.14)",
          overlay:
            "bg-[linear-gradient(180deg,rgba(145,17,52,0.14),rgba(120,22,45,0.50)_58%,rgba(86,13,31,0.78)_100%)]",
          chip: "bg-[linear-gradient(135deg,rgba(255,245,247,0.82),rgba(255,224,232,0.74))] text-[#b43d5d] border-[#f3cad4]",
          meta: "text-[#ffe6ee]",
          value: "text-white",
        }
      : {
          image: "/images/profiles/male-sample-profile.jpg",
          border: active ? "border-[#bed7ff]" : "border-[#d4e2fb]",
          glow: active
            ? "0 24px 46px rgba(58,112,228,0.28)"
            : "0 18px 40px rgba(41,57,94,0.14)",
          overlay:
            "bg-[linear-gradient(180deg,rgba(21,74,182,0.12),rgba(22,55,124,0.48)_58%,rgba(16,31,76,0.76)_100%)]",
          chip: "bg-[linear-gradient(135deg,rgba(246,250,255,0.84),rgba(227,238,255,0.76))] text-[#3a70e4] border-[#cfe0ff]",
          meta: "text-[#e4eeff]",
          value: "text-white",
        };

  return (
    <motion.div
      animate={
        active
          ? {
              scale: [1, 1.02, 1],
              boxShadow: [
                "0 18px 24px rgba(73,17,29,0.10)",
                "0 22px 34px rgba(200,77,99,0.24)",
                "0 18px 24px rgba(73,17,29,0.10)",
              ],
            }
          : { scale: 1, boxShadow: "0 18px 24px rgba(73,17,29,0.10)" }
      }
      transition={{
        duration: 1.8,
        repeat: active ? Number.POSITIVE_INFINITY : 0,
        ease: "easeInOut",
      }}
      style={{ boxShadow: theme.glow }}
      className={`relative min-h-[8.1rem] overflow-hidden rounded-[1.5rem] border text-center backdrop-blur-xl sm:min-h-[9rem] sm:rounded-[1.7rem] ${theme.border}`}
    >
      <Image
        src={theme.image}
        alt={`${role} sample profile background`}
        fill
        unoptimized
        sizes="(max-width: 640px) 36vw, 18vw"
        className="object-cover"
      />
      <div className={`absolute inset-0 ${theme.overlay}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_34%)]" />

      <div className="relative flex h-full flex-col justify-between px-3 py-3 sm:px-4 sm:py-3.5">
        <div className="flex items-center gap-2.5 rounded-[1rem] border border-white/18 bg-black/10 px-2.5 py-2 backdrop-blur-[6px]">
          <span className="text-xl sm:text-2xl">{icon}</span>
          <p className="truncate font-display text-xl leading-none text-white sm:text-3xl">
            {name}
          </p>
        </div>

        <div className="space-y-2">
          <div
            className={`mx-auto inline-flex min-w-[3.25rem] items-center justify-center rounded-full border px-3 py-1 text-[0.82rem] font-semibold tracking-[0.22em] shadow-[0_8px_18px_rgba(18,9,14,0.16)] sm:min-w-[3.6rem] sm:text-[0.9rem] ${theme.chip}`}
          >
            {position}
          </div>
          <p className={`text-lg tracking-[0.06em] sm:text-2xl ${theme.meta}`}>
            {getSkipDisplay(skipsUsed, maxSkips)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function SharedBoard({
  femalePosition,
  malePosition,
  openedCells,
  highlightedTile,
  highlightedPlayer,
  activePlayer,
}: {
  femalePosition: number;
  malePosition: number;
  openedCells: Record<number, boolean>;
  highlightedTile: number | null;
  highlightedPlayer: "male" | "female" | null;
  activePlayer: "male" | "female";
}) {
  return (
    <div className="h-full w-full">
      <BoardWrapper>
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(255,248,249,0.52))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_16px_36px_rgba(127,29,45,0.08)] sm:p-4">
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.65rem] border border-white/75 shadow-[0_18px_36px_rgba(127,29,45,0.12)]">
            <Image
              src="/images/board-shared-background.jpg"
              alt="Romantic shared board background"
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02))]" />
            <LayoutGroup id="shared-board">
              <div className="relative grid h-full w-full grid-cols-10 grid-rows-5 gap-1 p-1.5 sm:gap-1.5 sm:p-2.5 lg:gap-2 lg:p-3">
                {trackRows.flatMap((row) =>
                  row.map((cell) => {
                    const femaleHere = femalePosition === cell;
                    const maleHere = malePosition === cell;
                    const landingHighlight = highlightedTile === cell;

                    return (
                      <BoardCell
                        key={cell}
                        number={cell}
                        opened={Boolean(openedCells[cell])}
                        opening={landingHighlight && !openedCells[cell]}
                        femaleHere={femaleHere}
                        maleHere={maleHere}
                        highlightedPlayer={highlightedPlayer}
                        activePlayer={activePlayer}
                      />
                    );
                  }),
                )}
              </div>
            </LayoutGroup>
          </div>
        </div>
      </BoardWrapper>
    </div>
  );
}

export function GameBoard() {
  const { playCard, playDice, playLand, playUnwrap } = useGameSounds();
  const entryMode = useGameStore((state) => state.entryMode);
  const players = useGameStore((state) => state.players);
  const onlineRoom = useGameStore((state) => state.onlineRoom);
  const currentTurn = useGameStore((state) => state.currentTurn);
  const pendingTask = useGameStore((state) => state.pendingTask);
  const queuedTask = useGameStore((state) => state.queuedTask);
  const highlightedTile = useGameStore((state) => state.highlightedTile);
  const highlightedPlayer = useGameStore((state) => state.highlightedPlayer);
  const openedCells = useGameStore((state) => state.openedCells);
  const winner = useGameStore((state) => state.winner);
  const logs = useGameStore((state) => state.logs);
  const logsOpen = useGameStore((state) => state.logsOpen);
  const editorOpen = useGameStore((state) => state.editorOpen);
  const clearedPlayers = useGameStore((state) => state.clearedPlayers);
  const resolveRoll = useGameStore((state) => state.resolveRoll);
  const finishLandingSequence = useGameStore((state) => state.finishLandingSequence);
  const resolvePendingTask = useGameStore((state) => state.resolvePendingTask);
  const continueAfterWin = useGameStore((state) => state.continueAfterWin);
  const toggleLogs = useGameStore((state) => state.toggleLogs);
  const toggleEditor = useGameStore((state) => state.toggleEditor);
  const resetExperience = useGameStore((state) => state.resetExperience);
  const leaveOnlineRoom = useGameStore((state) => state.leaveOnlineRoom);
  const restartMatch = useGameStore((state) => state.restartMatch);
  const [exitOpen, setExitOpen] = useState(false);
  const lastLandingCueRef = useRef<string | null>(null);
  const lastCardCueRef = useRef<string | null>(null);

  useEffect(() => {
    if (!highlightedTile) {
      return;
    }

    const timer = window.setTimeout(() => {
      finishLandingSequence();
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, [finishLandingSequence, highlightedTile, queuedTask]);

  useEffect(() => {
    if (highlightedTile === null || highlightedPlayer === null) {
      return;
    }

    const landingCueKey = `${highlightedPlayer}-${highlightedTile}-${queuedTask?.task.id ?? "empty"}`;

    if (lastLandingCueRef.current === landingCueKey) {
      return;
    }

    lastLandingCueRef.current = landingCueKey;
    const alreadyOpened = Boolean(openedCells[highlightedTile]);
    const landTimer = window.setTimeout(() => {
      vibrate("medium");
      playLand();
    }, 300);
    const unwrapTimer =
      alreadyOpened || !queuedTask
        ? null
        : window.setTimeout(() => {
            vibrate("light");
            playUnwrap();
          }, 420);

    return () => {
      window.clearTimeout(landTimer);

      if (unwrapTimer !== null) {
        window.clearTimeout(unwrapTimer);
      }
    };
  }, [
    highlightedPlayer,
    highlightedTile,
    openedCells,
    playLand,
    playUnwrap,
    queuedTask,
  ]);

  useEffect(() => {
    if (!pendingTask) {
      return;
    }

    const cardCueKey = `${pendingTask.player}-${pendingTask.task.id}`;

    if (lastCardCueRef.current === cardCueKey) {
      return;
    }

    lastCardCueRef.current = cardCueKey;
    const timer = window.setTimeout(() => {
      vibrate("heavy");
      playCard();
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pendingTask, playCard]);

  return (
    <>
      <div className="relative flex h-[var(--app-height,100dvh)] w-full max-w-full min-w-0 flex-col overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_22%),linear-gradient(180deg,#6f1226_0%,#8d1d33_16%,#fdf7f8_16%,#fffafb_100%)] px-3 py-3 sm:px-4 sm:py-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleLogs(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/74 text-[#8a4353] shadow-[0_12px_22px_rgba(127,29,45,0.10)] backdrop-blur-md"
              aria-label="Open logs"
            >
              <ScrollText className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => toggleEditor(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/74 text-[#8a4353] shadow-[0_12px_22px_rgba(127,29,45,0.10)] backdrop-blur-md"
              aria-label="Edit tasks"
            >
              <PencilLine className="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setExitOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/74 text-[#8a4353] shadow-[0_12px_22px_rgba(127,29,45,0.10)] backdrop-blur-md"
            aria-label="Exit game"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-3 rounded-[1.45rem] border border-white/55 bg-white/58 px-4 py-3 shadow-[0_20px_44px_rgba(127,29,45,0.12)] backdrop-blur-xl sm:rounded-[1.6rem] sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#a05e6a] sm:text-[11px]">
                Shared Board
              </p>
              <p className="mt-1 text-sm font-semibold text-[#59202c] sm:text-base">
                {currentTurn === "female"
                  ? `${players.female.name}'s turn`
                  : `${players.male.name}'s turn`}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {entryMode === "online" && onlineRoom ? (
                <div className="rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d4858] sm:text-[11px]">
                  Room {onlineRoom.code}
                </div>
              ) : null}
              <div className="rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d4858] sm:text-[11px]">
                First to 50 wins
              </div>
            </div>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[2rem] border border-white/55 bg-white/24 p-2 shadow-[0_26px_70px_rgba(127,29,45,0.16)] backdrop-blur-xl sm:rounded-[2.15rem] sm:p-3.5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))]" />
          <SharedBoard
            femalePosition={players.female.position}
            malePosition={players.male.position}
            openedCells={openedCells}
            highlightedTile={highlightedTile}
            highlightedPlayer={highlightedPlayer}
            activePlayer={currentTurn}
          />
        </div>

        <div className="mt-3 rounded-[1.6rem] border border-white/55 bg-white/46 p-2.5 shadow-[0_20px_48px_rgba(127,29,45,0.12)] backdrop-blur-xl sm:p-3">
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-2 sm:gap-3">
            <PlayerPanel
              role="queen"
              name={players.female.name}
              position={players.female.position}
              skipsUsed={players.female.skipsUsed}
              maxSkips={getSkipAllowance("female", clearedPlayers)}
              active={currentTurn === "female" && !winner}
            />

            <div className="flex min-w-[5.75rem] flex-col items-center justify-center gap-2 px-1 sm:min-w-[6.5rem]">
              <div
                className="overflow-visible"
                style={{
                  perspective: "1200px",
                  transformStyle: "preserve-3d",
                }}
              >
                <Dice
                  player={currentTurn}
                  disabled={Boolean(pendingTask) || Boolean(queuedTask) || Boolean(winner)}
                  onRollStart={() => {
                    vibrate("light");
                    playDice();
                  }}
                  onRoll={resolveRoll}
                />
              </div>
              <p
                className={`text-center text-[11px] font-semibold uppercase tracking-[0.22em] sm:text-xs ${
                  winner === "male" || (!winner && currentTurn === "male")
                    ? "text-[#2d55cc]"
                    : "text-[#8f4153]"
                }`}
              >
                {winner
                  ? winner === "female"
                    ? "Female Wins"
                    : "Male Wins"
                  : currentTurn === "female"
                    ? "Female Turn"
                    : "Male Turn"}
              </p>
            </div>

            <PlayerPanel
              role="king"
              name={players.male.name}
              position={players.male.position}
              skipsUsed={players.male.skipsUsed}
              maxSkips={getSkipAllowance("male", clearedPlayers)}
              active={currentTurn === "male" && !winner}
            />
          </div>
        </div>
      </div>

      <TaskPopup
        pendingTask={pendingTask}
        players={players}
        clearedPlayers={clearedPlayers}
        onAccept={() => resolvePendingTask("accept")}
        onSkip={() => resolvePendingTask("skip")}
      />

      <AnimatePresence>
        {winner ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(18,3,7,0.28)] p-3 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              className="w-full max-w-md rounded-[1.8rem] border border-white/60 bg-white/84 p-6 text-center shadow-[0_28px_80px_rgba(88,18,33,0.16)] backdrop-blur-xl"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-[#a05e6a]">
                Round Winner
              </p>
              <h3 className="mt-3 font-display text-4xl text-[#5f1626]">
                {winner === "female" ? "Female Won" : "Male Won"}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[#6b3846] sm:text-base">
                Continue the game to unlock reward mode. The winner gets 3 skips
                and all previously cleared cells become rest cells with no task.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={continueAfterWin}
                  className="rounded-full bg-[linear-gradient(135deg,#c84d63,#7f1d2d)] px-5 py-3 text-sm font-semibold text-white"
                >
                  Continue Game
                </button>
                <button
                  type="button"
                  onClick={restartMatch}
                  className="rounded-full border border-[#ebccd2] bg-white/84 px-5 py-3 text-sm font-semibold text-[#8a4353] backdrop-blur-md"
                >
                  New Round
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {logsOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(18,3,7,0.28)] p-3 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              className="w-full max-w-2xl rounded-[1.8rem] border border-white/60 bg-white/78 p-5 shadow-[0_28px_80px_rgba(88,18,33,0.16)] backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-display text-4xl text-black">Logs</h3>
                <button
                  type="button"
                  onClick={() => toggleLogs(false)}
                  className="rounded-full border border-[#ebccd2] bg-white/82 px-4 py-2 text-sm font-medium text-[#8a4353] backdrop-blur-md"
                >
                  Close
                </button>
              </div>
              <div className="space-y-2">
                {logs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="rounded-[1.2rem] border border-[#eed4d9] bg-white/74 px-4 py-3 text-sm leading-6 text-black backdrop-blur-md"
                  >
                    {log.text}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {exitOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(18,3,7,0.28)] p-3 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              className="w-full max-w-md rounded-[1.8rem] border border-white/60 bg-white/80 p-6 text-center shadow-[0_28px_80px_rgba(88,18,33,0.16)] backdrop-blur-xl"
            >
              <h3 className="font-display text-4xl text-black">Exit Game</h3>
              <p className="mt-4 text-base leading-7 text-[#6b3846]">
                Are you sure you want to exit?
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setExitOpen(false)}
                  className="rounded-full border border-[#ebccd2] bg-white/84 px-5 py-3 text-sm font-semibold text-[#8a4353] backdrop-blur-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExitOpen(false);
                    if (entryMode === "online") {
                      leaveOnlineRoom("landing");
                      return;
                    }

                    resetExperience();
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#c84d63,#7f1d2d)] px-5 py-3 text-sm font-semibold text-white"
                >
                  <DoorOpen className="h-4 w-4" />
                  Exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {editorOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 overflow-auto bg-[rgba(18,3,7,0.28)] p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              className="mx-auto w-full max-w-7xl rounded-[2rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,253,253,0.84),rgba(255,242,245,0.78))] p-4 shadow-[0_30px_90px_rgba(88,18,33,0.16)] backdrop-blur-xl sm:p-6"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#a05e6a]">
                    Live Editor
                  </p>
                  <h3 className="mt-2 font-display text-4xl text-[#5f1626]">
                    Update The Couple Deck Mid-Game
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => toggleEditor(false)}
                  className="rounded-full border border-[#e4bcc4] bg-white/82 px-4 py-2 text-sm text-[#83404f] backdrop-blur-md"
                >
                  Close
                </button>
              </div>

              <TaskEditor />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
