import type { CardModule } from '@/server/cards/types';
import { COLS, LAYOUT, ROWS, WORDS, byKey, cellsOf, keyOf } from './logic';

interface State {
  solved: string[];                 // keys of answers already locked in
  letters: Record<number, string>;  // flat cell index -> confirmed letter
}

const card: CardModule = {
  id: 'crossword',
  real: true,
  name: 'ByteCross',
  rules: [
    `A ${ROWS} by ${COLS} grid with ${WORDS.length} answers to find.`,
    'Click a clue, type the answer, press Enter to submit it.',
    'A correct answer locks into the grid and fills letters for crossing words.',
    'Wrong guesses cost nothing. Guess as often as you like.',
    'The card is complete when every answer is in.',
    'You cannot leave once you begin.',
  ],
  maxWrong: 9999,                   // no lockout on this card
  key: { value: 'R9', position: 3 },
  nextClue: 'The computer isn\'t angry. It simply refuses to understand one tiny thing. Find the place where almost-correct becomes completely-wrong',

  init: (): State => ({ solved: [], letters: {} }),

  view: (s: State) => ({
    rows: ROWS,
    cols: COLS,
    open: LAYOUT.open,
    numbers: LAYOUT.numbers,
    letters: s.letters,             // only confirmed letters — never the solution
    solved: s.solved,
    total: WORDS.length,
    clues: WORDS.map((w) => ({
      key: keyOf(w),
      number: w.number,
      direction: w.direction,
      clue: w.clue,
      length: w.length,
      row: w.row,
      col: w.col,
    })),
  }),

  attempt: (s: State, p: { key: string; guess: string }) => {
    const w = byKey(p.key);

    // already solved, or an unknown clue — no effect, and no penalty
    if (!w || s.solved.includes(p.key)) {
      return { state: s, correct: true, done: false };
    }

    const guess = String(p.guess ?? '').trim().toUpperCase();

    // wrong word. `correct: true` so the server does not count an attempt
    if (guess !== w.word) {
      return { state: s, correct: true, done: false };
    }

    const letters = { ...s.letters };
    cellsOf(w).forEach((idx, i) => { letters[idx] = w.word[i]; });
    const solved = [...s.solved, p.key];

    return {
      state: { solved, letters },
      correct: true,
      done: solved.length >= WORDS.length,
    };
  },
};

export default card;