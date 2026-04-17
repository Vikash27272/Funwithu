"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import type { CardRole, PlayerKey, TaskCard } from "@/types/game";
import { PLAYER_LABELS } from "@/utils/game-logic";
import { useGameStore } from "@/utils/game-store";

interface TaskEditorProps {
  compact?: boolean;
}

function createImportId(
  title: string,
  performer: PlayerKey,
  role: CardRole,
  index: number,
) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${performer}-${role}-${slug || `card-${index + 1}`}`;
}

function parseCsvContent(content: string): TaskCard[] {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split(",").map((part) => part.trim());
      const [title = "", description = "", performerValue = "female", roleValue = "leader", image = ""] =
        parts;
      const performer: PlayerKey = performerValue === "male" ? "male" : "female";
      const role: CardRole = roleValue === "submissive" ? "submissive" : "leader";

      return {
        id: createImportId(title, performer, role, index),
        title,
        description,
        performer,
        role,
        image,
      };
    })
    .filter((row) => row.title.length > 0 && row.description.length > 0);
}

function TaskCardPanel({
  performer,
  rows,
  compact,
}: {
  performer: PlayerKey;
  rows: TaskCard[];
  compact: boolean;
}) {
  const updateTaskCard = useGameStore((state) => state.updateTaskCard);
  const bulkAssignTasks = useGameStore((state) => state.bulkAssignTasks);
  const [bulkValue, setBulkValue] = useState("");

  return (
    <div className="min-w-0 rounded-[1.75rem] border border-[#c97a84]/35 bg-white/92 shadow-[0_18px_40px_rgba(101,20,35,0.08)]">
      <div className="border-b border-[#f0c8cf] px-5 py-4">
        <p className="text-xs uppercase tracking-[0.22em] text-[#9f4051]">
          {PLAYER_LABELS[performer]} Cards
        </p>
        <h4 className="mt-2 font-display text-3xl text-[#5f1626]">
          {PLAYER_LABELS[performer]} Performs
        </h4>
        <p className="mt-2 text-sm leading-6 text-[#8f4b59]">
          These cards can be drawn on any tile. The deck decides performer and role dynamically.
        </p>
      </div>

      <div className="border-b border-[#f0c8cf] bg-[#fff7f8] px-5 py-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#7e3040]">
          <Download className="h-4 w-4 text-[#c95468]" />
          Bulk Replace Descriptions
        </div>
        <p className="mb-3 text-xs leading-5 text-[#9d6470]">
          Paste one description per line to overwrite this performer’s cards in order.
        </p>
        <textarea
          value={bulkValue}
          onChange={(event) => setBulkValue(event.target.value)}
          rows={compact ? 3 : 5}
          placeholder={"Take the lead for 10 seconds\nFollow one playful command immediately"}
          className="min-h-24 w-full rounded-2xl border border-[#ebc9cf] bg-white px-4 py-3 text-sm text-[#4b1824] outline-none placeholder:text-[#c19aa3] focus:border-[#c85f73]"
        />
        <button
          type="button"
          onClick={() => bulkAssignTasks(performer, bulkValue.split(/\r?\n/))}
          className="mt-3 rounded-full border border-[#e4aab5] bg-[linear-gradient(135deg,#fff1f3,#ffe0e6)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a3043]"
        >
          Apply To {PLAYER_LABELS[performer]} Cards
        </button>
      </div>

      <div className="max-h-[34rem] space-y-4 overflow-y-auto p-4">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-[1.4rem] border border-[#edd2d7] bg-[#fffafb] p-4"
          >
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_10rem]">
              <input
                value={row.title}
                onChange={(event) =>
                  updateTaskCard(row.id, { title: event.target.value })
                }
                placeholder="Card title"
                className="w-full rounded-xl border border-[#eabdc6] bg-white px-3 py-2 text-[#4b1824] outline-none focus:border-[#c85f73]"
              />
              <select
                value={row.role}
                onChange={(event) =>
                  updateTaskCard(row.id, {
                    role: event.target.value as CardRole,
                  })
                }
                className="rounded-xl border border-[#eabdc6] bg-white px-3 py-2 text-[#4b1824] outline-none focus:border-[#c85f73]"
              >
                <option value="leader">Leader</option>
                <option value="submissive">Submissive</option>
              </select>
            </div>

            <textarea
              value={row.description}
              onChange={(event) =>
                updateTaskCard(row.id, { description: event.target.value })
              }
              rows={compact ? 3 : 4}
              placeholder="Card description"
              className="mt-3 w-full rounded-2xl border border-[#eabdc6] bg-white px-3 py-3 text-sm text-[#4b1824] outline-none focus:border-[#c85f73]"
            />

            <input
              value={row.image}
              onChange={(event) =>
                updateTaskCard(row.id, { image: event.target.value })
              }
              placeholder="Image URL or data URI"
              className="mt-3 w-full rounded-xl border border-[#eabdc6] bg-white px-3 py-2 text-sm text-[#4b1824] outline-none focus:border-[#c85f73]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TaskEditor({ compact = false }: TaskEditorProps) {
  const tasks = useGameStore((state) => state.tasks);
  const difficulty = useGameStore((state) => state.difficulty);
  const importTasks = useGameStore((state) => state.importTasks);
  const rebuildTasks = useGameStore((state) => state.rebuildTasks);

  const kingCards = useMemo(
    () => tasks.filter((row) => row.performer === "male"),
    [tasks],
  );
  const queenCards = useMemo(
    () => tasks.filter((row) => row.performer === "female"),
    [tasks],
  );

  const handleCsvImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const content = await file.text();
    importTasks(parseCsvContent(content));
    event.target.value = "";
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#e7c2ca] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#85414f]">
          <Upload className="h-4 w-4" />
          Import CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvImport}
            className="hidden"
          />
        </label>

        <button
          type="button"
          onClick={() => rebuildTasks(difficulty)}
          className="inline-flex items-center gap-2 rounded-full border border-[#e7c2ca] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#85414f]"
        >
          <RotateCcw className="h-4 w-4" />
          Restore Preset Deck
        </button>

        <p className="self-center text-xs text-[#9f6672]">
          CSV format:
          <span className="ml-1 font-semibold text-[#7e3040]">
            title,description,performer,role,image
          </span>
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <TaskCardPanel performer="female" rows={queenCards} compact={compact} />
        <TaskCardPanel performer="male" rows={kingCards} compact={compact} />
      </div>
    </div>
  );
}
