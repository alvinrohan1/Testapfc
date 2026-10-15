/**
 * Pure logic for APFC Smart Test scoring, validation, and feedback calculations.
 * Decoupled from UI to allow fast deterministic unit testing.
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

export interface MarkingScheme {
  positive: number; // default +1
  negative: number; // default 0.33
}

/**
 * Calculates net score with negative marking according to UPSC APFC rules.
 * Net Score = (Correct * Positive) - (Incorrect * Negative).
 * Unanswered questions get 0.
 */
export function calculateMarks(
  correctCount: number,
  incorrectCount: number,
  positiveMark: number = 1.0,
  negativeMark: number = 0.33
): number {
  if (correctCount < 0) correctCount = 0;
  if (incorrectCount < 0) incorrectCount = 0;
  const raw = (correctCount * positiveMark) - (incorrectCount * negativeMark);
  // Round to 2 decimal places to avoid floating point precision artifacts
  return Math.round(raw * 100) / 100;
}

/**
 * Calculates accuracy percentage based on attempted questions.
 */
export function calculateAccuracy(correctCount: number, totalAttempted: number): number {
  if (totalAttempted <= 0) return 0;
  const acc = (correctCount / totalAttempted) * 100;
  return Math.round(acc * 10) / 10;
}

export type OptionFeedbackState =
  | 'unanswered'       // not yet answered, neutral option
  | 'selected_correct' // user clicked this option and it is correct (Green)
  | 'selected_wrong'   // user clicked this option and it is wrong (Red)
  | 'actual_correct'   // user picked wrong option; this option is revealed as correct (Green)
  | 'unselected_wrong' // neutral unselected option after question is locked
  | 'neutral';

/**
 * Core Answer Feedback Logic — CRITICAL REQUIREMENT:
 * - When user selects an answer, immediately lock question and display feedback:
 * - If selected answer is correct -> highlight that option GREEN.
 * - If selected answer is wrong -> highlight selected option RED AND highlight actual correct option GREEN.
 * - Never show the correct option in red. Never show only the selected answer.
 */
export function getOptionFeedbackState(
  optionIndex: number,
  selectedIndex: number | null,
  correctIndex: number,
  isLockedOrSubmitted: boolean
): OptionFeedbackState {
  if (!isLockedOrSubmitted || selectedIndex === null) {
    return 'neutral';
  }

  const isSelected = selectedIndex === optionIndex;
  const isCorrect = optionIndex === correctIndex;

  if (isSelected && isCorrect) {
    return 'selected_correct';
  }

  if (isSelected && !isCorrect) {
    return 'selected_wrong';
  }

  if (!isSelected && isCorrect) {
    return 'actual_correct';
  }

  return 'unselected_wrong';
}

/**
 * Validates that a question has strictly 4 non-empty options,
 * a valid correctAnswer index (0 to 3), and non-empty question and explanation.
 */
export function validateQuestion(q: any): { isValid: boolean; error?: string } {
  if (!q || typeof q !== 'object') {
    return { isValid: false, error: 'Question object is missing or invalid' };
  }
  if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
    return { isValid: false, error: 'Question text is empty' };
  }
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    return { isValid: false, error: `Must have exactly 4 options, found ${q.options ? q.options.length : 0}` };
  }
  for (let i = 0; i < 4; i++) {
    if (typeof q.options[i] !== 'string' || q.options[i].trim().length === 0) {
      return { isValid: false, error: `Option ${i + 1} is empty` };
    }
  }
  if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3 || !Number.isInteger(q.correctAnswer)) {
    return { isValid: false, error: `Invalid correctAnswer index: ${q.correctAnswer} (must be 0, 1, 2, or 3)` };
  }
  if (!q.explanation || typeof q.explanation !== 'string' || q.explanation.trim().length === 0) {
    return { isValid: false, error: 'Explanation is missing or empty' };
  }
  return { isValid: true };
}

/**
 * Validates that a list of 100 questions can be partitioned into exactly 5 sets of 20 questions each.
 */
export function partitionIntoFiveSets(questions: Question[]): Question[][] {
  if (questions.length !== 100) {
    throw new Error(`Expected exactly 100 questions to partition into 5 sets, received ${questions.length}`);
  }
  const sets: Question[][] = [];
  for (let i = 0; i < 5; i++) {
    const chunk = questions.slice(i * 20, (i + 1) * 20);
    if (chunk.length !== 20) {
      throw new Error(`Set ${i + 1} does not have exactly 20 questions`);
    }
    sets.push(chunk);
  }
  return sets;
}

/**
 * Reattempt helper: Randomizes question order and option order safely,
 * recalculating the correctAnswer index so scoring remains 100% accurate.
 */
export function shuffleAttempt(questions: Question[]): Question[] {
  // First shuffle question order
  const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);

  return shuffledQuestions.map((q, idx) => {
    // Keep track of the original correct option text
    const correctOptionText = q.options[q.correctAnswer];

    // Create array of indexed options to shuffle
    const indexedOptions = q.options.map((text, i) => ({ text, originalIndex: i }));
    const shuffledIndexedOptions = [...indexedOptions].sort(() => Math.random() - 0.5);

    const newOptions: [string, string, string, string] = [
      shuffledIndexedOptions[0].text,
      shuffledIndexedOptions[1].text,
      shuffledIndexedOptions[2].text,
      shuffledIndexedOptions[3].text
    ];

    const newCorrectAnswer = newOptions.findIndex(text => text === correctOptionText);

    return {
      ...q,
      id: `${q.id}-reattempt-${Date.now()}-${idx}`,
      options: newOptions,
      correctAnswer: newCorrectAnswer >= 0 ? newCorrectAnswer : 0
    };
  });
}
