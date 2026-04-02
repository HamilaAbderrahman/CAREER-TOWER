# Career Tower

A narrative platformer game that visualizes a developer's career journey — built with React, TypeScript, and Phaser 3. Jump your way through 13+ years of craft, from a CS degree in Tunisia to leading frontend architecture at enterprise scale.

**Play it:** climb the tower, reach every milestone, don't fall.

---

## Features

- Narrative platformer with real career milestones as checkpoints
- Mobile-first with full touch controls and haptics
- Pixel-art character with speech bubbles and idle animations
- Procedurally generated stepping stones between milestones
- Parallax backgrounds that shift color per career era
- Persistent best score via localStorage
- Toggleable music and SFX

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 + TypeScript |
| Game Engine | Phaser 3 |
| Build | Vite |
| Styling | CSS (viewport-fit, mobile-safe) |
| Font | Press Start 2P (Google Fonts) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
git clone https://github.com/HamilaAbderrahman/career-tower.git
cd career-tower
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm run preview
```

Output goes to `dist/`.

## Project Structure

```
src/
├── App.tsx                     # Root component, game state
├── components/                 # React UI layer
│   ├── StartScreen.tsx
│   ├── GameCanvas.tsx          # Phaser ↔ React bridge
│   ├── HUD.tsx
│   ├── MilestoneBanner.tsx
│   ├── DeathScreen.tsx
│   ├── WinScreen.tsx
│   ├── AboutModal.tsx
│   ├── TouchControls.tsx
│   └── RotatePrompt.tsx
└── game/                       # Phaser game logic
    ├── CareerTowerGame.ts      # Game factory / config
    ├── scenes/
    │   ├── BootScene.ts
    │   └── GameScene.ts        # Main game loop
    ├── objects/
    │   ├── Player.ts
    │   ├── Platform.ts
    │   ├── SpeechBubble.ts
    │   └── MilestoneManager.ts
    ├── config/                 # All tunable data lives here
    │   ├── physics.json        # Gravity, jump, speed, canvas size
    │   ├── milestones.json     # Career milestone definitions
    │   ├── bubbles.json        # Speech bubble dialogue
    │   ├── physics.ts          # Re-exports physics.json with types
    │   └── milestones.ts       # Milestone interface + re-export
    ├── input/
    │   └── TouchInput.ts
    ├── backgrounds/
    │   └── BackgroundRenderer.ts
    └── audio/
        └── AudioManager.ts
```

## Customizing the Game

All game data lives in JSON files — no TypeScript knowledge required to tweak it.

### Tune physics (`src/game/config/physics.json`)

```json
{
  "physics": {
    "GRAVITY": 600,
    "JUMP_VELOCITY": -620,
    "MOVE_SPEED": 220,
    "MAX_FALL_SPEED": 800,
    "COYOTE_TIME": 120,
    "JUMP_BUFFER": 150,
    "VARIABLE_JUMP": true
  },
  "canvas": {
    "WIDTH": 400,
    "HEIGHT": 700
  }
}
```

### Add or edit milestones (`src/game/config/milestones.json`)

Each milestone needs:

| Field | Type | Description |
|---|---|---|
| `id` | number | Unique, sequential |
| `label` | string | Title shown in-game |
| `year` | string | Date range string |
| `desc` | string | Description shown on banner |
| `worldY` | number | Height in the world (higher = further up) |
| `bg` | string | Background hex color |
| `platformColor` | string | Platform fill hex color |
| `accent` | string | Accent / highlight hex color |

### Edit speech bubbles (`src/game/config/bubbles.json`)

Four pools: `idle`, `jump`, `milestone`, `idle_rare`. Add or remove strings freely.

## Controls

| Action | Keyboard | Touch |
|---|---|---|
| Move | Arrow keys / A D | Left / Right buttons |
| Jump | Space / Up / W | Jump button |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE) — Abderrahmane Hamila, 2026.
