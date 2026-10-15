import React from 'react';
import { X, Check, Bookmark, HelpCircle } from 'lucide-react';

interface QuestionPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  totalQuestions: number;
  currentIndex: number;
  answers: Record<number, number | null>;
  visitedQuestions: number[];
  markedForReview: number[];
  onSelectQuestion: (index: number) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  isOpen,
  onClose,
  totalQuestions,
  currentIndex,
  answers,
  visitedQuestions,
  markedForReview,
  onSelectQuestion
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-5 text-slate-100 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base text-white">Question Palette</h3>
            <p className="text-xs text-slate-400">Total {totalQuestions} Questions</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 my-3 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-700 border border-slate-600"></span>
            <span>Unanswered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-500 text-slate-950 flex items-center justify-center text-[9px] font-bold">★</span>
            <span>Review Marked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-purple-600 text-white flex items-center justify-center text-[9px] font-bold">✓★</span>
            <span>Answered & Review</span>
          </div>
        </div>

        {/* Question Numbers Grid */}
        <div className="overflow-y-auto py-2">
          <div className="grid grid-cols-5 gap-2.5">
            {Array.from({ length: totalQuestions }, (_, i) => {
              const isCurrent = currentIndex === i;
              const hasAnswer = answers[i] !== undefined && answers[i] !== null;
              const isMarked = markedForReview.includes(i);
              const isVisited = visitedQuestions.includes(i);

              let badgeStyle = 'bg-slate-800/80 text-slate-400 border border-slate-700/60';
              if (hasAnswer && isMarked) {
                badgeStyle = 'bg-purple-600 text-white font-bold border-purple-400 shadow-sm shadow-purple-600/30';
              } else if (hasAnswer) {
                badgeStyle = 'bg-emerald-600 text-white font-bold border-emerald-400 shadow-sm shadow-emerald-600/30';
              } else if (isMarked) {
                badgeStyle = 'bg-amber-500 text-slate-950 font-bold border-amber-300 shadow-sm shadow-amber-500/30';
              } else if (isVisited) {
                badgeStyle = 'bg-slate-700 text-slate-200 border border-slate-600';
              }

              return (
                <button
                  key={i}
                  onClick={() => {
                    onSelectQuestion(i);
                    onClose();
                  }}
                  className={`h-11 rounded-xl flex items-center justify-center text-sm font-semibold transition active:scale-95 ${badgeStyle} ${
                    isCurrent ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-900 scale-105' : ''
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 mt-auto">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Close Palette
          </button>
        </div>
      </div>
    </div>
  );
};
