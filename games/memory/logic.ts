export const ROWS = 10;
export const COLS = 10;

export const CARD_COUNT = ROWS * COLS;
export const PAIR_COUNT = CARD_COUNT / 2;

export function createDeck(): number[] {
  const deck = Array.from(
    { length: PAIR_COUNT },
    (_, i) => [i, i],
  ).flat();

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [deck[i], deck[j]] = [
      deck[j],
      deck[i],
    ];
  }

  return deck;
}