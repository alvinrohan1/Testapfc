import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Bookmark,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Flag,
  RotateCcw,
  Send,
  Grid,
  Sparkles,
  Info
} from 'lucide-react';
import { Question, ActiveTestState, AppSettings, TestAttempt } from '../types/index.ts';
import {
  calculateMarks,
  calculateAccuracy,
  getOptionFeedbackState
} from '../utils/scoring.ts';
import {
  requestFullscreen,
  exitFullscreen,
  isFullscreen,
  acquireWakeLock,
  releaseWakeLock,
  triggerHaptic
} from '../utils/fullscreen.ts';
import { QuestionPalette } from './QuestionPalette.tsx';
import { isBookmarked, toggleBookmark } from '../utils/storage.ts';

interface TestRunnerProps {
  testState: ActiveTestState;
  settings: AppSettings;
  onUpdateState: (state: ActiveTestState) => void;
  onSubmitTest: (attempt: TestAttempt) => void;
  onExitTest: () => void;
}

export const TestRunner: React.FC<TestRunnerProps> = ({
  testState,
  settings,
  onUpdateState,
  onSubmitTest,
  onExitTest
}) => {
  const [currentIdx, setCurrentIdx] = useState(testState.currentQuestionIndex || 0);
  const [answers, setAnswers] = useState<Record<number, number | null>>(testState.answers || {});
  const [visited, setVisited] = useState<number[]>(testState.visitedQuestions || [0]);
  const [markedForReview, setMarkedForReview] = useState<number[]>(testState.markedForReview || []);
  const [timeRemaining, setTimeRemaining] = useState(testState.timeRemainingSeconds);
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const [isCurrentBookmarked, setIsCurrentBookmarked] = useState(false);

  const questions = testState.questions;
  const currentQ: Question = questions[currentIdx];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WakeLock and Fullscreen
  useEffect(() => {
    if (settings.wakeLockEnabled) {
      acquireWakeLock();
    }
    setFullscreenActive(isFullscreen());

    const onFsChange = () => setFullscreenActive(isFullscreen());
    document.addEventListener('fullscreenchange', onFsChange);

    // Hardware/browser back button handling
    window.history.pushState({ testActive: true }, '');
    const handlePopState = (e: PopStateEvent) => {
      // Intercept back navigation
      window.history.pushState({ testActive: true }, '');
      setShowExitConfirm(true);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      releaseWakeLock();
      document.removeEventListener('fullscreenchange', onFsChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [settings.wakeLockEnabled]);

  // Check bookmark status on current question change
  useEffect(() => {
    if (currentQ) {
      setIsCurrentBookmarked(isBookmarked(currentQ.id));
    }
  }, [currentIdx, currentQ]);

  // Sync state upward whenever local state updates
  useEffect(() => {
    onUpdateState({
      ...testState,
      currentQuestionIndex: currentIdx,
      answers,
      visitedQuestions: visited,
      markedForReview,
      timeRemainingSeconds: timeRemaining
    });
  }, [currentIdx, answers, visited, markedForReview, timeRemaining]);

  // Countdown Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex: number) => {
    // If feedbackMode is 'immediate', once an answer is chosen, lock the question
    if (settings.feedbackMode === 'immediate' && answers[currentIdx] !== undefined && answers[currentIdx] !== null) {
      return; // already locked
    }

    const isCorrect = optionIndex === currentQ.correctAnswer;
    if (settings.vibrationEnabled) {
      triggerHaptic(isCorrect ? 'correct' : 'wrong');
    }

    const updatedAnswers = { ...answers, [currentIdx]: optionIndex };
    setAnswers(updatedAnswers);
  };

  const handleNavigate = (newIdx: number) => {
    if (newIdx < 0 || newIdx >= questions.length) return;
    setCurrentIdx(newIdx);
    if (!visited.includes(newIdx)) {
      setVisited([...visited, newIdx]);
    }
  };

  const handleToggleMarkReview = () => {
    if (markedForReview.includes(currentIdx)) {
      setMarkedForReview(markedForReview.filter((i) => i !== currentIdx));
    } else {
      setMarkedForReview([...markedForReview, currentIdx]);
    }
  };

  const handleToggleBookmark = () => {
    if (!currentQ) return;
    const added = toggleBookmark({
      questionId: currentQ.id,
      question: currentQ,
      noteTitle: testState.setTitle
    });
    setIsCurrentBookmarked(added);
    if (settings.vibrationEnabled) triggerHaptic('tap');
  };

  const handleAutoSubmit = () => {
    triggerHaptic('warning');
    finalizeAndSubmit();
  };

  const finalizeAndSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const topicStats: Record<string, { total: number; correct: number; incorrect: number }> = {};

    questions.forEach((q, i) => {
      const selected = answers[i];
      const topic = q.topic || 'General Studies';
      if (!topicStats[topic]) {
        topicStats[topic] = { total: 0, correct: 0, incorrect: 0 };
      }
      topicStats[topic].total += 1;

      if (selected === null || selected === undefined) {
        unansweredCount += 1;
      } else if (selected === q.correctAnswer) {
        correctCount += 1;
        topicStats[topic].correct += 1;
      } else {
        incorrectCount += 1;
        topicStats[topic].incorrect += 1;
      }
    });

    const netScore = calculateMarks(
      correctCount,
      incorrectCount,
      settings.positiveMark,
      settings.negativeMark
    );
    const accuracy = calculateAccuracy(correctCount, correctCount + incorrectCount);
    const timeTaken = testState.totalDurationSeconds - timeRemaining;

    const attempt: TestAttempt = {
      id: `attempt-${Date.now()}`,
      setId: testState.setId,
      noteId: testState.noteId,
      timestamp: new Date().toISOString(),
      score: netScore,
      totalPossibleMarks: questions.length * settings.positiveMark,
      correctCount,
      incorrectCount,
      unansweredCount,
      accuracy,
      timeTakenSeconds: timeTaken,
      timeAllocatedSeconds: testState.totalDurationSeconds,
      userAnswers: answers,
      markingScheme: {
        positive: settings.positiveMark,
        negative: settings.negativeMark
      },
      topicWiseStats: topicStats,
      isCompleted: true
    };

    onSubmitTest(attempt);
  };

  const answeredCount = Object.values(answers).filter((a) => a !== null && a !== undefined).length;
  const isLocked = settings.feedbackMode === 'immediate' && answers[currentIdx] !== undefined && answers[currentIdx] !== null;
  const userSelected = answers[currentIdx] ?? null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between select-none">
      {/* Test Runner Top Bar */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          {/* Back/Exit Button */}
          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition text-xs font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Save & Exit</span>
          </button>

          {/* Test Set Title & Counter */}
          <div className="text-center min-w-0 px-1">
            <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[140px] sm:max-w-xs">
              {testState.setTitle.replace(/^(Official Demo Practice Set: )/, 'Demo: ')}
            </h2>
            <p className="text-[11px] text-sky-400 font-semibold">
              Q{currentIdx + 1} of {questions.length}
            </p>
          </div>

          {/* Timer and Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-mono text-xs font-bold border transition ${
                timeRemaining <= 120
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                  : timeRemaining <= 300
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800 text-sky-300 border-slate-700'
              }`}
              title="Time Remaining"
            >
              <Clock className="w-3 h-3" />
              <span>{formatTime(timeRemaining)}</span>
            </div>

            {/* Bookmark button */}
            <button
              onClick={handleToggleBookmark}
              className={`p-1.5 rounded-lg transition ${
                isCurrentBookmarked
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Bookmark question"
              aria-label="Bookmark question"
            >
              <Bookmark className={`w-4 h-4 ${isCurrentBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={async () => {
                if (fullscreenActive) {
                  await exitFullscreen();
                  setFullscreenActive(false);
                } else {
                  await requestFullscreen();
                  setFullscreenActive(true);
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition hidden xs:block"
              title="Toggle Fullscreen"
              aria-label="Toggle Fullscreen"
            >
              {fullscreenActive ? <Minimize2 className="w-4 h-4 text-sky-400" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Question Palette Drawer Trigger */}
            <button
              onClick={() => setShowPalette(true)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Open Question Palette"
              aria-label="Open Question Palette"
            >
              <Grid className="w-4 h-4 text-sky-400" />
            </button>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
          <div
            className="bg-sky-500 h-full transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Body Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 overflow-y-auto space-y-4">
        {/* Topic and Reference Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
              {currentQ.topic || 'UPSC APFC Syllabus'}
            </span>
            {currentQ.reference && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-[200px]">
                {currentQ.reference}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMarkReview}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                markedForReview.includes(currentIdx)
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{markedForReview.includes(currentIdx) ? 'Review Marked' : 'Mark Review'}</span>
            </button>
          </div>
        </div>

        {/* Question Text */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
            <span className="text-sky-400 font-bold mr-2">Q{currentIdx + 1}.</span>
            {currentQ.question}
          </p>
        </div>

        {/* 4 Options — CRITICAL ANSWER FEEDBACK LOGIC */}
        <div className="space-y-3">
          {currentQ.options.map((optText, optIdx) => {
            const feedback = getOptionFeedbackState(
              optIdx,
              userSelected,
              currentQ.correctAnswer,
              isLocked
            );

            // Styling based on feedback
            let btnStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700';
            let badgeStyle = 'bg-slate-800 text-slate-400 border-slate-700';
            let label = null;

            if (feedback === 'selected_correct') {
              // User picked right option: Green check
              btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/60 shadow-lg shadow-emerald-950/40';
              badgeStyle = 'bg-emerald-600 text-white border-emerald-500 font-bold';
              label = (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                  <CheckCircle2 className="w-3 h-3" /> Correct
                </span>
              );
            } else if (feedback === 'selected_wrong') {
              // User picked wrong option: Red X
              btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-100 ring-2 ring-rose-500/60 shadow-lg shadow-rose-950/40';
              badgeStyle = 'bg-rose-600 text-white border-rose-500 font-bold';
              label = (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  <XCircle className="w-3 h-3" /> Your Choice
                </span>
              );
            } else if (feedback === 'actual_correct') {
              // Revealed correct answer when user picked wrong: Green check
              btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/60 animate-pulse';
              badgeStyle = 'bg-emerald-600 text-white border-emerald-500 font-bold';
              label = (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                  <CheckCircle2 className="w-3 h-3" /> Correct Answer
                </span>
              );
            }

            const letter = ['A', 'B', 'C', 'D'][optIdx];

            return (
              <button
                key={optIdx}
                onClick={() => handleSelectOption(optIdx)}
                disabled={isLocked}
                className={`w-full min-h-[52px] p-3.5 sm:p-4 rounded-xl border flex items-start justify-between gap-3 text-left transition active:scale-[0.99] ${btnStyle} ${
                  isLocked ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 border ${badgeStyle}`}>
                    {letter}
                  </div>
                  <span className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
                    {optText}
                  </span>
                </div>
                {label && <div className="shrink-0">{label}</div>}
              </button>
            );
          })}
        </div>

        {/* Immediate Explanation Box — Displayed once locked */}
        {isLocked && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-sky-500/30 text-slate-200 space-y-2 animate-fade-in shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">
                  Official Explanation & Provision
                </h4>
              </div>
              {currentQ.reference && (
                <span className="text-[11px] text-slate-400 font-mono">
                  Ref: {currentQ.reference}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
              {currentQ.explanation}
            </p>
          </div>
        )}
      </main>

      {/* Test Runner Bottom Bar */}
      <footer className="sticky bottom-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          {/* Previous Button */}
          <button
            onClick={() => handleNavigate(currentIdx - 1)}
            disabled={currentIdx === 0}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Prev</span>
          </button>

          {/* Center Summary Indicator & Submit Early */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              <strong className="text-emerald-400 font-bold">{answeredCount}</strong> / {questions.length}
            </span>

            {answeredCount > 0 && currentIdx < questions.length - 1 && (
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-[10px] font-bold transition"
              >
                Submit Early
              </button>
            )}
          </div>

          {/* Next or Submit Button */}
          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => handleNavigate(currentIdx + 1)}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-500 transition shadow-md shadow-sky-600/20"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:from-emerald-500 hover:to-teal-500 transition shadow-md shadow-emerald-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Test</span>
            </button>
          )}
        </div>
      </footer>

      {/* Question Palette Drawer Modal */}
      <QuestionPalette
        isOpen={showPalette}
        onClose={() => setShowPalette(false)}
        totalQuestions={questions.length}
        currentIndex={currentIdx}
        answers={answers}
        visitedQuestions={visited}
        markedForReview={markedForReview}
        onSelectQuestion={(idx) => handleNavigate(idx)}
      />

      {/* Confirmation Modal: Submit Test */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 text-slate-100 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base text-white">Submit Test?</h3>
              <p className="text-xs text-slate-400 mt-1">
                You have answered <strong className="text-emerald-400">{answeredCount}</strong> out of{' '}
                <strong className="text-white">{questions.length}</strong> questions.
              </p>
              {questions.length - answeredCount > 0 && (
                <p className="text-xs text-amber-400 mt-1 font-medium">
                  {questions.length - answeredCount} unanswered questions will receive 0 marks.
                </p>
              )}
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                Keep Testing
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  finalizeAndSubmit();
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Exit & Save Test */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 text-slate-100 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-base text-white">Pause & Save Test?</h3>
              <p className="text-xs text-slate-300 mt-1">
                Your answers ({answeredCount}/{questions.length}) and timer ({formatTime(timeRemaining)}) are saved locally. You can resume anytime from the Home screen.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                Stay in Test
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onExitTest();
                }}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition"
              >
                Save & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
