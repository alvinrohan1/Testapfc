import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMarks,
  calculateAccuracy,
  getOptionFeedbackState,
  validateQuestion,
  partitionIntoFiveSets,
  shuffleAttempt,
  type Question
} from './scoring.ts';

test('calculateMarks correctly applies standard UPSC APFC negative marking', () => {
  // 20 questions total: 15 correct, 5 incorrect with +1 / -0.33
  // Expected: 15 * 1 - 5 * 0.33 = 15 - 1.65 = 13.35
  const marks = calculateMarks(15, 5, 1, 0.33);
  assert.equal(marks, 13.35);

  // Perfect score: 20 correct, 0 incorrect
  assert.equal(calculateMarks(20, 0, 1, 0.33), 20);

  // All wrong: 0 correct, 20 incorrect
  assert.equal(calculateMarks(0, 20, 1, 0.33), -6.6);

  // Custom scheme: +2 for correct, -0.66 for wrong
  assert.equal(calculateMarks(10, 5, 2, 0.66), 16.7);
});

test('calculateAccuracy returns accurate rounded percentages', () => {
  assert.equal(calculateAccuracy(15, 20), 75);
  assert.equal(calculateAccuracy(1, 3), 33.3);
  assert.equal(calculateAccuracy(0, 10), 0);
  assert.equal(calculateAccuracy(0, 0), 0);
});

test('getOptionFeedbackState strictly obeys critical feedback rules', () => {
  // Scenario 1: User chose option 1 (correctIndex = 1) -> Correct!
  // Option 1 must be 'selected_correct' (Green)
  assert.equal(getOptionFeedbackState(1, 1, 1, true), 'selected_correct');
  // Other options must be 'unselected_wrong'
  assert.equal(getOptionFeedbackState(0, 1, 1, true), 'unselected_wrong');
  assert.equal(getOptionFeedbackState(2, 1, 1, true), 'unselected_wrong');

  // Scenario 2: User chose option 2 (correctIndex = 0) -> Wrong!
  // Option 2 (user's wrong choice) must be 'selected_wrong' (Red)
  assert.equal(getOptionFeedbackState(2, 2, 0, true), 'selected_wrong');
  // Option 0 (the actual correct answer) MUST be 'actual_correct' (Green)
  assert.equal(getOptionFeedbackState(0, 2, 0, true), 'actual_correct');
  // Other unselected options (1, 3) must be unselected_wrong
  assert.equal(getOptionFeedbackState(1, 2, 0, true), 'unselected_wrong');
  assert.equal(getOptionFeedbackState(3, 2, 0, true), 'unselected_wrong');

  // Scenario 3: Not locked or submitted -> neutral
  assert.equal(getOptionFeedbackState(0, null, 1, false), 'neutral');
});

test('validateQuestion verifies 4 options, valid correctAnswer index, and non-empty explanation', () => {
  const validQ: Question = {
    id: 'q1',
    question: 'Under EPF Act 1952, what is the statutory wage ceiling?',
    options: ['Rs 6,500', 'Rs 15,000', 'Rs 21,000', 'Rs 25,000'],
    correctAnswer: 1,
    explanation: 'The current statutory monthly wage ceiling is Rs 15,000.',
    topic: 'Labour Laws'
  };
  assert.equal(validateQuestion(validQ).isValid, true);

  // Missing an option (only 3 options)
  const invalidOptions = { ...validQ, options: ['A', 'B', 'C'] };
  assert.equal(validateQuestion(invalidOptions).isValid, false);

  // Invalid correctAnswer out of bounds (4)
  const invalidAnswer = { ...validQ, correctAnswer: 4 };
  assert.equal(validateQuestion(invalidAnswer).isValid, false);

  // Empty question text
  const emptyQ = { ...validQ, question: '   ' };
  assert.equal(validateQuestion(emptyQ).isValid, false);

  // Empty explanation
  const emptyExpl = { ...validQ, explanation: '' };
  assert.equal(validateQuestion(emptyExpl).isValid, false);
});

test('partitionIntoFiveSets divides exactly 100 questions into 5 sets of 20', () => {
  const sample100: Question[] = Array.from({ length: 100 }, (_, i) => ({
    id: `q-${i + 1}`,
    question: `Sample APFC Question ${i + 1}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: i % 4,
    explanation: `Explanation for question ${i + 1}`,
    topic: 'EPFO Syllabus'
  }));

  const sets = partitionIntoFiveSets(sample100);
  assert.equal(sets.length, 5);
  for (let s = 0; s < 5; s++) {
    assert.equal(sets[s].length, 20);
    assert.equal(sets[s][0].id, `q-${s * 20 + 1}`);
  }

  // Should throw if not exactly 100
  assert.throws(() => partitionIntoFiveSets(sample100.slice(0, 99)));
});

test('shuffleAttempt shuffles questions and options while preserving correct answer mapping', () => {
  const sampleQuestions: Question[] = [
    {
      id: 'q-test-1',
      question: 'Which schedule of the Factories Act 1948 lists hazardous processes?',
      options: ['First Schedule', 'Second Schedule', 'Third Schedule', 'Fourth Schedule'],
      correctAnswer: 0, // 'First Schedule'
      explanation: 'First Schedule lists industries involving hazardous processes.',
      topic: 'Labour Laws'
    },
    {
      id: 'q-test-2',
      question: 'What is the maximum gratuity payable under Payment of Gratuity Act 1972?',
      options: ['Rs 10 Lakh', 'Rs 15 Lakh', 'Rs 20 Lakh', 'Rs 25 Lakh'],
      correctAnswer: 2, // 'Rs 20 Lakh'
      explanation: 'The ceiling is Rs 20 Lakhs.',
      topic: 'Social Security'
    }
  ];

  const shuffled = shuffleAttempt(sampleQuestions);
  assert.equal(shuffled.length, 2);

  for (const q of shuffled) {
    assert.equal(q.options.length, 4);
    // Find matching original question
    const orig = sampleQuestions.find(origQ => origQ.question === q.question);
    assert.ok(orig);
    const expectedCorrectText = orig.options[orig.correctAnswer];
    // The option at q.correctAnswer must match expectedCorrectText!
    assert.equal(q.options[q.correctAnswer], expectedCorrectText);
  }
});
