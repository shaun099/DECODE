import type { CardModule } from '@/server/cards/types';
import {
  MAX_GUESSES,
  compareGuess,
  generateClues,
  generateNumber,
} from './logic';

interface State {
  /*
   * Server-authoritative secret number.
   *
   * NEVER expose this through view().
   */
  secret: number;

  /*
   * Current round clues.
   */
  clues: {
    id: string;
    text: string;
  }[];

  /*
   * Number of guesses used in the current round.
   */
  guesses: number;

  /*
   * Current round number.
   */
  round: number;

  /*
   * Last server response.
   *
   * Only "higher", "lower", or "correct" is exposed.
   */
  feedback: 'higher' | 'lower' | 'correct' | null;

  /*
   * Last submitted guess.
   */
  lastGuess: number | null;

  /*
   * Game violation.
   */
  failed: boolean;

  /*
   * Successfully solved.
   */
  solved: boolean;
}

interface GuessPayload {
  action: 'guess';
  value: number;
}

interface ViolationPayload {
  action: 'violation';
  reason: string;
}

type Payload =
  | GuessPayload
  | ViolationPayload;

function createRound(round: number): State {
  const secret = generateNumber();

  return {
    secret,
    clues: generateClues(secret),
    guesses: 0,
    round,
    feedback: null,
    lastGuess: null,
    failed: false,
    solved: false,
  };
}

const card: CardModule = {
  id: 'number-mystery',

  real: true,

  name: 'Number Mystery',

  teaser:
    'A number is hidden behind a trail of clues. Four guesses. No easy answers.',

  rules: [
    'A secret four-digit number is generated for your round.',
    'Study the clues carefully before making your guess.',
    'You have four guesses per mystery.',
    'After an incorrect guess, you will only be told HIGHER or LOWER.',
    'Four incorrect guesses start a completely new mystery.',
    'There is no penalty lockout for exhausting a round.',
    'The game continues with new mysteries until the correct number is found.',
    'Leaving fullscreen, switching tabs, or using back navigation terminates the game.',
    'The game is complete only when the current mystery is solved.',
  ],

  /*
   * The generic DECODE router uses maxWrong for its own
   * lockout mechanism.
   *
   * This game intentionally handles its four guesses
   * internally, so every guess is marked "correct" at the
   * CardModule level to prevent the generic lockout.
   */
  maxWrong: 4,

  key: {
    value: 'N7',
    position: 7,
  },

  nextClue:
    'Next: the grid remembers what was hidden in plain sight.',

  init: (): State => createRound(1),

  view: (s: State) => ({
    round: s.round,

    totalGuesses: MAX_GUESSES,
    guessesUsed: s.guesses,
    guessesLeft: Math.max(
      0,
      MAX_GUESSES - s.guesses,
    ),

    clues: s.clues,

    feedback: s.feedback,
    lastGuess: s.lastGuess,

    failed: s.failed,
    done: s.solved,

    /*
     * IMPORTANT:
     *
     * The secret number is intentionally absent.
     */
  }),

  attempt: (s: State, p: Payload) => {
    /*
     * Once terminated or solved, do nothing.
     *
     * IMPORTANT:
     * done remains false for violations so the generic
     * router does not award the key.
     */
    if (s.failed || s.solved) {
      return {
        state: s,
        correct: true,
        done: false,
      };
    }

    /*
     * -----------------------------------------
     * RULE VIOLATION
     * -----------------------------------------
     */
    if (p.action === 'violation') {
      return {
        state: {
          ...s,
          failed: true,
        },
        correct: true,
        done: false,
      };
    }

    /*
     * -----------------------------------------
     * GUESS
     * -----------------------------------------
     */
    if (p.action === 'guess') {
      const guess = Number(p.value);

      /*
       * Invalid input does not consume a guess.
       */
      if (
        !Number.isInteger(guess) ||
        guess < 1000 ||
        guess > 9999
      ) {
        return {
          state: s,
          correct: true,
          done: false,
        };
      }

      /*
       * Prevent additional guesses after the
       * four-guess round has already been exhausted.
       */
      if (s.guesses >= MAX_GUESSES) {
        return {
          state: s,
          correct: true,
          done: false,
        };
      }

      const result = compareGuess(
        guess,
        s.secret,
      );

      /*
       * -----------------------------------------
       * CORRECT
       * -----------------------------------------
       */
      if (result === 'correct') {
        return {
          state: {
            ...s,
            guesses: s.guesses + 1,
            feedback: 'correct',
            lastGuess: guess,
            solved: true,
          },

          correct: true,
          done: true,
        };
      }

      const guesses = s.guesses + 1;

      /*
       * -----------------------------------------
       * FOURTH WRONG GUESS
       * -----------------------------------------
       *
       * Generate an entirely new mystery.
       *
       * We deliberately return done:false and
       * correct:true so the generic router does
       * not lock the player out.
       */
      if (guesses >= MAX_GUESSES) {
        const next = createRound(s.round + 1);

        return {
          state: next,
          correct: true,
          done: false,
        };
      }

      /*
       * -----------------------------------------
       * NORMAL WRONG GUESS
       * -----------------------------------------
       */
      return {
        state: {
          ...s,
          guesses,
          feedback: result,
          lastGuess: guess,
        },

        correct: true,
        done: false,
      };
    }

    return {
      state: s,
      correct: true,
      done: false,
    };
  },
};

export default card;