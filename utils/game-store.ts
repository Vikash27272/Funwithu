"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Difficulty,
  GameKey,
  GameLog,
  ModeType,
  OnlineMatchSnapshot,
  OnlineRoom,
  OnlineRoomPhase,
  PendingTask,
  PlayerKey,
  PlayerState,
  Screen,
  TaskRow,
} from "@/types/game";
import {
  buildTaskDeck,
  createLogId,
  createTaskId,
  DIFFICULTY_META,
  getDisplayName,
  getOppositePlayer,
  MAX_POSITION,
  movePlayerOnTrack,
} from "@/utils/game-logic";
import {
  createSessionId,
  generateRoomCode,
  normalizeRoomCode,
  readRoom,
  removeRoom,
  writeRoom,
} from "@/utils/online-room";

const DEFAULT_OFFLINE_NAMES = { male: "King", female: "Queen" } as const;
const DEFAULT_ONLINE_NAMES = { male: "Male", female: "Female" } as const;

interface CoupleGameState {
  screen: Screen;
  entryMode: "offline" | "online";
  selectedGame: GameKey;
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
  editorOpen: boolean;
  logsOpen: boolean;
  clearedPlayers: Record<PlayerKey, boolean>;
  onlineSessionId: string;
  onlineRoom: OnlineRoom | null;
  onlineRole: PlayerKey | null;
  onlineError: string | null;
  startOfflineFlow: () => void;
  startOnlineFlow: () => void;
  createOnlineRoom: (roomName: string) => boolean;
  joinOnlineRoom: (roomCode: string) => boolean;
  syncOnlineRoom: () => void;
  clearOnlineError: () => void;
  leaveOnlineRoom: (destination?: Screen) => void;
  setScreen: (screen: Screen) => void;
  setMode: (mode: ModeType) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  selectGame: (game: GameKey) => void;
  setPlayerNames: (maleName: string, femaleName: string) => void;
  rebuildTasks: (difficulty?: Difficulty) => void;
  updateTask: (target: PlayerKey, position: number, task: string) => void;
  swapTasks: (target: PlayerKey, fromPosition: number, toPosition: number) => void;
  bulkAssignTasks: (target: PlayerKey, lines: string[]) => void;
  importTasks: (rows: Array<{ target: PlayerKey; position: number; task: string }>) => void;
  startGame: () => void;
  restartMatch: () => void;
  resolveRoll: (player: PlayerKey, roll: number) => void;
  finishLandingSequence: () => void;
  resolvePendingTask: (decision: "accept" | "skip") => void;
  toggleEditor: (open?: boolean) => void;
  toggleLogs: (open?: boolean) => void;
  resetExperience: () => void;
  continueAfterWin: () => void;
}

function createFreshPlayers(
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
  logs: GameLog[],
  text: string,
  tone: GameLog["tone"] = "neutral",
): GameLog[] {
  return [{ id: createLogId(), text, tone }, ...logs].slice(0, 18);
}

function defaultNames(players: Record<PlayerKey, PlayerState>): Record<PlayerKey, string> {
  return {
    male: players.male.name,
    female: players.female.name,
  };
}

function getOnlineNames(room: OnlineRoom | null): Record<PlayerKey, string> {
  return {
    male: room?.players.male?.name ?? DEFAULT_ONLINE_NAMES.male,
    female: room?.players.female?.name ?? DEFAULT_ONLINE_NAMES.female,
  };
}

function getRoleForSession(room: OnlineRoom, sessionId: string): PlayerKey | null {
  if (room.players.male?.sessionId === sessionId) {
    return "male";
  }

  if (room.players.female?.sessionId === sessionId) {
    return "female";
  }

  return null;
}

function screenForPhase(phase: OnlineRoomPhase): Screen {
  if (phase === "mode-select") {
    return "mode-select";
  }

  if (phase === "playing") {
    return "playing";
  }

  return "game-select";
}

function createSnapshotFromState(state: CoupleGameState): OnlineMatchSnapshot {
  return {
    mode: state.mode,
    difficulty: state.difficulty,
    players: state.players,
    tasks: state.tasks,
    currentTurn: state.currentTurn,
    pendingTask: state.pendingTask,
    queuedTask: state.queuedTask,
    highlightedTile: state.highlightedTile,
    highlightedPlayer: state.highlightedPlayer,
    openedCells: state.openedCells,
    diceValue: state.diceValue,
    winner: state.winner,
    logs: state.logs,
    clearedPlayers: state.clearedPlayers,
  };
}

function roomStatePatch(
  room: OnlineRoom,
  currentDifficulty: Difficulty,
  currentGame: GameKey,
) {
  const fallbackNames = getOnlineNames(room);
  const snapshot = room.matchSnapshot;

  if (snapshot) {
    return {
      selectedGame: room.selectedGame ?? currentGame,
      mode: snapshot.mode,
      difficulty: snapshot.difficulty,
      players: snapshot.players,
      tasks: snapshot.tasks,
      currentTurn: snapshot.currentTurn,
      pendingTask: snapshot.pendingTask,
      queuedTask: snapshot.queuedTask,
      highlightedTile: snapshot.highlightedTile,
      highlightedPlayer: snapshot.highlightedPlayer,
      openedCells: snapshot.openedCells,
      diceValue: snapshot.diceValue,
      winner: snapshot.winner,
      logs: snapshot.logs,
      clearedPlayers: snapshot.clearedPlayers,
    };
  }

  return {
    selectedGame: room.selectedGame ?? currentGame,
    mode: "preset" as ModeType,
    difficulty: currentDifficulty,
    players: createFreshPlayers(fallbackNames),
    tasks: buildTaskDeck(currentDifficulty, fallbackNames),
    currentTurn: "male" as PlayerKey,
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
        text: "Room is ready. Host can choose a game and start when both players join.",
        tone: "success" as const,
      },
    ],
    clearedPlayers: {
      male: false,
      female: false,
    },
  };
}

function createInitialState(sessionId = createSessionId()) {
  return {
    screen: "landing" as Screen,
    entryMode: "offline" as const,
    selectedGame: "truth-dare" as GameKey,
    mode: "preset" as ModeType,
    difficulty: 2 as Difficulty,
    players: createFreshPlayers(DEFAULT_OFFLINE_NAMES),
    tasks: buildTaskDeck(2, DEFAULT_OFFLINE_NAMES),
    currentTurn: "male" as PlayerKey,
    pendingTask: null as PendingTask | null,
    queuedTask: null as PendingTask | null,
    highlightedTile: null as number | null,
    highlightedPlayer: null as PlayerKey | null,
    openedCells: {} as Record<number, boolean>,
    diceValue: null as number | null,
    winner: null as PlayerKey | null,
    logs: [
      {
        id: createLogId(),
        text: "Truth & Dare board is ready. Both players share one 1-50 board.",
        tone: "success" as const,
      },
    ],
    editorOpen: false,
    logsOpen: false,
    clearedPlayers: {
      male: false,
      female: false,
    },
    onlineSessionId: sessionId,
    onlineRoom: null as OnlineRoom | null,
    onlineRole: null as PlayerKey | null,
    onlineError: null as string | null,
  };
}

export const useGameStore = create<CoupleGameState>()(
  persist(
    (set, get) => {
      const syncStoredRoom = (patch?: Partial<OnlineRoom>) => {
        const state = get();

        if (!state.onlineRoom || !state.onlineRole) {
          return null;
        }

        const latestRoom = readRoom(state.onlineRoom.code);

        if (!latestRoom) {
          return null;
        }

        const role = getRoleForSession(latestRoom, state.onlineSessionId);

        if (!role) {
          return null;
        }

        const nextRoom: OnlineRoom = {
          ...latestRoom,
          ...patch,
          players: patch?.players ?? latestRoom.players,
          selectedGame: patch?.selectedGame ?? latestRoom.selectedGame,
          phase: patch?.phase ?? latestRoom.phase,
          matchSnapshot:
            patch && "matchSnapshot" in patch
              ? patch.matchSnapshot ?? null
              : latestRoom.matchSnapshot,
        };

        writeRoom(nextRoom);
        return { room: nextRoom, role };
      };

      const syncMatchSnapshot = (phase?: OnlineRoomPhase) => {
        const state = get();

        if (!state.onlineRoom) {
          return;
        }

        const synced = syncStoredRoom({
          phase: phase ?? state.onlineRoom.phase,
          matchSnapshot: createSnapshotFromState(state),
        });

        if (synced) {
          set({ onlineRoom: synced.room, onlineRole: synced.role });
        }
      };

      return {
        ...createInitialState(),
        startOfflineFlow: () =>
          set({
            screen: "setup",
            entryMode: "offline",
            onlineError: null,
          }),
        startOnlineFlow: () => {
          const state = get();

          if (state.onlineRoom) {
            const latestRoom = readRoom(state.onlineRoom.code);

            if (latestRoom) {
              const role = getRoleForSession(latestRoom, state.onlineSessionId);

              if (role) {
                set({
                  entryMode: "online",
                  screen: screenForPhase(latestRoom.phase),
                  onlineRoom: latestRoom,
                  onlineRole: role,
                  onlineError: null,
                  ...roomStatePatch(latestRoom, state.difficulty, state.selectedGame),
                });
                return;
              }
            }
          }

          set({
            screen: "online-room",
            entryMode: "online",
            onlineError: null,
          });
        },
        createOnlineRoom: (roomName) => {
          const trimmedRoomName = roomName.trim() || "Private Room";
          const state = get();
          const code = generateRoomCode();
          const createdAt = Date.now();
          const room: OnlineRoom = {
            code,
            name: trimmedRoomName,
            createdAt,
            updatedAt: createdAt,
            hostSessionId: state.onlineSessionId,
            selectedGame: null,
            phase: "lobby",
            players: {
              male: {
                role: "male",
                name: DEFAULT_ONLINE_NAMES.male,
                sessionId: state.onlineSessionId,
                isHost: true,
                joinedAt: createdAt,
              },
              female: null,
            },
            matchSnapshot: null,
          };

          writeRoom(room);
          set({
            entryMode: "online",
            screen: "game-select",
            players: createFreshPlayers(DEFAULT_ONLINE_NAMES),
            tasks: buildTaskDeck(2, DEFAULT_ONLINE_NAMES),
            currentTurn: "male",
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
                text: `Room ${code} created. Share the code so one more player can join as Female.`,
                tone: "success",
              },
            ],
            editorOpen: false,
            logsOpen: false,
            clearedPlayers: {
              male: false,
              female: false,
            },
            onlineRoom: room,
            onlineRole: "male",
            onlineError: null,
          });

          return true;
        },
        joinOnlineRoom: (roomCode) => {
          const state = get();
          const code = normalizeRoomCode(roomCode);
          const room = readRoom(code);

          if (!room) {
            set({ onlineError: "Room code not found. Check the 6-digit code and try again." });
            return false;
          }

          const existingRole = getRoleForSession(room, state.onlineSessionId);

          if (!existingRole && room.players.female) {
            set({ onlineError: "This room is already full. Only two players are allowed." });
            return false;
          }

          const joinedAt = Date.now();
          const nextRole = existingRole ?? "female";
          const nextRoom: OnlineRoom = {
            ...room,
            players: {
              ...room.players,
              [nextRole]:
                room.players[nextRole] ??
                ({
                  role: nextRole,
                  name: nextRole === "male" ? DEFAULT_ONLINE_NAMES.male : DEFAULT_ONLINE_NAMES.female,
                  sessionId: state.onlineSessionId,
                  isHost: nextRole === "male",
                  joinedAt,
                } satisfies NonNullable<OnlineRoom["players"][PlayerKey]>),
            },
          };

          writeRoom(nextRoom);

          set({
            entryMode: "online",
            screen: screenForPhase(nextRoom.phase),
            editorOpen: false,
            logsOpen: false,
            onlineRoom: nextRoom,
            onlineRole: nextRole,
            onlineError: null,
            ...roomStatePatch(nextRoom, state.difficulty, state.selectedGame),
          });

          return true;
        },
        syncOnlineRoom: () => {
          const state = get();

          if (!state.onlineRoom) {
            return;
          }

          const latestRoom = readRoom(state.onlineRoom.code);

          if (!latestRoom) {
            const resetState = createInitialState(state.onlineSessionId);
            set({
              ...resetState,
              screen: "online-room",
              entryMode: "online",
              onlineError: "That room is no longer available.",
            });
            return;
          }

          const role = getRoleForSession(latestRoom, state.onlineSessionId);

          if (!role) {
            const resetState = createInitialState(state.onlineSessionId);
            set({
              ...resetState,
              screen: "online-room",
              entryMode: "online",
              onlineError: "You are no longer part of this room.",
            });
            return;
          }

          set({
            entryMode: "online",
            screen: screenForPhase(latestRoom.phase),
            onlineRoom: latestRoom,
            onlineRole: role,
            onlineError: null,
            ...roomStatePatch(latestRoom, state.difficulty, state.selectedGame),
          });
        },
        clearOnlineError: () => set({ onlineError: null }),
        leaveOnlineRoom: (destination = "landing") => {
          const state = get();

          if (state.onlineRoom && state.onlineRole) {
            const latestRoom = readRoom(state.onlineRoom.code);

            if (latestRoom) {
              if (state.onlineRole === "male") {
                removeRoom(latestRoom.code);
              } else {
                const nextRoom: OnlineRoom = {
                  ...latestRoom,
                  phase: latestRoom.phase === "playing" ? "lobby" : latestRoom.phase,
                  players: {
                    ...latestRoom.players,
                    female: null,
                  },
                  matchSnapshot: latestRoom.phase === "playing" ? null : latestRoom.matchSnapshot,
                };
                writeRoom(nextRoom);
              }
            }
          }

          const resetState = createInitialState(state.onlineSessionId);

          set({
            ...resetState,
            screen: destination,
            entryMode:
              destination === "setup" || destination === "landing" ? "offline" : "online",
          });
        },
        setScreen: (screen) => set({ screen }),
        setMode: (mode) => {
          const state = get();
          const names = defaultNames(state.players);

          set({
            mode,
            tasks:
              mode === "custom" && state.tasks.length > 0
                ? state.tasks
                : buildTaskDeck(state.difficulty, names),
          });
        },
        setDifficulty: (difficulty) => {
          const state = get();
          const names = defaultNames(state.players);

          set({
            difficulty,
            mode: "preset",
            tasks: buildTaskDeck(difficulty, names),
          });
        },
        selectGame: (game) => {
          const state = get();

          if (state.entryMode === "online" && state.onlineRoom) {
            if (state.onlineRole !== "male") {
              set({ onlineError: "Only the room admin can pick the game for this room." });
              return;
            }

            const synced = syncStoredRoom({
              selectedGame: game,
              phase: "mode-select",
            });

            if (synced) {
              set({
                selectedGame: game,
                screen: "mode-select",
                onlineRoom: synced.room,
                onlineRole: synced.role,
                onlineError: null,
              });
            }

            return;
          }

          set({ selectedGame: game, screen: "mode-select" });
        },
        setPlayerNames: (maleName, femaleName) => {
          const trimmedNames = {
            male: maleName.trim() || DEFAULT_OFFLINE_NAMES.male,
            female: femaleName.trim() || DEFAULT_OFFLINE_NAMES.female,
          };
          const state = get();

          set({
            players: createFreshPlayers(trimmedNames),
            tasks: buildTaskDeck(state.difficulty, trimmedNames),
            logs: appendLog(
              [],
              `${trimmedNames.male} and ${trimmedNames.female} joined the board.`,
              "success",
            ),
          });
        },
        rebuildTasks: (difficulty) => {
          const state = get();
          const nextDifficulty = difficulty ?? state.difficulty;
          const names = defaultNames(state.players);

          set({
            difficulty: nextDifficulty,
            tasks: buildTaskDeck(nextDifficulty, names),
          });
        },
        updateTask: (target, position, task) => {
          set((state) => ({
            tasks: state.tasks.map((row) =>
              row.target === target && row.position === position ? { ...row, task } : row,
            ),
          }));

          const state = get();

          if (state.entryMode === "online" && state.onlineRoom) {
            syncMatchSnapshot(state.onlineRoom.phase);
          }
        },
        swapTasks: (target, fromPosition, toPosition) => {
          set((state) => {
            const fromTask = state.tasks.find(
              (row) => row.target === target && row.position === fromPosition,
            );
            const toTask = state.tasks.find(
              (row) => row.target === target && row.position === toPosition,
            );

            if (!fromTask || !toTask) {
              return state;
            }

            return {
              tasks: state.tasks.map((row) => {
                if (row.target === target && row.position === fromPosition) {
                  return { ...row, task: toTask.task };
                }

                if (row.target === target && row.position === toPosition) {
                  return { ...row, task: fromTask.task };
                }

                return row;
              }),
            };
          });

          const state = get();

          if (state.entryMode === "online" && state.onlineRoom) {
            syncMatchSnapshot(state.onlineRoom.phase);
          }
        },
        bulkAssignTasks: (target, lines) => {
          set((state) => {
            const sanitized = lines.map((line) => line.trim()).filter(Boolean);

            if (sanitized.length === 0) {
              return state;
            }

            const targetRows = state.tasks
              .filter((row) => row.target === target)
              .sort((left, right) => left.position - right.position);
            const updates = new Map<number, string>();

            targetRows.forEach((row, index) => {
              const replacement = sanitized[index];

              if (replacement) {
                updates.set(row.position, replacement);
              }
            });

            return {
              tasks: state.tasks.map((row) =>
                row.target === target && updates.has(row.position)
                  ? { ...row, task: updates.get(row.position) ?? row.task }
                : row,
              ),
            };
          });

          const state = get();

          if (state.entryMode === "online" && state.onlineRoom) {
            syncMatchSnapshot(state.onlineRoom.phase);
          }
        },
        importTasks: (rows) => {
          set((state) => {
            const updates = new Map<string, string>();

            rows.forEach((row) => {
              if (row.position >= 1 && row.position <= MAX_POSITION && row.task.trim()) {
                updates.set(createTaskId(row.target, row.position), row.task.trim());
              }
            });

            return {
              tasks: state.tasks.map((row) =>
                updates.has(row.id)
                  ? { ...row, task: updates.get(row.id) ?? row.task }
                  : row,
              ),
            };
          });

          const state = get();

          if (state.entryMode === "online" && state.onlineRoom) {
            syncMatchSnapshot(state.onlineRoom.phase);
          }
        },
        startGame: () => {
          const state = get();
          const names = defaultNames(state.players);

          set({
            screen: "playing",
            players: createFreshPlayers(names),
            currentTurn: "male",
            pendingTask: null,
            queuedTask: null,
            highlightedTile: null,
            highlightedPlayer: null,
            openedCells: {},
            diceValue: null,
            winner: null,
            editorOpen: false,
            logsOpen: false,
            clearedPlayers: {
              male: false,
              female: false,
            },
            logs: [
              {
                id: createLogId(),
                text: `${getDisplayName("male", names.male)} rolls first on the shared board.`,
                tone: "success",
              },
            ],
          });

          if (state.entryMode === "online" && state.onlineRoom) {
            syncMatchSnapshot("playing");
          }
        },
        restartMatch: () => {
          const state = get();
          const names = defaultNames(state.players);

          set({
            players: createFreshPlayers(names),
            currentTurn: "male",
            pendingTask: null,
            queuedTask: null,
            highlightedTile: null,
            highlightedPlayer: null,
            openedCells: {},
            diceValue: null,
            winner: null,
            editorOpen: false,
            logsOpen: false,
            clearedPlayers: {
              male: false,
              female: false,
            },
            logs: [
              {
                id: createLogId(),
                text: `${DIFFICULTY_META[state.difficulty].label} deck reloaded. Tap the dice to continue on the shared board.`,
                tone: "success",
              },
            ],
          });

          if (state.entryMode === "online" && state.onlineRoom) {
            syncMatchSnapshot("playing");
          }
        },
        resolveRoll: (player, roll) => {
          const state = get();

          if (
            state.pendingTask ||
            state.queuedTask ||
            state.winner ||
            state.currentTurn !== player
          ) {
            return;
          }

          const playerState = state.players[player];
          const playerName = getDisplayName(player, playerState.name);
          const opponent = getOppositePlayer(player);
          const alreadyCleared = state.clearedPlayers[player];
          const moved = movePlayerOnTrack(playerState.position, roll, alreadyCleared);
          const landingTask = alreadyCleared
            ? null
            : state.tasks.find(
                (row) => row.target === player && row.position === moved.position,
              );
          const reachesFinish = moved.position >= MAX_POSITION;

          set({
            players: {
              ...state.players,
              [player]: { ...playerState, ...moved, lastRoll: roll },
            },
            pendingTask: null,
            queuedTask: landingTask ? { player, task: landingTask } : null,
            highlightedTile: moved.position,
            highlightedPlayer: player,
            diceValue: roll,
            currentTurn: landingTask ? player : opponent,
            winner: null,
            logs: appendLog(
              state.logs,
              alreadyCleared
                ? `${playerName} rolled ${roll} and is resting on ${moved.position}.`
                : reachesFinish
                  ? `${playerName} rolled ${roll} and reached 50.`
                  : `${playerName} rolled ${roll} and moved to ${moved.position}.`,
              "success",
            ),
          });

          if (state.entryMode === "online" && state.onlineRoom) {
            syncMatchSnapshot("playing");
          }
        },
        finishLandingSequence: () => {
          const state = get();

          if (!state.queuedTask) {
            set({
              highlightedTile: null,
              highlightedPlayer: null,
            });
            return;
          }

          set({
            pendingTask: state.queuedTask,
            queuedTask: null,
            highlightedTile: null,
            highlightedPlayer: null,
            diceValue: state.diceValue,
            openedCells: {
              ...state.openedCells,
              [state.queuedTask.task.position]: true,
            },
          });

          if (state.entryMode === "online" && state.onlineRoom) {
            syncMatchSnapshot("playing");
          }
        },
        resolvePendingTask: (decision) => {
          const state = get();
          const pending = state.pendingTask;

          if (!pending) {
            return;
          }

          const player = pending.player;
          const playerState = state.players[player];
          const playerName = getDisplayName(player, playerState.name);
          const skipLimit = state.clearedPlayers[player] ? 3 : 2;

          if (decision === "skip" && playerState.skipsUsed >= skipLimit) {
            return;
          }

          const updatedPlayers =
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
            updatedPlayers[player].position >= MAX_POSITION && !state.clearedPlayers[player];

          set({
            players: updatedPlayers,
            pendingTask: null,
            queuedTask: null,
            highlightedTile: null,
            highlightedPlayer: null,
            diceValue: state.diceValue,
            currentTurn: hasWinner ? player : getOppositePlayer(player),
            winner: hasWinner ? player : null,
            logs: appendLog(
              state.logs,
              hasWinner
                ? `${playerName} completed their full track and wins the round.`
                : decision === "skip"
                  ? `${playerName} skipped the task. ${skipLimit - updatedPlayers[player].skipsUsed} skips left.`
                  : `${playerName} accepted the task and passed the turn.`,
              hasWinner ? "success" : decision === "skip" ? "warning" : "neutral",
            ),
          });

          if (state.entryMode === "online" && state.onlineRoom) {
            syncMatchSnapshot("playing");
          }
        },
        continueAfterWin: () => {
          const state = get();

          if (!state.winner) {
            return;
          }

          const winner = state.winner;
          const winnerName = getDisplayName(winner, state.players[winner].name);

          set({
            clearedPlayers: {
              ...state.clearedPlayers,
              [winner]: true,
            },
            winner: null,
            currentTurn: getOppositePlayer(winner),
            logs: appendLog(
              state.logs,
              `${winnerName} keeps playing with reward mode: completed cells are now rest cells and 3 skips are available.`,
              "success",
            ),
          });

          if (state.entryMode === "online" && state.onlineRoom) {
            syncMatchSnapshot("playing");
          }
        },
        toggleEditor: (open) =>
          set((state) => ({
            editorOpen: open ?? !state.editorOpen,
          })),
        toggleLogs: (open) =>
          set((state) => ({
            logsOpen: open ?? !state.logsOpen,
          })),
        resetExperience: () => {
          const state = get();
          set(createInitialState(state.onlineSessionId));
        },
      };
    },
    {
      name: "couple-game-mvp",
      partialize: (state) => ({
        screen: state.screen,
        entryMode: state.entryMode,
        selectedGame: state.selectedGame,
        mode: state.mode,
        difficulty: state.difficulty,
        players: state.players,
        tasks: state.tasks,
        currentTurn: state.currentTurn,
        pendingTask: state.pendingTask,
        queuedTask: state.queuedTask,
        highlightedTile: state.highlightedTile,
        highlightedPlayer: state.highlightedPlayer,
        openedCells: state.openedCells,
        diceValue: state.diceValue,
        winner: state.winner,
        logs: state.logs,
        editorOpen: state.editorOpen,
        logsOpen: state.logsOpen,
        clearedPlayers: state.clearedPlayers,
        onlineSessionId: state.onlineSessionId,
        onlineRoom: state.onlineRoom,
        onlineRole: state.onlineRole,
      }),
    },
  ),
);
