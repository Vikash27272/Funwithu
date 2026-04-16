"use client";

import { ChangeEvent, useMemo, useState } from "react";
import {
  Download,
  GripVertical,
  MoveDown,
  MoveUp,
  RotateCcw,
  Upload,
} from "lucide-react";
import type { PlayerKey, TaskRow } from "@/types/game";
import { nextTrackPosition, PLAYER_LABELS } from "@/utils/game-logic";
import { useGameStore } from "@/utils/game-store";

interface TaskEditorProps {
  compact?: boolean;
}

function parseCsvContent(
  content: string,
): Array<{ target: PlayerKey; position: number; task: string }> {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(",");
      const parsedTarget = parts[0]?.trim().toLowerCase();
      const target: PlayerKey = parsedTarget === "female" ? "female" : "male";

      if (parts.length >= 3) {
        return {
          target,
          position: Number(parts[1].trim()),
          task: parts.slice(2).join(",").trim(),
        };
      }

      return {
        target,
        position: Number(parts[0].trim()),
        task: parts.slice(1).join(",").trim(),
      };
    })
    .filter((row) => Number.isInteger(row.position) && row.task.length > 0);
}

function TaskLaneTable({
  target,
  rows,
  onDragStart,
  onDrop,
}: {
  target: PlayerKey;
  rows: TaskRow[];
  onDragStart: (payload: { target: PlayerKey; position: number }) => void;
  onDrop: (payload: { target: PlayerKey; position: number }) => void;
}) {
  const players = useGameStore((state) => state.players);
  const updateTask = useGameStore((state) => state.updateTask);
  const swapTasks = useGameStore((state) => state.swapTasks);

  const moveTask = (position: number, direction: "up" | "down") => {
    const nextPosition = nextTrackPosition(position, direction);

    if (nextPosition) {
      swapTasks(target, position, nextPosition);
    }
  };

  return (
    <div className="min-w-0 rounded-[1.75rem] border border-[#c97a84]/35 bg-white/92 shadow-[0_18px_40px_rgba(101,20,35,0.08)]">
      <div className="border-b border-[#f0c8cf] px-5 py-4">
        <p className="text-xs uppercase tracking-[0.22em] text-[#9f4051]">
          {PLAYER_LABELS[target]} Track
        </p>
        <h4 className="mt-2 font-display text-3xl text-[#5f1626]">
          {players[target].name || PLAYER_LABELS[target]} Tasks
        </h4>
        <p className="mt-2 text-sm leading-6 text-[#8f4b59]">
          Positions 1 to 50 trigger only for this player.
        </p>
      </div>

      <div className="max-h-[32rem] overflow-y-auto overflow-x-hidden">
        <table className="w-full table-fixed border-separate border-spacing-0 text-left text-xs sm:text-sm">
          <thead className="sticky top-0 z-10 bg-[#fff7f8]">
            <tr className="text-xs uppercase tracking-[0.2em] text-[#9a5764]">
              <th className="w-11 px-2 py-3 sm:px-4">Move</th>
              <th className="w-12 px-2 py-3 sm:w-16 sm:px-4">Pos</th>
              <th className="px-2 py-3 sm:px-4">Task</th>
              <th className="w-28 px-2 py-3 text-right sm:w-40 sm:px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                draggable
                onDragStart={() => onDragStart({ target, position: row.position })}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  onDrop({ target, position: row.position });
                }}
                className="border-t border-[#f6dde1] hover:bg-[#fff5f7]"
              >
                <td className="px-2 py-3 text-[#bf8a94] sm:px-4">
                  <GripVertical className="h-4 w-4" />
                </td>
                <td className="px-2 py-3 font-semibold text-[#5f1626] sm:px-4">
                  {row.position}
                </td>
                <td className="px-2 py-3 sm:px-4">
                  <input
                    value={row.task}
                    onChange={(event) => updateTask(target, row.position, event.target.value)}
                    className="w-full min-w-0 rounded-xl border border-[#eabdc6] bg-white px-3 py-2 text-[#4b1824] outline-none focus:border-[#c85f73]"
                  />
                </td>
                <td className="px-2 py-3 sm:px-4">
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => moveTask(row.position, "up")}
                      className="rounded-full border border-[#edd2d7] bg-white p-2 text-[#8d4a59]"
                    >
                      <MoveUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveTask(row.position, "down")}
                      className="rounded-full border border-[#edd2d7] bg-white p-2 text-[#8d4a59]"
                    >
                      <MoveDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTask(target, row.position, "")}
                      className="rounded-full border border-[#edd2d7] bg-white px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d4a59] sm:px-3 sm:text-xs sm:tracking-[0.18em]"
                    >
                      Clear
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TaskEditor({ compact = false }: TaskEditorProps) {
  const tasks = useGameStore((state) => state.tasks);
  const players = useGameStore((state) => state.players);
  const difficulty = useGameStore((state) => state.difficulty);
  const bulkAssignTasks = useGameStore((state) => state.bulkAssignTasks);
  const importTasks = useGameStore((state) => state.importTasks);
  const rebuildTasks = useGameStore((state) => state.rebuildTasks);
  const [maleBulk, setMaleBulk] = useState("");
  const [femaleBulk, setFemaleBulk] = useState("");
  const [draggedRow, setDraggedRow] = useState<{
    target: PlayerKey;
    position: number;
  } | null>(null);

  const maleRows = useMemo(
    () =>
      tasks
        .filter((row) => row.target === "male")
        .sort((left, right) => left.position - right.position),
    [tasks],
  );
  const femaleRows = useMemo(
    () =>
      tasks
        .filter((row) => row.target === "female")
        .sort((left, right) => left.position - right.position),
    [tasks],
  );

  const helperText = useMemo(
    () => ({
      male: `${players.female.name || PLAYER_LABELS.female} writes the male track prompts.`,
      female: `${players.male.name || PLAYER_LABELS.male} writes the female track prompts.`,
    }),
    [players],
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

  const handleDrop = (payload: { target: PlayerKey; position: number }) => {
    if (!draggedRow || draggedRow.target !== payload.target || draggedRow.position === payload.position) {
      setDraggedRow(null);
      return;
    }

    useGameStore.getState().swapTasks(payload.target, draggedRow.position, payload.position);
    setDraggedRow(null);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="min-w-0 rounded-[1.75rem] border border-[#e9c2ca] bg-[#fff8f9] p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#7e3040]">
            <Download className="h-4 w-4 text-[#c95468]" />
            Female to Male Bulk Paste
          </div>
          <p className="mb-3 text-xs leading-5 text-[#9d6470]">{helperText.male}</p>
          <textarea
            value={maleBulk}
            onChange={(event) => setMaleBulk(event.target.value)}
            rows={compact ? 4 : 6}
            placeholder={"Hold his hand and give him a daring compliment\nTell him one soft truth\nWhisper what makes him irresistible"}
            className="min-h-28 w-full rounded-2xl border border-[#ebc9cf] bg-white px-4 py-3 text-sm text-[#4b1824] outline-none placeholder:text-[#c19aa3] focus:border-[#c85f73]"
          />
          <button
            type="button"
            onClick={() => bulkAssignTasks("male", maleBulk.split(/\r?\n/))}
            className="mt-3 rounded-full border border-[#e4aab5] bg-[linear-gradient(135deg,#fff1f3,#ffe0e6)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a3043]"
          >
            Fill Male Track
          </button>
        </div>

        <div className="min-w-0 rounded-[1.75rem] border border-[#e9c2ca] bg-[#fff8f9] p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#7e3040]">
            <Download className="h-4 w-4 text-[#c95468]" />
            Male to Female Bulk Paste
          </div>
          <p className="mb-3 text-xs leading-5 text-[#9d6470]">{helperText.female}</p>
          <textarea
            value={femaleBulk}
            onChange={(event) => setFemaleBulk(event.target.value)}
            rows={compact ? 4 : 6}
            placeholder={"Hold her close\nTell her one daring compliment\nChoose a playful reward for her"}
            className="min-h-28 w-full rounded-2xl border border-[#ebc9cf] bg-white px-4 py-3 text-sm text-[#4b1824] outline-none placeholder:text-[#c19aa3] focus:border-[#c85f73]"
          />
          <button
            type="button"
            onClick={() => bulkAssignTasks("female", femaleBulk.split(/\r?\n/))}
            className="mt-3 rounded-full border border-[#e4aab5] bg-[linear-gradient(135deg,#fff1f3,#ffe0e6)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a3043]"
          >
            Fill Female Track
          </button>
        </div>
      </div>

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
          CSV format: <span className="font-semibold text-[#7e3040]">male,1,task text</span>
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <TaskLaneTable
          target="male"
          rows={maleRows}
          onDragStart={setDraggedRow}
          onDrop={handleDrop}
        />
        <TaskLaneTable
          target="female"
          rows={femaleRows}
          onDragStart={setDraggedRow}
          onDrop={handleDrop}
        />
      </div>
    </div>
  );
}
