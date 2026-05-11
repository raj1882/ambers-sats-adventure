// components/screens/LandSelectionScreen.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandSelectionScreen.css';

interface LandInfo {
  id: 'forest_of_fractions' | 'labyrinth_of_logic';
  name: string;
  emoji: string;
  description: string;
  color: string;
  progress: number;
  unlocked: boolean;
}

const LANDS: LandInfo[] = [
  {
    id: 'forest_of_fractions',
    name: 'Forest of Fractions',
    emoji: '🌲',
    description: 'Master fractions, decimals & percentages',
    color: 'var(--forest-primary)',
    progress: 0,
    unlocked: true,
  },
  {
    id: 'labyrinth_of_logic',
    name: 'Labyrinth of Logic',
    emoji: '🌀',
    description: 'Conquer multi-step reasoning',
    color: 'var(--labyrinth-primary)',
    progress: 0,
    unlocked: true,
  },
];

export const LandSelectionScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="land-selection">
      <h1 className="land-selection__title">🏰 Amber's SATs Adventure</h1>
      <p className="land-selection__subtitle">Choose your path to mastery!</p>

      <div className="land-selection__grid">
        {LANDS.map((land) => (
          <div
            key={land.id}
            className={`land-card ${!land.unlocked ? 'land-card--locked' : ''}`}
            onClick={() => land.unlocked && navigate(`/play/${land.id}`)}
            role="button"
            tabIndex={land.unlocked ? 0 : -1}
            aria-disabled={!land.unlocked}
          >
            <div className="land-card__emoji">{land.emoji}</div>
            <h2 className="land-card__name">{land.name}</h2>
            <p className="land-card__description">{land.description}</p>

            <div className="land-card__progress">
              <span>{land.progress}/10 completed</span>
              <div className="land-card__progress-bar">
                <div
                  className={`land-card__progress-fill land-card__progress-fill--${land.id}`}
                  style={{ width: `${(land.progress / 10) * 100}%` }}
                />
              </div>
            </div>

            {!land.unlocked && (
              <div className="land-card__lock">
                <span role="img" aria-label="Locked">🔒</span>
                Complete previous land to unlock
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
