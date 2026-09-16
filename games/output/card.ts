import type { CardModule } from '@/server/cards/types';
import { CHALLENGES, TOTAL_CHALLENGES, checkAnswer } from './logic';

interface State {
    currentIndex: number;
    solvedCount: number;
    attempts: number;
    lastResult: boolean | null;
    finished: boolean;
}

const card: CardModule = {
    id: 'output',
    real: true,
    name: "What's the Output?",
    teaser: 'Six snippets. No interpreter. Just your eyes and your instincts.',
    rules: [
        'Six Python snippets are shown one at a time, easiest first.',
        'Read each snippet and type the exact output it prints — nothing runs for you.',
        'Snippets are checked one at a time, in order. You cannot skip ahead.',
        'A wrong guess tells you it was wrong, never what the right answer is.',
        'Six wrong submissions and your terminal locks for one minute.',
        'You cannot leave once you begin.',
    ],
    maxWrong: 6,
    key: { value: 'O6', position: 8 },
    nextClue: 'Next: the terminal is still counting.',

    init: (): State => ({
        currentIndex: 0,
        solvedCount: 0,
        attempts: 0,
        lastResult: null,
        finished: false,
    }),

    view: (s: State) => ({
        challenge: CHALLENGES[s.currentIndex],
        challengeNumber: s.currentIndex + 1,
        totalChallenges: TOTAL_CHALLENGES,
        solvedCount: s.solvedCount,
        attempts: s.attempts,
        lastResult: s.lastResult,
        finished: s.finished,
    }),

    attempt: (s: State, p: { answer: string }) => {
        if (s.finished) {
            return { state: s, correct: false, done: true };
        }

        const guess = typeof p?.answer === 'string' ? p.answer : '';
        const ok = checkAnswer(s.currentIndex, guess);
        const attempts = s.attempts + 1;

        if (!ok) {
            return {
                state: { ...s, attempts, lastResult: false },
                correct: false,
                done: false,
            };
        }

        const isLast = s.currentIndex >= TOTAL_CHALLENGES - 1;

        return {
            state: {
                currentIndex: isLast ? s.currentIndex : s.currentIndex + 1,
                solvedCount: s.solvedCount + 1,
                attempts,
                lastResult: true,
                finished: isLast,
            },
            correct: true,
            done: isLast,
        };
    },
};

export default card;
