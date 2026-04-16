import type { RealtimeChannel } from "@supabase/supabase-js";
import type {
  GameKey,
  OnlineMatchSnapshot,
  OnlineInteractionPhase,
  OnlineRoom,
  OnlineRoomPhase,
  PlayerKey,
} from "@/types/game";
import { supabase } from "@/utils/supabase";

interface CreateRoomRpcResult {
  room_code: string;
  player_id: string;
  room_id: string;
}

interface JoinRoomRpcResult {
  player_id: string;
  room_id: string;
}

interface RoomRow {
  id: string;
  room_code: string;
  created_at: string;
}

interface PlayerRow {
  id: string;
  room_id: string;
  name: string;
  joined_at: string;
}

interface GameStateRow {
  room_id: string;
  turn: string | null;
  data: unknown;
  updated_at: string;
}

interface StoredRoomState {
  game_over?: boolean;
  started?: boolean;
  players_order?: string[];
  turn_index?: number;
  phase?: OnlineRoomPhase | OnlineInteractionPhase;
  current_question?: string | null;
  question_type?: "truth" | "dare" | null;
  action_by?: string | null;
  selectedGame?: GameKey | null;
  matchSnapshot?: OnlineMatchSnapshot | null;
}

export interface StoredPlayerSession {
  playerId: string;
  playerName: string | null;
  roomId: string;
  roomCode: string | null;
}

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function roleForIndex(index: number): PlayerKey | null {
  if (index === 0) {
    return "male";
  }

  if (index === 1) {
    return "female";
  }

  return null;
}

function toTimestamp(value?: string | null) {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function normalizeNullableString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.toLowerCase() === "null") {
    return null;
  }

  return trimmed;
}

function parseStoredRoomState(data: unknown): StoredRoomState {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {};
  }

  const candidate = data as Record<string, unknown>;

  return {
    game_over: typeof candidate.game_over === "boolean" ? candidate.game_over : undefined,
    started: typeof candidate.started === "boolean" ? candidate.started : undefined,
    players_order: Array.isArray(candidate.players_order)
      ? candidate.players_order.filter((value): value is string => typeof value === "string")
      : undefined,
    turn_index:
      typeof candidate.turn_index === "number" && Number.isInteger(candidate.turn_index)
        ? candidate.turn_index
        : undefined,
    phase:
      candidate.phase === "lobby" ||
      candidate.phase === "mode-select" ||
      candidate.phase === "playing" ||
      candidate.phase === "idle" ||
      candidate.phase === "question"
        ? candidate.phase
        : undefined,
    current_question: normalizeNullableString(candidate.current_question),
    question_type:
      candidate.question_type === "truth" || candidate.question_type === "dare"
        ? candidate.question_type
        : null,
    action_by: normalizeNullableString(candidate.action_by),
    selectedGame: candidate.selectedGame === "truth-dare" ? "truth-dare" : null,
    matchSnapshot:
      candidate.matchSnapshot && typeof candidate.matchSnapshot === "object"
        ? (candidate.matchSnapshot as OnlineMatchSnapshot)
        : null,
  };
}

function buildRoomFromRows(
  room: RoomRow,
  players: PlayerRow[],
  gameState: GameStateRow | null,
): OnlineRoom {
  const orderedPlayers = [...players].sort(
    (left, right) => toTimestamp(left.joined_at) - toTimestamp(right.joined_at),
  );
  const storedState = parseStoredRoomState(gameState?.data);
  const screenPhase =
    storedState.phase === "lobby" ||
    storedState.phase === "mode-select" ||
    storedState.phase === "playing"
      ? storedState.phase
      : undefined;
  const interactionPhase =
    storedState.phase === "idle" || storedState.phase === "question"
      ? storedState.phase
      : undefined;
  const mappedPlayers: OnlineRoom["players"] = {
    male: null,
    female: null,
  };

  orderedPlayers.forEach((player, index) => {
    const role = roleForIndex(index);

    if (!role) {
      return;
    }

    mappedPlayers[role] = {
      id: player.id,
      role,
      name: player.name,
      isHost: role === "male",
      joinedAt: toTimestamp(player.joined_at),
    };
  });

  return {
    id: room.id,
    code: room.room_code,
    name: `Private Room ${room.room_code.toUpperCase()}`,
    createdAt: toTimestamp(room.created_at),
    updatedAt: Math.max(
      toTimestamp(room.created_at),
      toTimestamp(gameState?.updated_at),
      ...orderedPlayers.map((player) => toTimestamp(player.joined_at)),
    ),
    gameOver: storedState.game_over ?? false,
    playerCount: orderedPlayers.length,
    started:
      storedState.started ??
      (screenPhase === "mode-select" ||
        screenPhase === "playing" ||
        interactionPhase === "idle" ||
        interactionPhase === "question" ||
        Boolean(storedState.matchSnapshot)),
    playersOrder: storedState.players_order ?? orderedPlayers.map((player) => player.id).slice(0, 2),
    turnIndex: storedState.turn_index ?? 0,
    interactionPhase: interactionPhase ?? (storedState.started ? "idle" : null),
    currentQuestion: storedState.current_question ?? null,
    questionType: storedState.question_type ?? null,
    actionBy: storedState.action_by ?? null,
    selectedGame: storedState.selectedGame ?? null,
    phase: screenPhase ?? (storedState.started ? "playing" : "lobby"),
    players: mappedPlayers,
    matchSnapshot: storedState.matchSnapshot ?? null,
  };
}

function storePlayerSession({
  playerId,
  playerName,
  roomCode,
  roomId,
}: {
  playerId: string;
  playerName: string;
  roomCode: string;
  roomId: string;
}) {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem("player_id", playerId);
  window.sessionStorage.setItem("player_name", playerName);
  window.sessionStorage.setItem("room_id", roomId);
  window.sessionStorage.setItem("room_code", roomCode);
}

export function readPlayerSession(): StoredPlayerSession | null {
  if (!canUseSessionStorage()) {
    return null;
  }

  const playerId = window.sessionStorage.getItem("player_id");
  const roomId = window.sessionStorage.getItem("room_id");

  if (!playerId || !roomId) {
    return null;
  }

  return {
    playerId,
    playerName: window.sessionStorage.getItem("player_name"),
    roomId,
    roomCode: window.sessionStorage.getItem("room_code"),
  };
}

export function clearPlayerSession() {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.removeItem("player_id");
  window.sessionStorage.removeItem("player_name");
  window.sessionStorage.removeItem("room_id");
  window.sessionStorage.removeItem("room_code");
}

export async function createRoom(name: string) {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new Error("Player name is required.");
  }

  const { data, error } = await supabase.rpc("create_new_room", {
    player_name: trimmedName,
  });

  if (error) {
    throw error;
  }

  const result = Array.isArray(data) ? (data[0] as CreateRoomRpcResult | undefined) : undefined;

  if (!result?.room_code || !result.player_id || !result.room_id) {
    throw new Error("Room creation returned an unexpected response.");
  }

  storePlayerSession({
    playerId: result.player_id,
    playerName: trimmedName,
    roomCode: result.room_code,
    roomId: result.room_id,
  });

  return result.room_code;
}

export function normalizeRoomCode(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toLowerCase();
}

export async function joinRoom(roomCode: string, name: string) {
  const normalizedCode = normalizeRoomCode(roomCode);
  const trimmedName = name.trim();

  if (!normalizedCode) {
    throw new Error("Room code is required.");
  }

  if (!trimmedName) {
    throw new Error("Player name is required.");
  }

  const { data, error } = await supabase.rpc("join_existing_room", {
    p_room_code: normalizedCode,
    player_name: trimmedName,
  });

  if (error) {
    throw error;
  }

  const result = Array.isArray(data) ? (data[0] as JoinRoomRpcResult | undefined) : undefined;

  if (!result?.player_id || !result.room_id) {
    throw new Error("Room join returned an unexpected response.");
  }

  storePlayerSession({
    playerId: result.player_id,
    playerName: trimmedName,
    roomCode: normalizedCode,
    roomId: result.room_id,
  });

  return result.room_id;
}

export async function fetchRoomById(roomId: string) {
  const [{ data: room, error: roomError }, { data: players, error: playersError }, { data: gameState, error: gameStateError }] =
    await Promise.all([
      supabase.from("rooms").select("*").eq("id", roomId).maybeSingle<RoomRow>(),
      supabase.from("players").select("*").eq("room_id", roomId).order("joined_at", { ascending: true }),
      supabase.from("game_state").select("*").eq("room_id", roomId).maybeSingle<GameStateRow>(),
    ]);

  if (roomError) {
    throw roomError;
  }

  if (playersError) {
    throw playersError;
  }

  if (gameStateError) {
    throw gameStateError;
  }

  if (!room) {
    return null;
  }

  return buildRoomFromRows(room, (players ?? []) as PlayerRow[], (gameState as GameStateRow | null) ?? null);
}

export async function fetchRoomByCode(roomCode: string) {
  const normalizedCode = normalizeRoomCode(roomCode);

  if (!normalizedCode) {
    return null;
  }

  const { data: room, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("room_code", normalizedCode)
    .maybeSingle<RoomRow>();

  if (error) {
    throw error;
  }

  if (!room) {
    return null;
  }

  return fetchRoomById(room.id);
}

export function getRoleForPlayer(room: OnlineRoom, playerId: string): PlayerKey | null {
  if (room.players.male?.id === playerId) {
    return "male";
  }

  if (room.players.female?.id === playerId) {
    return "female";
  }

  return null;
}

export async function updateRoomState({
  roomId,
  gameOver,
  started,
  playersOrder,
  turnIndex,
  interactionPhase,
  currentQuestion,
  questionType,
  actionBy,
  phase,
  selectedGame,
  matchSnapshot,
  turn,
}: {
  roomId: string;
  gameOver: boolean;
  started: boolean;
  playersOrder: string[];
  turnIndex: number;
  interactionPhase: OnlineInteractionPhase | null;
  currentQuestion: string | null;
  questionType: "truth" | "dare" | null;
  actionBy: string | null;
  phase: OnlineRoomPhase;
  selectedGame: GameKey | null;
  matchSnapshot: OnlineMatchSnapshot | null;
  turn: string | null;
}) {
  const { error } = await supabase
    .from("game_state")
    .update({
      turn,
      data: {
        game_over: gameOver,
        started,
        players_order: playersOrder,
        turn_index: turnIndex,
        phase: interactionPhase ?? phase,
        current_question: currentQuestion,
        question_type: questionType,
        action_by: actionBy,
        selectedGame,
        matchSnapshot,
      } satisfies StoredRoomState,
    })
    .eq("room_id", roomId);

  if (error) {
    throw error;
  }
}

export async function resetOnlineGame(roomId: string) {
  const { error } = await supabase.rpc("reset_game", {
    p_room_id: roomId,
  });

  if (error) {
    throw error;
  }
}

export async function switchOnlineTurn(roomId: string, playerId: string) {
  const { error } = await supabase.rpc("switch_turn", {
    p_room_id: roomId,
    p_player_id: playerId,
  });

  if (error) {
    throw error;
  }
}

export async function pickOnlineQuestion({
  roomId,
  playerId,
  type,
}: {
  roomId: string;
  playerId: string;
  type: "truth" | "dare";
}) {
  const { error } = await supabase.rpc("pick_question", {
    p_room_id: roomId,
    p_player_id: playerId,
    p_type: type,
  });

  if (error) {
    throw error;
  }
}

export async function resolveOnlineAction({
  roomId,
  playerId,
  decision,
}: {
  roomId: string;
  playerId: string;
  decision: "accept" | "skip";
}) {
  const { error } = await supabase.rpc("resolve_action", {
    p_room_id: roomId,
    p_player_id: playerId,
    p_decision: decision,
  });

  if (error) {
    throw error;
  }
}

export async function deleteOnlineRoom({
  roomId,
  playerId,
  isHost,
}: {
  roomId: string;
  playerId: string;
  isHost: boolean;
}) {
  if (isHost) {
    const [stateDelete, playersDelete, roomDelete] = await Promise.all([
      supabase.from("game_state").delete().eq("room_id", roomId),
      supabase.from("players").delete().eq("room_id", roomId),
      supabase.from("rooms").delete().eq("id", roomId),
    ]);

    if (stateDelete.error) {
      throw stateDelete.error;
    }

    if (playersDelete.error) {
      throw playersDelete.error;
    }

    if (roomDelete.error) {
      throw roomDelete.error;
    }

    return;
  }

  const { error } = await supabase.from("players").delete().eq("id", playerId);

  if (error) {
    throw error;
  }
}

export function subscribeToRoom(roomId: string, onChange: () => void) {
  return supabase
    .channel(`room:${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "players",
        filter: `room_id=eq.${roomId}`,
      },
      onChange,
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "game_state",
        filter: `room_id=eq.${roomId}`,
      },
      onChange,
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "rooms",
        filter: `id=eq.${roomId}`,
      },
      onChange,
    )
    .subscribe();
}

export async function unsubscribeFromRoom(channel: RealtimeChannel) {
  await supabase.removeChannel(channel);
}
