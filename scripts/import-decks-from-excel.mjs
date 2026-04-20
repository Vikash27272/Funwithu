import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import xlsx from "xlsx";

const SHEET_TO_LEVEL = {
  easy: "easy",
  fun: "fun",
  medium: "medium",
  hard: "hard",
  extreme: "extreme",
};
const LEVELS = Object.values(SHEET_TO_LEVEL);
const DEFAULT_DRAW_COUNT = 50;

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function toOptionalString(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function toLevel(sheetName, row) {
  const explicitLevel = toOptionalString(row.level).toLowerCase();

  if (explicitLevel && SHEET_TO_LEVEL[explicitLevel]) {
    return SHEET_TO_LEVEL[explicitLevel];
  }

  const normalizedSheet = toOptionalString(sheetName).toLowerCase();

  if (SHEET_TO_LEVEL[normalizedSheet]) {
    return SHEET_TO_LEVEL[normalizedSheet];
  }

  return null;
}

function toPerformer(value) {
  return toOptionalString(value).toLowerCase() === "male" ? "male" : "female";
}

function toRole(value) {
  return toOptionalString(value).toLowerCase() === "submissive" ? "submissive" : "leader";
}

function toPoints(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toPositiveInteger(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null;
}

function normalizeRow(row, index, sheetName) {
  const title = toOptionalString(row.title || row.name);
  const text = toOptionalString(row.text || row.description);
  const level = toLevel(sheetName, row);

  if (!title || !text || !level) {
    return null;
  }

  const performer = toPerformer(row.performer);
  const role = toRole(row.role);
  const fallbackId = `${level}-${slugify(title || `card-${index + 1}`)}`;

  return {
    id: toOptionalString(row.id) || fallbackId,
    level,
    title,
    text,
    performer,
    role,
    category: toOptionalString(row.category) || "general",
    points: toPoints(row.points),
    image: toOptionalString(row.image),
  };
}

function workbookToDeckRows(workbook) {
  const rows = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      continue;
    }

    const sheetRows = xlsx.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false,
    });

    sheetRows.forEach((row, index) => {
      const normalized = normalizeRow(row, index, sheetName);

      if (normalized) {
        rows.push(normalized);
      }
    });
  }

  return rows;
}

function readExistingDeckConfig(outputPath) {
  if (!fs.existsSync(outputPath)) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(outputPath, "utf8"));

    if (parsed && !Array.isArray(parsed) && typeof parsed === "object") {
      return parsed.config;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function withDeckNumbers(rows) {
  const counters = new Map();

  return rows.map((row) => {
    const key = `${row.level}:${row.performer}`;
    const nextNumber = (counters.get(key) || 0) + 1;
    counters.set(key, nextNumber);

    return {
      ...row,
      number: nextNumber,
    };
  });
}

function buildDeckConfig(existingConfig) {
  const defaultDrawCount = {
    male:
      toPositiveInteger(existingConfig?.defaultDrawCount?.male) ?? DEFAULT_DRAW_COUNT,
    female:
      toPositiveInteger(existingConfig?.defaultDrawCount?.female) ?? DEFAULT_DRAW_COUNT,
  };
  const levels = Object.fromEntries(
    LEVELS.map((level) => {
      const levelConfig = existingConfig?.levels?.[level];

      return [
        level,
        {
          drawCount: {
            male:
              toPositiveInteger(levelConfig?.drawCount?.male) ??
              defaultDrawCount.male,
            female:
              toPositiveInteger(levelConfig?.drawCount?.female) ??
              defaultDrawCount.female,
          },
        },
      ];
    }),
  );

  return {
    defaultDrawCount,
    levels,
  };
}

const workbookPath = path.resolve(process.cwd(), process.argv[2] || "data/decks.xlsx");
const outputPath = path.resolve(process.cwd(), process.argv[3] || "data/decks.json");

if (!fs.existsSync(workbookPath)) {
  console.error(`Workbook not found: ${workbookPath}`);
  process.exit(1);
}

const workbook = xlsx.readFile(workbookPath);
const existingConfig = readExistingDeckConfig(outputPath);
const rows = withDeckNumbers(workbookToDeckRows(workbook));

if (rows.length === 0) {
  console.error("No valid deck rows were found. Check sheet names and column headers.");
  process.exit(1);
}

const deckData = {
  config: buildDeckConfig(existingConfig),
  cards: rows,
};

fs.writeFileSync(outputPath, `${JSON.stringify(deckData, null, 2)}\n`, "utf8");
console.log(
  `Imported ${rows.length} cards from ${path.basename(workbookPath)} to ${outputPath}`,
);
