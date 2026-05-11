// utils/persistence.ts
// Amber's SATs Adventure — localStorage Persistence Layer
// Save strategy: Every question (debounced 500ms) + heartbeat (30s) + beforeunload

import { LandId, DifficultyLevel } from '../types/game';

const STORAGE_KEY = 'ambers_sats_adventure_v1';
const DEBOUNCE_MS = 500;
const HEARTBEAT_MS = 30000;

// ============================================================
// TYPES
// ============================================================

export interface PersistedQuestionResult {
  attempts: number;
  bestMarks: number;
  hintsUsed: number;
  lastAttemptedAt: string;
}

export interface PersistedLandProgress {
  unlocked: boolean;
  completed: boolean;
  questionsAnswered: number;
  questionsCorrect: number;
  hintsUsed: number;
  goldenCalculatorEarned: boolean;
  accuracy: number;
  questionResults: Record<string, PersistedQuestionResult>;
}

export interface PersistedActiveSession {
  landId: LandId;
  currentQuestionIndex: number;
  streak: number;
  currentDifficulty: DifficultyLevel;
  sessionScore: number;
  sessionMaxMarks: number;
  hintsUsed: number;
  userAnswer: string;
  questionId: string;
}

export interface PersistedState {
  version: number;
  player: {
    name: string;
    pathTo100: number;
    goldenCalculators: LandId[];
    totalQuestionsAnswered: number;
    totalCorrect: number;
    lastPlayedAt: string;
  };
  lands: Record<LandId, PersistedLandProgress>;
  activeSession: PersistedActiveSession | null;
}

// ============================================================
// DEFAULT STATE
// ============================================================

const DEFAULT_STATE: PersistedState = {
  version: 1,
  player: {
    name: 'Amber',
    pathTo100: 0,
    goldenCalculators: [],
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    lastPlayedAt: new Date().toISOString(),
  },
  lands: {
    forest_of_fractions: {
      unlocked: true,
      completed: false,
      questionsAnswered: 0,
      questionsCorrect: 0,
      hintsUsed: 0,
      goldenCalculatorEarned: false,
      accuracy: 0,
      questionResults: {},
    },
    labyrinth_of_logic: {
      unlocked: true,
      completed: false,
      questionsAnswered: 0,
      questionsCorrect: 0,
      hintsUsed: 0,
      goldenCalculatorEarned: false,
      accuracy: 0,
      questionResults: {},
    },
  },
  activeSession: null,
};

// ============================================================
// CORE FUNCTIONS
// ============================================================

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed.version || parsed.version < 1) {
      return { ...DEFAULT_STATE };
    }
    return mergeWithDefaults(parsed);
  } catch (err) {
    console.warn('[Persistence] Failed to load state:', err);
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state: PersistedState, immediate: boolean = false): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  const doSave = () => {
    try {
      const serialized = JSON.stringify(state);
      if (serialized.length > 4500000) {
        console.warn('[Persistence] State too large, pruning session data');
        const pruned = { ...state, activeSession: null };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
        return;
      }
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (err) {
      console.error('[Persistence] Save failed:', err);
      try {
        const minimal = { ...state, activeSession: null };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
      } catch {
        console.error('[Persistence] Critical: Cannot save even minimal state');
      }
    }
  };
  if (immediate) {
    doSave();
  } else {
    saveTimeout = setTimeout(doSave, DEBOUNCE_MS);
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
  if (saveTimeout) clearTimeout(saveTimeout);
  if (heartbeatInterval) clearInterval(heartbeatInterval);
}

export function startHeartbeat(getState: () => PersistedState): void {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(() => {
    saveState(getState(), true);
  }, HEARTBEAT_MS);
}

export function stopHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

export function registerBeforeUnload(getState: () => PersistedState): () => void {
  const handler = () => {
    saveState(getState(), true);
  };
  window.addEventListener('beforeunload', handler);
  return () => {
    window.removeEventListener('beforeunload', handler);
  };
}

// ============================================================
// STATE BUILDERS
// ============================================================

export function recordQuestionResult(
  state: PersistedState,
  landId: LandId,
  questionId: string,
  marksEarned: number,
  marksAvailable: number,
  usedHint: boolean,
  isCorrect: boolean
): PersistedState {
  const newState = deepClone(state);
  const land = newState.lands[landId];
  land.questionsAnswered += 1;
  if (isCorrect) land.questionsCorrect += 1;
  if (usedHint) land.hintsUsed += 1;
  const totalQ = land.questionsAnswered;
  land.accuracy = (land.accuracy * (totalQ - 1) + marksEarned / marksAvailable) / totalQ;
  const existing = land.questionResults[questionId] || {
    attempts: 0, bestMarks: 0, hintsUsed: 0, lastAttemptedAt: new Date().toISOString(),
  };
  existing.attempts += 1;
  existing.bestMarks = Math.max(existing.bestMarks, marksEarned);
  if (usedHint) existing.hintsUsed += 1;
  existing.lastAttemptedAt = new Date().toISOString();
  land.questionResults[questionId] = existing;
  if (land.questionsAnswered >= 8 && !land.completed) {
    land.completed = true;
  }
  if (land.questionsAnswered >= 8 && land.accuracy === 1 && land.hintsUsed === 0) {
    if (!land.goldenCalculatorEarned) {
      land.goldenCalculatorEarned = true;
      if (!newState.player.goldenCalculators.includes(landId)) {
        newState.player.goldenCalculators.push(landId);
      }
    }
  }
  newState.player.totalQuestionsAnswered += 1;
  if (isCorrect) newState.player.totalCorrect += 1;
  newState.player.lastPlayedAt = new Date().toISOString();
  newState.player.pathTo100 = calculatePathTo100(newState);
  return newState;
}

export function saveActiveSession(
  state: PersistedState,
  session: PersistedActiveSession
): PersistedState {
  const newState = deepClone(state);
  newState.activeSession = session;
  newState.player.lastPlayedAt = new Date().toISOString();
  return newState;
}

export function clearActiveSession(state: PersistedState): PersistedState {
  const newState = deepClone(state);
  newState.activeSession = null;
  return newState;
}

export function hasResumableSession(state: PersistedState): boolean {
  if (!state.activeSession) return false;
  const lastPlayed = new Date(state.player.lastPlayedAt);
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  return lastPlayed > twoHoursAgo;
}

// ============================================================
// HELPERS
// ============================================================

function calculatePathTo100(state: PersistedState): number {
  let totalMarks = 0;
  let maxMarks = 0;
  for (const land of Object.values(state.lands)) {
    for (const result of Object.values(land.questionResults)) {
      totalMarks += result.bestMarks;
      maxMarks += result.bestMarks > 0 ? result.bestMarks : 1;
    }
  }
  if (maxMarks === 0) return 0;
  return Math.min(Math.round((totalMarks / maxMarks) * 100), 100);
}

function mergeWithDefaults(parsed: Partial<PersistedState>): PersistedState {
  return {
    ...DEFAULT_STATE,
    ...parsed,
    player: { ...DEFAULT_STATE.player, ...parsed.player },
    lands: {
      forest_of_fractions: {
        ...DEFAULT_STATE.lands.forest_of_fractions,
        ...parsed.lands?.forest_of_fractions,
        questionResults: {
          ...DEFAULT_STATE.lands.forest_of_fractions.questionResults,
          ...parsed.lands?.forest_of_fractions?.questionResults,
        },
      },
      labyrinth_of_logic: {
        ...DEFAULT_STATE.lands.labyrinth_of_logic,
        ...parsed.lands?.labyrinth_of_logic,
        questionResults: {
          ...DEFAULT_STATE.lands.labyrinth_of_logic.questionResults,
          ...parsed.lands?.labyrinth_of_logic?.questionResults,
        },
      },
    },
    activeSession: parsed.activeSession || null,
  };
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
