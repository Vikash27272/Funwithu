import decks from "@/data/decks.json";
import type {
  CardRole,
  DeckLevel,
  Difficulty,
  PlayerKey,
  TaskCard,
} from "@/types/game";

interface DeckRow {
  id: string | number;
  level: DeckLevel;
  number?: number;
  title?: string;
  text?: string;
  description?: string;
  performer: PlayerKey;
  role: CardRole;
  category?: string;
  points?: number;
  image?: string;
}

interface DeckCountConfig {
  male?: number;
  female?: number;
}

interface DeckLevelConfig {
  drawCount?: DeckCountConfig;
}

interface DeckDataFile {
  config: {
    defaultDrawCount?: DeckCountConfig;
    levels?: Partial<Record<DeckLevel, DeckLevelConfig>>;
  };
  cards: DeckRow[];
}

interface DeckPool {
  cards: TaskCard[];
  cardsByPerformer: Record<PlayerKey, TaskCard[]>;
  availableCount: Record<PlayerKey, number>;
  configuredDrawCount: Record<PlayerKey, number>;
}

export interface DeckStats {
  level: DeckLevel;
  availableCount: Record<PlayerKey, number>;
  configuredDrawCount: Record<PlayerKey, number>;
  actualDrawCount: Record<PlayerKey, number>;
  totalAvailable: number;
  totalDraw: number;
}

const DIFFICULTY_TO_LEVEL: Record<Difficulty, DeckLevel> = {
  1: "easy",
  2: "fun",
  3: "medium",
  4: "hard",
  5: "extreme",
};

const normalizedDeckCache = new Map<Difficulty, DeckPool>();

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function createTaskId(title: string, performer: PlayerKey, role: CardRole): string {
  return `${performer}-${role}-${slugify(title)}`;
}

function cloneDeck(deck: TaskCard[]): TaskCard[] {
  return deck.map((card) => ({ ...card }));
}

function shuffleDeck(deck: TaskCard[]): TaskCard[] {
  const next = [...deck];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index];

    next[index] = next[swapIndex]!;
    next[swapIndex] = current!;
  }

  return next;
}

function getDeckRows(): DeckRow[] {
  const deckSource = decks as DeckDataFile;
  return Array.isArray(deckSource.cards) ? deckSource.cards : [];
}

function getDeckConfig(): DeckDataFile["config"] | undefined {
  const deckSource = decks as DeckDataFile;
  return deckSource.config;
}

function toConfiguredCount(value: unknown): number | null {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return Math.max(0, Math.floor(parsed));
}

function resolveDrawCount(
  configuredValue: unknown,
  defaultValue: unknown,
  availableCount: number,
): number {
  return (
    toConfiguredCount(configuredValue) ??
    toConfiguredCount(defaultValue) ??
    availableCount
  );
}

function sampleDeck(deck: TaskCard[], count: number): TaskCard[] {
  if (count <= 0 || deck.length === 0) {
    return [];
  }

  return shuffleDeck(cloneDeck(deck)).slice(0, Math.min(count, deck.length));
}

function normalizeDeckRow(row: DeckRow, index: number): TaskCard | null {
  const title = row.title?.trim();
  const description = row.description?.trim() || row.text?.trim();

  if (!title || !description) {
    return null;
  }

  return {
    id:
      String(row.id).trim() ||
      createTaskId(title, row.performer, row.role) ||
      `deck-card-${index + 1}`,
    title,
    description,
    performer: row.performer,
    role: row.role,
    image: row.image?.trim() ?? "",
    level: row.level,
    category: row.category?.trim() || undefined,
    points: typeof row.points === "number" ? row.points : undefined,
  };
}

function getNormalizedDeck(difficulty: Difficulty): DeckPool {
  const cached = normalizedDeckCache.get(difficulty);

  if (cached) {
    return cached;
  }

  const deckLevel = DIFFICULTY_TO_LEVEL[difficulty];
  const config = getDeckConfig();
  const nextDeck = getDeckRows()
    .filter((row) => row.level === deckLevel)
    .map(normalizeDeckRow)
    .filter((row): row is TaskCard => row !== null);

  const cardsByPerformer: Record<PlayerKey, TaskCard[]> = {
    male: nextDeck.filter((row) => row.performer === "male"),
    female: nextDeck.filter((row) => row.performer === "female"),
  };
  const availableCount = {
    male: cardsByPerformer.male.length,
    female: cardsByPerformer.female.length,
  };
  const levelConfig = config?.levels?.[deckLevel];
  const configuredDrawCount = {
    male: resolveDrawCount(
      levelConfig?.drawCount?.male,
      config?.defaultDrawCount?.male,
      availableCount.male,
    ),
    female: resolveDrawCount(
      levelConfig?.drawCount?.female,
      config?.defaultDrawCount?.female,
      availableCount.female,
    ),
  };
  const deckPool = {
    cards: nextDeck,
    cardsByPerformer,
    availableCount,
    configuredDrawCount,
  };

  normalizedDeckCache.set(difficulty, deckPool);

  return deckPool;
}

export function buildTaskDeck(difficulty: Difficulty): TaskCard[] {
  const deckPool = getNormalizedDeck(difficulty);
  const sampledDeck = [
    ...sampleDeck(deckPool.cardsByPerformer.male, deckPool.configuredDrawCount.male),
    ...sampleDeck(deckPool.cardsByPerformer.female, deckPool.configuredDrawCount.female),
  ];

  return shuffleDeck(sampledDeck);
}

export function getDeckStats(difficulty: Difficulty): DeckStats {
  const deckLevel = DIFFICULTY_TO_LEVEL[difficulty];
  const deckPool = getNormalizedDeck(difficulty);
  const actualDrawCount = {
    male: Math.min(deckPool.configuredDrawCount.male, deckPool.availableCount.male),
    female: Math.min(deckPool.configuredDrawCount.female, deckPool.availableCount.female),
  };

  return {
    level: deckLevel,
    availableCount: deckPool.availableCount,
    configuredDrawCount: deckPool.configuredDrawCount,
    actualDrawCount,
    totalAvailable: deckPool.cards.length,
    totalDraw: actualDrawCount.male + actualDrawCount.female,
  };
}

export function getDeckLevelForDifficulty(difficulty: Difficulty): DeckLevel {
  return DIFFICULTY_TO_LEVEL[difficulty];
}
