// components/screens/GameScreen.tsx
// WITH PERSISTENCE INTEGRATION

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Question, LandId, MarkingResult } from '../../types/game';
import { analyzeAnswer } from '../../utils/markingEngine';
import { AdaptiveEngine } from '../../utils/adaptiveEngine';
import {
  loadState,
  saveState,
  startHeartbeat,
  stopHeartbeat,
  registerBeforeUnload,
  recordQuestionResult,
  saveActiveSession,
  clearActiveSession,
  PersistedState,
  PersistedActiveSession,
} from '../../utils/persistence';
import questionsData from '../../data/questions.json';
import { MountainClimber } from '../common/MountainClimber';
import { QuestionCard } from '../game/QuestionCard';
import { NumberPad } from '../common/NumberPad';
import { HintCard } from '../common/HintCard';
import { FeedbackOverlay } from '../common/FeedbackOverlay';
import { ZeroTrapAlert } from '../common/ZeroTrapAlert';
import './GameScreen.css';

const QUESTIONS_PER_LAND = 10;
const QUESTIONS_TO_COMPLETE = 8;

export const GameScreen: React.FC = () => {
  const { landId } = useParams<{ landId: LandId }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [persistedState, setPersistedState] = useState<PersistedState>(() => loadState());
  const [questions] = useState<Question[]>(() =>
    (questionsData.questions as Question[]).filter((q) => q.land === landId)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<MarkingResult | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [zeroTrapVisible, setZeroTrapVisible] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionMaxMarks, setSessionMaxMarks] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [streak, setStreak] = useState(0);
  const [landComplete, setLandComplete] = useState(false);
  const [goldenCalculatorEarned, setGoldenCalculatorEarned] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  const adaptiveEngine = useRef(new AdaptiveEngine());
  const beforeUnloadCleanup = useRef<(() => void) | null>(null);

  const currentQuestion = questions[currentIndex];

  // PERSISTENCE: Restore session on mount
  useEffect(() => {
    const saved = loadState();
    if (
      saved.activeSession &&
      saved.activeSession.landId === landId &&
      !location.state?.freshStart
    ) {
      setCurrentIndex(saved.activeSession.currentQuestionIndex);
      setUserAnswer(saved.activeSession.userAnswer);
      setSessionScore(saved.activeSession.sessionScore);
      setSessionMaxMarks(saved.activeSession.sessionMaxMarks);
      setHintsUsed(saved.activeSession.hintsUsed);
      setStreak(saved.activeSession.streak);
      setIsRestored(true);
    }

    startHeartbeat(() => {
      const state = loadState();
      return buildPersistedState(state);
    });

    beforeUnloadCleanup.current = registerBeforeUnload(() => {
      const state = loadState();
      return buildPersistedState(state);
    });

    return () => {
      stopHeartbeat();
      if (beforeUnloadCleanup.current) {
        beforeUnloadCleanup.current();
      }
    };
  }, [landId, location.state]);

  // Build current state for saving
  const buildPersistedState = useCallback(
    (baseState: PersistedState): PersistedState => {
      if (!currentQuestion) return baseState;
      const session: PersistedActiveSession = {
        landId: landId!,
        currentQuestionIndex: currentIndex,
        streak,
        currentDifficulty: adaptiveEngine.current.getCurrentDifficulty(),
        sessionScore,
        sessionMaxMarks,
        hintsUsed,
        userAnswer,
        questionId: currentQuestion.id,
      };
      return saveActiveSession(baseState, session);
    },
    [landId, currentIndex, streak, sessionScore, sessionMaxMarks, hintsUsed, userAnswer, currentQuestion]
  );

  // Save after every state change
  useEffect(() => {
    if (!currentQuestion) return;
    const state = loadState();
    const updated = buildPersistedState(state);
    saveState(updated);
  }, [currentIndex, userAnswer, sessionScore, sessionMaxMarks, hintsUsed, streak, buildPersistedState, currentQuestion]);

  // Game actions
  const handleDigitPress = useCallback((digit: string) => {
    if (feedback) return;
    setUserAnswer((prev) => prev + digit);
  }, [feedback]);

  const handleBackspace = useCallback(() => {
    if (feedback) return;
    setUserAnswer((prev) => prev.slice(0, -1));
  }, [feedback]);

  const handleClear = useCallback(() => {
    if (feedback) return;
    setUserAnswer('');
  }, [feedback]);

  const handleShowHint = useCallback(() => {
    setHintVisible(true);
    setHintsUsed((prev) => prev + 1);
    const state = loadState();
    const updated = buildPersistedState(state);
    saveState(updated, true);
  }, [buildPersistedState]);

  const handleDismissHint = useCallback(() => {
    setHintVisible(false);
  }, []);

  const handleDismissZeroTrap = useCallback(() => {
    setZeroTrapVisible(false);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!userAnswer || feedback || !currentQuestion) return;

    const result = analyzeAnswer(userAnswer, currentQuestion);
    setFeedback(result);
    setSessionScore((prev) => prev + result.marks_earned);
    setSessionMaxMarks((prev) => prev + currentQuestion.marks_available);

    if (result.diagnostic === 'zero_trap') {
      setZeroTrapVisible(true);
    }

    const state = loadState();
    const updated = recordQuestionResult(
      state,
      landId!,
      currentQuestion.id,
      result.marks_earned,
      currentQuestion.marks_available,
      hintVisible,
      result.accuracy_mark
    );

    const landProgress = updated.lands[landId!];
    if (landProgress.goldenCalculatorEarned && !goldenCalculatorEarned) {
      setGoldenCalculatorEarned(true);
    }
    if (landProgress.questionsAnswered >= QUESTIONS_TO_COMPLETE) {
      setLandComplete(true);
    }

    setPersistedState(updated);
    saveState(updated, true);

    const adaptiveResult = adaptiveEngine.current.recordAnswer(result.accuracy_mark, hintVisible);
    if (adaptiveResult.action === 'inject_challenge') {
      console.log('Challenge question incoming!');
    }

    if (result.accuracy_mark) {
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  }, [userAnswer, feedback, currentQuestion, landId, hintVisible, goldenCalculatorEarned]);

  const handleNext = useCallback(() => {
    if (landComplete) {
      const state = loadState();
      const cleared = clearActiveSession(state);
      saveState(cleared, true);
      navigate('/complete', {
        state: {
          landId,
          score: sessionScore,
          maxMarks: sessionMaxMarks,
          goldenCalculator: goldenCalculatorEarned,
        },
      });
      return;
    }
    setFeedback(null);
    setUserAnswer('');
    setHintVisible(false);
    setZeroTrapVisible(false);
    setCurrentIndex((prev) => (prev + 1) % questions.length);
    setIsRestored(false);
  }, [landComplete, navigate, landId, sessionScore, sessionMaxMarks, goldenCalculatorEarned, questions.length]);

  const handleRetry = useCallback(() => {
    setFeedback(null);
    setUserAnswer('');
    setHintVisible(false);
    setZeroTrapVisible(false);
  }, []);

  const handleExit = useCallback(() => {
    const state = loadState();
    const updated = buildPersistedState(state);
    saveState(updated, true);
    navigate('/');
  }, [navigate, buildPersistedState]);

  const pathTo100 = persistedState.player.pathTo100;

  if (!currentQuestion) {
    return <div className="game-screen__loading">Loading questions...</div>;
  }

  return (
    <div className="game-screen">
      <ZeroTrapAlert visible={zeroTrapVisible} onDismiss={handleDismissZeroTrap} />
      <header className="game-screen__header">
        <button className="game-screen__back-btn" onClick={handleExit}>
          Save & Exit
        </button>
        <div className="game-screen__progress">
          Q{currentIndex + 1}/{QUESTIONS_PER_LAND} | Streak: {streak}
          {isRestored && <span className="game-screen__restored"> (Restored)</span>}
        </div>
      </header>
      <main className="game-screen__main">
        <div className="game-screen__climber">
          <MountainClimber
            currentScore={pathTo100}
            targetScore={100}
            goldenCalculators={persistedState.player.goldenCalculators}
          />
        </div>
        <div className="game-screen__question">
          <QuestionCard
            question={currentQuestion}
            userAnswer={userAnswer}
            feedback={feedback}
            hintVisible={hintVisible}
            onShowHint={handleShowHint}
          />
        </div>
        <div className="game-screen__input">
          <NumberPad
            onDigitPress={handleDigitPress}
            onBackspace={handleBackspace}
            onClear={handleClear}
            onSubmit={handleSubmit}
            disabled={!!feedback}
          />
        </div>
      </main>
      <HintCard
        visible={hintVisible}
        hintText={currentQuestion.hint_card}
        onClose={handleDismissHint}
      />
      <FeedbackOverlay
        result={feedback}
        onNext={handleNext}
        onRetry={handleRetry}
      />
    </div>
  );
};
