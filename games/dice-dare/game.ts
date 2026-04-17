import type { PendingTask, PlayerKey, PlayerState, TaskCard } from "@/types/game";
import {
  buildTaskDeck,
  createLogId,
  DICE_DARE_GAME_ID,
  getDisplayName,
  getOppositePlayer,
  MAX_POSITION,
} from "@/games/dice-dare/config";
import type {
  DiceDareAction,
  DiceDareInitOptions,
  DiceDareState,
} from "@/games/dice-dare/types";

export function getSkipAllowance(
  player: PlayerKey,
  clearedPlayers?: Partial<Record<PlayerKey, boolean>>,
): number {
  return clearedPlayers?.[player] ? 3 : 2;
}

export function movePlayerOnTrack(
  position: number,
  roll: number,
  wrap = false,
): { position: number } {
  if (wrap) {
    return {
      position: ((position - 1 + roll) % MAX_POSITION) + 1,
    };
  }

  return {
    position: Math.min(MAX_POSITION, position + roll),
  };
}

export function createDiceDarePlayers(
  names: Record<PlayerKey, string>,
): Record<PlayerKey, PlayerState> {
  return {
    male: {
      name: names.male,
      position: 0,
      skipsUsed: 0,
      lastRoll: null,
    },
    female: {
      name: names.female,
      position: 0,
      skipsUsed: 0,
      lastRoll: null,
    },
  };
}

function appendLog(
  logs: DiceDareState["logs"],
  text: string,
  tone: DiceDareState["logs"][number]["tone"] = "neutral",
) {
  return [{ id: createLogId(), text, tone }, ...logs].slice(0, 18);
}

function drawRandomTask(tasks: TaskCard[]): TaskCard | null {
  if (tasks.length === 0) {
    return null;
  }

  return tasks[Math.floor(Math.random() * tasks.length)] ?? null;
}

function queueLandingTask(
  state: DiceDareState,
  player: PlayerKey,
  nextPosition: number,
): PendingTask | null {
  if (state.clearedPlayers[player]) {
    return null;
  }

  const task = drawRandomTask(state.tasks);

  return task
    ? {
        player,
        position: nextPosition,
        task,
      }
    : null;
}

function resolveRoll(state: DiceDareState, player: PlayerKey, roll: number): DiceDareState {
  if (
    state.pendingTask ||
    state.queuedTask ||
    state.winner ||
    state.currentTurn !== player ||
    state.gameState !== "ROLL_DICE"
  ) {
    return state;
  }

  const playerState = state.players[player];
  const playerName = getDisplayName(player, playerState.name);
  const opponent = getOppositePlayer(player);
  const moved = movePlayerOnTrack(
    playerState.position,
    roll,
    state.clearedPlayers[player],
  );
  const queuedTask = queueLandingTask(state, player, moved.position);
  const reachesFinish =
    moved.position >= MAX_POSITION && !state.clearedPlayers[player];

  return {
    ...state,
    players: {
      ...state.players,
      [player]: {
        ...playerState,
        ...moved,
        lastRoll: roll,
      },
    },
    pendingTask: null,
    queuedTask,
    highlightedTile: moved.position,
    highlightedPlayer: player,
    diceValue: roll,
    gameState: "MOVE_PLAYER",
    currentTurn: queuedTask ? player : opponent,
    winner: null,
    logs: appendLog(
      state.logs,
      state.clearedPlayers[player]
        ? `${playerName} rolled ${roll} and is resting on ${moved.position}.`
        : reachesFinish
          ? `${playerName} rolled ${roll} and reached 50.`
          : `${playerName} rolled ${roll} and moved to ${moved.position}.`,
      "success",
    ),
  };
}

function finishLandingSequence(state: DiceDareState): DiceDareState {
  if (!state.queuedTask) {
    if (state.highlightedTile === null && state.highlightedPlayer === null) {
      return state;
    }

    return {
      ...state,
      highlightedTile: null,
      highlightedPlayer: null,
      gameState: "ROLL_DICE",
    };
  }

  return {
    ...state,
    highlightedTile: null,
    highlightedPlayer: null,
    openedCells: {
      ...state.openedCells,
      [state.queuedTask.position]: true,
    },
    gameState: "DRAW_CARD",
  };
}

function revealDrawnTask(state: DiceDareState): DiceDareState {
  if (!state.queuedTask || state.gameState !== "DRAW_CARD") {
    return state;
  }

  const performerName = getDisplayName(
    state.queuedTask.task.performer,
    state.players[state.queuedTask.task.performer].name,
  );
  const drawerName = getDisplayName(
    state.queuedTask.player,
    state.players[state.queuedTask.player].name,
  );
  const roleLabel =
    state.queuedTask.task.role === "leader" ? "leader" : "submissive";

  return {
    ...state,
    pendingTask: state.queuedTask,
    queuedTask: null,
    gameState: "SHOW_CARD",
    logs: appendLog(
      state.logs,
      `${drawerName} drew "${state.queuedTask.task.title}" for ${performerName} as the ${roleLabel} role.`,
      "neutral",
    ),
  };
}

function resolvePendingTask(
  state: DiceDareState,
  decision: "accept" | "skip",
): DiceDareState {
  const pending = state.pendingTask;

  if (!pending) {
    return state;
  }

  const player = pending.player;
  const playerState = state.players[player];
  const playerName = getDisplayName(player, playerState.name);
  const skipLimit = getSkipAllowance(player, state.clearedPlayers);

  if (decision === "skip" && playerState.skipsUsed >= skipLimit) {
    return state;
  }

  const players =
    decision === "skip"
      ? {
          ...state.players,
          [player]: {
            ...playerState,
            skipsUsed: playerState.skipsUsed + 1,
          },
        }
      : state.players;
  const hasWinner =
    players[player].position >= MAX_POSITION && !state.clearedPlayers[player];

  return {
    ...state,
    players,
    pendingTask: null,
    queuedTask: null,
    highlightedTile: null,
    highlightedPlayer: null,
    currentTurn: hasWinner ? player : getOppositePlayer(player),
    gameState: hasWinner ? "END_TURN" : "ROLL_DICE",
    winner: hasWinner ? player : null,
    logs: appendLog(
      state.logs,
      hasWinner
        ? `${playerName} completed their full track and wins the round.`
        : decision === "skip"
          ? `${playerName} skipped the card. ${skipLimit - players[player].skipsUsed} skips left.`
          : `${playerName} completed "${pending.task.title}" and passed the turn.`,
      hasWinner ? "success" : decision === "skip" ? "warning" : "neutral",
    ),
  };
}

function continueAfterWin(state: DiceDareState): DiceDareState {
  if (!state.winner) {
    return state;
  }

  const winner = state.winner;
  const winnerName = getDisplayName(winner, state.players[winner].name);

  return {
    ...state,
    clearedPlayers: {
      ...state.clearedPlayers,
      [winner]: true,
    },
    winner: null,
    currentTurn: getOppositePlayer(winner),
    gameState: "ROLL_DICE",
    logs: appendLog(
      state.logs,
      `${winnerName} keeps playing with reward mode: completed cells are now rest cells and 3 skips are available.`,
      "success",
    ),
  };
}

export function createDiceDareState({
  mode,
  difficulty,
  names,
  tasks,
}: DiceDareInitOptions): DiceDareState {
  const players = createDiceDarePlayers(names);

  return {
    mode,
    difficulty,
    players,
    tasks: tasks ?? buildTaskDeck(difficulty),
    currentTurn: "male",
    gameState: "ROLL_DICE",
    pendingTask: null,
    queuedTask: null,
    highlightedTile: null,
    highlightedPlayer: null,
    openedCells: {},
    diceValue: null,
    winner: null,
    logs: [
      {
        id: createLogId(),
        text: `${getDisplayName("male", names.male)} rolls first on the shared board.`,
        tone: "success",
      },
    ],
    clearedPlayers: {
      male: false,
      female: false,
    },
  };
}

export const DiceDareGame = {
  id: DICE_DARE_GAME_ID,
  init: createDiceDareState,
  onAction(state: DiceDareState, action: DiceDareAction): DiceDareState {
    switch (action.type) {
      case "ROLL_DICE":
        return resolveRoll(state, action.player, action.value);
      case "FINISH_LANDING_SEQUENCE":
        return finishLandingSequence(state);
      case "REVEAL_DRAWN_TASK":
        return revealDrawnTask(state);
      case "RESOLVE_PENDING_TASK":
        return resolvePendingTask(state, action.decision);
      case "CONTINUE_AFTER_WIN":
        return continueAfterWin(state);
      default:
        return state;
    }
  },
};
