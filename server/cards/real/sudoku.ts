import type { CardModule } from '../index';
import { generatePuzzle, isBoardSolved } from '@/games/sudoku/logic';

const card: CardModule = {
  id: 'sudoku',
  real: true,
  name: 'The Dance of Numbers',
  teaser: 'Nine rows, nine columns, and nothing may appear twice.',
  ui: 'sudoku',

  rules: [
    'One grid. Every row, column and 3×3 box must hold 1 to 9 with no repeats.',
    'The numbers already printed cannot be changed.',
    'Submit only when the grid is complete.',
    'An incomplete grid is rejected, but it does not cost you an attempt.',
    'You cannot leave once you begin.',
  ],
  maxWrong: 99,

  key: { value: 'H1', position: 5 },
  nextClue: 'You hold everything now. Assemble it.',

  init: () => {
    const { puzzle } = generatePuzzle(42);
    return { puzzle };
  },

  view: (s) => ({ puzzle: s.puzzle }),

  attempt: (s, p: { board: number[] }) => {
    const ok =
      Array.isArray(p.board) &&
      p.board.length === 81 &&
      s.puzzle.every((v: number, i: number) => v === 0 || v === p.board[i]) &&
      isBoardSolved(p.board);
    return { state: s, correct: ok, done: ok };
  },
};

export default card;