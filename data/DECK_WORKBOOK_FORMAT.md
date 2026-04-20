# Deck Workbook Format

Use one Excel workbook, for example `data/decks.xlsx`, with one sheet per preset level:

- `easy`
- `fun`
- `medium`
- `hard`
- `extreme`

Each sheet should use this header row:

```text
id | title | text | performer | role | category | points | image
```

Notes:

- `id` is optional. If blank, the importer generates one.
- `title` is required.
- `text` is required.
- `performer` should be `female` or `male`.
- `role` should be `leader` or `submissive`.
- `category` is optional.
- `points` is optional.
- `image` is optional.

You can also include a `level` column, but it is not required when the sheet name already matches the level.

When you import the workbook, the JSON output now keeps two things:

- `cards`: every task row, with an auto-generated `number` per `level + performer`
- `config.levels[level].drawCount`: how many `male` and `female` cards each difficulty should randomly pull from the pool

That means you can keep a larger source pool in the workbook, for example `100` male and `100` female cards for `easy`, while the app randomly uses only `50` and `50` for a match.

To convert the workbook into the app's JSON deck file:

```bash
npm run import:decks
```

Optional custom paths:

```bash
node scripts/import-decks-from-excel.mjs data/my-workbook.xlsx data/decks.json
```

Importer behavior:

- If `data/decks.json` already has draw-count settings, the importer preserves them.
- If there are no existing settings, it creates defaults with a `50` card target per performer for each difficulty.
- If the workbook currently has fewer than the target, the game uses the available rows now and automatically grows into the full target as you add more cards later.
