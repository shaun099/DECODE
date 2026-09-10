import type { CardModule } from '../index';
import { MEDIUM_QUESTION_POOL } from '@/games/tech_quiz/questions';
import { shuffle, shuffleQuestion } from '@/games/tech_quiz/logic';

const PER_ROUND = 10;
const PASS = 7;

const draw = () =>
  shuffle(MEDIUM_QUESTION_POOL).slice(0, PER_ROUND).map((q) => shuffleQuestion(q));

const card: CardModule = {
  id: 'quiz',
  real: true,
  name: 'The Examiner',
  teaser: 'It asks. It does not repeat itself.',
  ui: 'mcq',

  rules: [
    `${PER_ROUND} questions drawn at random. ${PASS} correct to pass.`,
    'A wrong answer moves you on. It does not end the round.',
    'Reach the end without passing and the round redraws from the start.',
    'Six wrong answers and your terminal locks for one minute.',
    'You cannot leave once you begin.',
  ],
  maxWrong: 6,

  key: { value: 'C8', position: 4 },
  nextClue: 'Next: the one that will not build.',

  init: () => ({ qs: draw(), i: 0, score: 0 }),

  view: (s) => ({
    index: s.i,
    total: PER_ROUND,
    score: s.score,
    need: PASS,
    question: s.qs[s.i].question,
    options: s.qs[s.i].options,        // the answer index never leaves the server
  }),

  attempt: (s, p: { pick: number }) => {
    const right = p.pick === s.qs[s.i].answer;
    const score = right ? s.score + 1 : s.score;

    if (score >= PASS) return { state: { ...s, score }, correct: true, done: true };

    const next = s.i + 1;
    if (next >= PER_ROUND) {
      return { state: { qs: draw(), i: 0, score: 0 }, correct: right, done: false };
    }
    return { state: { ...s, i: next, score }, correct: right, done: false };
  },
};

export default card;