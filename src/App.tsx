import React, { useState, useEffect } from 'react';
import {
  NoteDocument,
  TestSet,
  ActiveTestState,
  TestAttempt,
  AppSettings,
  Bookmark,
  IncorrectQuestionRecord
} from './types/index.ts';
import {
  loadNotes,
  saveNote,
  deleteNote as deleteNoteFromStorage,
  loadDemoTestSet,
  saveSetAttempt,
  loadActiveTest,
  saveActiveTest,
  clearActiveTest,
  loadSettings,
  saveSettings,
  loadBookmarks,
  loadIncorrectRecords,
  recordIncorrectAnswers,
  DEFAULT_SETTINGS
} from './utils/storage.ts';
import { shuffleAttempt } from './utils/scoring.ts';
import { Header } from './components/Header.tsx';
import { HomeView } from './components/HomeView.tsx';
import { TestRunner } from './components/TestRunner.tsx';
import { ResultsView } from './components/ResultsView.tsx';
import { UploadModal } from './components/UploadModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { ApkExportModal } from './components/ApkExportModal.tsx';
import { ReviewModal } from './components/ReviewModal.tsx';
import { QuestionBankView } from './components/QuestionBankView.tsx';

type AppView = 'home' | 'testing' | 'results' | 'questionBank';

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [notes, setNotes] = useState<NoteDocument[]>([]);
  const [demoSet, setDemoSet] = useState<TestSet>(loadDemoTestSet());
  const [activeTest, setActiveTest] = useState<ActiveTestState | null>(null);
  const [lastAttempt, setLastAttempt] = useState<TestAttempt | null>(null);
  const [lastAttemptQuestions, setLastAttemptQuestions] = useState<any[]>([]);
  const [lastAttemptTitle, setLastAttemptTitle] = useState('');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [incorrectRecords, setIncorrectRecords] = useState<IncorrectQuestionRecord[]>([]);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isApkOpen, setIsApkOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'incorrect' | 'all'>('all');
  const [questionBankTab, setQuestionBankTab] = useState<'incorrect' | 'bookmarks'>('incorrect');

  // Theme
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize and load persistent data
  useEffect(() => {
    const loadedNotes = loadNotes();
    const loadedDemo = loadDemoTestSet();
    const loadedActive = loadActiveTest();
    const loadedSettings = loadSettings();
    const loadedBms = loadBookmarks();
    const loadedIncs = loadIncorrectRecords();

    setNotes(loadedNotes);
    setDemoSet(loadedDemo);
    setActiveTest(loadedActive);
    setSettings(loadedSettings);
    setBookmarks(loadedBms);
    setIncorrectRecords(loadedIncs);

    // Apply dark mode class to HTML element
    if (loadedSettings.theme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleToggleTheme = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const updated = { ...settings, theme: nextMode ? 'dark' : ('light' as any) };
    setSettings(updated);
    saveSettings(updated);
  };

  // Start a fresh test attempt
  const handleStartSet = (noteId: string, set: TestSet) => {
    const durationSeconds = settings.defaultTimerMinutes * 60;
    const newState: ActiveTestState = {
      setId: set.id,
      noteId: noteId,
      setIndex: set.setIndex,
      setTitle: set.title,
      startedAt: Date.now(),
      timeRemainingSeconds: durationSeconds,
      totalDurationSeconds: durationSeconds,
      currentQuestionIndex: 0,
      answers: {},
      visitedQuestions: [0],
      markedForReview: [],
      questions: set.questions,
      mode: settings.feedbackMode === 'immediate' ? 'practice' : 'exam',
      attemptId: `att-${Date.now()}`
    };

    setActiveTest(newState);
    saveActiveTest(newState);
    setView('testing');
  };

  // Reattempt set: shuffles questions & options while preserving correct answer mapping
  const handleReattemptSet = (noteId: string, set: TestSet) => {
    const shuffledQuestions = shuffleAttempt(set.questions);
    const durationSeconds = settings.defaultTimerMinutes * 60;

    const newState: ActiveTestState = {
      setId: set.id,
      noteId: noteId,
      setIndex: set.setIndex,
      setTitle: `${set.title} (Reattempt)`,
      startedAt: Date.now(),
      timeRemainingSeconds: durationSeconds,
      totalDurationSeconds: durationSeconds,
      currentQuestionIndex: 0,
      answers: {},
      visitedQuestions: [0],
      markedForReview: [],
      questions: shuffledQuestions,
      mode: settings.feedbackMode === 'immediate' ? 'practice' : 'exam',
      attemptId: `att-${Date.now()}`
    };

    setActiveTest(newState);
    saveActiveTest(newState);
    setView('testing');
  };

  const handleResumeActiveTest = () => {
    if (activeTest) {
      setView('testing');
    }
  };

  const handleUpdateActiveTest = (state: ActiveTestState) => {
    setActiveTest(state);
    saveActiveTest(state);
  };

  const handleSubmitTest = (attempt: TestAttempt) => {
    if (!activeTest) return;

    // 1. Record attempt in storage
    saveSetAttempt(activeTest.noteId, activeTest.setId, attempt);

    // 2. Accumulate any incorrect questions into the Incorrect Questions Bank
    const newIncorrect: IncorrectQuestionRecord[] = [];
    activeTest.questions.forEach((q, idx) => {
      const userAns = attempt.userAnswers[idx];
      if (userAns !== null && userAns !== undefined && userAns !== q.correctAnswer) {
        newIncorrect.push({
          id: `inc-${q.id}-${Date.now()}`,
          question: q,
          selectedOptionIndex: userAns,
          attemptDate: new Date().toISOString(),
          noteTitle: activeTest.noteId === 'demo-note' ? 'Official APFC Demo' : activeTest.setTitle,
          setTitle: activeTest.setTitle
        });
      }
    });

    if (newIncorrect.length > 0) {
      recordIncorrectAnswers(newIncorrect);
      setIncorrectRecords(loadIncorrectRecords());
    }

    // 3. Clear active test state
    clearActiveTest();
    setActiveTest(null);

    // 4. Update memory state for notes & demo
    setNotes(loadNotes());
    setDemoSet(loadDemoTestSet());

    // 5. Navigate to results view
    setLastAttempt(attempt);
    setLastAttemptQuestions(activeTest.questions);
    setLastAttemptTitle(activeTest.setTitle);
    setView('results');
  };

  const handleExitTestToHome = () => {
    setView('home');
  };

  const handleNoteCreated = (newNote: NoteDocument) => {
    saveNote(newNote);
    setNotes(loadNotes());
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNoteFromStorage(noteId);
    setNotes(loadNotes());
  };

  const handleClearAllData = () => {
    localStorage.clear();
    setNotes([]);
    setDemoSet(loadDemoTestSet());
    setActiveTest(null);
    setBookmarks([]);
    setIncorrectRecords([]);
    setView('home');
  };

  const handleOpenQuestionBank = (tab: 'incorrect' | 'bookmarks') => {
    setQuestionBankTab(tab);
    setView('questionBank');
  };

  const refreshBankData = () => {
    setBookmarks(loadBookmarks());
    setIncorrectRecords(loadIncorrectRecords());
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors ${
      isDarkMode ? 'dark' : ''
    }`}>
      {/* Universal Sticky Header (only shown outside of active test taking) */}
      {view !== 'testing' && (
        <Header
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenApkModal={() => setIsApkOpen(true)}
          onOpenQuestionBank={handleOpenQuestionBank}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          activeTestTitle={activeTest?.setTitle}
          onReturnToActiveTest={handleResumeActiveTest}
          incorrectCount={incorrectRecords.length}
          bookmarkCount={bookmarks.length}
        />
      )}

      {/* Main Content Router */}
      <div className="flex-1">
        {view === 'home' && (
          <HomeView
            notes={notes}
            demoSet={demoSet}
            activeTest={activeTest}
            incorrectCount={incorrectRecords.length}
            bookmarkCount={bookmarks.length}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenQuestionBank={handleOpenQuestionBank}
            onStartSet={handleStartSet}
            onReattemptSet={handleReattemptSet}
            onResumeActiveTest={handleResumeActiveTest}
            onDeleteNote={handleDeleteNote}
          />
        )}

        {view === 'testing' && activeTest && (
          <TestRunner
            testState={activeTest}
            settings={settings}
            onUpdateState={handleUpdateActiveTest}
            onSubmitTest={handleSubmitTest}
            onExitTest={handleExitTestToHome}
          />
        )}

        {view === 'results' && lastAttempt && (
          <ResultsView
            attempt={lastAttempt}
            questions={lastAttemptQuestions}
            setTitle={lastAttemptTitle}
            onReview={(filter) => {
              setReviewFilter(filter);
              setIsReviewOpen(true);
            }}
            onReattempt={() => {
              // Reattempt the last attempt's set
              const set: TestSet = {
                id: lastAttempt.setId,
                noteId: lastAttempt.noteId,
                setIndex: 1,
                title: lastAttemptTitle,
                questions: lastAttemptQuestions,
                totalQuestions: lastAttemptQuestions.length,
                attempts: []
              };
              handleReattemptSet(lastAttempt.noteId, set);
            }}
            onReturnHome={() => setView('home')}
          />
        )}

        {view === 'questionBank' && (
          <QuestionBankView
            initialTab={questionBankTab}
            incorrectRecords={incorrectRecords}
            bookmarks={bookmarks}
            onBack={() => setView('home')}
            onRefresh={refreshBankData}
          />
        )}
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onNoteCreated={handleNoteCreated}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          saveSettings(newSettings);
        }}
        onClearAllData={handleClearAllData}
      />

      <ApkExportModal
        isOpen={isApkOpen}
        onClose={() => setIsApkOpen(false)}
      />

      {isReviewOpen && lastAttempt && (
        <ReviewModal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          questions={lastAttemptQuestions}
          attempt={lastAttempt}
          initialFilter={reviewFilter}
        />
      )}
    </div>
  );
}
