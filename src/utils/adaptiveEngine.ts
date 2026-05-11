// utils/adaptiveEngine.ts
// 3-and-Up Adaptive Difficulty Engine

import { DifficultyLevel } from '../types/game';

export interface AdaptiveResult {
  action: 'continue' | 'inject_challenge' | 'drop_difficulty' | 'retry';
  streak?: number;
  newDifficulty?: DifficultyLevel;
}

export class AdaptiveEngine {
  private streak = 0;
  private currentDifficulty: DifficultyLevel = 1;
  private questionsAnswered = 0;
  private correctCount = 0;

  recordAnswer(isCorrect: boolean, usedHint: boolean = false): AdaptiveResult {
    this.questionsAnswered += 1;

    if (isCorrect) {
      this.streak += 1;
      this.correctCount += 1;

      // 3-and-Up Rule
      if (this.streak >= 3) {
        const newDiff = Math.min(this.currentDifficulty + 1, 4) as DifficultyLevel;
        this.currentDifficulty = newDiff;
        this.streak = 0;
        return { action: 'inject_challenge', newDifficulty: newDiff };
      }

      return { action: 'continue', streak: this.streak };
    } else {
      this.streak = 0;

      // Drop difficulty if struggling
      if (this.questionsAnswered >= 5) {
        const accuracy = this.correctCount / this.questionsAnswered;
        if (accuracy < 0.5) {
          const newDiff = Math.max(this.currentDifficulty - 1, 1) as DifficultyLevel;
          this.currentDifficulty = newDiff;
          return { action: 'drop_difficulty', newDifficulty: newDiff };
        }
      }

      return { action: 'retry', streak: 0 };
    }
  }

  getCurrentDifficulty(): DifficultyLevel {
    return this.currentDifficulty;
  }

  getStats() {
    return {
      streak: this.streak,
      currentDifficulty: this.currentDifficulty,
      questionsAnswered: this.questionsAnswered,
      correctCount: this.correctCount,
      accuracy: this.questionsAnswered > 0 ? this.correctCount / this.questionsAnswered : 0,
    };
  }
}
