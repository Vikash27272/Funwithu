"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronLeft, Copy, Lock, PartyPopper, ShieldCheck, Users } from "lucide-react";
import { useGameStore } from "@/utils/game-store";

interface GameSelectionProps {
  onBack: () => void;
}

function RoomPlayerSlot({
  title,
  subtitle,
  joined,
  tone,
}: {
  title: string;
  subtitle: string;
  joined: boolean;
  tone: "female" | "male";
}) {
  const theme =
    tone === "female"
      ? {
          badge: "bg-[linear-gradient(135deg,#ffe7ed,#ffd8e2)] text-[#ab4960]",
          border: "border-[#edc8d1]",
          glow: "from-[#fff7f9] to-[#fff0f4]",
        }
      : {
          badge: "bg-[linear-gradient(135deg,#e8f1ff,#d7e7ff)] text-[#3f6eb2]",
          border: "border-[#cfdcf3]",
          glow: "from-[#f8fbff] to-[#eff5ff]",
        };

  return (
    <div
      className={`rounded-[1.6rem] border ${theme.border} bg-gradient-to-br ${theme.glow} p-5`}
    >
      <div
        className={`inline-flex rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] ${theme.badge}`}
      >
        {title}
      </div>
      <h3 className="mt-4 font-display text-3xl text-[#5f1626]">{joined ? subtitle : "Waiting..."}</h3>
      <p className="mt-2 text-sm leading-6 text-[#85505c]">
        {joined
          ? "Connected to this room and ready for the host's game choice."
          : "Open slot. Only one more player can join this room."}
      </p>
    </div>
  );
}

export function GameSelection({ onBack }: GameSelectionProps) {
  const selectGame = useGameStore((state) => state.selectGame);
  const entryMode = useGameStore((state) => state.entryMode);
  const onlineRoom = useGameStore((state) => state.onlineRoom);
  const onlineRole = useGameStore((state) => state.onlineRole);
  const onlineError = useGameStore((state) => state.onlineError);
  const clearOnlineError = useGameStore((state) => state.clearOnlineError);
  const [copied, setCopied] = useState(false);

  const inOnlineLobby = entryMode === "online" && onlineRoom;
  const isAdmin = onlineRole === "male";
  const roomReady = Boolean(onlineRoom?.players.male && onlineRoom?.players.female);
  const femaleName = onlineRoom?.players.female?.name ?? "Female";
  const maleName = onlineRoom?.players.male?.name ?? "Male";
  const selectedOnlineGame = onlineRoom?.selectedGame;

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
      className="mx-auto max-w-6xl space-y-6"
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
          {inOnlineLobby ? "Room Lobby" : "Choose A Game"}
        </p>
      </div>

      {inOnlineLobby ? (
        <div className="grid gap-6 rounded-[2rem] border border-[#d9a8b1]/40 bg-[linear-gradient(180deg,rgba(255,253,253,0.94),rgba(255,241,244,0.94))] p-6 shadow-[0_24px_70px_rgba(88,18,33,0.10)] lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ecc4cb] bg-white px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#8d4858]">
              <Users className="h-4 w-4" />
              Two Player Room
            </div>

            <h2 className="mt-5 font-display text-4xl text-[#5f1626]">{onlineRoom.name}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#85505c] sm:text-base">
              The room creator is the Male admin on the right. The joiner uses the
              Female slot on the left. Only two players can stay inside one room.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="rounded-[1.2rem] border border-[#edcad0] bg-white px-4 py-3">
                <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#a25f6d]">
                  Room Code
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[0.24em] text-[#6e2435]">
                  {onlineRoom.code}
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

              <div className="rounded-full border border-[#ecd0d5] bg-white px-4 py-3 text-xs uppercase tracking-[0.24em] text-[#9b5665]">
                {isAdmin ? "You are room admin" : "Waiting on room admin"}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <RoomPlayerSlot title="Female Left" subtitle={femaleName} joined={Boolean(onlineRoom.players.female)} tone="female" />
            <RoomPlayerSlot title="Male Right" subtitle={maleName} joined={Boolean(onlineRoom.players.male)} tone="male" />
          </div>
        </div>
      ) : null}

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

      <div className="grid gap-5 lg:grid-cols-3">
        <button
          type="button"
          onClick={() => selectGame("truth-dare")}
          disabled={inOnlineLobby ? !isAdmin || !roomReady : false}
          className="group rounded-[2rem] border border-[#dca8b2]/45 bg-[linear-gradient(160deg,#fffdfd,#fff1f4)] p-6 text-left shadow-[0_24px_60px_rgba(88,18,33,0.10)] transition hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:translate-y-0"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="inline-flex rounded-full bg-[linear-gradient(135deg,#ffe5ea,#ffd8e0)] p-3 text-[#a33f52]">
              <PartyPopper className="h-5 w-5" />
            </div>
            {inOnlineLobby && isAdmin ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#ebcad0] bg-white px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#8e4859]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin Picks
              </span>
            ) : null}
          </div>
          <h3 className="font-display text-3xl text-[#5f1626]">Dare Game</h3>
          <p className="mt-3 text-sm leading-6 text-[#7f4a57]">
            The current live room game. Host selects it, both players enter the same
            shared dare board, and the match starts with Male on the right and Female
            on the left.
          </p>
          <span className="mt-6 inline-flex rounded-full border border-[#efc6ce] bg-white px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#93495a]">
            {selectedOnlineGame === "truth-dare" ? "Selected" : "Active"}
          </span>
        </button>

        {[
          "Couple Challenge Race",
          "Late Night Quiz",
        ].map((title) => (
          <div
            key={title}
            className="rounded-[2rem] border border-[#dfbcc4]/40 bg-white/80 p-6 text-left opacity-95"
          >
            <div className="mb-4 inline-flex rounded-full bg-[#fff1f4] p-3 text-[#a36c78]">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-display text-3xl text-[#6e2435]">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#8c5663]">
              Reserved for upcoming online modes. The room flow is ready, but these
              games stay locked for now.
            </p>
            <span className="mt-6 inline-flex rounded-full border border-[#efd1d7] bg-white px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#aa7280]">
              Locked
            </span>
          </div>
        ))}
      </div>

      {inOnlineLobby ? (
        <div className="rounded-[1.6rem] border border-[#ebccd2] bg-white/80 px-5 py-4 text-sm leading-7 text-[#85505c]">
          {isAdmin
            ? roomReady
              ? "Pick Dare Game to move both players into the next screen."
              : "Share the room code first. Once Female joins, you can pick Dare Game."
            : selectedOnlineGame
              ? "The admin has already picked the Dare Game. Your screen will continue automatically."
              : "Waiting for the room admin to choose the game."}
        </div>
      ) : null}
    </motion.section>
  );
}
