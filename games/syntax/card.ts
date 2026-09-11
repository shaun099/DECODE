import type { CardModule } from '@/server/cards/types';
import { BUGS } from './logic';

const card: CardModule = {
  id: 'syntax',
  real: true,
  name: 'The Compiler',
  teaser: 'Snippets that will not build. One line each is at fault.',
  rules: [
    `${BUGS.length} C snippets. Exactly one line in each will not compile.`,
    'Click the line at fault. Blank lines cannot be clicked.',
    'Four wrong clicks and your terminal locks for one minute.',
    'A lock resets this task to the first snippet.',
    'You cannot leave once you begin.',
  ],
  maxWrong: 4,
  key: { value: 'K7', position: 1 },
  nextClue: 'Next: the one that runs perfectly and answers wrongly.',

  init: () => ({ i: 0, wrong: [] as number[] }),

  view: (s) => ({
    index: s.i,
    total: BUGS.length,
    title: BUGS[s.i].brief,
    lines: BUGS[s.i].lines,      // badLine and reason never leave the server
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