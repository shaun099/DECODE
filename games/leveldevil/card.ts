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
  name: 'The Honest Floor',
  teaser: 'A simple platformer. The floor is right there.',
  rules: [
    'Reach the door. Three rooms.',
    'Arrow keys or A and D to move. Up, W or Space to jump.',
    'R restarts a room.',
    'Dying costs you nothing but time.',
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

  attempt: (s: State, p: { level?: number; deaths?: number; all?: boolean }) => {
    const deaths = Number.isFinite(p?.deaths) ? Number(p.deaths) : s.deaths;

    if (p?.all) {
      return { state: { ...s, deaths, finished: true }, correct: true, done: true };
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