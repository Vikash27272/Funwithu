"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, DoorOpen, PlusCircle, Radio, Users, Wifi } from "lucide-react";
import { useGameStore } from "@/utils/game-store";

interface OnlineRoomHubProps {
  onBack: () => void;
}

export function OnlineRoomHub({ onBack }: OnlineRoomHubProps) {
  const onlineRoom = useGameStore((state) => state.onlineRoom);
  const onlineRole = useGameStore((state) => state.onlineRole);
  const onlineError = useGameStore((state) => state.onlineError);
  const createOnlineRoom = useGameStore((state) => state.createOnlineRoom);
  const joinOnlineRoom = useGameStore((state) => state.joinOnlineRoom);
  const clearOnlineError = useGameStore((state) => state.clearOnlineError);
  const leaveOnlineRoom = useGameStore((state) => state.leaveOnlineRoom);
  const syncOnlineRoom = useGameStore((state) => state.syncOnlineRoom);
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");

  if (onlineRoom && onlineRole) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl rounded-[2rem] border border-[#d9a7b1]/40 bg-[linear-gradient(180deg,rgba(255,253,253,0.94),rgba(255,241,244,0.94))] p-6 shadow-[0_24px_70px_rgba(88,18,33,0.10)] backdrop-blur sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[#e8c4cb] bg-white px-4 py-2 text-sm text-[#84424f]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ecc4cb] bg-white px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#8d4858]">
            <Wifi className="h-4 w-4" />
            Active Room
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[#ebcad0] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#a25f6d]">Ready To Resume</p>
          <h2 className="mt-3 font-display text-4xl text-[#5f1626]">{onlineRoom.name}</h2>
          <p className="mt-3 text-sm leading-7 text-[#85505c] sm:text-base">
            Room code <span className="font-semibold text-[#6e2435]">{onlineRoom.code}</span>.
            You are currently in the{" "}
            <span className="font-semibold text-[#6e2435]">
              {onlineRole === "male" ? "Male / Admin" : "Female / Joiner"}
            </span>{" "}
            slot.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={syncOnlineRoom}
              className="rounded-full bg-[linear-gradient(135deg,#c84d63,#7f1d2d)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(127,29,45,0.22)]"
            >
              Open Lobby
            </button>
            <button
              type="button"
              onClick={() => leaveOnlineRoom("online-room")}
              className="inline-flex items-center gap-2 rounded-full border border-[#ebccd2] bg-white px-6 py-3 text-sm font-semibold text-[#8a4353]"
            >
              <DoorOpen className="h-4 w-4" />
              Leave Room
            </button>
          </div>
        </div>
      </motion.section>
    );
  }

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
          className="inline-flex items-center gap-2 rounded-full border border-[#e8c4cb] bg-white px-4 py-2 text-sm text-[#84424f]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#ecc4cb] bg-white px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#8d4858]">
          <Radio className="h-4 w-4" />
          Online Room
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-[#d9a8b1]/40 bg-[linear-gradient(180deg,rgba(255,253,253,0.94),rgba(255,241,244,0.94))] p-6 shadow-[0_24px_70px_rgba(88,18,33,0.10)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#ffe1e7,#ffc5d0)] text-[#9b4154]">
            <PlusCircle className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-display text-4xl text-[#5f1626]">Create Room</h2>
          <p className="mt-3 text-sm leading-7 text-[#85505c] sm:text-base">
            Give the room a name and we will create a unique 6-digit code. The room
            creator becomes the Male admin by default.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              clearOnlineError();
              createOnlineRoom(roomName);
            }}
          >
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#8a4958]">Room Name</span>
              <input
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                placeholder="Tonight Dare Room"
                className="w-full rounded-2xl border border-[#ebc8cf] bg-white px-4 py-3 text-[#4b1824] outline-none transition placeholder:text-[#c39ba4] focus:border-[#c85f73]"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-[linear-gradient(135deg,#c84d63,#7f1d2d)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(127,29,45,0.22)]"
            >
              Create 6-Digit Room Code
            </button>
          </form>
        </div>

        <div className="rounded-[2rem] border border-[#d9a8b1]/40 bg-[linear-gradient(180deg,rgba(255,253,253,0.94),rgba(255,241,244,0.94))] p-6 shadow-[0_24px_70px_rgba(88,18,33,0.10)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#e2f0ff,#cde2ff)] text-[#436fb8]">
            <Users className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-display text-4xl text-[#5f1626]">Join Room</h2>
          <p className="mt-3 text-sm leading-7 text-[#85505c] sm:text-base">
            Enter the room code to join instantly. The joiner takes the Female slot
            by default, and the room stays limited to two players only.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              clearOnlineError();
              joinOnlineRoom(roomCode);
            }}
          >
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#8a4958]">6-Digit Room Code</span>
              <input
                value={roomCode}
                onChange={(event) =>
                  setRoomCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                placeholder="123456"
                className="w-full rounded-2xl border border-[#ebc8cf] bg-white px-4 py-3 text-[#4b1824] outline-none transition placeholder:text-[#c39ba4] focus:border-[#c85f73]"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-full border border-[#d9b7bf] bg-white px-6 py-3 text-sm font-semibold text-[#8a4353] shadow-[0_16px_32px_rgba(127,29,45,0.08)]"
            >
              Join This Room
            </button>
          </form>
        </div>
      </div>

      {onlineError ? (
        <div className="rounded-[1.5rem] border border-[#f3c2ca] bg-[#fff2f5] px-5 py-4 text-sm text-[#8d4353]">
          {onlineError}
        </div>
      ) : null}
    </motion.section>
  );
}
