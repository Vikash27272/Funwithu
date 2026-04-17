"use client";

import { useEffect, useState } from "react";
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

const AGE_GATE_STORAGE_KEY = "fun-with-u-age-confirmed";
const POGO_TV_URL = "https://www.pogo.tv/";

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

function AgeGate({
  onConfirm,
  onDecline,
}: {
  onConfirm: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,214,224,0.14),transparent_26%),linear-gradient(135deg,#070103_0%,#19040b_52%,#260611_100%)] px-4 py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,125,155,0.14),transparent_20%),radial-gradient(circle_at_bottom_right,rgba(127,29,29,0.18),transparent_30%)]" />
      <FloatingHearts />

      <motion.section
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-[2rem] border border-[#dd7488]/30 bg-[linear-gradient(145deg,rgba(31,4,10,0.94),rgba(88,15,30,0.9)_48%,rgba(130,23,44,0.86)_100%)] p-6 text-center shadow-[0_28px_80px_rgba(0,0,0,0.45),0_0_70px_rgba(255,62,103,0.18)] sm:p-8"
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/8 text-3xl text-rose-100">
          18+
        </div>
        <p className="font-display text-xs uppercase tracking-[0.38em] text-rose-200/75">
          Age Confirmation
        </p>
        <h1 className="mt-3 font-display text-3xl text-white sm:text-4xl">
          Are you 18 or older?
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-rose-50/78 sm:text-base">
          This website is only for adults. Please confirm your age before
          entering.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#631126] transition hover:-translate-y-0.5 hover:bg-rose-50"
          >
            Yes, Enter Website
          </button>
          <button
            type="button"
            onClick={onDecline}
            className="rounded-full border border-white/18 bg-white/6 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
          >
            No, Take Me Away
          </button>
        </div>

        <p className="mt-5 text-xs leading-5 text-rose-100/60">
          Choosing No will redirect you to the Pogo TV website.
        </p>
      </motion.section>
    </div>
  );
}

export function AppShell() {
  const [storeReady, setStoreReady] = useState(false);
  const [ageGateState, setAgeGateState] = useState<
    "checking" | "required" | "allowed"
  >("checking");
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
  const immersiveScreen = !landing && !playing;

  useEffect(() => {
    let active = true;

    void Promise.resolve(useGameStore.persist.rehydrate())
      .catch(() => null)
      .finally(() => {
        if (active) {
          setStoreReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const nextAgeGateState = (() => {
      try {
        return window.localStorage.getItem(AGE_GATE_STORAGE_KEY) === "true"
          ? "allowed"
          : "required";
      } catch {
        return "required";
      }
    })();

    const frame = window.setTimeout(() => {
      setAgeGateState(nextAgeGateState);
    }, 0);

    return () => {
      window.clearTimeout(frame);
    };
  }, []);

  useEffect(() => {
    try {
      if (ageGateState === "allowed") {
        window.localStorage.setItem(AGE_GATE_STORAGE_KEY, "true");
      }
    } catch {
      // Ignore storage errors after the initial decision has been made.
    }
  }, [ageGateState]);

  useEffect(() => {
    if (!storeReady || ageGateState !== "allowed") {
      return;
    }

    if (!readPlayerSession()) {
      return;
    }

    void syncOnlineRoom({ silent: true });
  }, [ageGateState, storeReady, syncOnlineRoom]);

  useEffect(() => {
    if (!storeReady || ageGateState !== "allowed" || !onlineRoomId) {
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
  }, [ageGateState, onlineRoomId, storeReady, syncOnlineRoom]);

  const handleAgeConfirm = () => {
    setAgeGateState("allowed");
  };

  const handleAgeDecline = () => {
    window.location.replace(POGO_TV_URL);
  };

  if (ageGateState !== "allowed") {
    return (
      <main className="h-[var(--app-height,100dvh)] w-full">
        {ageGateState === "required" ? (
          <AgeGate
            onConfirm={handleAgeConfirm}
            onDecline={handleAgeDecline}
          />
        ) : null}
      </main>
    );
  }

  return (
    <main
      className={`relative h-[var(--app-height,100dvh)] w-full overflow-hidden ${
        landing
          ? "bg-black"
          : "bg-[radial-gradient(circle_at_top,rgba(255,208,219,0.14),transparent_20%),linear-gradient(135deg,#050102_0%,#14040a_44%,#22060f_100%)]"
      }`}
    >
      {!landing ? <FloatingHearts /> : null}
      {!landing ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,113,133,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(127,29,29,0.10),transparent_34%)]" />
      ) : null}
      {immersiveScreen ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 mx-auto h-40 w-[min(78vw,38rem)] rounded-full bg-[#ff365e]/18 blur-[120px] sm:bottom-8 sm:h-48" />
      ) : null}

      <div className="relative h-full w-full min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="h-full w-full"
          >
            {screen === "landing" ? (
              <LandingHero
                onStartOffline={startOfflineFlow}
                onStartOnline={startOnlineFlow}
              />
            ) : null}

            {immersiveScreen ? (
              <div className="flex h-full w-full items-center justify-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                <div className="relative h-[88vh] max-h-full w-[92vw] max-w-full overflow-hidden rounded-[2rem] border border-[#c35d71]/28 bg-[linear-gradient(140deg,rgba(38,5,12,0.92),rgba(93,14,27,0.9)_42%,rgba(138,24,43,0.86)_100%)] shadow-[0_0_80px_rgba(255,0,60,0.24),0_34px_90px_rgba(12,1,5,0.5)] sm:max-w-[1200px] sm:rounded-[2.25rem]">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,224,232,0.14),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(255,89,125,0.16),transparent_30%)]" />
                  <div className="relative h-full overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
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
                  </div>
                </div>
              </div>
            ) : null}

            {screen === "playing" ? <GameBoard /> : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
