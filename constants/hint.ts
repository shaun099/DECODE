export interface Hint {
  name: string;
  hint: string;
  game: string;
}

export const hints: Hint[] = [
  { name: 'DECODE', hint: 'The Compiler', game: 'syntax' },
  { name: 'DECODE', hint: 'The Long Corridor', game: 'maze' },
  { name: 'DECODE', hint: 'ByteCross', game: 'crossword' },
  { name: 'DECODE', hint: 'The Observatory', game: 'spot' },
  { name: 'DECODE', hint: 'The Dance of Numbers', game: 'sudoku' },
];
