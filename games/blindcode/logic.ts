export interface CodingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  functionName: {
    js: string;
    python: string;
  };
  starterCode: {
    js: string;
    python: string;
  };
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  testCases: {
    input: any[];
    expected: any;
  }[];
}

export const PROBLEMS: CodingProblem[] = [
  {
    id: 'square',
    title: 'Square of a Number',
    description: 'Write a function that takes a number n and returns its square (n * n).',
    difficulty: 'Easy',
    functionName: {
      js: 'square',
      python: 'square',
    },
    starterCode: {
      js: 'function square(n) {\n  return n * n;\n}',
      python: 'def square(n):\n    return n * n',
    },
    examples: [
      { input: 'n = 5', output: '25' },
      { input: 'n = -3', output: '9' },
      { input: 'n = 0', output: '0' },
    ],
    testCases: [
      { input: [5], expected: 25 },
      { input: [-3], expected: 9 },
      { input: [0], expected: 0 },
      { input: [12], expected: 144 },
      { input: [1], expected: 1 },
    ],
  },
  {
    id: 'reverse_string',
    title: 'Reverse a String',
    description: 'Write a function that takes a string s and returns the reversed string.',
    difficulty: 'Easy',
    functionName: {
      js: 'reverseString',
      python: 'reverse_string',
    },
    starterCode: {
      js: 'function reverseString(s) {\n  return s.split("").reverse().join("");\n}',
      python: 'def reverse_string(s):\n    return s[::-1]',
    },
    examples: [
      { input: 's = "hello"', output: '"olleh"' },
      { input: 's = "world"', output: '"dlrow"' },
      { input: 's = "a"', output: '"a"' },
    ],
    testCases: [
      { input: ['hello'], expected: 'olleh' },
      { input: ['world'], expected: 'dlrow' },
      { input: ['blind'], expected: 'dnilb' },
      { input: ['racecar'], expected: 'racecar' },
      { input: [''], expected: '' },
    ],
  },
  {
    id: 'is_even',
    title: 'Check Even Integer',
    description: 'Write a function that returns true (or True) if the integer n is even, and false (or False) otherwise.',
    difficulty: 'Easy',
    functionName: {
      js: 'isEven',
      python: 'is_even',
    },
    starterCode: {
      js: 'function isEven(n) {\n  return n % 2 === 0;\n}',
      python: 'def is_even(n):\n    return n % 2 == 0',
    },
    examples: [
      { input: 'n = 4', output: 'true' },
      { input: 'n = 7', output: 'false' },
      { input: 'n = 0', output: 'true' },
    ],
    testCases: [
      { input: [4], expected: true },
      { input: [7], expected: false },
      { input: [0], expected: true },
      { input: [-2], expected: true },
      { input: [-9], expected: false },
    ],
  },
  {
    id: 'sum_array',
    title: 'Sum of Array Elements',
    description: 'Write a function that takes an array/list of numbers and returns their total sum. Return 0 for an empty array.',
    difficulty: 'Easy',
    functionName: {
      js: 'sumArray',
      python: 'sum_array',
    },
    starterCode: {
      js: 'function sumArray(arr) {\n  return arr.reduce((a, b) => a + b, 0);\n}',
      python: 'def sum_array(arr):\n    return sum(arr)',
    },
    examples: [
      { input: 'arr = [1, 2, 3, 4]', output: '10' },
      { input: 'arr = [-5, 5]', output: '0' },
      { input: 'arr = []', output: '0' },
    ],
    testCases: [
      { input: [[1, 2, 3, 4]], expected: 10 },
      { input: [[-5, 5]], expected: 0 },
      { input: [[]], expected: 0 },
      { input: [[100, 200, 300]], expected: 600 },
      { input: [[42]], expected: 42 },
    ],
  },
  {
    id: 'count_vowels',
    title: 'Count Vowels',
    description: 'Write a function that returns the total count of vowels (a, e, i, o, u, case-insensitive) in string s.',
    difficulty: 'Easy',
    functionName: {
      js: 'countVowels',
      python: 'count_vowels',
    },
    starterCode: {
      js: 'function countVowels(s) {\n  return (s.match(/[aeiou]/gi) || []).length;\n}',
      python: 'def count_vowels(s):\n    return sum(1 for c in s.lower() if c in "aeiou")',
    },
    examples: [
      { input: 's = "hello"', output: '2' },
      { input: 's = "sky"', output: '0' },
      { input: 's = "AEIOU"', output: '5' },
    ],
    testCases: [
      { input: ['hello'], expected: 2 },
      { input: ['sky'], expected: 0 },
      { input: ['AEIOU'], expected: 5 },
      { input: ['blind coding challenge'], expected: 7 },
      { input: [''], expected: 0 },
    ],
  },
];

