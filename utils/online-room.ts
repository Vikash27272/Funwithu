import type { OnlineRoom } from "@/types/game";

const ROOM_PREFIX = "couple-game-room:";

function getRoomKey(code: string) {
  return `${ROOM_PREFIX}${code}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function normalizeRoomCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function generateRoomCode() {
  if (!canUseStorage()) {
    return `${Math.floor(100000 + Math.random() * 900000)}`;
  }

  for (let attempt = 0; attempt < 60; attempt += 1) {
    const code = `${Math.floor(100000 + Math.random() * 900000)}`;

    if (!window.localStorage.getItem(getRoomKey(code))) {
      return code;
    }
  }

  return `${Math.floor(100000 + Math.random() * 900000)}`;
}

export function readRoom(code: string) {
  if (!canUseStorage()) {
    return null;
  }

  const normalizedCode = normalizeRoomCode(code);

  if (!normalizedCode) {
    return null;
  }

  const raw = window.localStorage.getItem(getRoomKey(normalizedCode));

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as OnlineRoom;
  } catch {
    return null;
  }
}

export function writeRoom(room: OnlineRoom) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    getRoomKey(room.code),
    JSON.stringify({
      ...room,
      updatedAt: Date.now(),
    } satisfies OnlineRoom),
  );
}

export function removeRoom(code: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(getRoomKey(normalizeRoomCode(code)));
}
