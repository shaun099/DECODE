import type { CardModule } from '@/server/cards/types';
import { CLUES, SITE_PAGES, checkParts, isPasswordCorrect } from './logic';

interface PasswordState {
  guesses: string[];
  activePageId: string;
  results: boolean[] | null;
}

const card: CardModule = {
  id: 'password-finding',
  real: true,
  name: 'Password Finding',
  teaser: 'Explore a company website and recover the hidden password.',
  rules: [
    'Read the pages of the mock company website carefully.',
    'Use the clues to find all four password parts.',
    'Submit all four parts together when you are ready.',
    'Four incorrect submissions lock the task temporarily.',
    'You cannot leave once you begin.',
  ],
  maxWrong: 4,
  key: { value: 'P4', position: 8 },
  nextClue: 'The password was recovered. Keep decoding.',

  init: (): PasswordState => ({
    guesses: ['', '', '', ''],
    activePageId: SITE_PAGES[0].id,
    results: null,
  }),

  view: (state: PasswordState) => ({
    clues: CLUES,
    pages: SITE_PAGES,
    guesses: state.guesses,
    activePageId: state.activePageId,
    results: state.results,
  }),

  attempt: (state: PasswordState, payload: { guesses: string[] }) => {
    const guesses = Array.isArray(payload?.guesses)
      ? payload.guesses.slice(0, CLUES.length).map((guess) => String(guess ?? ''))
      : state.guesses;
    const results = checkParts(guesses);
    const nextState = { ...state, guesses, results };

    return {
      state: nextState,
      correct: isPasswordCorrect(guesses),
      done: isPasswordCorrect(guesses),
    };
  },
};

export default card;
