// components/common/ResumeModal.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { hasResumableSession, loadState, clearActiveSession, saveState } from '../../utils/persistence';
import './ResumeModal.css';

interface ResumeModalProps {
  onDismiss: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ onDismiss }) => {
  const navigate = useNavigate();
  const state = loadState();

  if (!hasResumableSession(state)) return null;

  const session = state.activeSession!;
  const landName = session.landId === 'forest_of_fractions' 
    ? 'Forest of Fractions' 
    : 'Labyrinth of Logic';

  const handleResume = () => {
    navigate(`/play/${session.landId}`);
  };

  const handleStartFresh = () => {
    const updated = clearActiveSession(state);
    saveState(updated, true);
    onDismiss();
  };

  return (
    <div className="resume-modal">
      <div className="resume-modal__card">
        <div className="resume-modal__icon">👋</div>
        <h2 className="resume-modal__title">Welcome back, Amber!</h2>
        <p className="resume-modal__text">
          You were halfway through the <strong>{landName}</strong>.
          <br />
          You had scored <strong>{session.sessionScore}</strong> marks so far.
        </p>
        <div className="resume-modal__buttons">
          <button 
            className="resume-modal__btn resume-modal__btn--primary"
            onClick={handleResume}
          >
            Continue where I left off
          </button>
          <button 
            className="resume-modal__btn resume-modal__btn--secondary"
            onClick={handleStartFresh}
          >
            Start fresh
          </button>
        </div>
        <p className="resume-modal__autosave">
          Your progress auto-saves every question
        </p>
      </div>
    </div>
  );
};
