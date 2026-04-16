import type { Difficulty, PlayerKey, TaskRow } from "@/types/game";

export const PLAYER_LABELS: Record<PlayerKey, string> = {
  male: "Male",
  female: "Female",
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
    vibe: "A balanced mix of sweet, bold, and silly dares.",
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

const PROMPT_LIBRARY: Record<Difficulty, Record<PlayerKey, string[]>> = {
  1: {
    male: [
      "Give her a warm compliment and hold eye contact for 10 seconds.",
      "Tell her your favorite memory with her.",
      "Kiss her hand and say one sweet promise.",
      "Let her choose your next cute challenge.",
      "Describe what makes her feel safe to you.",
    ],
    female: [
      "Give him a long hug and stay close for 10 seconds.",
      "Tell him one thing you admire about him.",
      "Share the first moment he made you smile.",
      "Let him pick one gentle dare for you.",
      "Say what kind of date with him feels perfect.",
    ],
  },
  2: {
    male: [
      "Tell her the cutest thing she does without realizing it.",
      "Whisper one flirty line in her ear.",
      "Do your best charming movie-hero confession.",
      "Let her ask one bold question and answer honestly.",
      "Offer her a playful reward she can claim later.",
    ],
    female: [
      "Tell him what makes him impossible to ignore.",
      "Hold his face gently and give him one daring compliment.",
      "Describe your favorite version of him in one sentence.",
      "Let him choose a short fun dare for you.",
      "Give him a playful promise for later tonight.",
    ],
  },
  3: {
    male: [
      "Confess one romantic thought you usually keep to yourself.",
      "Describe your ideal private date night with her.",
      "Tell her which look of hers always wins you over.",
      "Hold her hand and say what she does to your heartbeat.",
      "Let her challenge you to speak one bold truth.",
    ],
    female: [
      "Tell him exactly when he looks most irresistible.",
      "Describe one moment when you felt strong chemistry with him.",
      "Let him ask for one confident answer and give it fully.",
      "Share your dream late-night plan together.",
      "Say one truth that makes the tension rise a little.",
    ],
  },
  4: {
    male: [
      "Reveal one intense thought you have had about her lately.",
      "Describe the boldest date you would actually plan for her.",
      "Whisper what about her energy pulls you in the most.",
      "Let her set a short high-stakes dare for you.",
      "Tell her what version of her is unforgettable to you.",
    ],
    female: [
      "Reveal one daring thought you have had about him lately.",
      "Describe how he can instantly get your attention.",
      "Whisper the compliment that would make him weak.",
      "Let him set a short high-stakes dare for you.",
      "Tell him what part of his energy is hardest to resist.",
    ],
  },
  5: {
    male: [
      "Confess one fantasy you would only trust her with.",
      "Tell her the boldest thing you want to make her feel.",
      "Describe the moment when she becomes impossible to resist.",
      "Let her decide one extreme romantic dare right now.",
      "Say one line that raises the temperature immediately.",
    ],
    female: [
      "Confess one fantasy you would only trust him with.",
      "Tell him the boldest thing you want him to know.",
      "Describe the moment when he becomes impossible to resist.",
      "Let him decide one extreme romantic dare right now.",
      "Say one line that raises the temperature immediately.",
    ],
  },
};

export function getOppositePlayer(player: PlayerKey): PlayerKey {
  return player === "male" ? "female" : "male";
}

export function getDisplayName(player: PlayerKey, name: string): string {
  return name.trim() || PLAYER_LABELS[player];
}

export function createTaskId(target: PlayerKey, position: number): string {
  return `${target}-${position}`;
}

export function getSkipAllowance(
  player: PlayerKey,
  clearedPlayers?: Partial<Record<PlayerKey, boolean>>,
): number {
  return clearedPlayers?.[player] ? 3 : 2;
}

export function buildTaskDeck(
  difficulty: Difficulty,
  names: Record<PlayerKey, string>,
): TaskRow[] {
  const library = PROMPT_LIBRARY[difficulty];

  return (["male", "female"] as PlayerKey[]).flatMap((target) =>
    Array.from({ length: MAX_POSITION }, (_, offset) => {
      const position = offset + 1;
      const author = getOppositePlayer(target);
      const targetName = getDisplayName(target, names[target]);
      const authorName = getDisplayName(author, names[author]);
      const prompt = library[target][offset % library[target].length];

      return {
        id: createTaskId(target, position),
        position,
        target,
        author,
        task: `${prompt} (${authorName} -> ${targetName})`,
      };
    }),
  );
}

export function nextTrackPosition(position: number, direction: "up" | "down"): number | null {
  const candidate = direction === "up" ? position - 1 : position + 1;

  if (candidate < 1 || candidate > MAX_POSITION) {
    return null;
  }

  return candidate;
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

  const nextPosition = Math.min(MAX_POSITION, position + roll);

  return {
    position: nextPosition,
  };
}

export function getTrackRows(): number[][] {
  const rows: number[][] = [];

  for (let row = 4; row >= 0; row -= 1) {
    const start = row * 10 + 1;
    const baseValues = Array.from({ length: 10 }, (_, offset) => start + offset);
    const values = row % 2 === 0 ? baseValues : [...baseValues].reverse();
    rows.push(values);
  }

  return rows;
}

export function createLogId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
