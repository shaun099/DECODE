import type { CardModule } from '@/server/cards/types';
import { MEDIUM_QUESTION_POOL } from './questions';
import { shuffle, shuffleQuestion } from './logic';

const PER_ROUND = 10;
const PASS = 7;
const MAX_WRONG = 4; // 4 wrong answers out of 10 makes passing impossible (10 - 4 = 6 < 7)

const draw = () =>
  shuffle(MEDIUM_QUESTION_POOL).slice(0, PER_ROUND).map((q) => shuffleQuestion(q));

const card: CardModule = {
  id: 'quiz',
  real: true,
  name: 'The Examiner',
  teaser: 'It asks. It does not repeat itself.',
  rules: [
    `${PER_ROUND} questions drawn at random. ${PASS} correct to pass.`,
    'A wrong answer moves you on. It does not end the round.',
    `${MAX_WRONG} wrong answers in a round locks your terminal for one minute.`,
    'Reach the end without 7 correct and your terminal locks for one minute.',
    'You cannot leave once you begin.',
  ],
  maxWrong: MAX_WRONG,
  key: { value: 'C8', position: 4 },
  nextClue: 'Next: the one that will not build.',

  init: () => ({ qs: draw(), i: 0, score: 0, wrongCount: 0 }),

  view: (s) => ({
    index: s.i,
    total: PER_ROUND,
    score: s.score,
    need: PASS,
    wrongCount: s.wrongCount ?? 0,
    maxWrong: MAX_WRONG,
    question: s.qs[s.i]?.question ?? '',
    options: s.qs[s.i]?.options ?? [],
  }),

  attempt: (s, p: { pick: number }) => {
    const q = s.qs[s.i];
    const right = p.pick === q.answer;
    const score = right ? s.score + 1 : s.score;
    const wrongCount = right ? (s.wrongCount ?? 0) : (s.wrongCount ?? 0) + 1;

    // Victory condition: reached 7 correct answers
    if (score >= PASS) {
      return {
        state: { ...s, score, wrongCount },
        correct: true,
        done: true,
        lastAnswer: q.answer,
        lastPick: p.pick,
      };
    }

    const next = s.i + 1;

    // Failure conditions:
    // 1. Made 4 wrong answers (mathematically impossible to reach 7/10)
    // 2. Reached the end of 10 questions without reaching 7 correct
    if (wrongCount >= MAX_WRONG || next >= PER_ROUND) {
      return {
        state: card.init(),
        correct: right,
        done: false,
        exhausted: true, // triggers lockout on server
        lastAnswer: q.answer,
        lastPick: p.pick,
      };
    }

    return {
      state: { ...s, i: next, score, wrongCount },
      correct: right,
      done: false,
      lastAnswer: q.answer,
      lastPick: p.pick,
    };
  },
};

export default card;