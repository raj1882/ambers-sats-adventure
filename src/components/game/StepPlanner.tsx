// components/game/StepPlanner.tsx
// Conceptual + Anchor phrasing — builds Amber's "internal compass"

import React, { useState, useCallback } from 'react';
import { Question, MethodStep } from '../../types/game';
import './StepPlanner.css';

interface StepPlannerProps {
  question: Question;
  onPlanComplete: () => void;
  onShowHint: () => void;
}

interface StepPlan {
  what: string;
  how: string;
  using: string;
}

interface WhatOption {
  concept: string;
  anchor: string;
  mathVocab: string;
  stepType: string;
  isCorrect: boolean;
}

const OPERATIONS = [
  { value: '', label: 'Pick...', symbol: '' },
  { value: '+', label: 'Add (+)', symbol: '+' },
  { value: '-', label: 'Subtract (-)', symbol: '-' },
  { value: '*', label: 'Multiply (×)', symbol: '×' },
  { value: '/', label: 'Divide (÷)', symbol: '÷' },
];

// Math vocabulary guide shown at top
const MATH_VOCAB_GUIDE: Record<string, { icon: string; meaning: string; trigger: string }> = {
  'unit_rate': { icon: '⚡', meaning: 'Cost/amount per ONE item', trigger: '"per", "each", "1"' },
  'subtotal': { icon: '📦', meaning: 'Cost before discounts', trigger: 'Multiple items, before tax' },
  'percentage': { icon: '%', meaning: 'Part of a whole (out of 100)', trigger: '"%", "off", "discount"' },
  'total': { icon: '💰', meaning: 'Final combined amount', trigger: '"altogether", "in total"' },
  'balance': { icon: '🔄', meaning: 'What is left over', trigger: '"change", "left", "remaining"' },
  'duration': { icon: '⏱️', meaning: 'How long something takes', trigger: 'Start time → end time' },
  'average': { icon: '📊', meaning: 'Typical value (total ÷ count)', trigger: '"average", "mean", "per"' },
  'share': { icon: '📐', meaning: 'Portion divided among parts', trigger: '"ratio", "fraction of"' },
};

export const StepPlanner: React.FC<StepPlannerProps> = ({
  question,
  onPlanComplete,
  onShowHint,
}) => {
  const [plans, setPlans] = useState<StepPlan[]>(
    question.method_steps.map(() => ({ what: '', how: '', using: '' }))
  );
  const [validated, setValidated] = useState<boolean[]>(
    new Array(question.method_steps.length).fill(false)
  );
  const [attempted, setAttempted] = useState(false);
  const [showVocab, setShowVocab] = useState(false);

  // Generate What options with conceptual phrasing + anchors
  const getWhatOptions = useCallback((stepIndex: number): WhatOption[] => {
    const step = question.method_steps[stepIndex];
    const correctType = getStepType(step, stepIndex, question);

    // Build correct option
    const correct: WhatOption = {
      concept: getConceptLabel(step, correctType),
      anchor: getAnchorText(step, question),
      mathVocab: correctType,
      stepType: correctType,
      isCorrect: true,
    };

    // Build distractors (wrong concepts for this step)
    const distractorTypes = Object.keys(MATH_VOCAB_GUIDE).filter(t => t !== correctType);
    const shuffled = distractorTypes.sort(() => Math.random() - 0.5).slice(0, 2);

    const distractors: WhatOption[] = shuffled.map(type => ({
      concept: getGenericConcept(type),
      anchor: getFakeAnchor(type, question),
      mathVocab: type,
      stepType: type,
      isCorrect: false,
    }));

    // Add "Skip this step" as a trap
    const skip: WhatOption = {
      concept: "Skip this step",
      anchor: "(not needed)",
      mathVocab: "skip",
      stepType: "skip",
      isCorrect: false,
    };

    return [correct, ...distractors, skip].sort(() => Math.random() - 0.5);
  }, [question]);

  const getStepType = (step: MethodStep, index: number, q: Question): string => {
    const desc = step.description.toLowerCase();
    if (desc.includes('per') || desc.includes('each') || desc.includes('1') || desc.includes('unit')) return 'unit_rate';
    if (desc.includes('discount') || desc.includes('%') || desc.includes('percentage') || desc.includes('off')) return 'percentage';
    if (desc.includes('total') || desc.includes('sum') || desc.includes('altogether') || desc.includes('spent')) return 'total';
    if (desc.includes('change') || desc.includes('left') || desc.includes('remaining') || desc.includes('balance')) return 'balance';
    if (desc.includes('time') || desc.includes('hour') || desc.includes('minute') || desc.includes('duration')) return 'duration';
    if (desc.includes('average') || desc.includes('speed') || desc.includes('mean')) return 'average';
    if (desc.includes('share') || desc.includes('ratio') || desc.includes('part') || desc.includes('chloe') || desc.includes('ben')) return 'share';
    if (index > 0 && index < q.method_steps.length - 1) return 'subtotal';
    return 'total';
  };

  const getConceptLabel = (step: MethodStep, type: string): string => {
    const labels: Record<string, string> = {
      'unit_rate': 'Find the unit rate',
      'subtotal': 'Calculate the subtotal',
      'percentage': 'Apply percentage reduction',
      'total': 'Find the total expenditure',
      'balance': 'Determine the remaining balance',
      'duration': 'Calculate the time duration',
      'average': 'Find the average rate',
      'share': 'Calculate the unequal share',
    };
    return labels[type] || step.description;
  };

  const getGenericConcept = (type: string): string => {
    const labels: Record<string, string> = {
      'unit_rate': 'Find the cost per item',
      'subtotal': 'Add up the items',
      'percentage': 'Work out the discount',
      'total': 'Calculate everything together',
      'balance': 'Find what is left over',
      'duration': 'Work out how long',
      'average': 'Find the typical value',
      'share': 'Divide between people',
    };
    return labels[type] || 'Calculate the amount';
  };

  const getAnchorText = (step: MethodStep, q: Question): string => {
    // Extract specific quantities from the step
    const numbers = step.expected_value.match(/[\d.]+/g);
    const numStr = numbers ? numbers.join(', ') : '';

    // Context-aware anchor
    if (q.question_text.includes('notebook')) return `(for notebooks)`;
    if (q.question_text.includes('pen')) return `(for pens)`;
    if (q.question_text.includes('train')) return `(for the journey)`;
    if (q.question_text.includes('garden')) return `(for the area)`;
    return numStr ? `(${numStr})` : '';
  };

  const getFakeAnchor = (type: string, q: Question): string => {
    const anchors: Record<string, string> = {
      'unit_rate': `(using total cost)`,
      'subtotal': `(after discount)`,
      'percentage': `(of the final price)`,
      'total': `(just the first item)`,
      'balance': `(before paying)`,
      'duration': `(using distance)`,
      'average': `(using total time)`,
      'share': `(equal parts)`,
    };
    return anchors[type] || '';
  };

  const getOperationForStep = useCallback((step: MethodStep): string => {
    const desc = step.description.toLowerCase();
    if (desc.includes('divide') || desc.includes('per') || desc.includes('each') || desc.includes('÷')) return '/';
    if (desc.includes('multiply') || desc.includes('times') || desc.includes('of') || desc.includes('×')) return '*';
    if (desc.includes('subtract') || desc.includes('minus') || desc.includes('difference') || desc.includes('change') || desc.includes('left') || desc.includes('-')) return '-';
    if (desc.includes('add') || desc.includes('plus') || desc.includes('total') || desc.includes('sum') || desc.includes('+')) return '+';
    return '+';
  }, []);

  const getUsingValue = useCallback((step: MethodStep): string => {
    const match = step.expected_value.match(/[\d.]+/);
    return match ? match[0] : step.expected_value;
  }, []);

  const handleWhatChange = useCallback((index: number, value: string) => {
    setPlans((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], what: value };
      return next;
    });
    setValidated((prev) => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  }, []);

  const handleHowChange = useCallback((index: number, value: string) => {
    setPlans((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], how: value };
      return next;
    });
    setValidated((prev) => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  }, []);

  const validateStep = useCallback((index: number, options: WhatOption[]): boolean => {
    const plan = plans[index];
    const selectedOption = options.find(o => o.concept === plan.what);
    const correctOp = getOperationForStep(question.method_steps[index]);

    const isWhatCorrect = selectedOption?.isCorrect || false;
    const isHowCorrect = plan.how === correctOp;

    const isValid = isWhatCorrect && isHowCorrect;

    setValidated((prev) => {
      const next = [...prev];
      next[index] = isValid;
      return next;
    });

    return isValid;
  }, [plans, getOperationForStep, question]);

  const handleValidate = useCallback(() => {
    setAttempted(true);
    const allValid = question.method_steps.every((_, i) => {
      const options = getWhatOptions(i);
      return validateStep(i, options);
    });
    if (allValid) {
      setTimeout(() => onPlanComplete(), 800);
    }
  }, [question, validateStep, getWhatOptions, onPlanComplete]);

  const allStepsValid = validated.every((v) => v);
  const progressPercent = (validated.filter((v) => v).length / validated.length) * 100;

  return (
    <div className="step-planner">
      <div className="step-planner__header">
        <div className="step-planner__badge">🎯 Strategy Board</div>
        <div className="step-planner__progress">
          <div className="step-planner__progress-bar">
            <div className="step-planner__progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="step-planner__progress-text">
            {validated.filter((v) => v).length}/{validated.length} locked
          </span>
        </div>
      </div>

      <div className="step-planner__vocab-toggle">
        <button className="step-planner__vocab-btn" onClick={() => setShowVocab(!showVocab)}>
          {showVocab ? '📚 Hide' : '📚 Show'} Math Vocabulary
        </button>
      </div>

      {showVocab && (
        <div className="step-planner__vocab-panel">
          <p className="step-planner__vocab-intro">Match the word in the question to the concept:</p>
          <div className="step-planner__vocab-grid">
            {Object.entries(MATH_VOCAB_GUIDE).map(([key, vocab]) => (
              <div key={key} className="step-planner__vocab-card">
                <span className="step-planner__vocab-icon">{vocab.icon}</span>
                <span className="step-planner__vocab-name">{key.replace('_', ' ')}</span>
                <span className="step-planner__vocab-meaning">{vocab.meaning}</span>
                <span className="step-planner__vocab-trigger">{vocab.trigger}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="step-planner__intro">
        Before calculating, plan your attack! Pick the <strong>concept</strong> and <strong>operation</strong> for each step.
        <button className="step-planner__hint-btn" onClick={onShowHint}>💡 Need help?</button>
      </p>

      <div className="step-planner__steps">
        {question.method_steps.map((step, index) => {
          const options = getWhatOptions(index);
          const isValid = validated[index];
          const showError = attempted && !isValid && (plans[index].what || plans[index].how);
          const correctOp = getOperationForStep(step);
          const usingValue = getUsingValue(step);

          return (
            <div key={index} className={`step-planner__step ${isValid ? 'step-planner__step--valid' : ''} ${showError ? 'step-planner__step--error' : ''}`}>
              <div className="step-planner__step-number">
                {isValid ? '✅' : `${index + 1}`}
              </div>
              <div className="step-planner__step-content">
                <div className="step-planner__row">
                  <span className="step-planner__label">What:</span>
                  <select
                    className="step-planner__select step-planner__select--what"
                    value={plans[index].what}
                    onChange={(e) => handleWhatChange(index, e.target.value)}
                    disabled={isValid}
                  >
                    <option value="">What concept applies here?</option>
                    {options.map((opt) => (
                      <option key={opt.concept} value={opt.concept}>
                        {opt.concept} {opt.anchor}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="step-planner__row">
                  <span className="step-planner__label">How:</span>
                  <select
                    className="step-planner__select step-planner__select--how"
                    value={plans[index].how}
                    onChange={(e) => handleHowChange(index, e.target.value)}
                    disabled={isValid}
                  >
                    {OPERATIONS.map((op) => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                </div>
                <div className="step-planner__row">
                  <span className="step-planner__label">Using:</span>
                  <span className="step-planner__using">{usingValue}</span>
                </div>
                {showError && (
                  <div className="step-planner__feedback">
                    {plans[index].what && !options.find(o => o.concept === plans[index].what)?.isCorrect && (
                      <span>❌ Check the concept — does this step match "{options.find(o => o.isCorrect)?.mathVocab.replace('_', ' ')}"? </span>
                    )}
                    {plans[index].how && plans[index].how !== correctOp && (
                      <span>❌ Check the operation. </span>
                    )}
                    <button className="step-planner__fix-btn" onClick={() => {
                      setPlans((prev) => { const next = [...prev]; next[index] = { what: '', how: '', using: '' }; return next; });
                      setValidated((prev) => { const next = [...prev]; next[index] = false; return next; });
                    }}>Try again</button>
                  </div>
                )}
                {isValid && (
                  <div className="step-planner__feedback step-planner__feedback--success">
                    ✅ {options.find(o => o.isCorrect)?.mathVocab.replace('_', ' ')} locked! {correctOp === '/' ? '÷' : correctOp === '*' ? '×' : correctOp} {usingValue}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="step-planner__actions">
        {!allStepsValid ? (
          <button className="step-planner__validate-btn" onClick={handleValidate}>
            🔍 Check My Plan
          </button>
        ) : (
          <div className="step-planner__unlock">
            <div className="step-planner__unlock-animation">
              <span role="img" aria-label="Target">🎯</span>
              <span> Strategy Locked!</span>
            </div>
            <button className="step-planner__unlock-btn" onClick={onPlanComplete}>
              Unlock Keypad →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
