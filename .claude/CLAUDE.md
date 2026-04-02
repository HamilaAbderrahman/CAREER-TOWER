# Career Tower — Claude Context

## What this project is

A narrative web platformer game built with React 18 + TypeScript + Phaser 3 + Vite. The player jumps up a procedurally generated tower, with career milestones as checkpoints. It is the personal career story of Abderrahmane Hamila — a senior frontend engineer with 13+ years of experience.

## Stack

- **React 18** — UI layer (start screen, HUD, banners, game over/win screens)
- **Phaser 3** — game engine (physics, rendering, input, audio)
- **TypeScript strict mode** — throughout
- **Vite** — build tool, dev server on port 3000
- **Press Start 2P** — Google Font for retro aesthetic

## Key architecture decisions

- React and Phaser are decoupled: Phaser runs inside a `div` managed by `GameCanvas.tsx`, which bridges events via Phaser's event emitter (`scene.events.emit / on`).
- All game data is in JSON files under `src/game/config/` — no TypeScript required to change content.
- Physics constants and canvas dimensions live in `physics.json`.
- Career milestones (id, label, year, desc, worldY, colors) live in `milestones.json`.
- Speech bubble dialogue pools live in `bubbles.json`.
- TypeScript wrappers (`physics.ts`, `milestones.ts`) re-export the JSON with proper types.

## File map (critical files)

| File | Role |
|---|---|
| `src/App.tsx` | Root component, game state (started/muted), localStorage |
| `src/components/GameCanvas.tsx` | Phaser ↔ React bridge |
| `src/game/scenes/GameScene.ts` | Main game loop, platform gen, scoring, win/death |
| `src/game/objects/Player.ts` | Player physics, animation, speech bubbles |
| `src/game/objects/MilestoneManager.ts` | Tracks which milestones have been passed |
| `src/game/config/physics.json` | All physics + canvas size constants |
| `src/game/config/milestones.json` | All career milestone definitions |
| `src/game/config/bubbles.json` | All speech bubble text pools |

## How platform generation works

`GameScene.generateAllPlatforms()` iterates `MILESTONES`. For each pair of adjacent milestones it calls `generateSteppingStones()`, which uses a seeded random to place platforms every ~90px vertically, with ±60px horizontal variation clamped to canvas edges.

## Conventions to follow

- No default exports in game code — named exports only.
- Components in `src/components/` are React functional components, `.tsx`.
- Game objects in `src/game/` extend Phaser classes, `.ts`.
- Hex colors as strings (`#rrggbb`) in JSON; converted to numbers with `parseInt(hex.replace('#',''), 16)` where Phaser needs them.
- Canvas is always 400×700. Touch-first, mobile viewport.

## What NOT to do

- Do not add a router or state management library — this is intentionally a single-screen app.
- Do not split Phaser game config across multiple files — `CareerTowerGame.ts` owns it.
- Do not add test infrastructure unless explicitly requested — there are no tests currently.
- Do not change the milestone data (personal career history) without being asked.
- Do not add comments to code that is already self-explanatory.

## Running locally

```bash
npm install
npm run dev   # http://localhost:3000
npm run build # outputs to dist/
```
