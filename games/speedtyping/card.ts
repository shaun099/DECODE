import type { CardModule } from '@/server/cards/types';
import { LEVEL_COUNT, SENTENCES } from './logic';

interface State {
  cleared: number[];
  finished: boolean;
}

const card: CardModule = {
  id: 'speedtyping',
  real: false,
  name: 'Speed Typing',
  teaser: 'Type fast. 15 seconds per sentence. Four levels.',
  rules: [
    'Type the sentence exactly — case and punctuation matter.',
    'You have 15 seconds per level; the clock starts on first keystroke.',
    'Finish all four levels in order to pass.',
    'Copy-paste is blocked. You must type.',
    'You cannot leave once you begin.',
  ],
  maxWrong: 99,
  nextClue: '',

  init: (): State => ({ cleared: [], finished: false }),

  view: (s: State) => ({
    cleared: s.cleared,
    total: LEVEL_COUNT,
    finished: s.finished,
    sentences: SENTENCES,
  }),

  attempt: (s: State, p: { level?: number; reset?: boolean }) => {
    if (p?.reset) {
      if (s.finished) return { state: { ...s }, correct: true, done: true };
      return { state: { cleared: [], finished: false }, correct: true, done: false };
    }

    const lv = Number(p?.level);
    if (!Number.isInteger(lv) || lv < 0 || lv >= LEVEL_COUNT || s.cleared.includes(lv)) {
      return { state: { ...s }, correct: true, done: false };
    }

    const cleared = [...s.cleared, lv].sort((a, b) => a - b);
    const done = cleared.length >= LEVEL_COUNT;
    return {
      state: { cleared, finished: done },
      correct: true,
      done,
    };
  },
};

export default card;
