import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Bookmark,
  AlertTriangle,
  Info,
  BookOpen
} from 'lucide-react';
import { Question, TestAttempt } from '../types/index.ts';
import { isBookmarked, toggleBookmark } from '../utils/storage.ts';
import { getOptionFeedbackState } from '../utils/scoring.ts';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  attempt: TestAttempt;
  initialFilter?: 'incorrect' | 'all';
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  questions,
  attempt,
  initialFilter = 'all'
}) => {
  const [filter, setFilter] = useState<'incorrect' | 'all'>(initialFilter);
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);

  if (!isOpen) return null;

  // Filter questions
  const displayedIndices = questions
    .map((q, idx) => {
      const userAns = attempt.userAnswers[idx];
      const isIncorrect = userAns !== null && userAns !== undefined && userAns !== q.correctAnswer;
      const isUnanswered = userAns === null || userAns === undefined;
      if (filter === 'incorrect') {
        return (isIncorrect || isUnanswered) ? idx : null;
      }
      return idx;
    })
    .filter((idx): idx is number => idx !== null);

  const currentRealIdx = displayedIndices[activeReviewIdx] ?? 0;
  const currentQ: Question = questions[currentRealIdx];
  const userSelected = attempt.userAnswers[currentRealIdx] ?? null;
  const isMarked = currentQ ? isBookmarked(currentQ.id) : false;

  const handleToggleBookmark = () => {
    if (!currentQ) return;
    toggleBookmark({
      questionId: currentQ.id,
      question: currentQ,
      noteTitle: 'Review Question'
    });
    // Force re-render
    setActiveReviewIdx((prev) => prev);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Review Test Answers</h3>
              <p className="text-[11px] text-slate-400">
                Question {activeReviewIdx + 1} of {displayedIndices.length} ({filter === 'incorrect' ? 'Errors Only' : 'All'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Toggle */}
            <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => {
                  setFilter('all');
                  setActiveReviewIdx(0);
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  filter === 'all' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({questions.length})
              </button>
              <button
                onClick={() => {
                  setFilter('incorrect');
                  setActiveReviewIdx(0);
                }}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  filter === 'incorrect' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Errors ({attempt.incorrectCount + attempt.unansweredCount})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Question content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {displayedIndices.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">Outstanding Performance!</h4>
              <p className="text-xs text-slate-400">No incorrect or unanswered questions found in this set.</p>
            </div>
          ) : (
            <>
              {/* Question metadata & Bookmark */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    {currentQ.topic || 'UPSC APFC Syllabus'}
                  </span>
                  {userSelected === null ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                      Unanswered
                    </span>
                  ) : userSelected === currentQ.correctAnswer ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Correct (+{attempt.markingScheme.positive})
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      Incorrect (-{attempt.markingScheme.negative})
                    </span>
                  )}
                </div>

                <button
                  onClick={handleToggleBookmark}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold border transition ${
                    isBookmarked(currentQ.id)
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked(currentQ.id) ? 'fill-current' : ''}`} />
                  <span>{isBookmarked(currentQ.id) ? 'Bookmarked' : 'Bookmark'}</span>
                </button>
              </div>

              {/* Question text */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
                <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed">
                  <span className="text-sky-400 font-bold mr-1.5">Q{currentRealIdx + 1}.</span>
                  {currentQ.question}
                </p>
              </div>

              {/* 4 Options review with strict color rules */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const isUserPick = userSelected === optIdx;
                  const isCorrect = currentQ.correctAnswer === optIdx;

                  let cardStyle = 'bg-slate-900 border-slate-800 text-slate-300';
                  let badge = null;

                  if (isCorrect) {
                    // Correct answer is always GREEN
                    cardStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-100 ring-1 ring-emerald-500/50';
                    badge = (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                        <CheckCircle2 className="w-3 h-3" /> Correct Answer
                      </span>
                    );
                  } else if (isUserPick && !isCorrect) {
                    // User wrong pick is RED
                    cardStyle = 'bg-rose-950/70 border-rose-500 text-rose-100 ring-1 ring-rose-500/50';
                    badge = (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                        <XCircle className="w-3 h-3" /> Your Choice
                      </span>
                    );
                  }

                  const letter = ['A', 'B', 'C', 'D'][optIdx];

                  return (
                    <div
                      key={optIdx}
                      className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs sm:text-sm font-medium ${cardStyle}`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {letter}
                        </span>
                        <span className="pt-0.5">{opt}</span>
                      </div>
                      {badge && <div className="shrink-0">{badge}</div>}
                    </div>
                  );
                })}
              </div>

              {/* Detailed Explanation Box */}
              <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-800/40 text-slate-200 space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5" />
                    <span>Official APFC Syllabus Explanation</span>
                  </div>
                  {currentQ.reference && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Ref: {currentQ.reference}
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-slate-300">
                  {currentQ.explanation}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between gap-2">
          <button
            onClick={() => setActiveReviewIdx((prev) => Math.max(0, prev - 1))}
            disabled={activeReviewIdx === 0 || displayedIndices.length === 0}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 disabled:opacity-40 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <span className="text-xs text-slate-400 font-mono">
            {displayedIndices.length > 0 ? `${activeReviewIdx + 1} / ${displayedIndices.length}` : '0 / 0'}
          </span>

          <button
            onClick={() => setActiveReviewIdx((prev) => Math.min(displayedIndices.length - 1, prev + 1))}
            disabled={activeReviewIdx >= displayedIndices.length - 1 || displayedIndices.length === 0}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500 disabled:opacity-40 transition"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
