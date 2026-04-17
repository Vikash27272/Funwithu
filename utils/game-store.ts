"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  GameFlowState,
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
  TaskCard,
} from "@/types/game";
import {
  buildTaskDeck,
  createDiceDarePlayers,
  createDiceDareState,
  createLogId,
  DiceDareGame,
  DIFFICULTY_META,
  DICE_DARE_GAME_ID,
} from "@/utils/game-logic";
import {
  clearPlayerSession,
  deleteOnlineRoom,
  fetchRoomById,
  getRoleForPlayer,
  readPlayerSession,
  updateRoomState,
} from "@/utils/online-room";

const DEFAULT_OFFLINE_NAMES = { male: "King", female: "Queen" } as const;
const DEFAULT_ONLINE_NAMES = { male: "King", female: "Queen" } as const;

function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

interface CoupleGameState {
  screen: Screen;
  entryMode: "offline" | "online";
  selectedGame: GameKey;
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
  editorOpen: boolean;
  logsOpen: boolean;
  clearedPlayers: Record<PlayerKey, boolean>;
  onlineSessionId: string;
  onlinePlayerId: string | null;
  onlineRoom: OnlineRoom | null;
  onlineRole: PlayerKey | null;
  onlineRoomLoading: boolean;
  onlineError: string | null;
  startOfflineFlow: () => void;
  startOnlineFlow: () => void;
  createOnlineRoom: (roomName: string) => Promise<boolean>;
  joinOnlineRoom: (roomCode: string) => Promise<boolean>;
  syncOnlineRoom: (options?: { silent?: boolean }) => Promise<void>;
  clearOnlineError: () => void;
  leaveOnlineRoom: (destination?: Screen) => void;
  setScreen: (screen: Screen) => void;
  setMode: (mode: ModeType) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  selectGame: (game: GameKey) => void;
  setPlayerNames: (maleName: string, femaleName: string) => void;
  rebuildTasks: (difficulty?: Difficulty) => void;
  updateTaskCard: (
    taskId: string,
    patch: Partial<Pick<TaskCard, "title" | "description" | "performer" | "role" | "image">>,
  ) => void;
  bulkAssignTasks: (performer: PlayerKey, lines: string[]) => void;
  importTasks: (rows: TaskCard[]) => void;
  startGame: () => void;
  restartMatch: () => void;
  resolveRoll: (player: PlayerKey, roll: number) => void;
  finishLandingSequence: () => void;
  revealDrawnTask: () => void;
  resolvePendingTask: (decision: "accept" | "skip") => void;
  toggleEditor: (open?: boolean) => void;
  toggleLogs: (open?: boolean) => void;
  resetExperience: () => void;
  continueAfterWin: () => void;
}

function createFreshPlayers(
  names: Record<PlayerKey, string>,
): Record<PlayerKey, PlayerState> {
  return createDiceDarePlayers(names);
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

function screenForPhase(phase: OnlineRoomPhase): Screen {
  if (phase === "mode-select") {
    return "mode-select";
  }

  if (phase === "playing") {
    return "playing";
  }

  return "game-select";
}

function screenForRoom(room: OnlineRoom): Screen {
  if (room.started) {
    return "playing";
  }

  return screenForPhase(room.phase);
}

function createSnapshotFromState(state: CoupleGameState): OnlineMatchSnapshot {
  return {
    ...createDiceDareState({
      mode: state.mode,
      difficulty: state.difficulty,
      names: defaultNames(state.players),
      tasks: state.tasks,
    }),
    players: state.players,
    currentTurn: state.currentTurn,
    gameState: state.gameState,
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

function defaultPlayersOrder(room: OnlineRoom): string[] {
  return [room.players.male?.id, room.players.female?.id].filter(
    (playerId): playerId is string => Boolean(playerId),
  );
}

function getTurnRole(room: OnlineRoom): PlayerKey | null {
  const activePlayerId = room.playersOrder[room.turnIndex];

  if (!activePlayerId) {
    return null;
  }

  if (room.players.male?.id === activePlayerId) {
    return "male";
  }

  if (room.players.female?.id === activePlayerId) {
    return "female";
  }

  return null;
}

function roomStatePatch(
  room: OnlineRoom,
  currentDifficulty: Difficulty,
) {
  const fallbackNames = getOnlineNames(room);
  const snapshot = room.matchSnapshot;
  const turnRole = getTurnRole(room);

  if (snapshot) {
    return {
      selectedGame: room.selectedGame ?? (DiceDareGame.id as GameKey),
      mode: snapshot.mode,
      difficulty: snapshot.difficulty,
      players: snapshot.players,
      tasks: snapshot.tasks,
      currentTurn: turnRole ?? snapshot.currentTurn,
      gameState: snapshot.gameState ?? "ROLL_DICE",
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

  const engineState = DiceDareGame.init({
    mode: "preset",
    difficulty: currentDifficulty,
    names: fallbackNames,
  });

  return {
    selectedGame: room.selectedGame ?? (DiceDareGame.id as GameKey),
    ...engineState,
    currentTurn: turnRole ?? engineState.currentTurn,
    logs: appendLog(
      [],
      "Room is ready. Host can choose Dice & Dare and start when both players join.",
      "success",
    ),
  };
}

function createInitialState(sessionId = createSessionId()) {
  const initialNames = { ...DEFAULT_OFFLINE_NAMES };
  const engineState = DiceDareGame.init({
    mode: "preset",
    difficulty: 2,
    names: initialNames,
  });

  return {
    screen: "landing" as Screen,
    entryMode: "offline" as const,
    selectedGame: DICE_DARE_GAME_ID as GameKey,
    ...engineState,
    editorOpen: false,
    logsOpen: false,
    onlineSessionId: sessionId,
    onlinePlayerId: null as string | null,
    onlineRoom: null as OnlineRoom | null,
    onlineRole: null as PlayerKey | null,
    onlineRoomLoading: false,
    onlineError: null as string | null,
  };
}

export const useGameStore = create<CoupleGameState>()(
  persist(
    (set, get) => {
      const resetOnlineSession = (screen: Screen, error: string | null) => {
        const state = get();
        const resetState = createInitialState(state.onlineSessionId);

        set({
          ...resetState,
          screen,
          entryMode: screen === "landing" || screen === "setup" ? "offline" : "online",
          onlinePlayerId: null,
          onlineRoomLoading: false,
          onlineError: error,
        });
      };

      const syncStoredRoom = async (
        patch?: Partial<
          Pick<
            OnlineRoom,
            | "selectedGame"
            | "phase"
            | "gameOver"
            | "matchSnapshot"
            | "playersOrder"
            | "turnIndex"
            | "started"
            | "interactionPhase"
            | "currentQuestion"
            | "questionType"
            | "actionBy"
          >
        >,
      ) => {
        const state = get();
        const storedSession = readPlayerSession();
        const roomId = state.onlineRoom?.id ?? storedSession?.roomId;
        const playerId = state.onlinePlayerId ?? storedSession?.playerId ?? null;

        if (!roomId || !playerId) {
          return null;
        }

        const latestRoom = await fetchRoomById(roomId);

        if (!latestRoom) {
          return null;
        }

        const role = getRoleForPlayer(latestRoom, playerId);

        if (!role) {
          return null;
        }

        const nextRoom: OnlineRoom = {
          ...latestRoom,
          selectedGame: patch?.selectedGame ?? latestRoom.selectedGame,
          phase: patch?.phase ?? latestRoom.phase,
          gameOver: patch?.gameOver ?? latestRoom.gameOver,
          matchSnapshot:
            patch && "matchSnapshot" in patch
              ? patch.matchSnapshot ?? null
              : latestRoom.matchSnapshot,
          playersOrder:
            patch?.playersOrder ??
            latestRoom.playersOrder ??
            defaultPlayersOrder(latestRoom),
          turnIndex: patch?.turnIndex ?? latestRoom.turnIndex ?? 0,
          interactionPhase:
            patch && "interactionPhase" in patch
              ? patch.interactionPhase ?? null
              : latestRoom.interactionPhase ?? (latestRoom.started ? "idle" : null),
          currentQuestion:
            patch && "currentQuestion" in patch
              ? patch.currentQuestion ?? null
              : latestRoom.currentQuestion,
          questionType:
            patch && "questionType" in patch
              ? patch.questionType ?? null
              : latestRoom.questionType,
          actionBy:
            patch && "actionBy" in patch ? patch.actionBy ?? null : latestRoom.actionBy,
          started:
            patch?.started ??
            (patch && ("phase" in patch || "matchSnapshot" in patch)
              ? (patch?.phase ?? latestRoom.phase) !== "lobby" ||
                Boolean(
                  patch && "matchSnapshot" in patch
                    ? patch.matchSnapshot
                    : latestRoom.matchSnapshot,
                )
              : latestRoom.started),
          updatedAt: patch ? Date.now() : latestRoom.updatedAt,
        };

        if (patch) {
          const currentTurnName = nextRoom.playersOrder[nextRoom.turnIndex] ?? null;

          await updateRoomState({
            roomId,
            gameOver: nextRoom.gameOver,
            started:
              nextRoom.phase !== "lobby" ||
              nextRoom.started ||
              Boolean(nextRoom.matchSnapshot),
            playersOrder: nextRoom.playersOrder,
            turnIndex: nextRoom.turnIndex,
            interactionPhase: nextRoom.interactionPhase,
            currentQuestion: nextRoom.currentQuestion,
            questionType: nextRoom.questionType,
            actionBy: nextRoom.actionBy,
            phase: nextRoom.phase,
            selectedGame: nextRoom.selectedGame,
            matchSnapshot: nextRoom.matchSnapshot,
            turn: currentTurnName,
          });
        }

        return { room: nextRoom, role, playerId };
      };

      const syncMatchSnapshot = (phase?: OnlineRoomPhase) => {
        const state = get();

        if (!state.onlineRoom) {
          return;
        }

        void syncStoredRoom({
          phase: phase ?? state.onlineRoom.phase,
          interactionPhase: null,
          currentQuestion: null,
          questionType: null,
          actionBy: null,
          matchSnapshot: createSnapshotFromState(state),
        })
          .then((synced) => {
            if (!synced) {
              return;
            }

            set({
              onlineRoom: synced.room,
              onlineRole: synced.role,
              onlinePlayerId: synced.playerId,
            });
          })
          .catch((error) => {
            set({
              onlineError:
                error instanceof Error ? error.message : "Unable to sync the room state.",
            });
          });
      };

      const applyGameAction = (
        action: Parameters<typeof DiceDareGame.onAction>[1],
        phase: OnlineRoomPhase = "playing",
      ) => {
        const state = get();
        const nextMatch = DiceDareGame.onAction(createSnapshotFromState(state), action);

        set({
          mode: nextMatch.mode,
          difficulty: nextMatch.difficulty,
          players: nextMatch.players,
          tasks: nextMatch.tasks,
          currentTurn: nextMatch.currentTurn,
          gameState: nextMatch.gameState,
          pendingTask: nextMatch.pendingTask,
          queuedTask: nextMatch.queuedTask,
          highlightedTile: nextMatch.highlightedTile,
          highlightedPlayer: nextMatch.highlightedPlayer,
          openedCells: nextMatch.openedCells,
          diceValue: nextMatch.diceValue,
          winner: nextMatch.winner,
          logs: nextMatch.logs,
          clearedPlayers: nextMatch.clearedPlayers,
        });

        const latestState = get();

        if (latestState.entryMode === "online" && latestState.onlineRoom) {
          syncMatchSnapshot(phase);
        }
      };

      return {
        ...createInitialState(),
        startOfflineFlow: () =>
          set({
            screen: "setup",
            entryMode: "offline",
            onlineRoomLoading: false,
            onlineError: null,
          }),
        startOnlineFlow: () => {
          const storedSession = readPlayerSession();

          set({
            screen: "online-room",
            entryMode: "online",
            onlineRoomLoading: Boolean(storedSession),
            onlineError: null,
          });

          void get().syncOnlineRoom();
        },
        createOnlineRoom: async () => {
          set({
            onlineError: "Create the room with the Supabase form in the online room hub.",
          });
          return false;
        },
        joinOnlineRoom: async () => {
          set({
            onlineError: "Join the room with the Supabase form in the online room hub.",
          });
          return false;
        },
        syncOnlineRoom: async (options) => {
          const state = get();
          const storedSession = readPlayerSession();
          const silent = options?.silent ?? false;

          if (!silent) {
            set({
              entryMode: "online",
              onlineRoomLoading: true,
              onlineError: null,
            });
          }

          if (!storedSession) {
            if (state.entryMode === "online" || state.onlineRoom) {
              resetOnlineSession("online-room", null);
            } else if (!silent) {
              set({ onlineRoomLoading: false });
            }
            return;
          }

          try {
            const latestRoom = await fetchRoomById(storedSession.roomId);

            if (!latestRoom) {
              clearPlayerSession();
              resetOnlineSession("online-room", "That room is no longer available.");
              return;
            }

            const role = getRoleForPlayer(latestRoom, storedSession.playerId);

            if (!role) {
              clearPlayerSession();
              resetOnlineSession("online-room", "You are no longer part of this room.");
              return;
            }

            set({
              entryMode: "online",
              screen: screenForRoom(latestRoom),
              onlinePlayerId: storedSession.playerId,
              onlineRoom: latestRoom,
              onlineRole: role,
              onlineRoomLoading: false,
              onlineError: null,
              ...roomStatePatch(latestRoom, state.difficulty),
            });
          } catch (error) {
            set({
              entryMode: "online",
              screen: "online-room",
              onlineRoomLoading: false,
              onlineError:
                error instanceof Error ? error.message : "Unable to load the online room.",
            });
          }
        },
        clearOnlineError: () => set({ onlineError: null }),
        leaveOnlineRoom: (destination = "landing") => {
          const state = get();
          const storedSession = readPlayerSession();
          const roomId = state.onlineRoom?.id ?? storedSession?.roomId ?? null;
          const playerId = state.onlinePlayerId ?? storedSession?.playerId ?? null;
          const isHost = state.onlineRole === "male";

          clearPlayerSession();
          const resetState = createInitialState(state.onlineSessionId);
          set({
            ...resetState,
            screen: destination,
            entryMode:
              destination === "setup" || destination === "landing" ? "offline" : "online",
            onlinePlayerId: null,
            onlineRoomLoading: false,
          });

          if (!roomId || !playerId) {
            return;
          }

          void deleteOnlineRoom({ roomId, playerId, isHost }).catch((error) => {
            set({
              onlineError:
                error instanceof Error ? error.message : "Unable to leave the online room.",
            });
          });
        },
        setScreen: (screen) => set({ screen }),
        setMode: (mode) => {
          const state = get();

          set({
            mode,
            tasks:
              mode === "custom" && state.tasks.length > 0
                ? state.tasks
                : buildTaskDeck(state.difficulty),
          });

          const latestState = get();

          if (latestState.entryMode === "online" && latestState.onlineRoom) {
            syncMatchSnapshot(latestState.onlineRoom.phase);
          }
        },
        setDifficulty: (difficulty) => {
          set({
            difficulty,
            mode: "preset",
            tasks: buildTaskDeck(difficulty),
          });

          const latestState = get();

          if (latestState.entryMode === "online" && latestState.onlineRoom) {
            syncMatchSnapshot(latestState.onlineRoom.phase);
          }
        },
        selectGame: (game) => {
          const state = get();

          if (state.entryMode === "online" && state.onlineRoom) {
            if (state.onlineRole !== "male") {
              set({ onlineError: "Only the room admin can pick the game for this room." });
              return;
            }

            void syncStoredRoom({
              selectedGame: game,
              phase: "mode-select",
            })
              .then((synced) => {
                if (!synced) {
                  return;
                }

                set({
                  selectedGame: game,
                  screen: "mode-select",
                  onlineRoom: synced.room,
                  onlineRole: synced.role,
                  onlinePlayerId: synced.playerId,
                  onlineError: null,
                });
              })
              .catch((error) => {
                set({
                  onlineError:
                    error instanceof Error ? error.message : "Unable to update the room.",
                });
              });

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
            tasks: buildTaskDeck(state.difficulty),
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

          set({
            difficulty: nextDifficulty,
            tasks: buildTaskDeck(nextDifficulty),
          });

          const latestState = get();

          if (latestState.entryMode === "online" && latestState.onlineRoom) {
            syncMatchSnapshot(latestState.onlineRoom.phase);
          }
        },
        updateTaskCard: (taskId, patch) => {
          set((state) => ({
            tasks: state.tasks.map((row) =>
              row.id === taskId ? { ...row, ...patch } : row,
            ),
          }));

          const state = get();

          if (state.entryMode === "online" && state.onlineRoom) {
            syncMatchSnapshot(state.onlineRoom.phase);
          }
        },
        bulkAssignTasks: (performer, lines) => {
          set((state) => {
            const sanitized = lines.map((line) => line.trim()).filter(Boolean);

            if (sanitized.length === 0) {
              return state;
            }

            const performerRows = state.tasks.filter((row) => row.performer === performer);
            const updates = new Map<string, string>();

            performerRows.forEach((row, index) => {
              const replacement = sanitized[index];

              if (replacement) {
                updates.set(row.id, replacement);
              }
            });

            return {
              tasks: state.tasks.map((row) =>
                updates.has(row.id)
                  ? { ...row, description: updates.get(row.id) ?? row.description }
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
            const sanitized = rows
              .map((row, index) => ({
                id: row.id?.trim() || `imported-card-${index + 1}`,
                title: row.title.trim(),
                description: row.description.trim(),
                performer: row.performer,
                role: row.role,
                image: row.image.trim(),
              }))
              .filter((row) => row.title && row.description);

            if (sanitized.length === 0) {
              return state;
            }

            return { tasks: sanitized };
          });

          const state = get();

          if (state.entryMode === "online" && state.onlineRoom) {
            syncMatchSnapshot(state.onlineRoom.phase);
          }
        },
        startGame: () => {
          const state = get();

          if (state.entryMode === "online") {
            if (state.onlineRole !== "male") {
              set({ onlineError: "Only the host can start the room match." });
              return;
            }

            if (!state.onlineRoom || state.onlineRoom.playerCount < 2) {
              set({ onlineError: "Two players need to be in the room before the match can start." });
              return;
            }
          }

          const names = defaultNames(state.players);
          const nextMatch = DiceDareGame.init({
            mode: state.mode,
            difficulty: state.difficulty,
            names,
            tasks: state.tasks,
          });

          set({
            screen: "playing",
            mode: nextMatch.mode,
            difficulty: nextMatch.difficulty,
            players: nextMatch.players,
            tasks: nextMatch.tasks,
            currentTurn: nextMatch.currentTurn,
            gameState: nextMatch.gameState,
            pendingTask: nextMatch.pendingTask,
            queuedTask: nextMatch.queuedTask,
            highlightedTile: nextMatch.highlightedTile,
            highlightedPlayer: nextMatch.highlightedPlayer,
            openedCells: nextMatch.openedCells,
            diceValue: nextMatch.diceValue,
            winner: nextMatch.winner,
            editorOpen: false,
            logsOpen: false,
            clearedPlayers: nextMatch.clearedPlayers,
            logs: nextMatch.logs,
          });

          if (state.entryMode === "online" && state.onlineRoom) {
            void syncStoredRoom({
              started: true,
              phase: "playing",
              playersOrder: defaultPlayersOrder(state.onlineRoom),
              turnIndex: 0,
              interactionPhase: null,
              currentQuestion: null,
              questionType: null,
              actionBy: null,
              matchSnapshot: nextMatch,
            })
              .then((synced) => {
                if (!synced) {
                  return;
                }

                set({
                  onlineRoom: synced.room,
                  onlineRole: synced.role,
                  onlinePlayerId: synced.playerId,
                });
              })
              .catch((error) => {
                set({
                  onlineError:
                    error instanceof Error ? error.message : "Unable to start the room match.",
                });
              });
          }
        },
        restartMatch: () => {
          const state = get();
          const names = defaultNames(state.players);
          const nextMatch = DiceDareGame.init({
            mode: state.mode,
            difficulty: state.difficulty,
            names,
            tasks: state.tasks,
          });

          set({
            mode: nextMatch.mode,
            difficulty: nextMatch.difficulty,
            players: nextMatch.players,
            tasks: nextMatch.tasks,
            currentTurn: nextMatch.currentTurn,
            gameState: nextMatch.gameState,
            pendingTask: nextMatch.pendingTask,
            queuedTask: nextMatch.queuedTask,
            highlightedTile: nextMatch.highlightedTile,
            highlightedPlayer: nextMatch.highlightedPlayer,
            openedCells: nextMatch.openedCells,
            diceValue: nextMatch.diceValue,
            winner: nextMatch.winner,
            editorOpen: false,
            logsOpen: false,
            clearedPlayers: nextMatch.clearedPlayers,
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
          applyGameAction({
            type: "ROLL_DICE",
            player,
            value: roll,
          });
        },
        finishLandingSequence: () => {
          applyGameAction({
            type: "FINISH_LANDING_SEQUENCE",
          });
        },
        revealDrawnTask: () => {
          applyGameAction({
            type: "REVEAL_DRAWN_TASK",
          });
        },
        resolvePendingTask: (decision) => {
          applyGameAction({
            type: "RESOLVE_PENDING_TASK",
            decision,
          });
        },
        continueAfterWin: () => {
          applyGameAction({
            type: "CONTINUE_AFTER_WIN",
          });
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
      version: 2,
      skipHydration: true,
      migrate: (persistedState, version) => {
        if (version < 2) {
          const legacyState = persistedState as Partial<CoupleGameState> | undefined;
          return createInitialState(legacyState?.onlineSessionId);
        }

        return persistedState as CoupleGameState;
      },
      partialize: (state) => ({
        screen: state.screen,
        entryMode: state.entryMode,
        selectedGame: state.selectedGame,
        mode: state.mode,
        difficulty: state.difficulty,
        players: state.players,
        tasks: state.tasks,
        currentTurn: state.currentTurn,
        gameState: state.gameState,
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
        onlinePlayerId: state.onlinePlayerId,
        onlineRoom: state.onlineRoom,
        onlineRole: state.onlineRole,
      }),
    },
  ),
);
