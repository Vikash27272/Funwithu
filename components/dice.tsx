"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { PlayerKey } from "@/types/game";

interface DiceProps {
  player: PlayerKey;
  disabled?: boolean;
  onRoll: (player: PlayerKey, value: number) => void;
  onRollStart?: () => void;
  onRollComplete?: () => void;
}

const FACE_ROTATIONS: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: 0, y: -180 },
  4: { x: 0, y: 90 },
  5: { x: -90, y: 0 },
  6: { x: 90, y: 0 },
};

const FACE_PIPS: Record<1 | 2 | 3 | 4 | 5 | 6, Array<[number, number]>> = {
  1: [[2, 2]],
  2: [
    [1, 1],
    [3, 3],
  ],
  3: [
    [1, 1],
    [2, 2],
    [3, 3],
  ],
  4: [
    [1, 1],
    [1, 3],
    [3, 1],
    [3, 3],
  ],
  5: [
    [1, 1],
    [1, 3],
    [2, 2],
    [3, 1],
    [3, 3],
  ],
  6: [
    [1, 1],
    [1, 3],
    [2, 1],
    [2, 3],
    [3, 1],
    [3, 3],
  ],
};

function DiceFace({ value, transform }: { value: 1 | 2 | 3 | 4 | 5 | 6; transform: string }) {
  return (
    <div
      className="absolute inset-0 rounded-[1rem] border border-white/85 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,236,240,0.96))] shadow-[inset_0_1px_0_rgba(255,255,255,0.96),0_14px_24px_rgba(71,22,31,0.12)] [backface-visibility:hidden] sm:rounded-[1.15rem]"
      style={{ transform }}
    >
      <div className="grid h-full w-full grid-cols-3 grid-rows-3 p-2.5 sm:p-3">
        {Array.from({ length: 9 }, (_, index) => {
          const row = Math.floor(index / 3) + 1;
          const column = (index % 3) + 1;
          const active = FACE_PIPS[value].some(
            ([pipRow, pipColumn]) => pipRow === row && pipColumn === column,
          );

          return (
            <span key={index} className="flex items-center justify-center">
              {active ? (
                <span className="h-2 w-2 rounded-full bg-[linear-gradient(180deg,#6b1526,#341019)] shadow-[0_2px_4px_rgba(52,16,25,0.24)] sm:h-2.5 sm:w-2.5" />
              ) : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function Dice({
  player,
  disabled = false,
  onRoll,
  onRollStart,
  onRollComplete,
}: DiceProps) {
  const [face, setFace] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [rolling, setRolling] = useState(false);
  const [targetFace, setTargetFace] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const pendingFaceRef = useRef<1 | 2 | 3 | 4 | 5 | 6>(1);
  const FACE_Z = 32;
  const FACE_EPSILON = 0.2;

  const roll = () => {
    if (disabled || rolling) {
      return;
    }

    const finalValue = (Math.floor(Math.random() * 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
    pendingFaceRef.current = finalValue;
    setTargetFace(finalValue);
    setRolling(true);
    onRollStart?.();
  };

  const activeFace = rolling ? targetFace : face;
  const currentRotation = FACE_ROTATIONS[face];
  const nextRotation = FACE_ROTATIONS[activeFace];

  return (
    <div className="relative flex h-[5.4rem] w-[5.4rem] items-end justify-center pb-2 sm:h-[6rem] sm:w-[6rem]">
      <motion.button
        type="button"
        onClick={roll}
        disabled={disabled || rolling}
        className="relative h-[4.35rem] w-[4.35rem] cursor-pointer rounded-[1rem] [transform-style:preserve-3d] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[4.85rem] sm:w-[4.85rem] sm:rounded-[1.15rem]"
        style={{ transformStyle: "preserve-3d" }}
        animate={
          rolling
            ? {
                rotateX: [currentRotation.x, currentRotation.x + 720 + (nextRotation.x - currentRotation.x)],
                rotateY: [currentRotation.y, currentRotation.y + 720 + (nextRotation.y - currentRotation.y)],
                rotateZ: [0, 10, -6, 3, 0],
                y: [0, -40, 0],
                scale: [1, 1.2, 0.9, 1],
              }
            : {
                rotateX: currentRotation.x,
                rotateY: currentRotation.y,
                rotateZ: 0,
                y: 0,
                scale: 1,
              }
        }
        transition={
          rolling
            ? {
                duration: 1.25,
                times: [0, 0.55, 1],
                ease: ["easeOut", "easeInOut", "easeOut"],
              }
            : { duration: 0.25, ease: "easeOut" }
        }
        onAnimationComplete={() => {
          if (!rolling) {
            return;
          }

          const finalValue = pendingFaceRef.current;
          setFace(finalValue);
          setRolling(false);
          onRollComplete?.();
          onRoll(player, finalValue);
        }}
        aria-label="Roll dice"
      >
        <DiceFace value={1} transform={`rotateY(0deg) translateZ(${FACE_Z + FACE_EPSILON}px)`} />
        <DiceFace value={2} transform={`rotateY(90deg) translateZ(${FACE_Z + FACE_EPSILON}px)`} />
        <DiceFace value={3} transform={`rotateY(180deg) translateZ(${FACE_Z + FACE_EPSILON}px)`} />
        <DiceFace value={4} transform={`rotateY(-90deg) translateZ(${FACE_Z + FACE_EPSILON}px)`} />
        <DiceFace value={5} transform={`rotateX(90deg) translateZ(${FACE_Z + FACE_EPSILON}px)`} />
        <DiceFace value={6} transform={`rotateX(-90deg) translateZ(${FACE_Z + FACE_EPSILON}px)`} />
      </motion.button>
      <motion.div
        animate={
          rolling
            ? {
                scale: [1, 1.6, 1],
                opacity: [0.5, 0.2, 0.6],
              }
            : {
                scale: 1,
                opacity: 0.5,
              }
        }
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="absolute bottom-0.5 h-3 w-11 rounded-full bg-black/40 blur-md sm:w-12"
      />
    </div>
  );
}
