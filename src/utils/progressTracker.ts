// utils/progressTracker.ts
// Path to 100 & Golden Calculator Tracker

import { LandId, LandProgress } from '../types/game';

export class ProgressTracker {
  private totalMarks = 0;
  private maxPossibleMarks = 0;
  private landProgress: Record<LandId, LandProgress> = {
    forest_of_fractions: {
      unlocked: true,
      completed: false,
      questionsAnswered: 0,
      questionsCorrect: 0,
      hintsUsed: 0,
      goldenCalculatorEarned: false,
      accuracy: 0,
    },
    labyrinth_of_logic: {
      unlocked: true,
      completed: false,
      questionsAnswered: 0,
      questionsCorrect: 0,
      hintsUsed: 0,
      goldenCalculatorEarned: false,
      accuracy: 0,
    },
  };
  private goldenCalculators: LandId[] = [];

  recordQuestion(
    land: LandId,
    marksEarned: number,
    marksAvailable: number,
    usedHint: boolean,
    isCorrect: boolean
  ): { event?: string; land?: LandId } | null {
    this.totalMarks += marksEarned;
    this.maxPossibleMarks += marksAvailable;

    const progress = this.landProgress[land];
    progress.questionsAnswered += 1;
    if (isCorrect) progress.questionsCorrect += 1;
    if (usedHint) progress.hintsUsed += 1;

    // Update accuracy
    const totalQ = progress.questionsAnswered;
    progress.accuracy =
      (progress.accuracy * (totalQ - 1) + marksEarned / marksAvailable) / totalQ;

    // Check completion (80% = 8/10)
    if (progress.questionsAnswered >= 8 && !progress.completed) {
      progress.completed = true;
    }

    // Check Golden Calculator
    return this.checkGoldenCalculator(land);
  }

  private checkGoldenCalculator(land: LandId): { event: string; land: LandId } | null {
    const progress = this.landProgress[land];
    if (progress.questionsAnswered >= 8) {
      if (progress.accuracy === 1 && progress.hintsUsed === 0) {
        if (!progress.goldenCalculatorEarned) {
          progress.goldenCalculatorEarned = true;
          this.goldenCalculators.push(land);
          return { event: 'golden_calculator_earned', land };
        }
      }
    }
    return null;
  }

  getPathTo100(): number {
    if (this.maxPossibleMarks === 0) return 0;
    return Math.round((this.totalMarks / this.maxPossibleMarks) * 100);
  }

  getStatus() {
    return {
      pathTo100: this.getPathTo100(),
      goldenCalculators: this.goldenCalculators,
      landProgress: this.landProgress,
      gatewayUnlocked: this.goldenCalculators.length >= 2,
    };
  }

  getLandProgress(land: LandId): LandProgress {
    return this.landProgress[land];
  }
}
