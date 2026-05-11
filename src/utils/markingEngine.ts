// utils/markingEngine.ts
// 2-Mark Method Scoring Engine

import { Question, MarkingResult } from '../types/game';

export function analyzeAnswer(userAnswer: string, question: Question): MarkingResult {
  const cleanUser = userAnswer.trim().toLowerCase().replace(/\s/g, '');
  const cleanCorrect = question.correct_answer.trim().toLowerCase().replace(/\s/g, '');

  // Exact match = full marks
  if (cleanUser === cleanCorrect) {
    return {
      marks_earned: question.marks_available,
      method_mark: true,
      accuracy_mark: true,
      feedback: '🎉 Perfect! Full marks!',
      shield_awarded: false,
      hint_triggered: false,
      power_up: 'Full Power! ⚡',
    };
  }

  // Check distractors for specific diagnostic feedback
  for (const d of question.distractors) {
    const cleanDistractor = d.value.trim().toLowerCase().replace(/\s/g, '');
    if (cleanUser === cleanDistractor) {
      return {
        marks_earned: 0,
        method_mark: false,
        accuracy_mark: false,
        feedback: `❌ Not quite. ${d.reason}`,
        shield_awarded: false,
        hint_triggered: true,
        power_up: null,
        diagnostic: d.method_error,
      };
    }
  }

  // Unknown wrong answer
  return {
    marks_earned: 0,
    method_mark: false,
    accuracy_mark: false,
    feedback: "❌ That's not right. Let's check your working...",
    shield_awarded: false,
    hint_triggered: true,
    power_up: null,
    diagnostic: 'unknown_error',
  };
}
