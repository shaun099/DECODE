import type { CardModule } from '@/server/cards/types';
import { EMAILS, parse } from './logic';

const seg = (line: string) => parse(line);

const card: CardModule = {
  id: 'phishing',
  real: false,
  name: 'The Honest Letter',
  //teaser: 'Five messages. Every one is lying about something small.',
  rules: [
    `${EMAILS.length} messages, one at a time.`,
    'Each hides one or two details that give it away.',
    'Click the detail that is wrong. Underlined text is clickable.',
    'Four wrong clicks and your terminal locks for one minute.',
    'You cannot leave once you begin.',
  ],
  maxWrong: 4,
  nextClue: '',

  init: () => ({ i: 0, found: [] as string[], wrong: [] as string[] }),

  view: (s) => {
    const e = EMAILS[s.i];
    if (!e) {
      return {
        index: s.i,
        total: EMAILS.length,
        brand: 'Complete',
        rows: [],
        body: [],
        found: s.found,
        wrong: s.wrong,
        remaining: 0,
      };
    }

    return {
      index: s.i,
      total: EMAILS.length,
      brand: e.brand,
      rows: [
        ['From', seg(e.from)],
        ...(e.replyTo ? [['Reply-To', seg(e.replyTo)]] : []),
        ['To', seg(e.to)],
        ['Subject', seg(e.subject)],
        ['Date', seg(e.date)],
      ],
      body: e.body.map(seg),
      found: s.found,
      wrong: s.wrong,
      remaining: e.suspects.filter((x: string) => !s.found.includes(x)).length,
    };
  },

  attempt: (s, p: { id: string }) => {
    const e = EMAILS[s.i];
    if (!e) {
      return { state: s, correct: false, done: true };
    }

    if (!e.suspects.includes(p.id)) {
      return { state: { ...s, wrong: [...s.wrong, p.id] }, correct: false, done: false };
    }
    const found = [...s.found, p.id];
    if (!e.suspects.every((x: string) => found.includes(x))) {
      return { state: { ...s, found }, correct: true, done: false };
    }
    const next = s.i + 1;
    return { state: { i: next, found: [], wrong: [] }, correct: true, done: next >= EMAILS.length };
  },
};

export default card;