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
  nextClue: 'Next: a labyrinth of locked doors where every step requires an answer.',

  init: () => ({ i: 0, wrong: [] as number[] }),

  view: (s) => {
    const bug = BUGS[s.i];
    if (!bug) {
      return {
        index: s.i,
        total: BUGS.length,
        title: 'Complete',
        lines: [],
        wrong: s.wrong,
      };
    }

    return {
      index: s.i,
      total: BUGS.length,
      title: bug.brief,
      lines: bug.lines,      // badLine and reason never leave the server
      wrong: s.wrong,
    };
  },

  attempt: (s, p: { line: number }) => {
    const bug = BUGS[s.i];
    if (!bug) {
      return { state: s, correct: false, done: true };
    }

    if (p.line !== bug.badLine) {
      return { state: { ...s, wrong: [...s.wrong, p.line] }, correct: false, done: false };
    }
    const next = s.i + 1;
    return { state: { i: next, wrong: [] }, correct: true, done: next >= BUGS.length };
  },
};

export default card;