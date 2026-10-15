import React, { useState } from 'react';
import {
  Bookmark,
  AlertTriangle,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  BookOpen,
  Filter
} from 'lucide-react';
import { Bookmark as BookmarkType, IncorrectQuestionRecord } from '../types/index.ts';
import { clearIncorrectRecord, toggleBookmark } from '../utils/storage.ts';

interface QuestionBankViewProps {
  initialTab?: 'incorrect' | 'bookmarks';
  incorrectRecords: IncorrectQuestionRecord[];
  bookmarks: BookmarkType[];
  onBack: () => void;
  onRefresh: () => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  initialTab = 'incorrect',
  incorrectRecords,
  bookmarks,
  onBack,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'incorrect' | 'bookmarks'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredIncorrect = incorrectRecords.filter(
    (r) =>
      r.question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.question.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.noteTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookmarks = bookmarks.filter(
    (b) =>
      b.question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.question.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.noteTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveBookmark = (bm: BookmarkType) => {
    toggleBookmark({
      questionId: bm.questionId,
      question: bm.question,
      noteTitle: bm.noteTitle
    });
    onRefresh();
  };

  const handleClearIncorrect = (id: string) => {
    clearIncorrectRecord(id);
    onRefresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <h2 className="font-bold text-sm sm:text-base text-white">Revision & Question Bank</h2>

          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-4 flex-1">
        {/* Navigation Tabs */}
        <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('incorrect')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'incorrect'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Incorrect Answers ({incorrectRecords.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'bookmarks'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Bookmarked ({bookmarks.length})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by topic, act, keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Tab 1: Incorrect Answers Bank */}
        {activeTab === 'incorrect' && (
          <div className="space-y-3">
            {filteredIncorrect.length === 0 ? (
              <div className="text-center py-14 space-y-2 rounded-2xl bg-slate-900/60 border border-slate-800">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">No Incorrect Questions!</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  When you take tests, any questions answered incorrectly will automatically accumulate here for revision.
                </p>
              </div>
            ) : (
              filteredIncorrect.map((record) => {
                const isExpanded = expandedId === record.id;
                const q = record.question;
                return (
                  <div
                    key={record.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          {q.topic}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {record.setTitle || record.noteTitle}
                        </span>
                      </div>
                      <button
                        onClick={() => handleClearIncorrect(record.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Remove from incorrect list"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed">
                      {q.question}
                    </p>

                    {/* Options list */}
                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isUserChoice = record.selectedOptionIndex === optIdx;
                        const isCorrect = q.correctAnswer === optIdx;

                        let style = 'bg-slate-800/40 border-slate-800 text-slate-300';
                        if (isCorrect) {
                          style = 'bg-emerald-950/50 border-emerald-500/80 text-emerald-100 font-semibold';
                        } else if (isUserChoice) {
                          style = 'bg-rose-950/50 border-rose-500/80 text-rose-100 font-semibold';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${style}`}
                          >
                            <span>{['A', 'B', 'C', 'D'][optIdx]}. {opt}</span>
                            {isCorrect && (
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Correct
                              </span>
                            )}
                            {isUserChoice && !isCorrect && (
                              <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                                <XCircle className="w-3 h-3" /> Selected
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1">
                      <span className="font-bold text-sky-400 block text-[11px] uppercase tracking-wider">
                        Explanation
                      </span>
                      <p>{q.explanation}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Bookmarked Questions */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-3">
            {filteredBookmarks.length === 0 ? (
              <div className="text-center py-14 space-y-2 rounded-2xl bg-slate-900/60 border border-slate-800">
                <Bookmark className="w-10 h-10 text-amber-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">No Bookmarks Saved Yet</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Tap the bookmark ribbon icon on any question during test attempts to save it here for offline study.
                </p>
              </div>
            ) : (
              filteredBookmarks.map((bm) => {
                const q = bm.question;
                return (
                  <div
                    key={bm.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {q.topic}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {bm.noteTitle}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveBookmark(bm)}
                        className="p-1 rounded-lg text-amber-400 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed">
                      {q.question}
                    </p>

                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctAnswer === optIdx;
                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                              isCorrect
                                ? 'bg-emerald-950/50 border-emerald-500/80 text-emerald-100 font-semibold'
                                : 'bg-slate-800/40 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span>{['A', 'B', 'C', 'D'][optIdx]}. {opt}</span>
                            {isCorrect && (
                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1">
                      <span className="font-bold text-sky-400 block text-[11px] uppercase tracking-wider">
                        Explanation
                      </span>
                      <p>{q.explanation}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
