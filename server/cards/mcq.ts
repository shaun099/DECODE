import type { CardModule } from './index';

const Q = [
  { q: 'What does the % operator compute?', o: ['A percentage', 'The remainder after division', 'The power', 'The average'], a: 1 },
  { q: 'What does len() return for a list of 5 items?', o: ['4', '5', '6', 'The last item'], a: 1 },
];

const card: CardModule = {
  id: 'quiz',
  real: true,
  name: 'The Examiner',
  teaser: 'It asks. It does not repeat itself.',
  ui: 'mcq',
  key: { value: '7c02', position: 1 },
  nextClue: 'Next: the one that will not build.',

  init: () => ({ i: 0 }),

  view: (s) => ({
    index: s.i,
    total: Q.length,
    question: Q[s.i].q,
    options: Q[s.i].o,               // `a` is never sent
  }),

  attempt: (s, p: { pick: number }) => {
    if (p.pick !== Q[s.i].a) return { state: s, correct: false, done: false };
    const next = s.i + 1;
    return { state: { i: next }, correct: true, done: next >= Q.length };
  },
};

export default card;