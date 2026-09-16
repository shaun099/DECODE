export type Direction = 'across' | 'down';

export interface CrosswordWord {
  number: number;
  direction: Direction;
  word: string;
  clue: string;
  row: number;
  col: number;
  length: number;
}

export const ROWS = 15;
export const COLS = 15;

export const WORDS: CrosswordWord[] = [
  { number: 1,  direction: 'down',   word: 'DATABASE', clue: 'A place where an app stores all its records, like MySQL', row: 0,  col: 0,  length: 8 },
  { number: 2,  direction: 'down',   word: 'CODING',   clue: 'The activity of writing a computer program', row: 0, col: 2, length: 6 },
  { number: 3,  direction: 'down',   word: 'REBOOT',   clue: 'To restart a computer when it stops responding', row: 0, col: 8, length: 6 },
  { number: 4,  direction: 'across', word: 'PIXEL',    clue: 'The smallest single dot that makes up a screen image', row: 0, col: 10, length: 5 },
  { number: 5,  direction: 'down',   word: 'INTERNET', clue: 'The global network that connects computers worldwide', row: 0, col: 11, length: 8 },
  { number: 6,  direction: 'across', word: 'SERVER',   clue: 'The remote computer that stores a website and sends it to you', row: 1, col: 4, length: 6 },
  { number: 6,  direction: 'down',   word: 'SEARCH',   clue: 'What you perform when you type keywords into Google', row: 1, col: 4, length: 6 },
  { number: 7,  direction: 'across', word: 'BROWSER',  clue: 'The program you open websites in, such as Chrome', row: 3, col: 6, length: 7 },
  { number: 8,  direction: 'across', word: 'BINARY',   clue: 'The number system computers use, with only 0 and 1', row: 4, col: 0, length: 6 },
  { number: 9,  direction: 'across', word: 'BUTTON',   clue: 'The thing on a screen you click to trigger an action', row: 5, col: 6, length: 6 },
  { number: 10, direction: 'down',   word: 'CLOUD',    clue: 'Online storage such as Google Drive keeps files in the ___', row: 5, col: 13, length: 5 },
  { number: 11, direction: 'across', word: 'PYTHON',   clue: 'A beginner-friendly language whose files end in .py', row: 7, col: 9, length: 6 },
  { number: 11, direction: 'down',   word: 'PASSWORD', clue: 'The secret text you type to log in to an account', row: 7, col: 9, length: 8 },
  { number: 12, direction: 'down',   word: 'BACKUP',   clue: 'A second copy of your files, kept in case the first is lost', row: 8, col: 1, length: 6 },
  { number: 13, direction: 'down',   word: 'LAPTOP',   clue: 'A portable computer with a screen that folds shut', row: 9, col: 5, length: 6 },
  { number: 14, direction: 'across', word: 'SYSTEM',   clue: 'Windows and Linux are each an operating ___', row: 10, col: 7, length: 6 },
  { number: 15, direction: 'down',   word: 'EMAIL',    clue: 'A message sent to an address containing an @ sign', row: 10, col: 11, length: 5 },
  { number: 16, direction: 'across', word: 'OUTPUT',   clue: 'The result a program produces after it runs', row: 12, col: 0, length: 6 },
  { number: 17, direction: 'across', word: 'DOMAIN',   clue: 'The name part of a web address, like google.com', row: 12, col: 8, length: 6 },
  { number: 18, direction: 'across', word: 'UPLOAD',   clue: 'To send a file from your device up to the internet', row: 14, col: 4, length: 6 },
];
export const keyOf = (w: { number: number; direction: Direction }) =>
  `${w.number}-${w.direction}`;

const step = (d: Direction) => (d === 'across' ? [0, 1] : [1, 0]);

/** Cells a word occupies, as flat indices. */
export function cellsOf(w: CrosswordWord): number[] {
  const [dr, dc] = step(w.direction);
  return Array.from({ length: w.length }, (_, i) =>
    (w.row + dr * i) * COLS + (w.col + dc * i),
  );
}

/** Which cells exist at all, and which carry a clue number. */
export const LAYOUT = (() => {
  const open = Array<boolean>(ROWS * COLS).fill(false);
  const numbers = Array<number | null>(ROWS * COLS).fill(null);
  for (const w of WORDS) {
    if (numbers[w.row * COLS + w.col] === null) {
      numbers[w.row * COLS + w.col] = w.number;
    }
    for (const i of cellsOf(w)) open[i] = true;
  }
  return { open, numbers };
})();

export const byKey = (k: string) => WORDS.find((w) => keyOf(w) === k);