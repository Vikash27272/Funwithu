export type PlayerKey = "male" | "female";
export type Screen =
  | "landing"
  | "setup"
  | "online-room"
  | "game-select"
  | "mode-select"
  | "playing";
export type GameKey = "truth-dare";
export type ModeType = "preset" | "custom";
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type LogTone = "neutral" | "success" | "warning";
export type OnlineRoomPhase = "lobby" | "mode-select" | "playing";

export interface TaskRow {
  id: string;
  position: number;
  task: string;
  target: PlayerKey;
  author: PlayerKey;
}

export interface PlayerState {
  name: string;
  position: number;
  skipsUsed: number;
  lastRoll: number | null;
}

export interface PendingTask {
  player: PlayerKey;
  task: TaskRow;
}

export interface GameLog {
  id: string;
  text: string;
  tone: LogTone;
}

export interface GameStateShape {
  currentPlayer: PlayerKey;
  players: Record<PlayerKey, Pick<PlayerState, "position" | "skipsUsed">>;
  openedCells: Record<number, boolean>;
  diceValue: number | null;
}

export interface OnlineRoomPlayer {
  role: PlayerKey;
  name: string;
  sessionId: string;
  isHost: boolean;
  joinedAt: number;
}

export interface OnlineMatchSnapshot {
  mode: ModeType;
  difficulty: Difficulty;
  players: Record<PlayerKey, PlayerState>;
  tasks: TaskRow[];
  currentTurn: PlayerKey;
  pendingTask: PendingTask | null;
  queuedTask: PendingTask | null;
  highlightedTile: number | null;
  highlightedPlayer: PlayerKey | null;
  openedCells: Record<number, boolean>;
  diceValue: number | null;
  winner: PlayerKey | null;
  logs: GameLog[];
  clearedPlayers: Record<PlayerKey, boolean>;
}

export interface OnlineRoom {
  code: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  hostSessionId: string;
  selectedGame: GameKey | null;
  phase: OnlineRoomPhase;
  players: Record<PlayerKey, OnlineRoomPlayer | null>;
  matchSnapshot: OnlineMatchSnapshot | null;
}
