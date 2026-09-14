import type { CardModule } from '@/server/cards/types';
import {
  ALL_TEST_CASES,
  LOCKED_TEST_CASES,
  STARTER_TEMPLATES,
  SupportedLanguage,
  VISIBLE_TEST_CASES,
  executeTests,
} from './logic';

interface State {
  solved: boolean;
  passedCount: number;
}

const card: CardModule = {
  id: 'leetcode',
  real: true,
  name: 'The Algorist',
  teaser: 'One target. Thirteen tests. Ten locked in the dark.',
  rules: [
    'Given an array of integers and a target, find the two indices that add up to the target.',
    '3 visible test cases are provided with input, output, and explanations.',
    '10 locked test cases will test edge cases: negative values, duplicates, and large integers.',
    'Write your solution in Python, JavaScript, Java, or C.',
    'All 13 test cases must pass on Submit to claim the fragment.',
    'Six failed submissions and your terminal locks for one minute.',
    'You cannot leave once you begin.',
  ],
  maxWrong: 6,
  key: { value: 'L6', position: 8 },
  nextClue: 'You have gathered the fragments. The terminal awaits the final assembly.',

  init: (): State => ({ solved: false, passedCount: 0 }),

  view: (s: State) => ({
    title: '1. Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    visibleTestCases: VISIBLE_TEST_CASES,
    lockedCount: LOCKED_TEST_CASES.length,
    totalTestCases: ALL_TEST_CASES.length,
    starterTemplates: STARTER_TEMPLATES,
    solved: s.solved,
  }),

  attempt: (s: State, p: { code: string; language: SupportedLanguage }) => {
    if (!p?.code || !p?.language) {
      return { state: s, correct: false, done: false };
    }

    const execResult = executeTests(p.code, p.language, true);

    if (execResult.passed) {
      return {
        state: { solved: true, passedCount: ALL_TEST_CASES.length },
        correct: true,
        done: true,
      };
    }

    return {
      state: { solved: false, passedCount: execResult.passedCount },
      correct: false,
      done: false,
    };
  },
};

export default card;
