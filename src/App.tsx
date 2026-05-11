// App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandSelectionScreen } from './components/screens/LandSelectionScreen';
import { GameScreen } from './components/screens/GameScreen';
import { ResumeModal } from './components/common/ResumeModal';
import { hasResumableSession, loadState } from './utils/persistence';
import './styles/variables.css';

const App: React.FC = () => {
  const [showResume, setShowResume] = useState(false);

  useEffect(() => {
    const state = loadState();
    if (hasResumableSession(state)) {
      setShowResume(true);
    }
  }, []);

  return (
    <BrowserRouter>
      {showResume && <ResumeModal onDismiss={() => setShowResume(false)} />}
      <Routes>
        <Route path="/" element={<LandSelectionScreen />} />
        <Route path="/play/:landId" element={<GameScreen />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
