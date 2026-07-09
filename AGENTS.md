# Gachapon Simulator Agent Guide

## Project Intent

Gachapon Simulator is a browser-based React application that recreates the small ritual of using a capsule toy vending machine: choose a machine, turn the crank, watch a capsule drop, reveal a random prize, and grow a persistent collection over time.

The product should feel cute, tactile, and lightly retro, with the immediacy of a classic arcade toy. The core experience is not real-money gambling. It is a playful collection simulator built around weighted random item generation, local progress, reveal animations, and a clear item album.

## Primary Goals

- Let users perform random draws from a predefined item pool.
- Represent item rarity with explicit, auditable probability weights.
- Save collection progress locally in the browser.
- Make repeat draws satisfying through animation, sound-ready interaction states, and a polished collection view.
- Keep the first screen focused on the actual simulator, not a marketing landing page.

## Technical Direction

- Use JavaScript and React for the user interface.
- Prefer Vite for a future scaffold unless the repository already contains another React setup.
- Use browser `localStorage` for persistence.
- Keep the app client-only unless a future requirement explicitly introduces a backend.
- Prefer simple local state or `useReducer` before adding external state libraries.
- Keep probability logic separated from presentation components so it can be unit tested.

## Core Domain Concepts

- `GachaponMachine`: A themed machine with a name, item pool, draw cost if any, and display metadata.
- `CapsuleItem`: A collectible prize with an id, name, rarity, weight, description, artwork, and optional series/category.
- `DrawResult`: The resolved item plus reveal metadata such as timestamp, duplicate status, and rarity.
- `CollectionEntry`: The user's saved ownership record for an item, including count and first acquired date.
- `RarityTier`: A human-readable rarity label backed by numeric draw weights.

## Probability Guidance

- Model draws with numeric weights rather than hard-coded percentage branches.
- Keep item definitions as data so probabilities can be reviewed without reading component logic.
- Do not silently change rarity odds in UI code.
- If pity timers, guarantees, streak bonuses, or currency systems are added, document the behavior in the README and add tests for it.
- Avoid real-money mechanics or language that implies wagering, cash value, withdrawal, or financial reward.

## User Experience Direction

- The simulator should open directly into the usable machine interface.
- The main interaction should be obvious: draw, reveal, collect, inspect collection, draw again.
- Use a charming retro-arcade visual style: crisp shapes, playful color, toy-like controls, pixel or cabinet-inspired details where useful.
- Cute graphics should support the app's usability; avoid decorative clutter that makes the machine, capsule, result, or collection harder to read.
- Include responsive layouts for mobile and desktop.
- Respect accessibility basics: semantic buttons, visible focus states, alt text for item art, sufficient contrast, and reduced-motion handling for reveal animations.

## Persistence Guidance

- Store user-owned collection data, draw history, settings, and machine progress under versioned `localStorage` keys.
- Treat stored data as user-owned and recover gracefully from missing, old, or malformed values.
- Provide a reset/clear-progress path before the project is considered complete.
- Do not store secrets, credentials, or personally identifiable information.

## Implementation Standards

- Read the existing code before changing architecture or style.
- Keep changes scoped to the requested behavior.
- Prefer reusable helpers for draw logic, storage adapters, item catalog validation, and rarity formatting.
- Do not add a dependency unless it clearly improves the implementation or matches the existing stack.
- Add or update tests when changing draw probability logic, persistence, collection behavior, or shared utilities.
- For UI work, verify that text does not overflow on small screens and that animations do not block interaction.

## Suggested Project Structure

Once the app is scaffolded, prefer a structure close to this unless the chosen starter provides a stronger convention:

```text
src/
  App.jsx
  main.jsx
  data/
    machines.js
    items.js
  components/
    GachaponMachine.jsx
    CapsuleReveal.jsx
    CollectionGrid.jsx
    ItemCard.jsx
  hooks/
    useCollection.js
    useLocalStorage.js
  lib/
    drawItem.js
    rarity.js
    storageKeys.js
  styles/
    tokens.css
    app.css
```

## Definition of Done

For meaningful implementation changes, aim to finish with:

- The requested behavior implemented in the app, not only described.
- Relevant docs updated when behavior, setup, or project scope changes.
- Tests or focused manual verification completed.
- Build/lint/test commands run when available.
- Any limitations or follow-up work called out clearly.
