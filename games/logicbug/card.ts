import type { CardModule } from '@/server/cards/types';
import { BUGS } from './logic';

const card: CardModule = {
  id: 'logicbug',
  real: true,
  name: 'The Polite Liar',
  teaser: 'Programs that run perfectly and answer wrongly.',
  rules: [
    `${BUGS.length} Python programs. Every one runs. Every one is wrong.`,
    'Read the brief first — it says what the program should do.',
    'Click the single line that disagrees with the brief.',
    'Four wrong clicks and your terminal locks for one minute.',
    'You cannot leave once you begin.',
  ],
  maxWrong: 4,
  key: { value: 'A4', position: 2 },
  nextClue: 'Next: five letters, none of them honest.',

  init: () => ({ i: 0, wrong: [] as number[] }),

  view: (s) => ({
    index: s.i,
    total: BUGS.length,
    title: BUGS[s.i].title,
    spec: BUGS[s.i].spec,
    lines: BUGS[s.i].lines,
    wrong: s.wrong,
  }),

  attempt: (s, p: { line: number }) => {
    if (p.line !== BUGS[s.i].badLine) {
      return { state: { ...s, wrong: [...s.wrong, p.line] }, correct: false, done: false };
    }
    const next = s.i + 1;
    return { state: { i: next, wrong: [] }, correct: true, done: next >= BUGS.length };
  },
};

export default card;