export interface TestCase {
  id: number;
  nums: number[];
  target: number;
  expected: [number, number];
  locked?: boolean;
  explanation?: string;
  tag?: string;
}

export const VISIBLE_TEST_CASES: TestCase[] = [
  {
    id: 1,
    nums: [2, 7, 11, 15],
    target: 9,
    expected: [0, 1],
    locked: false,
    explanation: 'nums[0] + nums[1] == 2 + 7 == 9, so we return [0, 1].',
  },
  {
    id: 2,
    nums: [3, 2, 4],
    target: 6,
    expected: [1, 2],
    locked: false,
    explanation: 'nums[1] + nums[2] == 2 + 4 == 6, so we return [1, 2].',
  },
  {
    id: 3,
    nums: [3, 3],
    target: 6,
    expected: [0, 1],
    locked: false,
    explanation: 'nums[0] + nums[1] == 3 + 3 == 6, so we return [0, 1].',
  },
];

export const LOCKED_TEST_CASES: TestCase[] = [
  {
    id: 4,
    nums: [-1, -2, -3, -4, -5],
    target: -8,
    expected: [2, 4],
    locked: true,
    tag: 'Negative numbers (-3 + -5 = -8)',
  },
  {
    id: 5,
    nums: [-10, 7, 14, -2, 5],
    target: 4,
    expected: [0, 2],
    locked: true,
    tag: 'Mixed positive and negative (-10 + 14 = 4)',
  },
  {
    id: 6,
    nums: [0, 4, 3, 0],
    target: 0,
    expected: [0, 3],
    locked: true,
    tag: 'Zeros at boundary (0 + 0 = 0)',
  },
  {
    id: 7,
    nums: [-5, 2, 5, 8],
    target: 0,
    expected: [0, 2],
    locked: true,
    tag: 'Additive inverses (-5 + 5 = 0)',
  },
  {
    id: 8,
    nums: [1, 5, 8, 12, 19, 99],
    target: 100,
    expected: [0, 5],
    locked: true,
    tag: 'First and last element (1 + 99 = 100)',
  },
  {
    id: 9,
    nums: [1, 2, 3, 4, 5, 6],
    target: 11,
    expected: [4, 5],
    locked: true,
    tag: 'Tail elements (5 + 6 = 11)',
  },
  {
    id: 10,
    nums: [100000000, 200000000, 500000000],
    target: 700000000,
    expected: [1, 2],
    locked: true,
    tag: 'Large integers (200M + 500M = 700M)',
  },
  {
    id: 11,
    nums: [42, 58],
    target: 100,
    expected: [0, 1],
    locked: true,
    tag: 'Minimum array size (n = 2)',
  },
  {
    id: 12,
    nums: [1, 5, 2, 5, 3],
    target: 10,
    expected: [1, 3],
    locked: true,
    tag: 'Duplicate values in array (5 + 5 = 10)',
  },
  {
    id: 13,
    nums: [15, -7, 9, -20, 4],
    target: -27,
    expected: [1, 3],
    locked: true,
    tag: 'Negative target with mixed signs (-7 + -20 = -27)',
  },
];

export const ALL_TEST_CASES: TestCase[] = [...VISIBLE_TEST_CASES, ...LOCKED_TEST_CASES];

export type SupportedLanguage = 'javascript' | 'python' | 'java' | 'c';

export const STARTER_TEMPLATES: Record<SupportedLanguage, string> = {
  javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your code here
    
}
`,
  python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your code here
        pass
`,
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }
}
`,
  c: `/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Write your code here
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    return result;
}
`,
};

export const REFERENCE_SOLUTIONS: Record<SupportedLanguage, string> = {
  javascript: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
  python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []
`,
  java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}
`,
  c: `int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    for (int i = 0; i < numsSize - 1; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    return result;
}
`,
};

export interface ExecutionResult {
  passed: boolean;
  totalRun: number;
  passedCount: number;
  results: {
    id: number;
    passed: boolean;
    input: { nums: number[]; target: number };
    expected: [number, number];
    actual?: [number, number] | any;
    error?: string;
    locked?: boolean;
  }[];
  runtimeMs?: number;
  error?: string;
}

/**
 * Checks matching pairs of parentheses, brackets, and braces.
 */
function checkBalancedBrackets(text: string) {
  const stack: { char: string; line: number }[] = [];
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '(' || c === '[' || c === '{') {
        stack.push({ char: c, line: i + 1 });
      } else if (c === ')' || c === ']' || c === '}') {
        if (stack.length === 0) {
          throw new Error(`SyntaxError: Unmatched closing '${c}' at line ${i + 1}`);
        }
        const top = stack.pop()!;
        const expected = top.char === '(' ? ')' : top.char === '[' ? ']' : '}';
        if (c !== expected) {
          throw new Error(`SyntaxError: Mismatched '${top.char}' from line ${top.line} closed by '${c}' at line ${i + 1}`);
        }
      }
    }
  }

  if (stack.length > 0) {
    const top = stack.pop()!;
    throw new Error(`SyntaxError: Unclosed '${top.char}' from line ${top.line}`);
  }
}

/**
 * Transpiles Python TwoSum code to executable JS with syntax checking.
 */
function transpilePythonToJS(pyCode: string): string {
  checkBalancedBrackets(pyCode);

  const lines = pyCode.split('\n');
  const jsLines: string[] = [];
  const indentStack: number[] = [];

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const rawLine = lines[lineNum];
    const trimmed = rawLine.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    // Check colons on control structures
    if (/^(if|elif|else|for|while|def|class)\b/.test(trimmed)) {
      if (!trimmed.endsWith(':')) {
        throw new Error(`SyntaxError: expected ':' at line ${lineNum + 1}: "${trimmed}"`);
      }
    }

    if (trimmed.startsWith('class ')) {
      continue;
    }

    const currentIndent = rawLine.search(/\S/);

    // Unindent if currentIndent < top of indentStack
    while (indentStack.length > 0 && currentIndent < indentStack[indentStack.length - 1]) {
      indentStack.pop();
      jsLines.push('}');
    }

    // Handle def twoSum(...)
    if (trimmed.startsWith('def twoSum')) {
      jsLines.push('function twoSum(nums, target) {');
      indentStack.push(currentIndent + 1);
      continue;
    }

    let line = trimmed.replace(/:$/, '');

    // Handle dictionary declaration: seen = {} or d = dict()
    if (/^[a-zA-Z_]\w*\s*=\s*(\{\}|dict\(\))$/.test(line)) {
      const varName = line.split('=')[0].trim();
      jsLines.push(`const ${varName} = new Map();`);
      continue;
    }

    // Handle for i, num in enumerate(nums):
    const enumMatch = line.match(/^for\s+([a-zA-Z_]\w*)\s*,\s*([a-zA-Z_]\w*)\s+in\s+enumerate\((?:nums|self\.nums)\)$/);
    if (enumMatch) {
      const idxVar = enumMatch[1];
      const valVar = enumMatch[2];
      jsLines.push(`for (let ${idxVar} = 0; ${idxVar} < nums.length; ${idxVar}++) { const ${valVar} = nums[${idxVar}];`);
      indentStack.push(currentIndent + 1);
      continue;
    }

    // Handle for i in range(len(nums)):
    const rangeMatch1 = line.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+range\(\s*(?:len\(nums\)|nums\.length)\s*\)$/);
    if (rangeMatch1) {
      const idxVar = rangeMatch1[1];
      jsLines.push(`for (let ${idxVar} = 0; ${idxVar} < nums.length; ${idxVar}++) {`);
      indentStack.push(currentIndent + 1);
      continue;
    }

    // Handle for j in range(i + 1, len(nums)):
    const rangeMatch2 = line.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+range\(\s*([a-zA-Z_]\w*|\d+)\s*\+\s*1\s*,\s*(?:len\(nums\)|nums\.length)\s*\)$/);
    if (rangeMatch2) {
      const idxVar = rangeMatch2[1];
      const startVar = rangeMatch2[2];
      jsLines.push(`for (let ${idxVar} = ${startVar} + 1; ${idxVar} < nums.length; ${idxVar}++) {`);
      indentStack.push(currentIndent + 1);
      continue;
    }

    // Handle if complement in seen:
    const inMatch = line.match(/^if\s+([a-zA-Z_]\w*)\s+in\s+([a-zA-Z_]\w*)$/);
    if (inMatch) {
      const keyVar = inMatch[1];
      const mapVar = inMatch[2];
      jsLines.push(`if (${mapVar}.has(${keyVar})) {`);
      indentStack.push(currentIndent + 1);
      continue;
    }

    // Handle general if conditions
    if (line.startsWith('if ')) {
      let cond = line.substring(3).trim();
      cond = cond.replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\b/g, '!');
      jsLines.push(`if (${cond}) {`);
      indentStack.push(currentIndent + 1);
      continue;
    }

    // Handle dictionary assignment: seen[num] = i
    const setMatch = line.match(/^([a-zA-Z_]\w*)\[([^\]]+)\]\s*=\s*(.+)$/);
    if (setMatch) {
      const mapVar = setMatch[1];
      const keyExpr = setMatch[2];
      const valExpr = setMatch[3];
      jsLines.push(`if (typeof ${mapVar}?.set === 'function') { ${mapVar}.set(${keyExpr}, ${valExpr}); } else { ${mapVar}[${keyExpr}] = ${valExpr}; }`);
      continue;
    }

    // Handle return
    if (line.startsWith('return ')) {
      let retExpr = line.substring(7).trim();
      retExpr = retExpr.replace(/([a-zA-Z_]\w*)\[([^\]]+)\]/g, '($1.get ? $1.get($2) : $1[$2])');
      jsLines.push(`return ${retExpr};`);
      continue;
    }

    // Handle assignments: complement = target - num
    if (line.includes('=')) {
      const parts = line.split('=');
      const lhs = parts[0].trim();
      const rhs = parts.slice(1).join('=').trim();
      if (/^[a-zA-Z_]\w*$/.test(lhs)) {
        jsLines.push(`const ${lhs} = ${rhs};`);
        continue;
      }
    }

    if (line === 'pass') {
      continue;
    }

    jsLines.push(line);
  }

  while (indentStack.length > 0) {
    indentStack.pop();
    jsLines.push('}');
  }

  return jsLines.join('\n');
}

/**
 * Transpiles Java TwoSum code to executable JS with syntax checking.
 */
function transpileJavaToJS(javaCode: string): string {
  checkBalancedBrackets(javaCode);

  if (!javaCode.includes('twoSum')) {
    throw new Error("Compile Error: Method 'twoSum' not found in Java solution.");
  }

  let code = javaCode;
  code = code.replace(/package\s+[^;]+;/g, '');
  code = code.replace(/import\s+[^;]+;/g, '');

  // Remove class header and its matching last brace
  code = code.replace(/class\s+\w+\s*\{/, '');
  const lastBraceIdx = code.lastIndexOf('}');
  if (lastBraceIdx !== -1) {
    code = code.substring(0, lastBraceIdx) + code.substring(lastBraceIdx + 1);
  }

  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (
      !t ||
      t.startsWith('//') ||
      t.startsWith('/*') ||
      t.startsWith('*') ||
      t.endsWith('{') ||
      t.endsWith('}') ||
      t.startsWith('class') ||
      t.includes('public int[] twoSum') ||
      t.startsWith('for') ||
      t.startsWith('if') ||
      t.startsWith('while')
    ) {
      continue;
    }
    if (!t.endsWith(';') && !t.endsWith(':')) {
      throw new Error(`Compile Error: ';' expected at line ${i + 1}: "${t}"`);
    }
  }

  // Transform method declaration
  code = code.replace(/public\s+int\[\]\s+twoSum\s*\([^)]*\)\s*\{/, 'function twoSum(nums, target) {');
  // Transform new int[]{a, b} -> [a, b]
  code = code.replace(/new\s+int\[\]\s*\{([^}]*)\}/g, '[$1]');
  // Transform new HashMap<...>() -> new Map()
  code = code.replace(/new\s+HashMap<[^>]*>\s*\(\)/g, 'new Map()');
  code = code.replace(/new\s+HashMap\s*\(\)/g, 'new Map()');
  // Strip types
  code = code.replace(/\b(int|Map<[^>]*>|HashMap<[^>]*>|Integer)\s+([a-zA-Z_]\w*)/g, 'let $2');
  code = code.replace(/\.containsKey\(/g, '.has(');
  code = code.replace(/\.put\(/g, '.set(');

  return code;
}

/**
 * Transpiles C TwoSum code to executable JS with syntax checking.
 */
function transpileCToJS(cCode: string): string {
  checkBalancedBrackets(cCode);

  if (!cCode.includes('twoSum')) {
    throw new Error("Compile Error: Function 'twoSum' not found.");
  }

  let code = cCode;
  code = code.replace(/#include\s+<[^>]+>/g, '');

  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (
      !t ||
      t.startsWith('//') ||
      t.startsWith('/*') ||
      t.startsWith('*') ||
      t.endsWith('{') ||
      t.endsWith('}') ||
      t.includes('twoSum(') ||
      t.startsWith('for') ||
      t.startsWith('if') ||
      t.startsWith('while')
    ) {
      continue;
    }
    if (!t.endsWith(';') && !t.endsWith(':')) {
      throw new Error(`Compile Error: expected ';' at line ${i + 1}: "${t}"`);
    }
  }

  code = code.replace(/int\*\s+twoSum\s*\([^)]*\)\s*\{/, 'function twoSum(nums, target) { const numsSize = nums.length;');
  code = code.replace(/\*returnSize\s*=\s*[^;]+;/g, '');
  code = code.replace(/\(int\*\)\s*malloc\([^;]*\)/g, '[0, 0]');
  code = code.replace(/\bmalloc\([^;]*\)/g, '[0, 0]');
  code = code.replace(/\b(int\*|int|void)\s+/g, 'let ');
  code = code.replace(/return\s+NULL;/g, 'return [];');

  return code;
}

/**
 * Transpiles or prepares user code to run in the JS sandbox.
 */
function createRunner(code: string, language: SupportedLanguage): (nums: number[], target: number) => [number, number] {
  let executableJS = '';

  if (language === 'javascript') {
    checkBalancedBrackets(code);
    executableJS = `
      ${code}
      if (typeof twoSum !== 'function') {
        throw new Error("Function 'twoSum' is not defined.");
      }
      return twoSum;
    `;
  } else if (language === 'python') {
    const transpiled = transpilePythonToJS(code);
    executableJS = `
      ${transpiled}
      if (typeof twoSum !== 'function') {
        throw new Error("Function 'twoSum' is not defined.");
      }
      return twoSum;
    `;
  } else if (language === 'java') {
    const transpiled = transpileJavaToJS(code);
    executableJS = `
      ${transpiled}
      if (typeof twoSum !== 'function') {
        throw new Error("Function 'twoSum' is not defined.");
      }
      return twoSum;
    `;
  } else if (language === 'c') {
    const transpiled = transpileCToJS(code);
    executableJS = `
      ${transpiled}
      if (typeof twoSum !== 'function') {
        throw new Error("Function 'twoSum' is not defined.");
      }
      return twoSum;
    `;
  } else {
    throw new Error(`Unsupported language: ${language}`);
  }

  const fnFactory = new Function(executableJS);
  return fnFactory();
}

/**
 * Runs test cases against user code.
 */
export function executeTests(
  code: string,
  language: SupportedLanguage,
  includeLocked: boolean = false
): ExecutionResult {
  const tests = includeLocked ? ALL_TEST_CASES : VISIBLE_TEST_CASES;
  const startTime = performance.now();

  let runner: (nums: number[], target: number) => [number, number];
  try {
    runner = createRunner(code, language);
  } catch (err: any) {
    return {
      passed: false,
      totalRun: tests.length,
      passedCount: 0,
      results: [],
      error: err?.message || 'Compile / Syntax Error',
    };
  }

  const results: ExecutionResult['results'] = [];
  let passedCount = 0;

  for (const tc of tests) {
    try {
      const actual = runner([...tc.nums], tc.target);
      // Valid answer: array of two distinct indices whose values sum to target
      let isCorrect = false;
      if (
        Array.isArray(actual) &&
        actual.length === 2 &&
        typeof actual[0] === 'number' &&
        typeof actual[1] === 'number' &&
        actual[0] !== actual[1] &&
        actual[0] >= 0 &&
        actual[0] < tc.nums.length &&
        actual[1] >= 0 &&
        actual[1] < tc.nums.length
      ) {
        const sum = tc.nums[actual[0]] + tc.nums[actual[1]];
        if (sum === tc.target) {
          isCorrect = true;
        }
      }

      if (isCorrect) {
        passedCount++;
        results.push({
          id: tc.id,
          passed: true,
          input: { nums: tc.nums, target: tc.target },
          expected: tc.expected,
          actual,
          locked: tc.locked,
        });
      } else {
        results.push({
          id: tc.id,
          passed: false,
          input: { nums: tc.nums, target: tc.target },
          expected: tc.expected,
          actual: actual !== undefined ? actual : 'undefined',
          locked: tc.locked,
        });
      }
    } catch (err: any) {
      results.push({
        id: tc.id,
        passed: false,
        input: { nums: tc.nums, target: tc.target },
        expected: tc.expected,
        error: err?.message || 'Runtime Error',
        locked: tc.locked,
      });
    }
  }

  const duration = Math.round(performance.now() - startTime);

  return {
    passed: passedCount === tests.length,
    totalRun: tests.length,
    passedCount,
    results,
    runtimeMs: duration,
  };
}
