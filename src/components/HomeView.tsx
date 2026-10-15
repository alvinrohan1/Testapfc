import React, { useState } from 'react';
import {
  Upload,
  BookOpen,
  Trophy,
  AlertTriangle,
  Bookmark,
  Play,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  Layers,
  History,
  ArrowRight
} from 'lucide-react';
import { NoteDocument, TestSet, ActiveTestState, TestAttempt } from '../types/index.ts';

interface HomeViewProps {
  notes: NoteDocument[];
  demoSet: TestSet;
  activeTest: ActiveTestState | null;
  incorrectCount: number;
  bookmarkCount: number;
  onOpenUpload: () => void;
  onOpenQuestionBank: (tab: 'incorrect' | 'bookmarks') => void;
  onStartSet: (noteId: string, set: TestSet) => void;
  onReattemptSet: (noteId: string, set: TestSet) => void;
  onResumeActiveTest: () => void;
  onDeleteNote: (noteId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  notes,
  demoSet,
  activeTest,
  incorrectCount,
  bookmarkCount,
  onOpenUpload,
  onOpenQuestionBank,
  onStartSet,
  onReattemptSet,
  onResumeActiveTest,
  onDeleteNote
}) => {
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [noteToDelete, setNoteToDelete] = useState<NoteDocument | null>(null);
  const [viewHistorySet, setViewHistorySet] = useState<TestSet | null>(null);

  // Compute aggregate stats across demo and all note sets
  const allSets = [demoSet, ...notes.flatMap((n) => n.sets)];
  const allAttempts = allSets.flatMap((s) => s.attempts || []);
  const completedAttemptsCount = allAttempts.length;

  let bestScore = 0;
  let bestPossible = 20;
  allAttempts.forEach((a) => {
    if (a.score > bestScore) {
      bestScore = a.score;
      bestPossible = a.totalPossibleMarks;
    }
  });

  const getSetBestAndLatest = (set: TestSet) => {
    if (!set.attempts || set.attempts.length === 0) return null;
    const latest = set.attempts[0];
    const best = [...set.attempts].sort((a, b) => b.score - a.score)[0];
    return { latest, best, totalAttempts: set.attempts.length };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-5 space-y-6">
      {/* 1. Quick Stats Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
          <div className="flex items-center gap-1.5 text-sky-400 text-xs font-semibold mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Completed Sets</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">
            {completedAttemptsCount}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Attempt records saved</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
            <Trophy className="w-3.5 h-3.5" />
            <span>Best Score</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">
            {completedAttemptsCount > 0 ? `${bestScore.toFixed(2)}` : '--'}
            <span className="text-xs font-normal text-slate-400"> / {bestPossible}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Net marks achieved</p>
        </div>

        <div
          onClick={() => onOpenQuestionBank('incorrect')}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md cursor-pointer hover:border-rose-500/50 transition group"
        >
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Errors Bank</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white group-hover:text-rose-300 transition">
            {incorrectCount}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Questions for revision</p>
        </div>

        <div
          onClick={() => onOpenQuestionBank('bookmarks')}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md cursor-pointer hover:border-amber-500/50 transition group"
        >
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold mb-1">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Bookmarks</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white group-hover:text-amber-300 transition">
            {bookmarkCount}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Flagged for revision</p>
        </div>
      </div>

      {/* 2. Active Test Resume Banner (if any) */}
      {activeTest && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-500/40 shadow-lg shadow-sky-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Active Test In Progress
              </span>
            </div>
            <h3 className="font-bold text-white text-sm sm:text-base">{activeTest.setTitle}</h3>
            <p className="text-xs text-slate-300">
              Answered {Object.keys(activeTest.answers).length} of {activeTest.questions.length} questions &bull;{' '}
              {Math.floor(activeTest.timeRemainingSeconds / 60)} mins remaining
            </p>
          </div>

          <button
            onClick={onResumeActiveTest}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Continue Test Now</span>
          </button>
        </div>
      )}

      {/* 3. Action Hub: Upload Notes Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onOpenUpload}
          className="flex-1 flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-sky-600/25 transition active:scale-[0.99]"
        >
          <Upload className="w-5 h-5" />
          <span>Upload Notes & Generate 100 Questions</span>
        </button>

        <button
          onClick={() => onOpenQuestionBank('incorrect')}
          className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-xs sm:text-sm transition"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Revise Mistakes ({incorrectCount})</span>
        </button>
      </div>

      {/* 4. Preloaded Official APFC Demo Test Card */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800/90 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 mt-0.5 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  Official Standard Demo
                </span>
                <span className="text-xs text-slate-400">Preloaded UPSC Standard</span>
              </div>
              <h3 className="font-bold text-base text-white mt-0.5">
                {demoSet.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                20 High-Yield Questions &bull; EPF Act, Factories Act, Social Security Code, Accounting & Auditing
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {demoSet.attempts && demoSet.attempts.length > 0 ? (
              <button
                onClick={() => onReattemptSet('demo-note', demoSet)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/40 hover:bg-sky-600/30 text-xs font-bold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reattempt</span>
              </button>
            ) : (
              <button
                onClick={() => onStartSet('demo-note', demoSet)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Attempt Demo</span>
              </button>
            )}
          </div>
        </div>

        {/* Demo Score Status */}
        {demoSet.attempts && demoSet.attempts.length > 0 && (
          <div className="px-5 py-3 bg-slate-950/40 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2 border-t border-slate-800/60">
            {(() => {
              const stats = getSetBestAndLatest(demoSet);
              if (!stats) return null;
              return (
                <>
                  <div className="flex items-center gap-3">
                    <span>
                      Best Score: <strong className="text-emerald-400 font-mono">{stats.best.score.toFixed(2)}</strong> / 20.00
                    </span>
                    <span>
                      Latest: <strong className="text-sky-400 font-mono">{stats.latest.score.toFixed(2)}</strong> ({stats.latest.accuracy}%)
                    </span>
                    <span className="text-slate-500">({stats.totalAttempts} past attempt{stats.totalAttempts > 1 ? 's' : ''})</span>
                  </div>

                  <button
                    onClick={() => setViewHistorySet(demoSet)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:underline"
                  >
                    <History className="w-3 h-3" />
                    <span>View All Attempts</span>
                  </button>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* 5. Uploaded Notes & 100-Question Test Sets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <h2 className="font-bold text-base sm:text-lg text-white">My Notes & Generated Sets</h2>
          </div>
          <span className="text-xs text-slate-400">
            {notes.length} Document{notes.length !== 1 ? 's' : ''} ({notes.length * 5} Total Sets)
          </span>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/50 border border-dashed border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base">No Custom Notes Uploaded Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Upload your PDF, DOCX, or text notes to automatically generate exactly 100 high-yield questions divided into 5 sets of 20!
            </p>
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload First Document</span>
            </button>
          </div>
        ) : (
          notes.map((note) => {
            const isExpanded = expandedNoteId === note.id;
            const completedSets = note.sets.filter((s) => s.attempts && s.attempts.length > 0).length;

            return (
              <div
                key={note.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden transition"
              >
                {/* Note Document Card Header */}
                <div
                  onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                  className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/40 transition select-none"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 mt-0.5 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          100 Questions &bull; 5 Sets
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {note.wordCount.toLocaleString()} words &bull; Uploaded{' '}
                          {new Date(note.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-white mt-1 truncate max-w-md">
                        {note.filename}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Status: <strong className="text-emerald-400">100 MCQs Ready</strong> &bull; {completedSets} of 5 Sets Completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNoteToDelete(note);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="Delete document and its question sets"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-1.5 rounded-xl text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* 5 Test Sets Accordion Body */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-slate-950/60 border-t border-slate-800 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>5 Generated APFC Test Sets (20 Questions Each)</span>
                      <span>100 Total Questions</span>
                    </div>

                    <div className="space-y-2.5">
                      {note.sets.map((set, setIdx) => {
                        const stats = getSetBestAndLatest(set);
                        const hasAttempts = stats !== null;

                        return (
                          <div
                            key={set.id}
                            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-lg bg-sky-600/30 text-sky-300 font-bold text-xs flex items-center justify-center shrink-0">
                                  {setIdx + 1}
                                </span>
                                <h4 className="font-bold text-sm text-white truncate max-w-sm">
                                  {set.title}
                                </h4>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pl-7">
                                <span>20 Questions</span>
                                {hasAttempts ? (
                                  <>
                                    <span>
                                      Best: <strong className="text-emerald-400 font-mono">{stats.best.score.toFixed(2)}</strong> / 20.00
                                    </span>
                                    <span>
                                      Latest: <strong className="text-sky-400 font-mono">{stats.latest.score.toFixed(2)}</strong>
                                    </span>
                                    <span className="text-slate-500">
                                      ({stats.totalAttempts} attempt{stats.totalAttempts > 1 ? 's' : ''})
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-amber-400/90 font-medium">Unattempted</span>
                                )}
                              </div>
                            </div>

                            {/* Set Actions */}
                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pl-7 sm:pl-0">
                              {hasAttempts && (
                                <button
                                  onClick={() => setViewHistorySet(set)}
                                  className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1 transition"
                                  title="View past attempt records"
                                >
                                  <History className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">History</span>
                                </button>
                              )}

                              {hasAttempts ? (
                                <button
                                  onClick={() => onReattemptSet(note.id, set)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/40 hover:bg-sky-600/30 text-xs font-bold transition"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Reattempt</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => onStartSet(note.id, set)}
                                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>Attempt Set</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {noteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">Delete Study Notes?</h4>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete <strong className="text-white">"{noteToDelete.filename}"</strong>? This will permanently delete all 5 test sets (100 questions) and past attempt records.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setNoteToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteNote(noteToDelete.id);
                  setNoteToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white"
              >
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Attempt History Modal */}
      {viewHistorySet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white">{viewHistorySet.title}</h3>
                <p className="text-xs text-slate-400">Past Attempt Records ({viewHistorySet.attempts?.length || 0})</p>
              </div>
              <button
                onClick={() => setViewHistorySet(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 flex-1">
              {viewHistorySet.attempts?.map((att, idx) => (
                <div
                  key={att.id}
                  className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-200">Attempt #{viewHistorySet.attempts.length - idx}</span>
                    <p className="text-[11px] text-slate-400">
                      {new Date(att.timestamp).toLocaleDateString()} at{' '}
                      {new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sky-400 text-sm">
                      {att.score.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400"> / {att.totalPossibleMarks}</span>
                    <p className="text-[10px] text-emerald-400">Accuracy: {att.accuracy}%</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setViewHistorySet(null)}
              className="w-full py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
