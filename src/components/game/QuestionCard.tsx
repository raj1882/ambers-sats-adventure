// components/game/QuestionCard.tsx
import React from 'react';
import { Question, MarkingResult } from '../../types/game';
import './QuestionCard.css';

interface QuestionCardProps {
  question: Question;
  userAnswer: string;
  feedback: MarkingResult | null;
  hintVisible: boolean;
  onShowHint: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  userAnswer,
  feedback,
  hintVisible,
  onShowHint,
}) => {
  const isForest = question.land === 'forest_of_fractions';

  return (
    <div className="question-card">
      {/* Land badge */}
      <div
        className={`question-card__land-badge ${
          isForest ? 'question-card__land-badge--forest' : 'question-card__land-badge--labyrinth'
        }`}
      >
        <span role="img" aria-label="Land">
          {isForest ? '🌲' : '🌀'}
        </span>
        <span>{isForest ? 'Forest of Fractions' : 'Labyrinth of Logic'}</span>
      </div>

      {/* Difficulty stars */}
      <div className="question-card__difficulty">
        {'⭐'.repeat(question.difficulty)}
        {question.difficulty === 4 && (
          <span className="question-card__challenge-badge">CHALLENGE</span>
        )}
      </div>

      {/* Question text */}
      <p className="question-card__text">{question.question_text}</p>

      {/* Marks indicator */}
      <div className="question-card__marks">
        {question.marks_available} mark{question.marks_available !== 1 ? 's' : ''} available
      </div>

      {/* Answer display */}
      <div
        className={`question-card__answer-display ${
          feedback
            ? feedback.accuracy_mark
              ? 'question-card__answer-display--correct'
              : 'question-card__answer-display--incorrect'
            : userAnswer
            ? 'question-card__answer-display--focused'
            : ''
        }`}
      >
        {userAnswer || <span className="question-card__placeholder">Type your answer...</span>}
      </div>

      {/* Hint button */}
      {!feedback && (
        <button
          className="question-card__hint-btn"
          onClick={onShowHint}
          disabled={hintVisible}
        >
          <span role="img" aria-label="Lightbulb">💡</span>
          Need a hint?
        </button>
      )}
    </div>
  );
};
