# Gachapon Simulator

A cute retro browser toy for drawing random capsule prizes, revealing them with a satisfying animation, building a persistent local collection, and running local Truth or Dare prompt draws with the same cute aesthetic.

## Overview

Gachapon Simulator is a React application that recreates the feel of a capsule toy vending machine in the browser. Users interact with a virtual machine, perform randomized draws from a curated item pool, discover prizes of different rarities, and track their collection over time.

The app can also operate in a Truth or Dare mode. In that mode, users upload one CSV deck containing truths, dares, and their correct/incorrect outcome images. The app then uses the same capsule-style reveal interaction to draw a prompt uniformly from the available categories.

The project is intended to be lightweight, tactile, and approachable. It should feel like a small arcade cabinet crossed with a collectible sticker album and party prompt machine: quick to understand, pleasant to repeat, and transparent about what can be drawn.

Current repository state: this repository now contains a Vite + React implementation with the first Retro Kawaii Pets machine, local collection persistence, Truth or Dare mode, sample item artwork, and unit tests for the core draw/storage helpers.

## Core Experience

### Collectible Gachapon

1. The user opens the app and sees the active gachapon machine.
2. The user presses a draw button or turns an on-screen crank.
3. The app selects an item with weighted random logic.
4. A capsule/reveal animation plays.
5. The result appears with item art, name, rarity, and flavor text.
6. The item is added to the user's local collection.
7. The user can inspect the collection, see duplicates/counts, and draw again.

### Truth Or Dare Mode

1. The user switches to Truth or Dare mode.
2. The app first tries `public/truthordare-deck.csv`; if it is unavailable, the user uploads one `.csv` deck. Referenced artwork lives in `public/images`.
3. The app parses each row as a truth or dare with two mapped outcome images.
4. The user chooses Surprise Me.
5. The app reveals one prompt through the capsule-style interaction.
6. After the animation, the user marks the answer Correct or Incorrect.
7. A full-screen, outcome-specific image transition plays and waits for input before returning to the machine.
8. The extracted row is removed from the remaining deck and cannot be drawn again during that session.

## Current Implementation

- Vite + React single-page app.
- Retro Kawaii Pets gachapon machine.
- Weighted collectible item draws.
- Capsule-style reveal state.
- Local collection persistence through `localStorage`.
- Collection grid with discovered and undiscovered item states.
- Draw stats, rarity counts, and reset progress control.
- Truth or Dare mode with one local CSV deck upload and `public/images` artwork mapping.
- Correct/incorrect prompt outcomes with distinct full-screen image transitions.
- Consumable prompt pools with one visible capsule per remaining CSV row.
- Distinct blue shades for truth capsules and red shades for dare capsules.
- Uniform Truth, Dare, and Surprise Me prompt draws.
- Responsive retro arcade styling.
- Unit tests for draw, prompt parsing, and storage helpers.

## Gameplay And Systems

### Rarity Tiers

The first catalog can use a simple rarity model like this:

| Rarity | Example Weight Share | Experience Goal |
| --- | ---: | --- |
| Common | 60% | Frequent, cute baseline prizes |
| Uncommon | 25% | Noticeably nicer finds |
| Rare | 10% | Exciting pulls |
| Epic | 4% | Special reveals |
| Legendary | 1% | Very scarce chase items |

These percentages are an example target, not a requirement. The implementation should use item weights so each catalog can define its own distribution.

### Weighted Draw Logic

The draw algorithm should:

1. Read the active machine's item pool.
2. Sum all eligible item weights.
3. Generate a random number in that total range.
4. Walk the item list cumulatively until the selected item is found.
5. Return the item and metadata needed by the UI.

The selection helper should live outside React components so it can be tested directly.

### Truth Or Dare Mode

Truth or Dare mode uses user-provided prompt lists instead of the predefined collectible item catalog.

Prompt upload rules:

- An optional `public/truthordare-deck.csv` is loaded automatically when Truth or Dare mode opens.
- If the default deck is missing or invalid, the app quietly waits for a CSV upload.
- Upload one CSV with the columns `Truth/dare`, `topic`, `description`, `image_name_1`, and `image_name_2`.
- Set `Truth/dare` to `truth` or `dare` on every row.
- `topic` is shown beside the Truth or Dare label during the prompt reveal.
- Put the referenced image files in `public/images`; `image_name_1` is the Correct image and `image_name_2` is the Incorrect image.
- CSV quoted fields, escaped quotes, commas, and line breaks in descriptions are supported.
- Prompt order in the file does not affect draw probability.
- Uploaded prompts are processed locally in the browser.

Truth or Dare draw behavior:

1. If the user chooses Truth, the app uniformly draws one prompt from the uploaded truths list.
2. If the user chooses Dare, the app uniformly draws one prompt from the uploaded dares list.
3. If the user chooses Surprise Me, the app uniformly chooses between the available prompt categories, then uniformly draws one prompt from that category.
4. If a category has no uploaded prompts, its draw control should be disabled or clearly unavailable.
5. Correct and Incorrect become available only after the capsule-opening animation finishes.
6. Either outcome waits for another click, tap, or key press before returning to the machine.
7. A selected row is immediately removed from the in-memory pool, so every question can be extracted once.
8. The globe and remaining counters update after every draw; reloading or uploading the deck starts a fresh pool.

Truth or Dare mode should not use rarity weights. Every prompt within a selected category has the same probability.

### Duplicate Handling

Duplicates should not be treated as failures. A duplicate can:

- Increase the owned count for the item.
- Be marked as "duplicate" in the reveal UI.
- Contribute to total draw stats.
- Later support exchange, crafting, or completion systems if desired.

## Persistence

The app should save progress in browser `localStorage` with versioned keys. Suggested keys:

| Key | Purpose |
| --- | --- |
| `gachapon.collection.v1` | Owned item map and duplicate counts |
| `gachapon.stats.v1` | Total draws and rarity totals |
| `gachapon.settings.v1` | Mute, reduced motion preference, selected machine |
| `gachapon.history.v1` | Optional recent draw history |

Uploaded Truth or Dare prompts should not be persisted in v1. They should remain in memory for the current browser session unless a future saved-deck feature is intentionally added.

Persistence should be defensive:

- Missing data should initialize cleanly.
- Invalid JSON should not crash the app.
- Future migrations should be possible by changing key versions.
- Resetting progress should clear the relevant keys only.
- Clearing collection progress should not imply uploaded prompt files were saved.


### State Management

Prefer simple React primitives until complexity proves otherwise:

- `useReducer` for collection, draw, and reveal state.
- `useMemo` for derived collection completion stats.
- `useEffect` for local storage persistence.
- Small helper modules for pure logic.

External state libraries are not necessary for the first version.

### Component Responsibilities

| Component | Responsibility |
| --- | --- |
| `GachaponMachine` | Renders the machine, capsule area, and physical controls |
| `DrawControls` | Handles draw button state and input affordances |
| `CapsuleReveal` | Shows reveal animation and result details |
| `CollectionGrid` | Displays discovered and undiscovered items |
| `ItemCard` | Renders a single prize card with rarity and count |
| `TruthOrDareMode` | Hosts prompt upload, type selection, and prompt draw controls |
| `PromptDeckUploader` | Parses one uploaded CSV into truth and dare lists with outcome images |
| `PostDrawRevealOverlay` | Shows the selected prompt and its correct/incorrect outcome flow |
| `StatsPanel` | Summarizes draws, completion, and rarity totals |

## Testing Strategy

When the app is scaffolded, prioritize tests around behavior that can silently break:

- Weighted draw selection returns only eligible items.
- Items with larger weights are statistically favored.
- Empty or invalid item pools fail predictably.
- Collection updates increment duplicate counts.
- Local storage load/save handles missing and malformed data.
- Reset progress clears only simulator data.
- UI renders discovered and undiscovered states correctly.
- Truth or Dare CSV parsing supports quoted content and validates all required columns.
- Truth or Dare draws select uniformly from the chosen prompt list.
- Surprise Me chooses between available prompt categories before drawing uniformly.
- Empty Truth or Dare categories disable or block their draw controls clearly.

Suggested tools for a Vite + React setup:

- Vitest for unit tests.
- React Testing Library for component behavior.
- Playwright for a small end-to-end smoke test once the UI exists.

## Development Setup

Install dependencies and run the app locally:

```sh
npm install
npm run dev
```

Build and test:

```sh
npm run build
npm test
```

The dev server uses Vite and binds to `0.0.0.0` so it can be opened from the local workspace URL shown in the terminal.

## Demo Deployment

The public demo is intended to run on GitHub Pages at:

```text
https://viuthelumberjack.github.io/gachapon-simulator/
```

Deployment is handled by GitHub Actions.

## Content Guidelines

Item names should be short and readable. Flavor text should be playful but brief. Rarity should feel special, but every prize should still feel intentionally designed.

Good item data includes:

- Stable id.
- Display name.
- Rarity tier.
- Numeric weight.
- Series or machine id.
- Short description.
- Artwork path or generated visual reference.
- Optional accent color.

Good Truth or Dare prompt files include:

- CSV format with the five required headers.
- One prompt per row and `truth` or `dare` in the first column.
- Clear, readable descriptions.
- Existing filenames for both outcome images in `public/images`.

Avoid item data that includes:

- Real-money value.
- Offensive stereotypes.
- Copyrighted characters from existing franchises.
- Long descriptions that do not fit cards.

Avoid prompt files that include:

- Private information about people who did not consent to play.
- Unsafe, coercive, or illegal dares.
- Prompts that depend on protected characteristics or harassment.

## Privacy And Safety

The app should not collect personal data. Collection progress is stored locally in the user's browser and is not transmitted anywhere in the first version.

Truth or Dare prompt files should be parsed locally in the browser. By default, uploaded prompt text should stay in memory for the current session and should not be saved, synced, logged, or sent to a server.

If export/import is added, make the saved file human-readable JSON and do not include secrets.
