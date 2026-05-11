// components/common/HintCard.tsx
import React from 'react';
import './HintCard.css';

interface HintCardProps {
  visible: boolean;
  hintText: string;
  onClose: () => void;
}

export const HintCard: React.FC<HintCardProps> = ({ visible, hintText, onClose }) => {
  return (
    <div className={`hint-card ${visible ? 'hint-card--visible' : ''}`}>
      <button
        className="hint-card__close"
        onClick={onClose}
        aria-label="Close hint"
      >
        ✕
      </button>
      <div className="hint-card__icon">💡</div>
      <p className="hint-card__text">{hintText}</p>
    </div>
  );
};
