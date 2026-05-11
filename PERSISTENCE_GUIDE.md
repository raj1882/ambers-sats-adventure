
# 💾 Persistence Implementation Summary

## Decision: Save on EVERY Question (Debounced 500ms)

**Why every question wins over checkpoints:**
- localStorage writes cost ~5ms — imperceptible to an 11-year-old
- Amber's "Path to 100" is her psychological anchor; losing it would be devastating
- SATs week is high-stakes; browser crashes shouldn't punish her
- The "3-and-Up" adaptive difficulty MUST persist across sessions
- Trust > optimisation: she needs to know her progress is safe

## What Gets Saved

| Data | When | Priority |
|---|---|---|
| Player stats (Path to 100, Golden Calculators) | Every question | Critical |
| Land progress (accuracy, completion, hints used) | Every question | Critical |
| Per-question results (attempts, best score) | Every question | Critical |
| Active session (current question, draft answer, streak) | Every 500ms + heartbeat | High |
| Hint usage | Immediate | High (affects Golden Calculator) |

## Save Triggers

1. **Question submitted** → debounced 500ms save
2. **Hint revealed** → immediate save (counts toward Diamond Calculator)
3. **Land completed** → immediate save + celebration
4. **Golden Calculator earned** → immediate save + animation
5. **beforeunload** → emergency flush
6. **Heartbeat every 30s** → catches tab crashes

## The Resume Flow

```
App mounts
    │
    ▼
Check localStorage
    │
    ├── No saved state ──► Fresh start, show Land Selection
    │
    └── Has saved state
            │
            ▼
    Was there an active session (< 2 hours old)?
            │
            ├── NO ──► Show Land Selection with progress bars
            │
            └── YES ──► Show ResumeModal
                         │
                         ├── "Continue where I left off" ──► Restore session
                         │   (same question, same draft answer, same streak)
                         │
                         └── "Start fresh" ──► Archive session, show Land Selection
```

## Edge Cases Handled

| Scenario | Behaviour |
|---|---|
| Amber types answer but doesn't submit | Saved as `userAnswer` — restored on return |
| Browser crashes mid-question | ResumeModal offers to continue |
| Switches Lands mid-session | Previous session archived, new one started |
| Same question attempted twice | Best score kept; attempt count tracked |
| localStorage quota exceeded | Drops session data, keeps player + land progress |
| Clears localStorage manually | Graceful fallback to fresh start |
| Session > 2 hours old | Considered stale, not offered for resume |

## Files Added/Modified

| File | Change |
|---|---|
| `utils/persistence.ts` | NEW — Core persistence API |
| `components/screens/GameScreen.tsx` | MODIFIED — Integrated save/load/resume |
| `components/common/ResumeModal.tsx` | NEW — "Welcome back" dialog |
| `components/common/ResumeModal.css` | NEW — Resume modal styles |
| `App.tsx` | MODIFIED — ResumeModal on mount |

## Usage in GameScreen

```typescript
// After every question submission:
const state = loadState();
const updated = recordQuestionResult(state, landId, questionId, marksEarned, ...);
saveState(updated, true); // immediate = true

// After hint reveal:
const state = loadState();
const updated = buildPersistedState(state);
saveState(updated, true); // hints affect Golden Calculator

// On exit:
const state = loadState();
const updated = buildPersistedState(state);
saveState(updated, true);
navigate('/');

// Auto-save heartbeat (every 30s):
startHeartbeat(() => buildPersistedState(loadState()));
```

## Testing Checklist

- [ ] Answer a question → refresh → progress preserved
- [ ] Type answer → don't submit → refresh → draft restored
- [ ] Use hint → refresh → hint counted toward Golden Calculator
- [ ] Close tab mid-question → reopen → ResumeModal appears
- [ ] Wait > 2 hours → reopen → no ResumeModal (stale)
- [ ] Complete Land → refresh → Land shows as completed
- [ ] Earn Golden Calculator → refresh → Calculator preserved
- [ ] Fill localStorage → save still works (prunes session)
