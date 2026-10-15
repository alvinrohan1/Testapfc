import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle,
  XCircle,
  MinusCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Home,
  AlertTriangle,
  Award,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { TestAttempt, Question } from '../types/index.ts';

interface ResultsViewProps {
  attempt: TestAttempt;
  questions: Question[];
  setTitle: string;
  onReview: (filter: 'incorrect' | 'all') => void;
  onReattempt: () => void;
  onReturnHome: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  attempt,
  questions,
  setTitle,
  onReview,
  onReattempt,
  onReturnHome
}) => {
  useEffect(() => {
    // Fire festive confetti if score is >= 50%
    if (attempt.score / attempt.totalPossibleMarks >= 0.5) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }
  }, [attempt.score, attempt.totalPossibleMarks]);

  const formatSeconds = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}m ${s}s`;
  };

  const percentage = Math.round((attempt.score / attempt.totalPossibleMarks) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto space-y-5 animate-fade-in pb-10">
        {/* Header Card */}
        <div className="text-center p-6 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-900/80 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-sky-500/10 blur-2xl pointer-events-none rounded-full" />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/20">
            <Trophy className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-white">{setTitle}</h2>
          <p className="text-xs text-slate-400 mt-1">UPSC EPFO APFC Performance Scorecard</p>

          {/* Net Marks Highlight */}
          <div className="my-5 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 max-w-xs mx-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Net Marks (With -0.33 Negative Marking)
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-sky-400 mt-1 font-mono">
              {attempt.score.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400">/ {attempt.totalPossibleMarks.toFixed(2)}</span>
            </div>
            <div className="mt-2 text-xs font-medium text-slate-300">
              Score: <strong className="text-white">{percentage}%</strong> &bull; Accuracy: <strong className="text-emerald-400">{attempt.accuracy}%</strong>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Completed on {new Date(attempt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; Time Taken: {formatSeconds(attempt.timeTakenSeconds)}
          </p>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-bold">Correct</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">{attempt.correctCount}</div>
            <p className="text-[10px] text-emerald-400/80 mt-0.5">+{attempt.correctCount * attempt.markingScheme.positive} Marks</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-rose-400 mb-1">
              <XCircle className="w-4 h-4" />
              <span className="text-xs font-bold">Incorrect</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">{attempt.incorrectCount}</div>
            <p className="text-[10px] text-rose-400/80 mt-0.5">-{(attempt.incorrectCount * attempt.markingScheme.negative).toFixed(2)} Marks</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-400 mb-1">
              <MinusCircle className="w-4 h-4" />
              <span className="text-xs font-bold">Unanswered</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">{attempt.unansweredCount}</div>
            <p className="text-[10px] text-slate-500 mt-0.5">0 Marks</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-bold">Pace</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {questions.length > 0 ? `${Math.round(attempt.timeTakenSeconds / (attempt.correctCount + attempt.incorrectCount || 1))}s` : '0s'}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Avg / Attempt</p>
          </div>
        </div>

        {/* Topic-Wise Performance Section */}
        {Object.keys(attempt.topicWiseStats).length > 0 && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                Topic-Wise APFC Syllabus Mastery
              </h3>
            </div>

            <div className="space-y-2.5">
              {Object.entries(attempt.topicWiseStats).map(([topic, stats]) => {
                const topicPct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                return (
                  <div key={topic} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-200 truncate max-w-[240px]">{topic}</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {stats.correct}/{stats.total} ({topicPct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          topicPct >= 70 ? 'bg-emerald-500' : topicPct >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${topicPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {attempt.incorrectCount > 0 && (
            <button
              onClick={() => onReview('incorrect')}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-300 font-bold text-xs sm:text-sm hover:bg-rose-600/30 transition shadow-lg shadow-rose-950/20 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Review {attempt.incorrectCount} Incorrect Answers</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => onReview('all')}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs sm:text-sm hover:bg-slate-800 transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Review All {questions.length} Questions & Explanations</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex gap-2.5 pt-1">
            <button
              onClick={onReattempt}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-600/20 transition active:scale-[0.99]"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reattempt Set</span>
            </button>

            <button
              onClick={onReturnHome}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition active:scale-[0.99]"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
