"use client";

import { useRef } from "react";

export function useGameSounds() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSequence = (
    steps: Array<{
      frequency: number;
      duration: number;
      type: OscillatorType;
      gain: number;
    }>,
  ) => {
    if (typeof window === "undefined") {
      return;
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;

    if (context.state === "suspended") {
      void context.resume();
    }

    let cursor = context.currentTime;

    steps.forEach((step) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const attack = Math.min(step.duration * 0.28, 0.03);
      const endTime = cursor + step.duration;

      oscillator.type = step.type;
      oscillator.frequency.setValueAtTime(step.frequency, cursor);

      gainNode.gain.setValueAtTime(0.0001, cursor);
      gainNode.gain.exponentialRampToValueAtTime(step.gain, cursor + attack);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start(cursor);
      oscillator.stop(endTime);

      cursor = endTime + 0.02;
    });
  };

  const playDice = () =>
    playSequence([
      { frequency: 540, duration: 0.06, type: "square", gain: 0.035 },
      { frequency: 740, duration: 0.07, type: "square", gain: 0.03 },
      { frequency: 620, duration: 0.09, type: "triangle", gain: 0.025 },
    ]);

  const playUnwrap = () =>
    playSequence([
      { frequency: 380, duration: 0.08, type: "triangle", gain: 0.028 },
      { frequency: 520, duration: 0.08, type: "triangle", gain: 0.024 },
      { frequency: 690, duration: 0.1, type: "sine", gain: 0.018 },
    ]);

  const playLand = () =>
    playSequence([
      { frequency: 330, duration: 0.09, type: "sine", gain: 0.03 },
      { frequency: 220, duration: 0.14, type: "triangle", gain: 0.025 },
    ]);

  const playCard = () =>
    playSequence([
      { frequency: 460, duration: 0.1, type: "triangle", gain: 0.025 },
      { frequency: 690, duration: 0.12, type: "sine", gain: 0.022 },
      { frequency: 920, duration: 0.08, type: "sine", gain: 0.016 },
    ]);

  return {
    playDice,
    playUnwrap,
    playLand,
    playCard,
  };
}
