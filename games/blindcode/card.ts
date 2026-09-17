import type { CardModule } from '@/server/cards/types';
import { PROBLEMS } from './logic';
import { runJavaScript, runPython, runC } from './runner';

const card: CardModule = {
  id: 'blindcode',
  real: false,
  name: 'The Dark Terminal',
  teaser: 'Write functioning code in a blurred terminal. The code unblurs once all tests pass.',
  rules: [
    'A coding challenge is presented.',
    'Choose your language: JavaScript, Python, or C.',
    'Type your code in the blurred editor — the text remains blurred until verified.',
    'Execution errors and test failures will appear in the output console.',
    'Four failed submissions and your terminal locks for one minute.',
    'You cannot leave once you begin.',
  ],
  maxWrong: 4,
  nextClue: '',

  init: () => ({
    i: 0,
    wrong: 0,
    lastError: null,
    lastOutput: null,
    testResults: [],
    solvedCode: null,
  }),

  view: (s) => {
    const p = PROBLEMS[s.i % PROBLEMS.length];
    return {
      index: s.i,
      total: 1,
      problem: {
        id: p.id,
        title: p.title,
        description: p.description,
        difficulty: p.difficulty,
        examples: p.examples,
        functionName: p.functionName,
        starterCode: p.starterCode,
      },
      lastError: s.lastError,
      lastOutput: s.lastOutput,
      testResults: s.testResults ?? [],
      solvedCode: s.solvedCode,
    };
  },

  attempt: async (s, p: { code: string; language: 'javascript' | 'python' | 'c' }) => {
    const currentProblem = PROBLEMS[s.i % PROBLEMS.length];
    const lang = p.language === 'c' ? 'c' : p.language === 'python' ? 'python' : 'javascript';
    const fnName =
      lang === 'c'
        ? currentProblem.functionName.c
        : lang === 'python'
          ? currentProblem.functionName.python
          : currentProblem.functionName.js;

    const execRes =
      lang === 'c'
        ? await runC(p.code || '', currentProblem.id, fnName, currentProblem.testCases)
        : lang === 'python'
          ? await runPython(p.code || '', fnName, currentProblem.testCases)
          : await runJavaScript(p.code || '', fnName, currentProblem.testCases);

    if (!execRes.success) {
      return {
        state: {
          ...s,
          wrong: (s.wrong || 0) + 1,
          lastError: execRes.error || 'Execution failed.',
          lastOutput: null,
          testResults: execRes.testResults || [],
        },
        correct: false,
        done: false,
        lastResult: {
          success: false,
          error: execRes.error,
          testResults: execRes.testResults,
        },
      };
    }

    return {
      state: {
        ...s,
        lastError: null,
        lastOutput: 'ACCEPTED: All test cases passed!',
        testResults: execRes.testResults,
        solvedCode: p.code,
      },
      correct: true,
      done: true,
      lastResult: {
        success: true,
        testResults: execRes.testResults,
      },
    };
  },
};

export default card;

