import type { CardRole, Difficulty, PlayerKey, TaskCard } from "@/types/game";

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

interface CardSeed {
  title: string;
  description: string;
  performer: PlayerKey;
  role: CardRole;
}

const CARD_LIBRARY: Record<Difficulty, CardSeed[]> = {
  1: [
    {
      title: "Queen Leads",
      description: "Queen chooses a soft compliment challenge and King follows it for one turn.",
      performer: "male",
      role: "submissive",
    },
    {
      title: "King Leads",
      description: "King sets a gentle romantic prompt and Queen answers with full attention.",
      performer: "female",
      role: "submissive",
    },
    {
      title: "Sweet Spotlight",
      description: "Queen takes the lead and asks for one heartfelt truth right now.",
      performer: "female",
      role: "leader",
    },
    {
      title: "Calm Command",
      description: "King guides the moment with one warm instruction and keeps it playful.",
      performer: "male",
      role: "leader",
    },
    {
      title: "Slow Surrender",
      description: "Queen follows a simple affectionate dare picked by King.",
      performer: "female",
      role: "submissive",
    },
    {
      title: "Soft Obey",
      description: "King follows one sweet direction from Queen without arguing.",
      performer: "male",
      role: "submissive",
    },
  ],
  2: [
    {
      title: "Queen Has The Floor",
      description: "Queen leads the vibe and asks for one bold answer from King.",
      performer: "female",
      role: "leader",
    },
    {
      title: "King In Charge",
      description: "King picks the dare and Queen performs it with confidence.",
      performer: "female",
      role: "submissive",
    },
    {
      title: "King Performs",
      description: "King takes center stage and delivers one flirty challenge all the way through.",
      performer: "male",
      role: "leader",
    },
    {
      title: "Queen Follows",
      description: "Queen accepts a playful prompt chosen on the spot by King.",
      performer: "female",
      role: "submissive",
    },
    {
      title: "Queen Commands",
      description: "Queen sets the tone and King completes the next affectionate action.",
      performer: "male",
      role: "submissive",
    },
    {
      title: "King Commands",
      description: "King leads a teasing mini-task and Queen responds without hesitation.",
      performer: "female",
      role: "submissive",
    },
  ],
  3: [
    {
      title: "Queen Momentum",
      description: "Queen drives the round and chooses the exact challenge that happens next.",
      performer: "female",
      role: "leader",
    },
    {
      title: "King Momentum",
      description: "King controls the moment and calls a confident dare for Queen.",
      performer: "male",
      role: "leader",
    },
    {
      title: "King Yields",
      description: "King follows Queen's next instruction completely before the turn ends.",
      performer: "male",
      role: "submissive",
    },
    {
      title: "Queen Yields",
      description: "Queen follows King's chosen prompt and keeps the energy playful.",
      performer: "female",
      role: "submissive",
    },
    {
      title: "Queen Spotlight",
      description: "Queen owns the turn and performs one bold line or action.",
      performer: "female",
      role: "leader",
    },
    {
      title: "King Spotlight",
      description: "King owns the turn and performs one bold line or action.",
      performer: "male",
      role: "leader",
    },
  ],
  4: [
    {
      title: "Queen Directs",
      description: "Queen takes full control and gives King one higher-stakes dare.",
      performer: "male",
      role: "submissive",
    },
    {
      title: "King Directs",
      description: "King takes full control and gives Queen one higher-stakes dare.",
      performer: "female",
      role: "submissive",
    },
    {
      title: "Queen Takes Lead",
      description: "Queen leads the round with a confident prompt that raises the tension.",
      performer: "female",
      role: "leader",
    },
    {
      title: "King Takes Lead",
      description: "King leads the round with a confident prompt that raises the tension.",
      performer: "male",
      role: "leader",
    },
    {
      title: "King Surrenders",
      description: "King must follow Queen's next command exactly once and immediately.",
      performer: "male",
      role: "submissive",
    },
    {
      title: "Queen Surrenders",
      description: "Queen must follow King's next command exactly once and immediately.",
      performer: "female",
      role: "submissive",
    },
  ],
  5: [
    {
      title: "Queen Rules This Round",
      description: "Queen owns the energy and decides the boldest next move.",
      performer: "female",
      role: "leader",
    },
    {
      title: "King Rules This Round",
      description: "King owns the energy and decides the boldest next move.",
      performer: "male",
      role: "leader",
    },
    {
      title: "King Gives In",
      description: "King follows a no-nonsense instruction from Queen and commits fully.",
      performer: "male",
      role: "submissive",
    },
    {
      title: "Queen Gives In",
      description: "Queen follows a no-nonsense instruction from King and commits fully.",
      performer: "female",
      role: "submissive",
    },
    {
      title: "Queen Sets The Temperature",
      description: "Queen leads with a daring prompt and controls how the turn resolves.",
      performer: "female",
      role: "leader",
    },
    {
      title: "King Sets The Temperature",
      description: "King leads with a daring prompt and controls how the turn resolves.",
      performer: "male",
      role: "leader",
    },
  ],
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

export function buildTaskDeck(difficulty: Difficulty): TaskCard[] {
  return CARD_LIBRARY[difficulty].map((entry) => ({
    ...entry,
    id: createTaskId(entry.title, entry.performer, entry.role),
    image: "",
  }));
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
