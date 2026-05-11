# 🏰 Amber's SATs Adventure 2026

A gamified revision tool to master the UK KS2 Maths curriculum, targeting the 2026 SATs papers.

## Features

- 🌲 **Forest of Fractions** — Fractions, Decimals, Percentages (25% weighting)
- 🌀 **Labyrinth of Logic** — Multi-step Reasoning (30% weighting)
- 🛡️ **2-Mark Method** — Earn method marks even when final answer is wrong
- 🧗‍♀️ **Path to 100** — Visual progress tracker toward Expected Standard
- 🏆 **Golden Calculators** — Mastery rewards for 100% accuracy, zero hints
- 💾 **Auto-Save** — Progress persists across sessions via localStorage
- 📱 **Mobile-First** — Large touch targets, on-screen number pad
- ⚠️ **Zero-Trap Alert** — Specific warnings for common mistakes

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start

# 3. Open http://localhost:3000
```

## Deploy to GitHub Pages

```bash
# Update homepage in package.json first
npm run deploy
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for full instructions.

## Project Structure

```
src/
├── data/questions.json          # 20 curated SATs-style questions
├── types/game.ts                # TypeScript definitions
├── utils/
│   ├── markingEngine.ts         # 2-Mark Method scoring
│   ├── adaptiveEngine.ts        # 3-and-Up difficulty rule
│   ├── progressTracker.ts       # Path to 100 logic
│   └── persistence.ts           # localStorage save/load
├── components/
│   ├── common/                  # Reusable UI components
│   ├── game/                    # Question-specific components
│   └── screens/                 # Full-page screens
└── App.tsx                      # Router entry point
```

## SATs Coverage

| Land | Topic | Weighting | Paper |
|---|---|---|---|
| Forest of Fractions | Fractions, Decimals, % | 25% | Paper 1 |
| Labyrinth of Logic | Multi-step Reasoning | 30% | Papers 2 & 3 |

## License

MIT — Built with ❤️ for Amber's 2026 SATs success.
