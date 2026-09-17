import type { CardModule } from '@/server/cards/types';
import { CLUES, FOOTER_NOTE, SITE_PAGES, checkParts, isPasswordCorrect } from './logic';

interface State {
    guesses: string[];
    results: boolean[] | null;
    tries: number;
}

const card: CardModule = {
    id: 'password',
    real: false,
    name: 'The Open Door',
   // teaser: 'A company website that says more than it means to.',
    rules: [
        'A four-part password is hidden across the pages of a company website.',
        'Read every page. The answers are in the text, never stated as answers.',
        'Fill all four parts, then submit them together.',
        'After a submission you are told which parts were right, not what they should be.',
        'Four wrong submissions and your terminal locks for one minute.',
        'You cannot leave once you begin.',
    ],
    maxWrong: 4,
    nextClue: '',

    init: (): State => ({ guesses: ['', '', '', ''], results: null, tries: 0 }),

    view: (s: State) => ({
        clues: CLUES,
        pages: SITE_PAGES,
        footer: FOOTER_NOTE,
        guesses: s.guesses,
        results: s.results,
        tries: s.tries,
    }),

    attempt: (s: State, p: { guesses: string[] }) => {
        const guesses = Array.isArray(p?.guesses)
            ? CLUES.map((_, i) => String(p.guesses[i] ?? ''))
            : s.guesses;

        const results = checkParts(guesses);
        const ok = isPasswordCorrect(guesses);

        return {
            state: { guesses, results, tries: s.tries + 1 },
            correct: ok,
            done: ok,
        };
    },
};

export default card;