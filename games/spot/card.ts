import type { CardModule } from '@/server/cards/types';
import { DIFFERENCES, SCENE_HEIGHT, SCENE_WIDTH, TOTAL, hitTest } from './logic';

interface Mark { id: string; x: number; y: number; radius: number; panel: 'A' | 'B'; n: number }
interface State { marks: Mark[] }

const card: CardModule = {
  id: 'spot',
  real: true,
  name: 'The Observatory',
  //teaser: 'Two scenes. Ten differences. Your eyes are the only tool.',
  rules: [
    `Two versions of the same scene, with ${TOTAL} differences between them.`,
    'The differences are small — a bead, a tick mark, a single wrap of twine.',
    'Use the lens. Raise the zoom if you need to.',
    'Click a difference to mark it. The mark appears only where you clicked.',
    'Six wrong clicks and your terminal locks for one minute.',
    'You cannot leave once you begin.',
  ],
  maxWrong: 6,
  key: { value: 'W5', position: 4 },
  nextClue: 'Next: nine rows, nine columns, and nothing may appear twice.',

  init: (): State => ({ marks: [] }),

  view: (s: State) => ({
    width: SCENE_WIDTH,
    height: SCENE_HEIGHT,
    total: TOTAL,
    marks: s.marks,
    remaining: TOTAL - s.marks.length,
  }),

  attempt: (s: State, p: { x: number; y: number; panel: 'A' | 'B' }) => {
    const x = Number(p?.x);
    const y = Number(p?.y);
    const panel: 'A' | 'B' = p?.panel === 'B' ? 'B' : 'A';

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return { state: s, correct: false, done: false };
    }

    const hit = hitTest(x, y);
    if (!hit || s.marks.some((m) => m.id === hit.id)) {
      return { state: s, correct: false, done: false };
    }

    const marks: Mark[] = [
      ...s.marks,
      { id: hit.id, x: hit.x, y: hit.y, radius: hit.radius, panel, n: s.marks.length + 1 },
    ];

    return { state: { marks }, correct: true, done: marks.length >= TOTAL };
  },
};

export default card;