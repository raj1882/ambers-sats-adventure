
# 🎯 StepPlanner Implementation Summary

## Decision: Operation Picker (MVP) + Strategy Board (Stretch)

**Why Operation Picker wins for 48 hours:**
- Dropdowns are mobile-friendly (large tap targets)
- Fast to build — no drag-and-drop libraries needed
- Directly teaches the #1 Paper 2 skill: choosing the right operation
- Exam transferable: Amber learns "what am I doing and why"

## The Flow

```
3-Step Question Appears (L11-L14)
    │
    ▼
┌─────────────────────────────────────┐
│  🎯 Strategy Board                   │
│                                      │
│  Step 1: What do I need to find?     │
│  [What dropdown] → [How dropdown] → 2.40│
│                                      │
│  Step 2: What next?                  │
│  [What dropdown] → [How dropdown] → 7  │
│                                      │
│  Step 3: What about the pen?         │
│  [What dropdown] → [How dropdown] → 0.75│
│                                      │
│  [🔍 Check My Plan]                  │
└─────────────────────────────────────┘
    │
    ▼ (All correct)
┌─────────────────────────────────────┐
│  🎯 Strategy Locked!                 │
│  [Unlock Keypad →]                   │
└─────────────────────────────────────┘
    │
    ▼
Number Pad Appears — She Calculates
```

## Key Features

| Feature | How It Helps Amber |
|---|---|
| **WHAT dropdown** | Forces her to name the step before calculating |
| **HOW dropdown (+ - × ÷)** | Teaches operation selection (the #1 error) |
| **USING value** | Pre-filled from question — she just confirms |
| **Per-step validation** | Wrong operation = red shake, right = green check |
| **Progress bar** | Visual feedback: "2/4 steps locked" |
| **"Try again" button** | Resets only that step, not the whole board |
| **Unlock animation** | "🎯 Strategy Locked!" → keypad appears |

## Exam Transfer

On Wednesday, Amber won't have dropdowns. But she WILL have:
- The habit of **writing down what each step finds**
- The habit of **naming the operation** before calculating
- The habit of **checking her plan** before committing

This is exactly what examiners want to see in her working.

## Files Added/Modified

| File | Status |
|---|---|
| `components/game/StepPlanner.tsx` | **NEW** — Operation Picker UI |
| `components/game/StepPlanner.css` | **NEW** — Mobile-responsive styles |
| `components/game/QuestionCard.tsx` | **MODIFIED** — Integrates StepPlanner |
| `components/screens/GameScreen.tsx` | **MODIFIED** — planComplete state management |

## 48-Hour Build Order

| Phase | When | Task | Time |
|---|---|---|---|
| **1** | Tonight | Drop StepPlanner into existing code. Test with L11. | 45 min |
| **2** | Tuesday AM | Playtest with Amber. Watch if she understands "What" vs "How". | 20 min |
| **3** | Tuesday PM | Deploy. Final check: plan → keypad → answer → save. | 15 min |

Total build time: ~80 minutes. High impact, low risk.
