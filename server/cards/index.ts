export interface CardModule {
  id: string;
  real: boolean;
  name: string;
  teaser: string;
  ui: 'lines' | 'mcq' | 'sudoku' | 'spans';
  rules: string[];          // 🆕 shown on the briefing screen
  maxWrong: number;         // 🆕 wrong attempts before the terminal locks
  key?: { value: string; position: number };
  nextClue?: string;
  init(): any;
  view(state: any): any;
  attempt(state: any, payload: any): { state: any; correct: boolean; done: boolean };
}

import syntax from './real/syntax';
import logic from './real/logicbug';
import phishing from './real/phishing';
import quiz from './real/quiz';
import sudoku from './real/sudoku';
import { DECOYS } from './decoys';

export const CARDS: CardModule[] = [syntax, logic, phishing, quiz, sudoku, ...DECOYS];
export const byId = (id: string) => CARDS.find((c) => c.id === id);

/* deterministic per-team shuffle */
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