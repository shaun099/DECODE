import type { CardModule } from './types';
import syntax from '@/games/syntax/card';
import logicbug from '@/games/logicbug/card';
import phishing from '@/games/phishing/card';
import quiz from '@/games/quiz/card';
import sudoku from '@/games/sudoku/card';
import { DECOYS } from '@/games/decoys/card';

export type { CardModule };

export const CARDS: CardModule[] = [syntax, logicbug, phishing, quiz, sudoku, ...DECOYS];
export const byId = (id: string) => CARDS.find((c) => c.id === id);

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Board in this team's own order. Never reveals real vs decoy. */
export function boardView(seed: number) {
  const out = CARDS.map((c) => ({ id: c.id, name: c.name, teaser: c.teaser }));
  const rnd = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}