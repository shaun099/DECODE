import type { CardModule } from '@/server/cards/types';
import {
  GLOBAL_LIMIT_MS, HINTS, LEVELS, RETRY_PENALTY_MS,
  drawChallenges, renderCaptcha,
} from './logic';

interface State {
  level: number;
  answers: string[];
  index: number;
  startedAt: number;        // global clock anchor
  penaltyMs: number;        // 60s per failure, deducted immediately
  levelStartedAt: number;
  runs: number;             // how many times the whole thing restarted
  lastPenalty: number;      // timestamp of the last penalty, for the banner
}

const fresh = (level: number, now: number, base: Partial<State> = {}): State => ({
  level,
  answers: drawChallenges(level),
  index: 0,
  startedAt: base.startedAt ?? now,
  penaltyMs: base.penaltyMs ?? 0,
  levelStartedAt: now,
  runs: base.runs ?? 0,
  lastPenalty: base.lastPenalty ?? 0,
});

const globalLeft = (s: State) =>
  Math.max(0, GLOBAL_LIMIT_MS - s.penaltyMs - (Date.now() - s.startedAt));

const levelLeft = (s: State) =>
  Math.max(0, LEVELS[s.level].seconds * 1000 - (Date.now() - s.levelStartedAt));

const card: CardModule = {
  id: 'captcha',
  real: false,
  name: 'Are You Human?',
  teaser: 'Five verification levels. Each one less reasonable than the last.',
  rules: [
    'Five levels. Type the distorted text exactly as shown.',
    'Case, numbers and symbols all matter.',
    'Level limits: 45, 45, 40, 30 and 25 seconds.',
    'Ten minutes for the whole verification.',
    'Any failure costs 60 seconds off the global clock, immediately, and restarts that level.',
    'Run the global clock out and the entire verification starts again from level one.',
    'You cannot leave once you begin.',
  ],
  maxWrong: 3,
  nextClue: '',

  init: (): State => fresh(0, Date.now()),

  view: (s: State) => ({
    level: s.level,
    levelName: LEVELS[s.level].name,
    levelSeconds: LEVELS[s.level].seconds,
    totalLevels: LEVELS.length,
    hint: HINTS[s.level],
    index: s.index,
    perLevel: s.answers.length,
    levelMs: levelLeft(s),
    globalMs: globalLeft(s),
    penaltyMs: s.penaltyMs,
    lastPenalty: s.lastPenalty,
    runs: s.runs,
    captcha: renderCaptcha(s.answers[s.index], s.level),
  }),

  attempt: (s: State, p: { answer?: string }) => {
    const now = Date.now();

    /** A failure: take 60 seconds immediately and restart this level. */
    const penalise = () => {
      const after = GLOBAL_LIMIT_MS - (s.penaltyMs + RETRY_PENALTY_MS) - (now - s.startedAt);

      // not enough clock left to absorb the penalty — full reset
      if (after <= 0) {
        return { state: fresh(0, now, { runs: s.runs + 1 }), correct: false, done: false };
      }

      return {
        state: fresh(s.level, now, {
          startedAt: s.startedAt,
          penaltyMs: s.penaltyMs + RETRY_PENALTY_MS,
          runs: s.runs,
          lastPenalty: now,
        }),
        correct: false,
        done: false,
      };
    };

    /* global clock already gone */
    if (globalLeft(s) <= 0) {
      return { state: fresh(0, now, { runs: s.runs + 1 }), correct: false, done: false };
    }

    /* level clock ran out */
    if (levelLeft(s) <= 0) return penalise();

    /* wrong answer */
    const given = String(p?.answer ?? '').trim();
    if (given !== s.answers[s.index]) return penalise();

    /* correct — next challenge in this level */
    const next = s.index + 1;
    if (next < s.answers.length) {
      return { state: { ...s, index: next }, correct: true, done: false };
    }

    /* level cleared */
    if (s.level === LEVELS.length - 1) {
      return { state: s, correct: true, done: true };
    }

    return {
      state: fresh(s.level + 1, now, {
        startedAt: s.startedAt,
        penaltyMs: s.penaltyMs,
        runs: s.runs,
        lastPenalty: s.lastPenalty,
      }),
      correct: true,
      done: false,
    };
  },
};

export default card;