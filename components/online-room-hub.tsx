"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, DoorOpen, PlusCircle, Radio, Users, Wifi } from "lucide-react";
import { useGameStore } from "@/utils/game-store";
import {
  createRoom,
  fetchRoomByCode,
  joinRoom,
  normalizeRoomCode,
} from "@/utils/online-room";

interface OnlineRoomHubProps {
  onBack: () => void;
}

export function OnlineRoomHub({ onBack }: OnlineRoomHubProps) {
  const onlineRoom = useGameStore((state) => state.onlineRoom);
  const onlineRole = useGameStore((state) => state.onlineRole);
  const onlineRoomLoading = useGameStore((state) => state.onlineRoomLoading);
  const onlineError = useGameStore((state) => state.onlineError);
  const clearOnlineError = useGameStore((state) => state.clearOnlineError);
  const leaveOnlineRoom = useGameStore((state) => state.leaveOnlineRoom);
  const syncOnlineRoom = useGameStore((state) => state.syncOnlineRoom);
  const [createName, setCreateName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [createdPlayerName, setCreatedPlayerName] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [joinedRoomCode, setJoinedRoomCode] = useState<string | null>(null);
  const [joinedPlayerName, setJoinedPlayerName] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joiningRoom, setJoiningRoom] = useState(false);

  if (onlineRoomLoading && !onlineRoom) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-4xl rounded-[2rem] border border-[#d9a7b1]/40 bg-[linear-gradient(180deg,rgba(255,253,253,0.94),rgba(255,241,244,0.94))] p-6 shadow-[0_24px_70px_rgba(88,18,33,0.10)] backdrop-blur sm:p-8"
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
            <Wifi className="h-4 w-4" />
            Realtime Sync
          </div>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-[#ebcad0] bg-white p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#a25f6d]">Loading Room</p>
          <h2 className="mt-3 font-display text-4xl text-[#5f1626]">Restoring your live room</h2>
          <p className="mt-3 text-sm leading-7 text-[#85505c] sm:text-base">
            We&apos;re validating the saved session and pulling the latest players from Supabase.
          </p>
        </div>
      </motion.section>
    );
  }

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
              onClick={() => void syncOnlineRoom()}
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

      {createdRoomCode ? (
        <div className="rounded-[1.5rem] border border-[#bfe4cb] bg-[#f2fff6] px-5 py-4 text-sm text-[#1c6a35]">
          Room created for <span className="font-semibold">{createdPlayerName}</span>. Your
          code is <span className="font-semibold tracking-[0.22em]">{createdRoomCode}</span>.
          The live lobby is opening now and will stay synced through Supabase realtime.
        </div>
      ) : null}

      {joinedRoomCode ? (
        <div className="rounded-[1.5rem] border border-[#bfe4cb] bg-[#f2fff6] px-5 py-4 text-sm text-[#1c6a35]">
          <span className="font-semibold">{joinedPlayerName}</span> joined room{" "}
          <span className="font-semibold tracking-[0.22em]">{joinedRoomCode}</span>. The lobby
          will update automatically for both players.
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-[#d9a8b1]/40 bg-[linear-gradient(180deg,rgba(255,253,253,0.94),rgba(255,241,244,0.94))] p-6 shadow-[0_24px_70px_rgba(88,18,33,0.10)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#ffe1e7,#ffc5d0)] text-[#9b4154]">
            <PlusCircle className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-display text-4xl text-[#5f1626]">Create Room</h2>
          <p className="mt-3 text-sm leading-7 text-[#85505c] sm:text-base">
            Enter the host player name and we will call your Supabase RPC to create a
            unique room code. This phase is only for validating room creation.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              clearOnlineError();
              setCreateError(null);
              setCreatedRoomCode(null);
              setJoinedRoomCode(null);

              const trimmedName = createName.trim();

              if (!trimmedName) {
                setCreateError("Enter a player name before creating a room.");
                return;
              }

              setCreatingRoom(true);

              try {
                const code = await createRoom(trimmedName);
                await syncOnlineRoom();

                setCreatedRoomCode(code);
                setCreatedPlayerName(trimmedName);
                setCreateName("");
              } catch (error) {
                setCreateError(
                  error instanceof Error ? error.message : "Unable to create the room.",
                );
              } finally {
                setCreatingRoom(false);
              }
            }}
          >
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#8a4958]">Your Name</span>
              <input
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                placeholder="Vikas"
                className="w-full rounded-2xl border border-[#ebc8cf] bg-white px-4 py-3 text-[#4b1824] outline-none transition placeholder:text-[#c39ba4] focus:border-[#c85f73]"
              />
            </label>

            <button
              type="submit"
              disabled={creatingRoom}
              className="w-full rounded-full bg-[linear-gradient(135deg,#c84d63,#7f1d2d)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(127,29,45,0.22)] disabled:cursor-wait disabled:opacity-80"
            >
              {creatingRoom ? "Creating Room..." : "Create Room In Supabase"}
            </button>
          </form>

          {createError ? (
            <div className="mt-4 rounded-[1.25rem] border border-[#f3c2ca] bg-[#fff2f5] px-4 py-3 text-sm text-[#8d4353]">
              {createError}
            </div>
          ) : null}
        </div>

        <div className="rounded-[2rem] border border-[#d9a8b1]/40 bg-[linear-gradient(180deg,rgba(255,253,253,0.94),rgba(255,241,244,0.94))] p-6 shadow-[0_24px_70px_rgba(88,18,33,0.10)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#e2f0ff,#cde2ff)] text-[#436fb8]">
            <Users className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-display text-4xl text-[#5f1626]">Join Room</h2>
          <p className="mt-3 text-sm leading-7 text-[#85505c] sm:text-base">
            Enter the room code and player name to join the existing Supabase room.
            This test should add a second player to the same room.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              clearOnlineError();
              setJoinError(null);
              setJoinedRoomCode(null);

              const normalizedCode = normalizeRoomCode(roomCode);
              const trimmedName = joinName.trim();

              if (!normalizedCode) {
                setJoinError("Enter the room code before joining.");
                return;
              }

              if (!trimmedName) {
                setJoinError("Enter your name before joining.");
                return;
              }

              setJoiningRoom(true);

              try {
                const room = await fetchRoomByCode(normalizedCode);

                if (!room) {
                  setJoinError("Room code not found. Check the code and try again.");
                  return;
                }

                if (room.playerCount >= 2) {
                  setJoinError("This room is already full.");
                  return;
                }

                await joinRoom(normalizedCode, trimmedName);
                await syncOnlineRoom();
                setJoinedRoomCode(normalizedCode);
                setJoinedPlayerName(trimmedName);
                setJoinName("");
              } catch (error) {
                setJoinError(error instanceof Error ? error.message : "Unable to join the room.");
              } finally {
                setJoiningRoom(false);
              }
            }}
          >
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#8a4958]">Your Name</span>
              <input
                value={joinName}
                onChange={(event) => setJoinName(event.target.value)}
                placeholder="Partner"
                className="w-full rounded-2xl border border-[#ebc8cf] bg-white px-4 py-3 text-[#4b1824] outline-none transition placeholder:text-[#c39ba4] focus:border-[#6c95d4]"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#8a4958]">6-Character Room Code</span>
              <input
                value={roomCode}
                onChange={(event) => setRoomCode(normalizeRoomCode(event.target.value))}
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="a3f91c"
                className="w-full rounded-2xl border border-[#ebc8cf] bg-white px-4 py-3 text-[#4b1824] outline-none transition placeholder:text-[#c39ba4] focus:border-[#6c95d4]"
              />
            </label>

            <button
              type="submit"
              disabled={joiningRoom}
              className="w-full rounded-full border border-[#9ebae7] bg-white px-6 py-3 text-sm font-semibold text-[#436fb8] shadow-[0_16px_32px_rgba(67,111,184,0.14)] disabled:cursor-wait disabled:opacity-80"
            >
              {joiningRoom ? "Joining Room..." : "Join This Room"}
            </button>
          </form>

          {joinError ? (
            <div className="mt-4 rounded-[1.25rem] border border-[#f3c2ca] bg-[#fff2f5] px-4 py-3 text-sm text-[#8d4353]">
              {joinError}
            </div>
          ) : null}
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
