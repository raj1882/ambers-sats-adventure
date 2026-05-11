// components/common/ZeroTrapAlert.tsx
import React from 'react';
import './ZeroTrapAlert.css';

interface ZeroTrapAlertProps {
  visible: boolean;
  onDismiss: () => void;
}

export const ZeroTrapAlert: React.FC<ZeroTrapAlertProps> = ({ visible, onDismiss }) => {
  if (!visible) return null;

  return (
    <div className="zero-trap-alert zero-trap-alert--visible">
      <span className="zero-trap-alert__icon">⚠️</span>
      <span className="zero-trap-alert__text">
        <strong>ZERO-TRAP ALERT!</strong> Remember to DROP THE ZERO when multiplying by tens! 0️⃣
      </span>
      <button
        className="zero-trap-alert__dismiss"
        onClick={onDismiss}
        aria-label="Dismiss alert"
      >
        ✕
      </button>
    </div>
  );
};
