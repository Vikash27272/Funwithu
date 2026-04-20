import type { CardRole, Difficulty, PlayerKey } from "@/types/game";
export {
  buildTaskDeck,
  getDeckLevelForDifficulty,
  getDeckStats,
} from "@/games/dice-dare/deck-loader";

export const DICE_DARE_GAME_ID = "dice-dare";

export const PLAYER_LABELS: Record<PlayerKey, string> = {
  male: "King",
  female: "Queen",
};

export const MAX_POSITION = 50;

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; vibe: string; accent: string }
> = {
  1: {
    label: "Easy",
    vibe: "Soft starts, warm smiles, and low-pressure prompts.",
    accent: "from-rose-200 via-pink-200 to-red-300",
  },
  2: {
    label: "Fun",
    vibe: "Playful energy with flirty little surprises.",
    accent: "from-pink-200 via-rose-300 to-red-400",
  },
  3: {
    label: "Medium",
    vibe: "A balanced mix of sweet, bold, and playful tasks.",
    accent: "from-red-200 via-rose-300 to-orange-300",
  },
  4: {
    label: "Hard",
    vibe: "Confident questions, teasing challenges, and bigger stakes.",
    accent: "from-red-300 via-rose-400 to-amber-300",
  },
  5: {
    label: "Extreme",
    vibe: "Intense chemistry, daring confessions, and spicy confidence.",
    accent: "from-rose-300 via-red-500 to-orange-400",
  },
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function getDisplayName(player: PlayerKey, name: string): string {
  return name.trim() || PLAYER_LABELS[player];
}

export function getOppositePlayer(player: PlayerKey): PlayerKey {
  return player === "male" ? "female" : "male";
}

export function createTaskId(title: string, performer: PlayerKey, role: CardRole): string {
  return `${performer}-${role}-${slugify(title)}`;
}

export function getTrackRows(): number[][] {
  const rows: number[][] = [];

  for (let row = 4; row >= 0; row -= 1) {
    const start = row * 10 + 1;
    const baseValues = Array.from({ length: 10 }, (_, offset) => start + offset);
    rows.push(row % 2 === 0 ? baseValues : [...baseValues].reverse());
  }

  return rows;
}

export function nextTrackPosition(
  position: number,
  direction: "up" | "down",
): number | null {
  const candidate = direction === "up" ? position - 1 : position + 1;

  if (candidate < 1 || candidate > MAX_POSITION) {
    return null;
  }

  return candidate;
}

export function createLogId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
