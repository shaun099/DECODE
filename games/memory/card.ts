import type { CardModule } from '@/server/cards/types';
import { CARD_COUNT, createDeck } from './logic';

interface State {
  deck: number[];
  flipped: number[];
  matched: number[];
  pairs: number;
  failed: boolean;
}

interface FlipPayload {
  action: 'flip';
  index: number;
}

interface HidePayload {
  action: 'hide';
  first: number;
  second: number;
}

interface ViolationPayload {
  action: 'violation';
  reason: string;
}

type Payload =
  | FlipPayload
  | HidePayload
  | ViolationPayload;

const card: CardModule = {
  id: 'memory-grid',
  real: true,

  name: 'Memory Grid',

  teaser: 'One hundred cards. Fifty pairs. Nothing twice.',

  rules: [
    'A 10 by 10 grid contains 50 matching pairs.',
    'Click two cards to reveal them.',
    'Matching cards remain face up.',
    'Non-matching cards are returned face down.',
    'You may only have two cards revealed at once.',
    'Fullscreen is mandatory.',
    'Leaving fullscreen, switching tabs, or using back navigation terminates the game.',
    'The card is complete when all 50 pairs are matched.',
  ],

  maxWrong: 9999,

  key: {
    value: 'R9',
    position: 6,
  },

  nextClue:
    'Next: nine rows, nine columns, nothing twice.',

  init: (): State => ({
    deck: createDeck(),
    flipped: [],
    matched: [],
    pairs: 0,
    failed: false,
  }),

  view: (s: State) => {
    const visible = new Set([
      ...s.flipped,
      ...s.matched,
    ]);

    return {
      rows: 10,
      cols: 10,
      totalCards: CARD_COUNT,
      totalPairs: 50,

      flipped: s.flipped,
      matched: s.matched,

      failed: s.failed,
      done: s.pairs >= 50,

      cards: Array.from(
        { length: CARD_COUNT },
        (_, index) => ({
          index,

          value: visible.has(index)
            ? getSymbol(s.deck[index])
            : null,

          flipped: s.flipped.includes(index),
          matched: s.matched.includes(index),
        }),
      ),
    };
  },

  attempt: (s: State, p: Payload) => {
    /*
     * Once the game has been terminated,
     * do not allow it to become successfully completed.
     */
    if (s.failed) {
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
     * HIDE MISMATCHED PAIR
     * -----------------------------------------
     */
    if (p.action === 'hide') {
      const first = Number(p.first);
      const second = Number(p.second);

      if (
        s.flipped.length === 2 &&
        s.flipped[0] === first &&
        s.flipped[1] === second
      ) {
        return {
          state: {
            ...s,
            flipped: [],
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
    }

    /*
     * -----------------------------------------
     * FLIP CARD
     * -----------------------------------------
     */
    if (p.action === 'flip') {
      const index = Number(p.index);

      /*
       * Invalid index.
       */
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= CARD_COUNT
      ) {
        return {
          state: s,
          correct: true,
          done: false,
        };
      }

      /*
       * Already matched.
       */
      if (s.matched.includes(index)) {
        return {
          state: s,
          correct: true,
          done: false,
        };
      }

      /*
       * Already flipped.
       */
      if (s.flipped.includes(index)) {
        return {
          state: s,
          correct: true,
          done: false,
        };
      }

      /*
       * Maximum two cards.
       */
      if (s.flipped.length >= 2) {
        return {
          state: s,
          correct: true,
          done: false,
        };
      }

      /*
       * First card.
       */
      if (s.flipped.length === 0) {
        return {
          state: {
            ...s,
            flipped: [index],
          },
          correct: true,
          done: false,
        };
      }

      /*
       * Second card.
       */
      const first = s.flipped[0];
      const second = index;

      const firstPair = s.deck[first];
      const secondPair = s.deck[second];

      /*
       * MATCH
       */
      if (firstPair === secondPair) {
        const matched = [
          ...s.matched,
          first,
          second,
        ];

        const pairs = s.pairs + 1;

        return {
          state: {
            ...s,
            flipped: [],
            matched,
            pairs,
          },
          correct: true,
          done: pairs >= 50,
        };
      }

      /*
       * MISMATCH
       *
       * Keep both cards visible temporarily.
       * The client sends `hide` after 900ms.
       */
      return {
        state: {
          ...s,
          flipped: [first, second],
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

function getSymbol(pairId: number): string {
  return SYMBOLS[pairId];
}

const SYMBOLS = [
  '🚀',
  '🌙',
  '⭐',
  '☀️',
  '🌈',
  '⚡',
  '🔥',
  '💧',
  '❄️',
  '🌊',

  '🍎',
  '🍊',
  '🍋',
  '🍉',
  '🍇',
  '🍓',
  '🍒',
  '🥝',
  '🥭',
  '🍍',

  '🐶',
  '🐱',
  '🐭',
  '🐹',
  '🐰',
  '🦊',
  '🐻',
  '🐼',
  '🐨',
  '🐯',

  '🦁',
  '🐮',
  '🐷',
  '🐸',
  '🐵',
  '🐙',
  '🦋',
  '🐝',
  '🐢',
  '🦄',

  '💻',
  '📱',
  '⌨️',
  '🖱️',
  '🎮',
  '🎧',
  '📷',
  '💡',
  '🔑',
  '🎯',
];