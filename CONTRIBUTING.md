# Contributing to Career Tower

Thanks for taking the time to contribute. This is a small personal project but PRs and issues are welcome.

## Ways to Contribute

- **Bug reports** — something broken? Open an issue.
- **Feature suggestions** — ideas for gameplay, accessibility, or visuals.
- **Code contributions** — fixes, improvements, new features via PR.
- **Content** — if you want to fork and make your own career version, the milestone JSON is the entry point.

## Ground Rules

- Be respectful. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
- Keep PRs focused — one concern per PR.
- Don't add dependencies without discussing first.

## Development Setup

```bash
git clone https://github.com/HamilaAbderrahman/career-tower.git
cd career-tower
npm install
npm run dev
```

The dev server runs on [http://localhost:3000](http://localhost:3000) with hot reload.

## Making Changes

### No TypeScript required for content changes

All tunable data is in `src/game/config/*.json`:
- `physics.json` — gravity, jump speed, canvas size
- `milestones.json` — career milestone definitions
- `bubbles.json` — speech bubble dialogue pools

Edit JSON, save, browser reloads automatically.

### Code changes

The codebase is TypeScript strict mode throughout. Key files:

| What | Where |
|---|---|
| Game loop | `src/game/scenes/GameScene.ts` |
| Player movement | `src/game/objects/Player.ts` |
| React UI | `src/components/` |
| Phaser ↔ React bridge | `src/components/GameCanvas.tsx` |

### Build check

Before opening a PR, verify the build passes:

```bash
npm run build
```

## Submitting a Pull Request

1. Fork the repo and create a branch from `main`.
2. Make your changes.
3. Run `npm run build` — fix any TypeScript errors.
4. Open a PR with a clear title and description of what and why.

## Reporting a Bug

Use the bug report issue template. Include:
- Browser and OS
- Steps to reproduce
- What you expected vs what happened
