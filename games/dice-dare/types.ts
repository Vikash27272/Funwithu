import type {
  Difficulty,
  GameFlowState,
  GameLog,
  ModeType,
  PendingTask,
  PlayerKey,
  PlayerState,
  TaskCard,
} from "@/types/game";

export interface DiceDareState {
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

export interface DiceDareInitOptions {
  mode: ModeType;
  difficulty: Difficulty;
  names: Record<PlayerKey, string>;
  tasks?: TaskCard[];
}

export type DiceDareAction =
  | {
      type: "ROLL_DICE";
      player: PlayerKey;
      value: number;
    }
  | {
      type: "FINISH_LANDING_SEQUENCE";
    }
  | {
      type: "REVEAL_DRAWN_TASK";
    }
  | {
      type: "RESOLVE_PENDING_TASK";
      decision: "accept" | "skip";
    }
  | {
      type: "CONTINUE_AFTER_WIN";
    };
