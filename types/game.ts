export type PlayerKey = "male" | "female";
export type CardRole = "leader" | "submissive";
export type DeckLevel = "easy" | "fun" | "medium" | "hard" | "extreme";
export type GameFlowState =
  | "ROLL_DICE"
  | "MOVE_PLAYER"
  | "DRAW_CARD"
  | "SHOW_CARD"
  | "END_TURN";
export type Screen =
  | "landing"
  | "setup"
  | "online-room"
  | "mode-select"
  | "playing";
export type GameKey = "dice-dare";
export type ModeType = "preset";
export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type LogTone = "neutral" | "success" | "warning";
export type OnlineRoomPhase = "lobby" | "mode-select" | "playing";

export interface TaskCard {
  id: string;
  title: string;
  description: string;
  performer: PlayerKey;
  role: CardRole;
  image: string;
  level?: DeckLevel;
  category?: string;
  points?: number;
}

export interface PlayerState {
  name: string;
  position: number;
  skipsUsed: number;
  lastRoll: number | null;
}

export interface PendingTask {
  player: PlayerKey;
  position: number;
  task: TaskCard;
}

export interface GameLog {
  id: string;
  text: string;
  tone: LogTone;
}

export interface GameStateShape {
  gameState: GameFlowState;
  currentPlayer: PlayerKey;
  players: Record<PlayerKey, Pick<PlayerState, "position" | "skipsUsed">>;
  openedCells: Record<number, boolean>;
  diceValue: number | null;
}

export interface OnlineRoomPlayer {
  id: string;
  role: PlayerKey;
  name: string;
  isHost: boolean;
  joinedAt: number;
}

export interface OnlineMatchSnapshot {
  mode: ModeType;
  difficulty: Difficulty;
  players: Record<PlayerKey, PlayerState>;
  tasks: TaskCard[];
  currentTurn: PlayerKey;
  gameState: GameFlowState;
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
  id: string;
  code: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  gameOver: boolean;
  playerCount: number;
  started: boolean;
  playersOrder: string[];
  turnIndex: number;
  selectedGame: GameKey | null;
  phase: OnlineRoomPhase;
  players: Record<PlayerKey, OnlineRoomPlayer | null>;
  matchSnapshot: OnlineMatchSnapshot | null;
}
