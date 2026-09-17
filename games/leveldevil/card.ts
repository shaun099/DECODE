import type { CardModule } from '@/server/cards/types';

const LEVEL_CAP = 3;

interface State {
  cleared: number[];
  deaths: number;
  finished: boolean;
}

const card: CardModule = {
  id: 'leveldevil',
  real: false,                       // a platformer has no verifiable answer
  name: 'The Devil\'s Contract',
  rules: [
    'Reach the door. Three rooms.',
    'Arrow keys or A and D to move. Up, W or Space to jump.',
    'R restarts a room.',
    'Dying sends you back to room 1.',
    'You cannot leave once you begin.',
  ],
  maxWrong: 99,
  nextClue: '',

  init: (): State => ({ cleared: [], deaths: 0, finished: false }),

  view: (s: State) => ({
    cleared: s.cleared,
    deaths: s.deaths,
    total: LEVEL_CAP,
    finished: s.finished,
  }),

  attempt: (s: State, p: { level?: number; deaths?: number; all?: boolean; reset?: boolean }) => {
    const deaths = Number.isFinite(p?.deaths) ? Number(p.deaths) : s.deaths;

    // Death resets progress: any death sends you back to room 1.
    if (p?.reset) {
      if (s.finished) return { state: { ...s, deaths }, correct: true, done: true };
      return { state: { cleared: [], deaths, finished: false }, correct: true, done: false };
    }

    if (p?.all) {
      // Fill cleared so view shows 3/3 even if the final onLevelCleared was dropped.
      const cleared = s.cleared.length >= LEVEL_CAP
        ? s.cleared
        : Array.from({ length: LEVEL_CAP }, (_, i) => i);
      return { state: { cleared, deaths, finished: true }, correct: true, done: true };
    }

    const lv = Number(p?.level);
    if (!Number.isInteger(lv) || lv < 0 || lv >= LEVEL_CAP || s.cleared.includes(lv)) {
      return { state: { ...s, deaths }, correct: true, done: false };
    }

    const cleared = [...s.cleared, lv];
    return {
      state: { cleared, deaths, finished: cleared.length >= LEVEL_CAP },
      correct: true,
      done: cleared.length >= LEVEL_CAP,
    };
  },
};

export default card;