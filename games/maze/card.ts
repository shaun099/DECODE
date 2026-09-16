import type { CardModule } from '@/server/cards/types';
import {
  COLS, DOORS_L1, DOORS_L2, LIVES, ROWS, TOTAL_MS,
  generateMaze, placeDoors, questionFor, type Cell,
} from './logic';

interface State {
  level: 1 | 2;
  grid: string;
  doors: Cell[];
  opened: number[];      // indices into doors
  lives: number;
  startedAt: number;
  runs: number;
}

const build = (level: 1 | 2, now: number, base: Partial<State> = {}): State => {
  const grid = generateMaze();
  return {
    level,
    grid,
    doors: placeDoors(grid, level === 1 ? DOORS_L1 : DOORS_L2),
    opened: [],
    lives: LIVES,
    startedAt: base.startedAt ?? now,
    runs: base.runs ?? 0,
  };
};

const timeLeft = (s: State) => Math.max(0, TOTAL_MS - (Date.now() - s.startedAt));

const card: CardModule = {
  id: 'maze',
  real: true,
  name: 'The Long Corridor',
  teaser: 'Every locked door wants an answer before it opens.',
  rules: [
    'Two mazes. Five locked doors in the first, ten in the second.',
    'Move with the arrow keys or WASD.',
    'Walk into a locked door and it asks a question. Answer it to pass.',
    'A wrong answer costs one of three lives.',
    'Every door must be open before the exit will accept you.',
    'Five minutes for both mazes. Lose all lives or run the clock out and it starts again.',
    'You cannot leave once you begin.',
  ],
  maxWrong: 3,
  key: { value: 'M2', position: 2 },
  nextClue: 'Next: twenty intersecting answers that hold each other up across the grid.',

  init: (): State => build(1, Date.now()),

  view: (s: State) => ({
    rows: ROWS,
    cols: COLS,
    level: s.level,
    grid: s.grid,
    // positions only — the question text comes with it, the answer never does
    doors: s.doors.map((d, i) => ({
      r: d.r,
      c: d.c,
      open: s.opened.includes(i),
      question: questionFor(s.level, i).q,
      options: questionFor(s.level, i).options,
    })),
    opened: s.opened.length,
    totalDoors: s.doors.length,
    lives: s.lives,
    msLeft: timeLeft(s),
    runs: s.runs,
    cleared: s.level === 1 ? 0 : DOORS_L1,
  }),

  attempt: (s: State, p: { door?: number; pick?: number; action?: 'exit' }) => {
    const now = Date.now();

    /* the clock ran out — start over */
    if (timeLeft(s) <= 0) {
      return { state: build(1, now, { runs: s.runs + 1 }), correct: false, done: false };
    }

    /* reached the exit */
    if (p?.action === 'exit') {
      if (s.opened.length < s.doors.length) {
        return { state: s, correct: true, done: false };   // not a mistake, just early
      }
      if (s.level === 2) return { state: s, correct: true, done: true };
      return {
        state: build(2, now, { startedAt: s.startedAt, runs: s.runs }),
        correct: true,
        done: false,
      };
    }

    /* answering a door */
    const i = Number(p?.door);
    const pick = Number(p?.pick);
    if (!Number.isInteger(i) || i < 0 || i >= s.doors.length) {
      return { state: s, correct: true, done: false };
    }
    if (s.opened.includes(i)) return { state: s, correct: true, done: false };

    if (pick === questionFor(s.level, i).answer) {
      return { state: { ...s, opened: [...s.opened, i] }, correct: true, done: false };
    }

    const lives = s.lives - 1;
    if (lives <= 0) {
      return { state: build(1, now, { runs: s.runs + 1 }), correct: false, done: false };
    }
    return { state: { ...s, lives }, correct: false, done: false };
  },
};

export default card;