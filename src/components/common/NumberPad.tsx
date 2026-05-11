// components/common/NumberPad.tsx
import React from 'react';
import './NumberPad.css';

interface NumberPadProps {
  onDigitPress: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
  disabled: boolean;
}

const DIGITS = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];

export const NumberPad: React.FC<NumberPadProps> = ({
  onDigitPress,
  onBackspace,
  onClear,
  onSubmit,
  disabled,
}) => {
  return (
    <div className="number-pad">
      {DIGITS.map((digit) => (
        <button
          key={digit}
          className="number-pad__button"
          onClick={() => onDigitPress(digit)}
          disabled={disabled}
          aria-label={`Digit ${digit}`}
        >
          {digit}
        </button>
      ))}
      <button
        className="number-pad__button number-pad__button--clear"
        onClick={onClear}
        disabled={disabled}
        aria-label="Clear"
      >
        C
      </button>
      <button
        className="number-pad__button"
        onClick={() => onDigitPress('0')}
        disabled={disabled}
        aria-label="Digit 0"
      >
        0
      </button>
      <button
        className="number-pad__button number-pad__button--backspace"
        onClick={onBackspace}
        disabled={disabled}
        aria-label="Backspace"
      >
        ←
      </button>
      <button
        className="number-pad__button number-pad__button--submit"
        onClick={onSubmit}
        disabled={disabled}
        aria-label="Submit answer"
      >
        Submit ✓
      </button>
    </div>
  );
};
