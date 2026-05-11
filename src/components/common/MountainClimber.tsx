// components/common/MountainClimber.tsx
import React from 'react';
import './MountainClimber.css';

interface MountainClimberProps {
  currentScore: number;
  targetScore?: number;
  goldenCalculators?: string[];
}

export const MountainClimber: React.FC<MountainClimberProps> = ({
  currentScore,
  targetScore = 100,
  goldenCalculators = [],
}) => {
  const percentage = Math.min((currentScore / targetScore) * 100, 100);
  const avatarBottom = `${percentage}%`;
  const isComplete = currentScore >= targetScore;

  return (
    <div className="mountain-climber">
      <div className="mountain-climber__score-label">
        {currentScore}/{targetScore}
      </div>
      <svg
        className="mountain-climber__svg"
        viewBox="0 0 200 300"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Mountain body */}
        <polygon
          className="mountain-climber__peak"
          points="100,20 20,280 180,280"
        />
        {/* Snow cap */}
        <polygon
          className="mountain-climber__snow-cap"
          points="100,20 70,80 130,80"
        />
        {/* Path line */}
        <path
          className="mountain-climber__path"
          d="M 100,280 Q 100,200 100,20"
        />
        {/* Score markers */}
        {[0, 25, 50, 75, 100].map((mark) => (
          <g key={mark}>
            <line
              x1="90"
              y1={280 - (mark / 100) * 260}
              x2="110"
              y2={280 - (mark / 100) * 260}
              stroke="#adb5bd"
              strokeWidth="2"
            />
            <text
              x="120"
              y={285 - (mark / 100) * 260}
              fontSize="10"
              fill="#6c757d"
            >
              {mark}
            </text>
          </g>
        ))}
      </svg>
      {/* Avatar */}
      <div
        className={`mountain-climber__avatar ${isComplete ? 'mountain-climber__avatar--celebrating' : ''}`}
        style={{ bottom: avatarBottom }}
      >
        <span role="img" aria-label="Climber" style={{ fontSize: '28px' }}>
          🧗‍♀️
        </span>
        {goldenCalculators.length > 0 && (
          <div className="mountain-climber__calculators">
            {goldenCalculators.map((_, i) => (
              <span key={i} role="img" aria-label="Golden calculator">
                🏆
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
