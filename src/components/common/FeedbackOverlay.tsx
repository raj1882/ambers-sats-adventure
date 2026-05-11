// components/common/FeedbackOverlay.tsx
import React from 'react';
import { MarkingResult } from '../../types/game';
import './FeedbackOverlay.css';

interface FeedbackOverlayProps {
  result: MarkingResult | null;
  onNext: () => void;
  onRetry?: () => void;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({
  result,
  onNext,
  onRetry,
}) => {
  if (!result) return null;

  const isCorrect = result.accuracy_mark;
  const isPartial = result.method_mark && !result.accuracy_mark;

  return (
    <div className={`feedback-overlay ${result ? 'feedback-overlay--visible' : ''}`}>
      <div className="feedback-overlay__card">
        {/* Shield visual */}
        <div
          className={`feedback-overlay__shield ${
            isCorrect ? 'feedback-overlay__shield--full' : ''
          } ${isPartial ? 'feedback-overlay__shield--half' : ''}`}
        >
          <span role="img" aria-label="Shield" style={{ fontSize: '80px' }}>
            {isCorrect ? '🛡️' : isPartial ? '🛡️' : '💔'}
          </span>
        </div>

        {/* Marks display */}
        <div
          className={`feedback-overlay__marks ${
            isCorrect
              ? 'feedback-overlay__marks--correct'
              : isPartial
              ? 'feedback-overlay__marks--partial'
              : 'feedback-overlay__marks--incorrect'
          }`}
        >
          {result.marks_earned} mark{result.marks_earned !== 1 ? 's' : ''}
        </div>

        {/* Feedback text */}
        <p className="feedback-overlay__feedback">{result.feedback}</p>

        {/* Power-up text */}
        {result.power_up && (
          <p className="feedback-overlay__powerup">{result.power_up}</p>
        )}

        {/* Buttons */}
        <div className="feedback-overlay__buttons">
          {isCorrect ? (
            <button
              className="feedback-overlay__button feedback-overlay__button--next"
              onClick={onNext}
            >
              Next Question →
            </button>
          ) : (
            <>
              {onRetry && (
                <button
                  className="feedback-overlay__button feedback-overlay__button--retry"
                  onClick={onRetry}
                >
                  Try Again 🔄
                </button>
              )}
              <button
                className="feedback-overlay__button feedback-overlay__button--next"
                onClick={onNext}
              >
                Next Question →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
