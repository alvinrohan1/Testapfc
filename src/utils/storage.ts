import {
  NoteDocument,
  TestSet,
  TestAttempt,
  ActiveTestState,
  AppSettings,
  Bookmark,
  IncorrectQuestionRecord
} from '../types/index.ts';
import { DEMO_TEST_SET } from './demoData.ts';

const KEYS = {
  NOTES: 'apfc_notes_v1',
  DEMO_ATTEMPTS: 'apfc_demo_attempts_v1',
  ACTIVE_TEST: 'apfc_active_test_v1',
  SETTINGS: 'apfc_settings_v1',
  BOOKMARKS: 'apfc_bookmarks_v1',
  INCORRECT_RECORDS: 'apfc_incorrect_records_v1'
};

export const DEFAULT_SETTINGS: AppSettings = {
  defaultTimerMinutes: 30, // 30 mins for 20 questions
  positiveMark: 1.0,       // +1 for correct
  negativeMark: 0.33,      // -0.33 for wrong
  feedbackMode: 'immediate', // immediate lock and feedback
  vibrationEnabled: true,
  theme: 'system',
  fontSize: 'normal',
  wakeLockEnabled: true
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function loadNotes(): NoteDocument[] {
  try {
    const raw = localStorage.getItem(KEYS.NOTES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load notes:', err);
  }
  return [];
}

export function saveNotes(notes: NoteDocument[]): void {
  try {
    localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save notes:', err);
  }
}

export function saveNote(note: NoteDocument): void {
  const notes = loadNotes();
  const index = notes.findIndex(n => n.id === note.id);
  if (index >= 0) {
    notes[index] = note;
  } else {
    notes.unshift(note);
  }
  saveNotes(notes);
}

export function deleteNote(noteId: string): void {
  const notes = loadNotes().filter(n => n.id !== noteId);
  saveNotes(notes);
  // Also clear active test if it was for this note
  const active = loadActiveTest();
  if (active && active.noteId === noteId) {
    clearActiveTest();
  }
}

export function loadDemoTestSet(): TestSet {
  try {
    const raw = localStorage.getItem(KEYS.DEMO_ATTEMPTS);
    if (raw) {
      const attempts: TestAttempt[] = JSON.parse(raw);
      return {
        ...DEMO_TEST_SET,
        attempts
      };
    }
  } catch (err) {
    console.error('Failed to load demo attempts:', err);
  }
  return DEMO_TEST_SET;
}

export function saveDemoAttempt(attempt: TestAttempt): void {
  try {
    const current = loadDemoTestSet();
    const attempts = [attempt, ...(current.attempts || [])];
    localStorage.setItem(KEYS.DEMO_ATTEMPTS, JSON.stringify(attempts));
  } catch (err) {
    console.error('Failed to save demo attempt:', err);
  }
}

export function saveSetAttempt(noteId: string, setId: string, attempt: TestAttempt): void {
  if (noteId === 'demo-note' || setId === 'demo-set-1') {
    saveDemoAttempt(attempt);
    return;
  }

  const notes = loadNotes();
  const noteIndex = notes.findIndex(n => n.id === noteId);
  if (noteIndex >= 0) {
    const note = notes[noteIndex];
    const setIndex = note.sets.findIndex(s => s.id === setId);
    if (setIndex >= 0) {
      note.sets[setIndex].attempts = [attempt, ...(note.sets[setIndex].attempts || [])];
      saveNotes(notes);
    }
  }
}

export function loadActiveTest(): ActiveTestState | null {
  try {
    const raw = localStorage.getItem(KEYS.ACTIVE_TEST);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load active test:', err);
  }
  return null;
}

export function saveActiveTest(state: ActiveTestState): void {
  try {
    localStorage.setItem(KEYS.ACTIVE_TEST, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save active test:', err);
  }
}

export function clearActiveTest(): void {
  try {
    localStorage.removeItem(KEYS.ACTIVE_TEST);
  } catch (err) {
    console.error('Failed to clear active test:', err);
  }
}

export function loadBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(KEYS.BOOKMARKS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load bookmarks:', err);
  }
  return [];
}

export function toggleBookmark(bookmark: Omit<Bookmark, 'id' | 'savedAt'>): boolean {
  const bookmarks = loadBookmarks();
  const existingIdx = bookmarks.findIndex(b => b.questionId === bookmark.questionId);
  if (existingIdx >= 0) {
    bookmarks.splice(existingIdx, 1);
    localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    return false; // removed
  } else {
    bookmarks.unshift({
      ...bookmark,
      id: `bm-${Date.now()}`,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    return true; // added
  }
}

export function isBookmarked(questionId: string): boolean {
  const bookmarks = loadBookmarks();
  return bookmarks.some(b => b.questionId === questionId);
}

export function recordIncorrectAnswers(records: IncorrectQuestionRecord[]): void {
  try {
    const existingRaw = localStorage.getItem(KEYS.INCORRECT_RECORDS);
    let list: IncorrectQuestionRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
    // Deduplicate by question text
    for (const record of records) {
      const idx = list.findIndex(r => r.question.question === record.question.question);
      if (idx >= 0) {
        list[idx] = record;
      } else {
        list.unshift(record);
      }
    }
    // Limit to latest 300 to manage storage
    if (list.length > 300) list = list.slice(0, 300);
    localStorage.setItem(KEYS.INCORRECT_RECORDS, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to record incorrect answers:', err);
  }
}

export function loadIncorrectRecords(): IncorrectQuestionRecord[] {
  try {
    const raw = localStorage.getItem(KEYS.INCORRECT_RECORDS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load incorrect records:', err);
  }
  return [];
}

export function clearIncorrectRecord(recordId: string): void {
  const list = loadIncorrectRecords().filter(r => r.id !== recordId);
  localStorage.setItem(KEYS.INCORRECT_RECORDS, JSON.stringify(list));
}
