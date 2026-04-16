"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  Copy,
  Lock,
  PartyPopper,
  Sparkles,
  Users,
} from "lucide-react";
import { useGameStore } from "@/utils/game-store";

interface GameSelectionProps {
  onBack: () => void;
}

export function GameSelection({ onBack }: GameSelectionProps) {
  const selectGame = useGameStore((state) => state.selectGame);
  const entryMode = useGameStore((state) => state.entryMode);
  const onlineRoom = useGameStore((state) => state.onlineRoom);
  const onlinePlayerId = useGameStore((state) => state.onlinePlayerId);
  const onlineError = useGameStore((state) => state.onlineError);
  const clearOnlineError = useGameStore((state) => state.clearOnlineError);
  const startGame = useGameStore((state) => state.startGame);
  const [copied, setCopied] = useState(false);

  const inOnlineLobby = entryMode === "online" && onlineRoom;
  const roomPlayers = onlineRoom
    ? [onlineRoom.players.male, onlineRoom.players.female].filter(
        (player): player is NonNullable<typeof onlineRoom.players.male> => Boolean(player),
      )
    : [];
  const isHost = roomPlayers[0]?.id === onlinePlayerId;
  const roomReady = (onlineRoom?.playerCount ?? roomPlayers.length) >= 2;
  const gameCards = [
    {
      title: "Dare Game",
      shortLine: "Fast turns on one shared board.",
      icon: PartyPopper,
      action: () => selectGame("truth-dare"),
      disabled: false,
      status: "Play Now",
      highlight: "Live",
    },
    {
      title: "Couple Challenge Race",
      shortLine: "Compact block mode coming soon.",
      icon: Sparkles,
      action: undefined,
      disabled: true,
      status: "Locked",
      highlight: "Soon",
    },
    {
      title: "Late Night Quiz",
      shortLine: "Quick private quiz mode soon.",
      icon: Lock,
      action: undefined,
      disabled: true,
      status: "Locked",
      highlight: "Soon",
    },
  ] as const;

  const copyRoomCode = async () => {
    if (!onlineRoom) {
      return;
    }

    try {
      await navigator.clipboard.writeText(onlineRoom.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-6xl space-y-5"
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
        <p className="text-xs uppercase tracking-[0.28em] text-[#d3a1ac]">{inOnlineLobby ? "Room Lobby" : "Choose A Game"}</p>
      </div>

      {inOnlineLobby ? (
        <div className="space-y-5 rounded-[2rem] border border-[#d9a8b1]/40 bg-[linear-gradient(180deg,rgba(255,253,253,0.94),rgba(255,241,244,0.94))] p-5 shadow-[0_24px_70px_rgba(88,18,33,0.10)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ecc4cb] bg-white px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#8d4858]">
                <Users className="h-4 w-4" />
                Room Lobby
              </div>
              <h2 className="mt-4 font-display text-4xl text-[#5f1626]">
                Room Code: {onlineRoom.code}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#85505c] sm:text-base">
                Players: {Math.min(onlineRoom.playerCount, 2)} / 2
              </p>
            </div>

            <button
              type="button"
              onClick={copyRoomCode}
              className="inline-flex items-center gap-2 rounded-full border border-[#e5bcc4] bg-white px-5 py-3 text-sm font-semibold text-[#83404f]"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy Code"}
            </button>
          </div>

          <div className="rounded-[1.6rem] border border-[#ebcad0] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[#a25f6d]">Players</p>
            <div className="mt-4 space-y-3">
              {roomPlayers.map((player) => (
                <div
                  key={player.id}
                  className="rounded-[1.2rem] border border-[#f0d8dd] bg-[#fff8fa] px-4 py-3 text-base text-[#5f1626]"
                >
                  <span className="font-medium">{"\uD83D\uDC64"} {player.name}</span>
                  {player.id === onlinePlayerId ? (
                    <span className="ml-2 text-sm text-[#9b5665]">(You)</span>
                  ) : null}
                </div>
              ))}
              {roomPlayers.length < 2 ? (
                <div className="rounded-[1.2rem] border border-dashed border-[#ebcad0] bg-[#fffdfd] px-4 py-3 text-base text-[#85505c]">
                  {"\uD83D\uDC64"} Waiting for partner
                </div>
              ) : null}
            </div>
          </div>

          {isHost ? (
            <button
              type="button"
              onClick={startGame}
              disabled={!roomReady}
              className="w-full rounded-full bg-[linear-gradient(135deg,#c84d63,#7f1d2d)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(127,29,45,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {roomReady ? "Start Game" : "Waiting For 2 Players"}
            </button>
          ) : (
            <div className="rounded-[1.4rem] border border-[#ebccd2] bg-white/80 px-5 py-4 text-sm leading-6 text-[#85505c]">
              {roomReady
                ? "Waiting for the host to start the game."
                : "Waiting for the host and second player to get the room ready."}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="rounded-[2rem] border border-[#c35d71]/30 bg-[linear-gradient(140deg,rgba(41,6,13,0.96),rgba(96,12,27,0.95)_42%,rgba(141,20,40,0.92)_100%)] px-5 py-5 shadow-[0_26px_80px_rgba(29,3,9,0.34)] sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.32em] text-[#ffd1db]">
                  Offline Game Choice
                </p>
                <h2 className="mt-3 font-display text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.92] text-white">
                  Pick a game block.
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/72 sm:text-base">
                  One short tap. No long descriptions.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {gameCards.map((game) => {
              const Icon = game.icon;

              return (
                <button
                  key={game.title}
                  type="button"
                  onClick={game.action ?? undefined}
                  disabled={game.disabled}
                  className="group relative min-h-[14rem] overflow-hidden rounded-[2rem] border border-[#8f233a]/70 bg-[linear-gradient(160deg,#24060d_0%,#4d0918_48%,#7e1228_100%)] p-5 text-left shadow-[0_30px_70px_rgba(18,2,7,0.38)] transition hover:-translate-y-1 hover:shadow-[0_34px_78px_rgba(18,2,7,0.44)] disabled:cursor-not-allowed disabled:opacity-85 disabled:hover:translate-y-0"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,198,211,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,90,122,0.2),transparent_34%)]" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(180deg,transparent,rgba(255,112,145,0.14))]" />

                  <div className="relative flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div className="inline-flex rounded-[1.1rem] border border-white/14 bg-white/10 p-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm">
                        <Icon className="h-5 w-5" />
                      </div>

                      <span className="inline-flex rounded-full border border-white/14 bg-white/10 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white/80 backdrop-blur-sm">
                        {game.highlight}
                      </span>
                    </div>

                    <div className="relative mt-8">
                      <h3 className="font-display text-[2rem] leading-none text-white sm:text-[2.25rem]">
                        {game.title}
                      </h3>
                      <p className="mt-3 max-w-[18rem] text-sm leading-6 text-[#ffd9e0]">
                        {game.shortLine}
                      </p>
                    </div>

                    <div className="relative mt-8 flex items-center justify-between gap-3">
                      <span className="inline-flex rounded-full border border-[#f4a6b7]/24 bg-white/12 px-4 py-2 text-[0.68rem] uppercase tracking-[0.24em] text-white/88 backdrop-blur-sm">
                        {game.status}
                      </span>
                      <span className="h-2 w-16 rounded-full bg-[linear-gradient(90deg,#ff9cb2,#ff4c72)] opacity-90" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {onlineError ? (
        <div className="rounded-[1.5rem] border border-[#f3c2ca] bg-[#fff2f5] px-5 py-4 text-sm text-[#8d4353]">
          <div className="flex items-center justify-between gap-3">
            <span>{onlineError}</span>
            <button
              type="button"
              onClick={clearOnlineError}
              className="rounded-full border border-[#ebc7ce] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8b4553]"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </motion.section>
  );
}
