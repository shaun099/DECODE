import type { CardModule } from '@/server/cards/types';
import { COLS, PAIRS, PEEK_MS, TOTAL_MS, newBoard, type Tile } from './logic';

interface State {
  deck: Tile[];
  matched: number[];
  flipped: number[];
  peekUntil: number;
  moves: number;
  startedAt: number;
  runs: number;
}

const fresh = (now: number, runs = 0): State => ({
  deck: newBoard(),
  matched: [],
  flipped: [],
  peekUntil: 0,
  moves: 0,
  startedAt: now,
  runs,
});

const timeLeft = (s: State) => Math.max(0, TOTAL_MS - (Date.now() - s.startedAt));

function visible(s: State): number[] {
  const peeking = s.peekUntil > Date.now() ? s.flipped : s.flipped.slice(0, 1);
  return [...s.matched, ...(s.flipped.length === 2 ? peeking : s.flipped)];
}

const card: CardModule = {
  id: 'memory',
  real: true,
  name: 'The Pairs',
  teaser: 'Thirty-six tiles. Eighteen matches. Your memory is the only tool.',
  rules: [
    `${PAIRS} pairs hidden under ${PAIRS * 2} tiles.`,
    'Click two tiles. If they match they stay face up.',
    'If they do not match, you see them briefly, then they turn back.',
    'Wrong pairs cost nothing but time. Take as many as you like.',
    'Four minutes. Run the clock out and the board reshuffles.',
    'You cannot leave once you begin.',
  ],
  maxWrong: 9999,
  nextClue: '',

  init: (): State => fresh(Date.now()),

  view: (s: State) => {
    const show = visible(s);
    return {
      cols: COLS,
      total: s.deck.length,
      pairs: PAIRS,
      tiles: s.deck.map((t) => ({
        id: t.id,
        face: show.includes(t.id) ? t.face : null,
        matched: s.matched.includes(t.id),
      })),
      matchedCount: s.matched.length / 2,
      moves: s.moves,
      msLeft: timeLeft(s),
      peekMs: Math.max(0, s.peekUntil - Date.now()),
      runs: s.runs,
    };
  },

  attempt: (s: State, p: { tile?: number; action?: 'settle' }) => {
    const now = Date.now();

    if (timeLeft(s) <= 0) {
      return { state: fresh(now, s.runs + 1), correct: false, done: false };
    }

    if (p?.action === 'settle') {
      if (s.flipped.length < 2 || s.peekUntil > now) {
        return { state: s, correct: true, done: false };
      }
      return { state: { ...s, flipped: [], peekUntil: 0 }, correct: true, done: false };
    }

    const id = Number(p?.tile);
    if (!Number.isInteger(id) || id < 0 || id >= s.deck.length) {
      return { state: s, correct: true, done: false };
    }

    if (s.flipped.length === 2) return { state: s, correct: true, done: false };
    if (s.matched.includes(id) || s.flipped.includes(id)) {
      return { state: s, correct: true, done: false };
    }

    if (s.flipped.length === 0) {
      return { state: { ...s, flipped: [id] }, correct: true, done: false };
    }

    const first = s.flipped[0];
    const moves = s.moves + 1;

    if (s.deck[first].face === s.deck[id].face) {
      const matched = [...s.matched, first, id];
      return {
        state: { ...s, matched, flipped: [], peekUntil: 0, moves },
        correct: true,
        done: matched.length >= s.deck.length,
      };
    }

    return {
      state: { ...s, flipped: [first, id], peekUntil: now + PEEK_MS, moves },
      correct: true,
      done: false,
    };
  },
};

export default card;