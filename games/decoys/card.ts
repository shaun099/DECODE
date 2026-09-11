import type { CardModule } from '@/server/cards/types';
import { DECOY_IDS } from './ids';

interface Spec { name: string; teaser: string; clicks: number; lines: (n: number) => string[] }

const SPECS: Record<string, Spec> = {
  notice: {
    name: 'The Notice', teaser: 'A maintenance bulletin. It insists you read it.', clicks: 5,
    lines: (n) => ['MAINTENANCE NOTICE', '', 'This terminal is scheduled for service.',
                   'Acknowledge each line to continue.', '', `Acknowledged ${n} of 5`],
  },
  upload: {
    name: 'The Upload', teaser: 'Something is transferring. Slowly.', clicks: 6,
    lines: (n) => ['TRANSFER IN PROGRESS', '',
                   `[${'#'.repeat(n * 3)}${'.'.repeat(Math.max(0, 18 - n * 3))}] ${n * 16}%`, '',
                   n >= 3 ? 'Recalculating…' : 'Please wait.', '', 'Click to continue.'],
  },
  queue: {
    name: 'The Queue', teaser: 'You are not first in line.', clicks: 7,
    lines: (n) => ['SERVICE QUEUE', '', `You are number ${Math.max(1, 7 - n)} in the queue.`, '',
                   n >= 4 ? 'Two positions were added ahead of you.' : 'Estimated wait: unknown.'],
  },
  terms: {
    name: 'The Terms', teaser: 'Conditions apply. All of them.', clicks: 8,
    lines: (n) => ['TERMS OF USE', '', `Clause ${n + 1} of 8`, '',
                   'By continuing you agree to the above.', '', 'Advance by clicking any line.'],
  },
  captcha: {
    name: 'The Gatekeeper', teaser: 'Prove you are not a machine.', clicks: 4,
    lines: (n) => ['VERIFICATION', '', `Attempt ${n + 1}`, '',
                   'Select all lines containing the letter e.', '', 'Then try again.'],
  },
  ledger: {
    name: 'The Ledger', teaser: 'Columns of numbers. Someone balanced them already.', clicks: 5,
    lines: (n) => ['AUDIT LEDGER', '', '  1204   OK', '  8871   OK', '  3390   OK', '',
                   `Verified ${n} of 5 entries.`],
  },
  archive: {
    name: 'The Archive', teaser: 'Boxes of paper. Most of it damp.', clicks: 6,
    lines: (n) => ['ARCHIVE INDEX', '', `Box ${n + 1} — contents illegible`, '', 'Continue searching?'],
  },
  signal: {
    name: 'The Signal', teaser: 'Something is transmitting on a dead channel.', clicks: 5,
    lines: (n) => ['CHANNEL MONITOR', '', '-- -.-. .- .-.. .-..', '',
                   `Decoding pass ${n + 1}…`, '', 'Nothing resolves.'],
  },
  roster: {
    name: 'The Roster', teaser: 'A list of names. None of them are yours.', clicks: 4,
    lines: (n) => ['DUTY ROSTER', '', '  MENON, R.', '  VARGHESE, A.', '  PILLAI, S.', '',
                   `Cross-referenced ${n} of 4.`],
  },
  lamp: {
    name: 'The Lamp Room', teaser: 'A switch, a bulb, and no wiring between them.', clicks: 6,
    lines: (n) => ['LAMP ROOM', '', n % 2 ? '  ( lit )' : '  ( dark )', '',
                   `Toggled ${n} times.`, '', 'The bulb is not connected.'],
  },
};

export const DECOYS: CardModule[] = DECOY_IDS.map((id) => {
  const sp = SPECS[id];
  return {
    id,
    real: false,
    name: sp.name,
    teaser: sp.teaser,
    rules: [
      'Read what is on the terminal.',
      'Click any line to advance.',
      'You cannot leave once you begin.',
    ],
    maxWrong: 99,
    init: () => ({ n: 0 }),
    view: (s: any) => ({ index: 0, total: 1, lines: sp.lines(s.n), wrong: [] }),
    attempt: (s: any) => {
      const n = s.n + 1;
      return { state: { n }, correct: true, done: n >= sp.clicks };
    },
  };
});