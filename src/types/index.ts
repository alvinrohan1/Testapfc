/**
 * APFC Smart Test - Data Types & Models
 */

export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0, 1, 2, or 3
  explanation: string;
  topic: string;
  reference?: string;
}

export interface TestAttempt {
  id: string;
  setId: string;
  noteId: string;
  timestamp: string; // ISO string
  score: number; // net score with negative marking
  totalPossibleMarks: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  accuracy: number;
  timeTakenSeconds: number;
  timeAllocatedSeconds: number;
  userAnswers: Record<number, number | null>; // question index -> option index or null
  markingScheme: {
    positive: number;
    negative: number;
  };
  topicWiseStats: Record<string, { total: number; correct: number; incorrect: number }>;
  isCompleted: boolean;
}

export interface TestSet {
  id: string;
  noteId: string;
  setIndex: number; // 1 to 5
  title: string;
  questions: Question[]; // strictly 20 questions
  totalQuestions: number; // 20
  attempts: TestAttempt[];
}

export interface NoteDocument {
  id: string;
  filename: string;
  uploadDate: string;
  content: string;
  wordCount: number;
  charCount: number;
  status: 'pending' | 'generating' | 'completed' | 'error';
  generationProgress?: {
    currentSet: number;
    totalSets: number;
    progressPercent: number;
    message: string;
  };
  sets: TestSet[]; // strictly 5 sets of 20 = 100 questions
  errorMessage?: string;
}

export interface ActiveTestState {
  setId: string;
  noteId: string;
  setIndex: number;
  setTitle: string;
  startedAt: number;
  timeRemainingSeconds: number;
  totalDurationSeconds: number;
  currentQuestionIndex: number;
  answers: Record<number, number | null>;
  visitedQuestions: number[];
  markedForReview: number[];
  questions: Question[];
  mode: 'practice' | 'exam';
  attemptId: string;
}

export interface AppSettings {
  defaultTimerMinutes: number; // default: 30 minutes
  positiveMark: number;        // default: 1.0
  negativeMark: number;        // default: 0.33
  feedbackMode: 'immediate' | 'on_submit'; // default: 'immediate'
  vibrationEnabled: boolean;   // default: true
  theme: 'light' | 'dark' | 'system';
  fontSize: 'normal' | 'large';
  wakeLockEnabled: boolean;
}

export interface Bookmark {
  id: string;
  questionId: string;
  question: Question;
  noteTitle: string;
  savedAt: string;
}

export interface IncorrectQuestionRecord {
  id: string;
  question: Question;
  selectedOptionIndex: number;
  attemptDate: string;
  noteTitle: string;
  setTitle: string;
}
