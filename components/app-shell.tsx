"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GameBoard } from "@/components/game-board";
import { GameSelection } from "@/components/game-selection";
import { LandingHero } from "@/components/landing-hero";
import { ModeSelection } from "@/components/mode-selection";
import { OnlineRoomHub } from "@/components/online-room-hub";
import { PlayerSetup } from "@/components/player-setup";
import { useGameStore } from "@/utils/game-store";
import {
  readPlayerSession,
  subscribeToRoom,
  unsubscribeFromRoom,
} from "@/utils/online-room";

function FloatingHearts() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 14 }, (_, index) => (
        <motion.span
          key={index}
          className="absolute text-lg text-rose-200/12"
          initial={{
            x: `${7 + index * 7}%`,
            y: "108%",
            scale: 0.8 + (index % 4) * 0.12,
            opacity: 0,
          }}
          animate={{
            y: "-12%",
            opacity: [0, 0.55, 0],
            x: `${4 + index * 6 + (index % 2 === 0 ? 3 : -2)}%`,
          }}
          transition={{
            duration: 14 + (index % 5) * 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: index * 0.6,
            ease: "linear",
          }}
        >
          {"\u2665"}
        </motion.span>
      ))}
    </div>
  );
}

export function AppShell() {
  const screen = useGameStore((state) => state.screen);
  const entryMode = useGameStore((state) => state.entryMode);
  const onlineRoomId = useGameStore((state) => state.onlineRoom?.id ?? null);
  const startOfflineFlow = useGameStore((state) => state.startOfflineFlow);
  const startOnlineFlow = useGameStore((state) => state.startOnlineFlow);
  const setScreen = useGameStore((state) => state.setScreen);
  const leaveOnlineRoom = useGameStore((state) => state.leaveOnlineRoom);
  const syncOnlineRoom = useGameStore((state) => state.syncOnlineRoom);
  const playing = screen === "playing";
  const landing = screen === "landing";

  useEffect(() => {
    if (!readPlayerSession()) {
      return;
    }

    void syncOnlineRoom({ silent: true });
  }, [syncOnlineRoom]);

  useEffect(() => {
    if (!onlineRoomId) {
      return;
    }

    const channel = subscribeToRoom(onlineRoomId, () => {
      void syncOnlineRoom({ silent: true });
    });
    const interval = window.setInterval(() => {
      void syncOnlineRoom({ silent: true });
    }, 2500);

    return () => {
      window.clearInterval(interval);
      void unsubscribeFromRoom(channel);
    };
  }, [onlineRoomId, syncOnlineRoom]);

  return (
    <main
      className={`relative h-[var(--app-height,100dvh)] w-full max-w-full overflow-hidden ${
        landing ? "" : "px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-10"
      }`}
    >
      <FloatingHearts />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,113,133,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(127,29,29,0.10),transparent_34%)]" />

      <div
        className={`relative min-w-0 ${
          landing || playing
            ? "h-full w-full"
            : "mx-auto flex h-full w-full max-w-7xl flex-col"
        }`}
      >
        {!playing && !landing ? (
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[#c78995]">
                Fun With U
              </p>
              <h1 className="mt-2 font-display text-3xl text-[#fff8f9] sm:text-4xl">
                Couple Game Hub
              </h1>
            </div>
            <div className="rounded-full border border-[#d8a8b0]/30 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#8e4a59] shadow-[0_10px_24px_rgba(101,20,35,0.08)]">
              Offline and Online Entry
            </div>
          </header>
        ) : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className={
              landing || playing ? "h-full" : "min-h-0 flex-1 overflow-y-auto pr-1"
            }
          >
            {screen === "landing" ? (
              <LandingHero
                onStartOffline={startOfflineFlow}
                onStartOnline={startOnlineFlow}
              />
            ) : null}

            {screen === "setup" ? (
              <PlayerSetup
                onBack={() => setScreen("landing")}
                onContinue={() => setScreen("game-select")}
              />
            ) : null}

            {screen === "online-room" ? (
              <OnlineRoomHub onBack={() => setScreen("landing")} />
            ) : null}

            {screen === "game-select" ? (
              <GameSelection
                onBack={() =>
                  entryMode === "online"
                    ? leaveOnlineRoom("online-room")
                    : setScreen("setup")
                }
              />
            ) : null}

            {screen === "mode-select" ? (
              <ModeSelection onBack={() => setScreen("game-select")} />
            ) : null}

            {screen === "playing" ? <GameBoard /> : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
