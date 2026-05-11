// types/game.ts
// Amber's SATs Adventure — Type Definitions

export type LandId = 'forest_of_fractions' | 'labyrinth_of_logic';

export type DifficultyLevel = 1 | 2 | 3 | 4;

export type QuestionType = 'arithmetic' | 'reasoning';

export interface MethodStep {
  step_number: number;
  description: string;
  expected_value: string;
  marks: number;
}

export interface Distractor {
  value: string;
  reason: string;
  method_error: string;
}

export interface Question {
  id: string;
  land: LandId;
  topic: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  question_text: string;
  correct_answer: string;
  method_steps: MethodStep[];
  distractors: Distractor[];
  hint_card: string;
  marks_available: number;
  time_estimate_seconds: number;
}

export interface MarkingResult {
  marks_earned: number;
  method_mark: boolean;
  accuracy_mark: boolean;
  feedback: string;
  shield_awarded: boolean;
  hint_triggered: boolean;
  power_up: string | null;
  diagnostic?: string;
}

export interface LandProgress {
  unlocked: boolean;
  completed: boolean;
  questionsAnswered: number;
  questionsCorrect: number;
  hintsUsed: number;
  goldenCalculatorEarned: boolean;
  accuracy: number;
}

export interface PlayerState {
  name: string;
  currentLand: LandId | null;
  pathTo100: number;
  goldenCalculators: LandId[];
  totalQuestionsAnswered: number;
  totalCorrect: number;
}

export interface SessionState {
  landId: LandId;
  questionIndex: number;
  streak: number;
  currentDifficulty: DifficultyLevel;
  sessionScore: number;
  sessionMaxMarks: number;
  hintsUsed: number;
  questionsCompleted: string[];
}

export interface CurrentQuestionState {
  question: Question | null;
  userAnswer: string;
  workingSteps: string[];
  feedback: MarkingResult | null;
  hintVisible: boolean;
  zeroTrapTriggered: boolean;
}

export interface GameState {
  player: PlayerState;
  currentSession: SessionState | null;
  currentQuestion: CurrentQuestionState;
  lands: Record<LandId, LandProgress>;
}

export type GameAction =
  | { type: 'START_LAND'; landId: LandId }
  | { type: 'LOAD_QUESTION'; question: Question }
  | { type: 'UPDATE_ANSWER'; answer: string }
  | { type: 'SUBMIT_ANSWER' }
  | { type: 'SHOW_HINT' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'COMPLETE_LAND' }
  | { type: 'RESET_SESSION' };
