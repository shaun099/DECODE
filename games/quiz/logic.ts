// Round logic for the tech quiz: draw questions without repeats, track score.

import { MEDIUM_QUESTION_POOL, type QuizQuestion } from "./questions";

export const QUESTIONS_PER_ROUND = 15;
export const PASS_THRESHOLD = 10;

/** Fisher-Yates shuffle of a copy — never mutates the pool. */
export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Rearrange a question's options into a random order so the correct answer is
 * not always in the same position. Returns a new question whose `answer` index
 * still points at the correct option text.
 */
export function shuffleQuestion(q: QuizQuestion, forcedCorrectIndex?: number): QuizQuestion {
  const correctText = q.options[q.answer];
  const distractors = shuffle(q.options.filter((_, index) => index !== q.answer));
  const correctIndex = forcedCorrectIndex ?? Math.floor(Math.random() * q.options.length);
  const options = [
    ...distractors.slice(0, correctIndex),
    correctText,
    ...distractors.slice(correctIndex),
  ];
  return {
    question: q.question,
    options,
    answer: options.indexOf(correctText),
  };
}

/**
 * Draw a fresh round of QUESTIONS_PER_ROUND questions.
 * Draws from the full pool without repeats within the round; across rounds
 * previously seen questions are avoided when possible so questions do not
 * repeat until the pool is exhausted.
 */
export function drawRound(seenQuestionIds: Set<number> = new Set()): {
  questions: QuizQuestion[];
  questionIds: number[];
  seen: Set<number>;
} {
  const fresh: number[] = [];
  const repeats: number[] = [];

  MEDIUM_QUESTION_POOL.forEach((_, id) => {
    if (seenQuestionIds.has(id)) repeats.push(id);
    else fresh.push(id);
  });

  const chosen = [
    ...shuffle(fresh),
    ...shuffle(repeats), // only used if the pool is exhausted
  ].slice(0, QUESTIONS_PER_ROUND);

  // Keep each round balanced while randomizing which question gets each slot.
  // Fifteen questions produce four of indexes 0-2 and three of index 3.
  const answerPositions = shuffle(
    Array.from({ length: QUESTIONS_PER_ROUND }, (_, index) => index % 4),
  );

  const seen = new Set(seenQuestionIds);
  chosen.forEach((id) => seen.add(id));

  return {
    questions: chosen.map((id, index) =>
      shuffleQuestion(MEDIUM_QUESTION_POOL[id], answerPositions[index]),
    ),
    questionIds: chosen,
    seen,
  };
}
