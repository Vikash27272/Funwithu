"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Heart,
  Play,
  RotateCw,
  ShieldCheck,
  Shuffle,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";

type Screen = "start" | "mode" | "game" | "result";
type PromptType = "truth" | "dare";
type ModeId = "cozy" | "flirty" | "chaos";

interface Prompt {
  id: string;
  text: string;
}

interface ModeConfig {
  id: ModeId;
  name: string;
  tagline: string;
  description: string;
  accent: string;
  glow: string;
  truths: Prompt[];
  dares: Prompt[];
}

const TOTAL_ROUNDS = 8;
const PLAYERS = ["Player One", "Player Two"];

const MODES: ModeConfig[] = [
  {
    id: "cozy",
    name: "Cozy",
    tagline: "Easy laughs",
    description: "Soft prompts and playful dares that keep the room light.",
    accent: "from-[#f59e0b] via-[#fb7185] to-[#ef4444]",
    glow: "shadow-[0_22px_60px_rgba(251,113,133,0.28)]",
    truths: [
      { id: "cozy-truth-1", text: "What tiny act of kindness stays with you for years?" },
      { id: "cozy-truth-2", text: "Which song can reset your mood in under a minute?" },
      { id: "cozy-truth-3", text: "What comfort ritual do you never want to give up?" },
      { id: "cozy-truth-4", text: "What is something simple that always makes you smile?" },
      { id: "cozy-truth-5", text: "Which memory feels warm every time you replay it?" },
      { id: "cozy-truth-6", text: "What compliment do you remember word for word?" },
    ],
    dares: [
      { id: "cozy-dare-1", text: "Do a five-second slow-motion movie entrance." },
      { id: "cozy-dare-2", text: "Describe your snack of choice like a luxury product ad." },
      { id: "cozy-dare-3", text: "Give your best weather forecast for tomorrow's vibes." },
      { id: "cozy-dare-4", text: "Hum a dramatic soundtrack for the next player's turn." },
      { id: "cozy-dare-5", text: "Strike three magazine-cover poses before time runs out." },
      { id: "cozy-dare-6", text: "Turn the nearest object into a microphone and accept an award." },
    ],
  },
  {
    id: "flirty",
    name: "Flirty",
    tagline: "Warm sparks",
    description: "A little bolder, still smooth, built for playful chemistry.",
    accent: "from-[#fb7185] via-[#f43f5e] to-[#e11d48]",
    glow: "shadow-[0_22px_60px_rgba(244,63,94,0.32)]",
    truths: [
      { id: "flirty-truth-1", text: "What compliment do you secretly wish you heard more often?" },
      { id: "flirty-truth-2", text: "What is the fastest way for someone to get your attention?" },
      { id: "flirty-truth-3", text: "Which moment this month made you feel especially confident?" },
      { id: "flirty-truth-4", text: "What kind of date plan feels instantly irresistible to you?" },
      { id: "flirty-truth-5", text: "What small detail do you notice first about someone?" },
      { id: "flirty-truth-6", text: "When do you feel the most charming version of yourself?" },
    ],
    dares: [
      { id: "flirty-dare-1", text: "Send a silent-movie blown kiss across the room." },
      { id: "flirty-dare-2", text: "Deliver one sincere compliment with full main-character energy." },
      { id: "flirty-dare-3", text: "Do your best slow spin and strike a confident finish." },
      { id: "flirty-dare-4", text: "Say hello in your smoothest radio-host voice." },
      { id: "flirty-dare-5", text: "Make eye contact for five seconds without laughing." },
      { id: "flirty-dare-6", text: "Pitch yourself as the star of a romantic comedy in one line." },
    ],
  },
  {
    id: "chaos",
    name: "Chaos",
    tagline: "Fast energy",
    description: "Quickfire turns, louder reactions, and bigger game-night moments.",
    accent: "from-[#22d3ee] via-[#0ea5e9] to-[#2563eb]",
    glow: "shadow-[0_22px_60px_rgba(14,165,233,0.28)]",
    truths: [
      { id: "chaos-truth-1", text: "What would your friends roast you for instantly?" },
      { id: "chaos-truth-2", text: "What harmless hill will you defend forever?" },
      { id: "chaos-truth-3", text: "Which habit of yours makes no sense but still works?" },
      { id: "chaos-truth-4", text: "What is your most dramatic overreaction to a tiny problem?" },
      { id: "chaos-truth-5", text: "What talent should absolutely not be taken seriously?" },
      { id: "chaos-truth-6", text: "When did you last act confident and improvise the rest?" },
    ],
    dares: [
      { id: "chaos-dare-1", text: "Create a victory dance using only your elbows and shoulders." },
      { id: "chaos-dare-2", text: "Narrate the next ten seconds like a sports commentator." },
      { id: "chaos-dare-3", text: "Do your best fake loading-screen animation until someone stops you." },
      { id: "chaos-dare-4", text: "Turn a regular sentence into a dramatic plot twist." },
      { id: "chaos-dare-5", text: "Invent a superhero pose and hold it like it is canon." },
      { id: "chaos-dare-6", text: "Announce the next player like a stadium presenter." },
    ],
  },
];

function pickPrompt(modeId: ModeId, type: PromptType, usedIds: string[]) {
  const mode = MODES.find((entry) => entry.id === modeId) ?? MODES[0];
  const pool = type === "truth" ? mode.truths : mode.dares;
  const available = pool.filter((prompt) => !usedIds.includes(prompt.id));
  const source = available.length > 0 ? available : pool;
  const next = source[Math.floor(Math.random() * source.length)];

  return {
    prompt: next,
    nextUsedIds: available.length > 0 ? [...usedIds, next.id] : [next.id],
  };
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-white/12 bg-white/6 px-3 py-2 text-center backdrop-blur-md">
      <p className="text-[0.62rem] uppercase tracking-[0.24em] text-white/55">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export function TruthDareApp() {
  const [screen, setScreen] = useState<Screen>("start");
  const [selectedMode, setSelectedMode] = useState<ModeId>("flirty");
  const [round, setRound] = useState(1);
  const [turnIndex, setTurnIndex] = useState(0);
  const [truthCount, setTruthCount] = useState(0);
  const [dareCount, setDareCount] = useState(0);
  const [usedTruths, setUsedTruths] = useState<string[]>([]);
  const [usedDares, setUsedDares] = useState<string[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [currentType, setCurrentType] = useState<PromptType | null>(null);

  const activeMode = MODES.find((mode) => mode.id === selectedMode) ?? MODES[0];
  const currentPlayer = PLAYERS[turnIndex];
  const roundsCompleted = round - 1;

  const syncViewportHeight = useEffectEvent(() => {
    document.documentElement.style.setProperty("--app-height", `${window.innerHeight}px`);
  });

  useEffect(() => {
    syncViewportHeight();

    const handleResize = () => {
      window.requestAnimationFrame(() => {
        syncViewportHeight();
      });
    };

    const preventBounce = (event: TouchEvent) => {
      if ((event.target as HTMLElement | null)?.closest("[data-allow-touch='true']")) {
        return;
      }

      event.preventDefault();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    document.addEventListener("touchmove", preventBounce, { passive: false });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      document.removeEventListener("touchmove", preventBounce);
    };
  }, []);

  const startGame = () => {
    setRound(1);
    setTurnIndex(0);
    setTruthCount(0);
    setDareCount(0);
    setUsedTruths([]);
    setUsedDares([]);
    setCurrentPrompt(null);
    setCurrentType(null);
    setScreen("game");
  };

  const drawPrompt = (type: PromptType) => {
    if (type === "truth") {
      const { prompt, nextUsedIds } = pickPrompt(selectedMode, type, usedTruths);
      setUsedTruths(nextUsedIds);
      setTruthCount((value) => value + 1);
      setCurrentPrompt(prompt);
      setCurrentType(type);
      return;
    }

    const { prompt, nextUsedIds } = pickPrompt(selectedMode, type, usedDares);
    setUsedDares(nextUsedIds);
    setDareCount((value) => value + 1);
    setCurrentPrompt(prompt);
    setCurrentType(type);
  };

  const rerollPrompt = () => {
    if (!currentType) {
      return;
    }

    if (currentType === "truth") {
      const { prompt, nextUsedIds } = pickPrompt(selectedMode, currentType, usedTruths);
      setUsedTruths(nextUsedIds);
      setCurrentPrompt(prompt);
      return;
    }

    const { prompt, nextUsedIds } = pickPrompt(selectedMode, currentType, usedDares);
    setUsedDares(nextUsedIds);
    setCurrentPrompt(prompt);
  };

  const completeTurn = () => {
    if (!currentPrompt || !currentType) {
      return;
    }

    if (round >= TOTAL_ROUNDS) {
      setScreen("result");
      return;
    }

    setRound((value) => value + 1);
    setTurnIndex((value) => (value + 1) % PLAYERS.length);
    setCurrentPrompt(null);
    setCurrentType(null);
  };

  const dominantStyle =
    truthCount === dareCount
      ? "Perfect split"
      : truthCount > dareCount
        ? "Truth leaning"
        : "Dare leaning";

  return (
    <main
      className="fixed inset-0 isolate overflow-hidden bg-[linear-gradient(180deg,#5f0a15_0%,#35050a_42%,#160205_72%,#050102_100%)] text-white"
      style={{ width: "100vw", height: "var(--app-height, 100dvh)" }}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(255,214,222,0.18),transparent_24%),radial-gradient(circle_at_14%_18%,rgba(248,113,113,0.22),transparent_24%),radial-gradient(circle_at_86%_20%,rgba(96,165,250,0.18),transparent_18%),linear-gradient(180deg,#6f0b17_0%,#3a060b_34%,#180204_68%,#050102_100%)]" />
        <div className="absolute left-[-10vmax] top-[-12vmax] h-[34vmax] w-[34vmax] rounded-full bg-[#fb7185]/12 blur-3xl" />
        <div className="absolute bottom-[-16vmax] right-[-8vmax] h-[34vmax] w-[34vmax] rounded-full bg-[#60a5fa]/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:radial-gradient(rgba(255,255,255,0.14)_0.8px,transparent_0.8px)] [background-size:18px_18px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_34%,rgba(0,0,0,0.42)_100%)]" />
      </div>

      <div className="relative h-full w-full overflow-hidden [padding-top:max(12px,env(safe-area-inset-top))] [padding-right:max(12px,env(safe-area-inset-right))] [padding-bottom:max(12px,env(safe-area-inset-bottom))] [padding-left:max(12px,env(safe-area-inset-left))]">
        <div className="mx-auto h-full w-full max-w-[1580px] overflow-hidden rounded-[28px] border border-white/10 bg-white/6 shadow-[0_32px_100px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
          <AnimatePresence mode="wait">
            <motion.section
              key={screen}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full min-h-0 w-full flex-col overflow-hidden"
            >
              {screen === "start" ? (
                <div className="relative flex h-full min-h-0 items-center justify-center overflow-hidden px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.07),transparent_18%),radial-gradient(circle_at_50%_100%,rgba(35,10,16,0.42),transparent_44%)]" />
                    <div className="absolute inset-x-[8%] top-[8%] h-px bg-gradient-to-r from-transparent via-white/14 to-transparent" />
                  </div>

                  <div className="relative flex h-full w-full items-center justify-center">
                    <div className="pointer-events-none absolute left-1/2 top-[calc(50%+clamp(124px,18vh,176px))] h-[clamp(180px,24vw,300px)] w-[min(78vw,820px)] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.34)_0%,rgba(59,130,246,0.20)_24%,rgba(244,63,94,0.28)_56%,rgba(127,29,29,0.10)_76%,transparent_100%)] opacity-90 blur-[64px] home-glow-pulse" />

                    <section className="home-card-breathe relative w-full max-w-[1020px] overflow-hidden rounded-[28px] border border-white/14 bg-[linear-gradient(160deg,rgba(255,255,255,0.14),rgba(255,255,255,0.07))] px-6 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-[22px] sm:px-8 sm:py-9 md:grid md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-8 lg:px-12 lg:py-11">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.10),transparent_24%)]" />
                      <div className="pointer-events-none absolute inset-[1px] rounded-[27px] border border-white/8" />

                      <div className="relative flex min-h-0 flex-col items-center text-center md:items-start md:text-left">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.34em] text-white/72 backdrop-blur-md">
                          <Heart className="h-4 w-4 text-[#fda4af]" />
                          Fun With U
                        </div>

                        <h1 className="mt-6 max-w-[10ch] text-[clamp(2.85rem,9vw,6.1rem)] font-black leading-[0.88] tracking-[-0.06em] text-white">
                          Fun With U
                        </h1>

                        <p className="mt-4 max-w-xl text-[clamp(0.96rem,2.5vw,1.12rem)] leading-relaxed text-white/72">
                          Couple games for two. Tap in and play together.
                        </p>

                        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                          {["For Two", "Cute Fun", "Quick Play"].map((item) => (
                            <span
                              key={item}
                              className="rounded-full border border-white/10 bg-black/12 px-3 py-2 text-xs uppercase tracking-[0.22em] text-white/60"
                            >
                              {item}
                            </span>
                          ))}
                        </div>

                        <motion.button
                          type="button"
                          onClick={() => setScreen("mode")}
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          transition={{ type: "spring", stiffness: 320, damping: 18 }}
                          className="group mt-8 inline-flex min-h-[3.25rem] items-center justify-center gap-3 rounded-full bg-[linear-gradient(135deg,#ffd7df,#ff8aa2_18%,#ff4d72_58%,#cf1f46_100%)] px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(255,77,114,0.34)]"
                        >
                          <Play className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                          Play Together
                        </motion.button>
                      </div>

                      <div className="relative mt-8 hidden min-h-[22rem] md:flex md:items-center md:justify-center">
                        <div className="absolute h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.16),rgba(255,255,255,0.04)_45%,transparent_72%)] blur-xl" />
                        <div className="absolute h-[12rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.18),rgba(244,63,94,0.16)_56%,transparent_80%)] blur-3xl" />

                        <div className="relative grid w-full max-w-[24rem] gap-4">
                          <div className="rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.07))] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.20)] backdrop-blur-xl">
                            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-white/55">
                              Couple Play
                            </p>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                              {[
                                { label: "Truth", tone: "from-[#7dd3fc] to-[#60a5fa]" },
                                { label: "Dare", tone: "from-[#fda4af] to-[#fb7185]" },
                                { label: "Love", tone: "from-[#fca5a5] to-[#ef4444]" },
                                { label: "Play", tone: "from-[#93c5fd] to-[#38bdf8]" },
                              ].map((item) => (
                                <div
                                  key={item.label}
                                  className="rounded-[18px] border border-white/10 bg-black/10 p-3"
                                >
                                  <div
                                    className={`h-1.5 rounded-full bg-gradient-to-r ${item.tone}`}
                                  />
                                  <p className="mt-3 text-sm font-medium text-white/84">
                                    {item.label}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between rounded-[22px] border border-white/10 bg-black/12 px-5 py-4 backdrop-blur-md">
                            <div>
                              <p className="text-[0.64rem] uppercase tracking-[0.28em] text-white/46">
                                Date Night
                              </p>
                              <p className="mt-2 text-sm text-white/70">
                                One tap to start.
                              </p>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                              <Sparkles className="h-5 w-5 text-white/84" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              ) : null}

              {screen === "mode" ? (
                <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr_auto] gap-4 overflow-hidden px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setScreen("start")}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white/80"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <p className="text-[0.68rem] uppercase tracking-[0.32em] text-white/52">
                      Choose A Mode
                    </p>
                  </div>

                  <div className="max-w-2xl">
                    <h2 className="font-display text-[clamp(2rem,6vw,4rem)] leading-none tracking-[-0.04em] text-white">
                      Pick the energy for this round.
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-white/66 sm:text-base">
                      The layout stays fullscreen, so mode choices are compact, tappable,
                      and balanced to fit phones, tablets, and desktops without scrolling.
                    </p>
                  </div>

                  <div className="grid min-h-0 grid-cols-3 gap-3">
                    {MODES.map((mode) => {
                      const selected = mode.id === selectedMode;
                      const Icon = mode.id === "cozy" ? ShieldCheck : mode.id === "flirty" ? Heart : Zap;

                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setSelectedMode(mode.id)}
                          className={`group flex min-h-0 flex-col overflow-hidden rounded-[24px] border p-3 text-left transition sm:p-4 ${
                            selected
                              ? `border-white/24 bg-white/14 ${mode.glow}`
                              : "border-white/10 bg-white/6"
                          }`}
                        >
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${mode.accent} text-white`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="mt-3 min-h-0">
                            <p className="text-[0.62rem] uppercase tracking-[0.24em] text-white/55">
                              {mode.tagline}
                            </p>
                            <h3 className="mt-2 font-display text-[clamp(1.2rem,3.1vw,2rem)] leading-none text-white">
                              {mode.name}
                            </h3>
                            <p className="mt-2 text-xs leading-5 text-white/68 sm:text-sm">
                              {mode.description}
                            </p>
                          </div>
                          <div className="mt-auto pt-3">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-[0.62rem] uppercase tracking-[0.24em] ${
                                selected
                                  ? "bg-white/16 text-white"
                                  : "bg-white/8 text-white/60"
                              }`}
                            >
                              {selected ? "Selected" : "Tap to select"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid items-center gap-3 lg:grid-cols-[1fr_auto]">
                    <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                      <p className="text-xs uppercase tracking-[0.26em] text-white/55">
                        Current Mode
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div
                          className={`h-3 w-24 rounded-full bg-gradient-to-r ${activeMode.accent}`}
                        />
                        <p className="text-xl font-semibold text-white">{activeMode.name}</p>
                      </div>
                      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/70">
                        {activeMode.description} Prompt decks are short on purpose so the
                        card content always stays comfortably inside the viewport.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={startGame}
                      className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-gradient-to-r ${activeMode.accent} px-6 py-3 text-sm font-semibold text-white shadow-[0_22px_50px_rgba(0,0,0,0.26)] transition hover:scale-[1.01] active:scale-[0.99]`}
                    >
                      <Sparkles className="h-4 w-4" />
                      Begin Match
                    </button>
                  </div>
                </div>
              ) : null}

              {screen === "game" ? (
                <div className="grid h-full min-h-0 grid-rows-[auto_auto_1fr_auto] gap-3 overflow-hidden px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setScreen("mode")}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white/80"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Modes
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      <StatPill label="Mode" value={activeMode.name} />
                      <StatPill label="Round" value={`${round}/${TOTAL_ROUNDS}`} />
                      <StatPill label="Turn" value={currentPlayer} />
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_18rem]">
                    <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/55">
                        Current Player
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${activeMode.accent}`}
                        >
                          <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-white/48">
                            Your move
                          </p>
                          <h2 className="font-display text-3xl leading-none text-white">
                            {currentPlayer}
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <StatPill label="Truths" value={String(truthCount)} />
                      <StatPill label="Dares" value={String(dareCount)} />
                      <StatPill label="Style" value={dominantStyle} />
                    </div>
                  </div>

                  <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-3 lg:grid-cols-[minmax(0,1fr)_18rem] lg:grid-rows-1">
                    <div className="min-h-0 overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.08))] p-4 sm:p-5">
                      <div className="flex h-full min-h-0 flex-col">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-white/55">
                              Prompt Card
                            </p>
                            <p className="mt-2 text-sm text-white/64">
                              Choose Truth or Dare to reveal the next challenge.
                            </p>
                          </div>
                          {currentType ? (
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
                                currentType === "truth"
                                  ? "bg-[#f59e0b]/18 text-[#fde68a]"
                                  : "bg-[#0ea5e9]/18 text-[#bae6fd]"
                              }`}
                            >
                              {currentType}
                            </span>
                          ) : null}
                        </div>

                        <div className="flex min-h-0 flex-1 items-center justify-center py-4">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={currentPrompt?.id ?? "empty"}
                              initial={{ opacity: 0, y: 24, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -16, scale: 0.98 }}
                              transition={{ duration: 0.28 }}
                              className={`flex h-full w-full max-w-4xl flex-col justify-between rounded-[26px] border border-white/12 bg-[#091325]/70 p-5 sm:p-6 ${activeMode.glow}`}
                            >
                              {currentPrompt ? (
                                <>
                                  <div
                                    className={`h-2 rounded-full bg-gradient-to-r ${activeMode.accent}`}
                                  />
                                  <div className="flex flex-1 items-center justify-center py-4">
                                    <p className="max-w-3xl text-center font-display text-[clamp(1.65rem,4vw,3.4rem)] leading-[1.06] tracking-[-0.03em] text-white">
                                      {currentPrompt.text}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.24em] text-white/48">
                                    <span>Tap complete when the turn is done</span>
                                    <span>{activeMode.name} deck</span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex h-full flex-col items-center justify-center text-center">
                                  <div
                                    className={`flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br ${activeMode.accent}`}
                                  >
                                    <Sparkles className="h-7 w-7 text-white" />
                                  </div>
                                  <h3 className="mt-5 font-display text-[clamp(1.8rem,4vw,3rem)] leading-none text-white">
                                    Truth or Dare?
                                  </h3>
                                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/64 sm:text-base">
                                    Pick a button below to deal the first card. Every prompt
                                    is kept concise so it stays readable inside this single
                                    fullscreen panel.
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    <div className="grid min-h-0 grid-cols-2 gap-3 lg:grid-cols-1 lg:grid-rows-[repeat(4,minmax(0,1fr))]">
                      <button
                        type="button"
                        onClick={() => drawPrompt("truth")}
                        className="flex min-h-0 flex-col justify-between rounded-[24px] border border-[#f59e0b]/22 bg-[#f59e0b]/10 p-4 text-left transition hover:bg-[#f59e0b]/14"
                      >
                        <p className="text-xs uppercase tracking-[0.24em] text-[#fde68a]">Reveal</p>
                        <div>
                          <h3 className="font-display text-3xl leading-none text-white">Truth</h3>
                          <p className="mt-2 text-sm leading-relaxed text-white/70">
                            Honest, reflective, quick to read.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => drawPrompt("dare")}
                        className="flex min-h-0 flex-col justify-between rounded-[24px] border border-[#0ea5e9]/22 bg-[#0ea5e9]/10 p-4 text-left transition hover:bg-[#0ea5e9]/14"
                      >
                        <p className="text-xs uppercase tracking-[0.24em] text-[#bae6fd]">Reveal</p>
                        <div>
                          <h3 className="font-display text-3xl leading-none text-white">Dare</h3>
                          <p className="mt-2 text-sm leading-relaxed text-white/70">
                            Instant action, no messy instructions.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={rerollPrompt}
                        disabled={!currentPrompt}
                        className="inline-flex min-h-0 items-center justify-center gap-2 rounded-[22px] border border-white/12 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition enabled:hover:bg-white/12 disabled:cursor-not-allowed disabled:text-white/35"
                      >
                        <Shuffle className="h-4 w-4" />
                        Shuffle
                      </button>
                      <button
                        type="button"
                        onClick={completeTurn}
                        disabled={!currentPrompt}
                        className={`inline-flex min-h-0 items-center justify-center gap-2 rounded-[22px] bg-gradient-to-r ${activeMode.accent} px-4 py-3 text-sm font-semibold text-white transition enabled:hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-45`}
                      >
                        <Check className="h-4 w-4" />
                        Complete
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-white/6 px-4 py-3">
                    <p className="hidden text-sm text-white/64 sm:block">
                      Screen transitions are animated and contained inside the app shell,
                      so navigation never depends on page scrolling.
                    </p>
                    <button
                      type="button"
                      onClick={() => setScreen("result")}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white/80"
                    >
                      <Trophy className="h-4 w-4" />
                      End Early
                    </button>
                  </div>
                </div>
              ) : null}

              {screen === "result" ? (
                <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] gap-4 overflow-hidden px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setScreen("mode")}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm text-white/80"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Change Mode
                    </button>
                    <p className="text-[0.68rem] uppercase tracking-[0.32em] text-white/52">
                      Match Summary
                    </p>
                  </div>

                  <div className="grid min-h-0 items-center gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] p-5 sm:p-7">
                      <div
                        className={`inline-flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br ${activeMode.accent}`}
                      >
                        <Trophy className="h-8 w-8 text-white" />
                      </div>
                      <p className="mt-5 text-xs uppercase tracking-[0.28em] text-white/55">
                        Session Complete
                      </p>
                      <h2 className="mt-3 font-display text-[clamp(2.3rem,6vw,5rem)] leading-[0.94] tracking-[-0.05em] text-white">
                        {roundsCompleted > 0 ? "That round landed clean." : "Ready for the first real round?"}
                      </h2>
                      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/68 sm:text-base">
                        {roundsCompleted > 0
                          ? `You finished ${roundsCompleted} turn${roundsCompleted === 1 ? "" : "s"} in ${activeMode.name} mode with a ${dominantStyle.toLowerCase()} mix.`
                          : "You exited before any prompt was completed, so the app stayed in a ready state without breaking the fullscreen layout."}
                      </p>
                    </div>

                    <div className="grid gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-white/55">Completed</p>
                          <p className="mt-3 font-display text-5xl leading-none text-white">
                            {roundsCompleted}
                          </p>
                        </div>
                        <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-white/55">Mode</p>
                          <p className="mt-3 font-display text-4xl leading-none text-white">
                            {activeMode.name}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <StatPill label="Truths" value={String(truthCount)} />
                        <StatPill label="Dares" value={String(dareCount)} />
                        <StatPill label="Balance" value={dominantStyle} />
                      </div>

                      <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/55">
                          Viewport Integrity
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-white/68">
                          The document remains overflow-hidden here too, so even the result
                          state behaves like a screen transition inside a fixed app frame.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-white/60">
                      Restart the same mode or jump back to mode selection without ever
                      leaving the fullscreen shell.
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={startGame}
                        className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-gradient-to-r ${activeMode.accent} px-6 py-3 text-sm font-semibold text-white shadow-[0_22px_50px_rgba(0,0,0,0.26)] transition hover:scale-[1.01] active:scale-[0.99]`}
                      >
                        <RotateCw className="h-4 w-4" />
                        Play Again
                      </button>
                      <button
                        type="button"
                        onClick={() => setScreen("start")}
                        className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/12 bg-white/8 px-6 py-3 text-sm font-semibold text-white/86 transition hover:bg-white/12"
                      >
                        <Play className="h-4 w-4" />
                        Home
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </motion.section>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
