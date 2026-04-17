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
          image: "/images/usage/player-panels/queen-player-card__required-1600x340.jpg",
          imagePosition: "42% 28%",
          border: active ? "border-[#f3bcc9]" : "border-[#efcdd6]",
          surface: "bg-[rgba(86,13,31,0.32)]",
          glow: active
            ? "0 24px 46px rgba(196,59,96,0.28)"
            : "0 18px 40px rgba(89,32,44,0.14)",
          overlay:
            "bg-[linear-gradient(180deg,rgba(145,17,52,0.14),rgba(120,22,45,0.50)_58%,rgba(86,13,31,0.78)_100%)]",
          chip: "bg-[linear-gradient(135deg,rgba(255,245,247,0.82),rgba(255,224,232,0.74))] text-[#b43d5d] border-[#f3cad4]",
          meta: "text-[#ffe6ee]",
        }
      : {
          image: "/images/usage/player-panels/king-player-card__required-1600x340.jpg",
          imagePosition: "74% 26%",
          border: active ? "border-[#bed7ff]" : "border-[#d4e2fb]",
          surface: "bg-[rgba(16,31,76,0.28)]",
          glow: active
            ? "0 24px 46px rgba(58,112,228,0.28)"
            : "0 18px 40px rgba(41,57,94,0.14)",
          overlay:
            "bg-[linear-gradient(180deg,rgba(21,74,182,0.12),rgba(22,55,124,0.48)_58%,rgba(16,31,76,0.76)_100%)]",
          chip: "bg-[linear-gradient(135deg,rgba(246,250,255,0.84),rgba(227,238,255,0.76))] text-[#3a70e4] border-[#cfe0ff]",
          meta: "text-[#e4eeff]",
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
      className={`relative min-h-[9rem] overflow-hidden rounded-[1.4rem] border text-left backdrop-blur-xl sm:min-h-[9.5rem] sm:rounded-[1.7rem] lg:min-h-[10.5rem] ${theme.border} ${theme.surface}`}
    >
      <div className="absolute inset-1.5 sm:inset-2">
        <Image
          src={theme.image}
          alt={`${role} sample profile background`}
          fill
          unoptimized
          loading="eager"
          sizes="(max-width: 640px) 42vw, (max-width: 1024px) 36vw, 24vw"
          className="object-cover"
          style={{ objectPosition: theme.imagePosition }}
        />
      </div>
      <div className={`absolute inset-0 ${theme.overlay}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_34%)]" />

      <div className="relative flex h-full flex-col px-2.5 py-2.5 sm:px-4 sm:py-3.5">
        <div className="flex flex-col items-start gap-2">
          <div className="flex w-fit max-w-full self-start items-center gap-2 rounded-[1rem] border border-white/18 bg-black/14 px-2.5 py-2 pr-3 backdrop-blur-[8px]">
            <span className="text-base sm:text-xl">{icon}</span>
            <p className="truncate font-display text-lg leading-none text-white sm:text-[1.7rem] lg:text-[2rem]">
              {name}
            </p>
            <span
              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-2.5 text-base font-bold leading-none shadow-[0_8px_18px_rgba(18,9,14,0.16)] sm:h-9 sm:min-w-9 sm:text-lg lg:h-10 lg:min-w-10 lg:text-xl ${theme.chip}`}
              aria-label={`Tile ${position}`}
            >
              {position}
            </span>
          </div>

          <p
            className={`rounded-full border border-white/14 bg-black/10 px-3 py-1 text-sm tracking-[0.08em] backdrop-blur-[6px] sm:text-base lg:text-lg ${theme.meta}`}
          >
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
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.65rem] border border-white/75 bg-[rgba(34,10,16,0.18)] shadow-[0_18px_36px_rgba(127,29,45,0.12)]">
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src="/images/usage/board/shared-board-background__required-2400x520.jpg"
                alt=""
                fill
                aria-hidden="true"
                unoptimized
                sizes="100vw"
                className="object-cover object-center opacity-72 blur-[10px]"
              />
            </div>
            <div className="absolute inset-2 sm:inset-3">
              <Image
                src="/images/usage/board/shared-board-background__required-2400x520.jpg"
                alt="Romantic shared board background"
                fill
                priority
                unoptimized
                sizes="100vw"
                className="object-contain object-center"
              />
            </div>
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
  const onlinePlayerId = useGameStore((state) => state.onlinePlayerId);
  const currentTurn = useGameStore((state) => state.currentTurn);
  const gameState = useGameStore((state) => state.gameState);
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
  const revealDrawnTask = useGameStore((state) => state.revealDrawnTask);
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
  const currentTurnPlayerId = onlineRoom?.playersOrder?.[onlineRoom.turnIndex] ?? null;
  const isMyTurn =
    entryMode === "online" && onlinePlayerId
      ? currentTurnPlayerId === onlinePlayerId
      : true;
  const canResolveTask = entryMode === "offline" || isMyTurn;
  const canControlWinnerModal = entryMode === "offline" || isMyTurn;
  const taskFooterNote =
    entryMode === "online" && !isMyTurn
      ? "Waiting for your partner to finish this challenge."
      : null;

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
  }, [finishLandingSequence, highlightedTile]);

  useEffect(() => {
    if (gameState !== "DRAW_CARD" || !queuedTask) {
      return;
    }

    const timer = window.setTimeout(() => {
      revealDrawnTask();
    }, 220);

    return () => {
      window.clearTimeout(timer);
    };
  }, [gameState, queuedTask, revealDrawnTask]);

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

  const boardStatus =
    entryMode === "online"
      ? winner
        ? isMyTurn
          ? "You won the round"
          : "Partner won the round"
        : gameState === "SHOW_CARD" && pendingTask
          ? isMyTurn
            ? "Resolve the drawn card"
            : "Partner is resolving the drawn card"
          : gameState === "MOVE_PLAYER" || gameState === "DRAW_CARD"
            ? isMyTurn
              ? "Landing and drawing a card"
              : "Partner is landing on the board"
          : isMyTurn
            ? "Your turn to roll"
            : "Partner's turn"
      : winner
        ? `${players[winner].name} won the round`
        : gameState === "SHOW_CARD" && pendingTask
          ? `${players[pendingTask.player].name} drew a card`
          : gameState === "MOVE_PLAYER" || gameState === "DRAW_CARD"
            ? `${players[currentTurn].name} is moving`
            : `${players[currentTurn].name}'s turn`;

  return (
    <>
      <div className="relative flex min-h-[var(--app-height,100dvh)] w-full max-w-full min-w-0 flex-col overflow-y-auto overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_22%),linear-gradient(180deg,#6f1226_0%,#8d1d33_16%,#fdf7f8_16%,#fffafb_100%)] px-3 py-3 sm:px-4 sm:py-4">
        <div className="mx-auto flex w-full max-w-[112rem] flex-col">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {entryMode === "offline" ? (
              <>
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
              </>
            ) : null}
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
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#a05e6a] sm:text-[11px]">
                Shared Board
              </p>
              <p className="mt-1 text-sm font-semibold text-[#59202c] sm:text-base">
                {boardStatus}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
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

        <div className="relative shrink-0 overflow-hidden rounded-[2rem] border border-white/55 bg-white/24 p-2 shadow-[0_26px_70px_rgba(127,29,45,0.16)] backdrop-blur-xl sm:rounded-[2.15rem] sm:p-3.5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.35),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.04))]" />
          <div className="mx-auto h-[min(82vw,28rem)] w-full max-w-[96rem] sm:h-[min(68vw,34rem)] lg:h-[min(48vw,39rem)] xl:h-[min(42vw,42rem)]">
            <SharedBoard
              femalePosition={players.female.position}
              malePosition={players.male.position}
              openedCells={openedCells}
              highlightedTile={highlightedTile}
              highlightedPlayer={highlightedPlayer}
              activePlayer={currentTurn}
            />
          </div>
        </div>

        <div className="mt-3 shrink-0 rounded-[1.6rem] border border-white/55 bg-white/46 p-2.5 shadow-[0_20px_48px_rgba(127,29,45,0.12)] backdrop-blur-xl sm:p-3">
          {entryMode === "online" ? (
            <div className="mb-3 rounded-[1.35rem] border border-white/60 bg-white/72 px-4 py-3">
              <p className="text-sm font-medium text-[#85505c]">
                {gameState === "SHOW_CARD" && pendingTask
                  ? isMyTurn
                    ? "Finish the task card to pass the turn."
                    : "Watching your partner's card resolve in real time."
                  : gameState === "MOVE_PLAYER" || gameState === "DRAW_CARD"
                    ? isMyTurn
                      ? "Your move is landing. A random card is being drawn."
                      : "Your partner is landing and drawing a card."
                  : isMyTurn
                    ? "Roll the dice to advance on the same shared board."
                    : "Waiting for your partner to roll the dice."}
              </p>
            </div>
          ) : null}

          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_4.75rem_minmax(0,1fr)] items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_5.75rem_minmax(0,1fr)] sm:gap-3 lg:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)]">
            <PlayerPanel
              role="queen"
              name={players.female.name}
              position={players.female.position}
              skipsUsed={players.female.skipsUsed}
              maxSkips={getSkipAllowance("female", clearedPlayers)}
              active={currentTurn === "female" && !winner}
            />

            <div className="flex min-w-[4.75rem] flex-col items-center justify-center gap-2 px-1 sm:min-w-[5.75rem] lg:min-w-[7rem]">
              <div
                className="overflow-visible"
                style={{
                  perspective: "1200px",
                  transformStyle: "preserve-3d",
                }}
              >
                <Dice
                  player={currentTurn}
                  disabled={
                    gameState !== "ROLL_DICE" ||
                    Boolean(winner) ||
                    (entryMode === "online" && !isMyTurn)
                  }
                  onRollStart={() => {
                    vibrate("light");
                    playDice();
                  }}
                  onRoll={resolveRoll}
                />
              </div>
              <p
                className={`text-center text-[10px] font-semibold uppercase tracking-[0.18em] sm:text-xs ${
                  winner === "male" || (!winner && currentTurn === "male")
                    ? "text-[#2d55cc]"
                    : "text-[#8f4153]"
                }`}
              >
                {winner
                  ? winner === "female"
                    ? "Queen Wins"
                    : "King Wins"
                  : currentTurn === "female"
                    ? "Queen Turn"
                    : "King Turn"}
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
      </div>

      <TaskPopup
        pendingTask={pendingTask}
        players={players}
        clearedPlayers={clearedPlayers}
        onAccept={() => {
          if (canResolveTask) {
            resolvePendingTask("accept");
          }
        }}
        onSkip={() => {
          if (canResolveTask) {
            resolvePendingTask("skip");
          }
        }}
        acceptDisabled={!canResolveTask}
        skipDisabled={!canResolveTask}
        footerNote={taskFooterNote}
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
                {winner === "female" ? `${players.female.name} Won` : `${players.male.name} Won`}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[#6b3846] sm:text-base">
                Continue the game to unlock reward mode. The winner gets 3 skips
                and all previously cleared cells become rest cells with no task.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={continueAfterWin}
                  disabled={!canControlWinnerModal}
                  className="rounded-full bg-[linear-gradient(135deg,#c84d63,#7f1d2d)] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Continue Game
                </button>
                <button
                  type="button"
                  onClick={restartMatch}
                  disabled={!canControlWinnerModal}
                  className="rounded-full border border-[#ebccd2] bg-white/84 px-5 py-3 text-sm font-semibold text-[#8a4353] backdrop-blur-md disabled:cursor-not-allowed disabled:opacity-45"
                >
                  New Round
                </button>
              </div>
              {entryMode === "online" && !canControlWinnerModal ? (
                <p className="mt-4 text-sm leading-6 text-[#8f4153]">
                  Waiting for the winning player to choose the next step.
                </p>
              ) : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {entryMode === "offline" && logsOpen ? (
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
        {entryMode === "offline" && editorOpen ? (
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
