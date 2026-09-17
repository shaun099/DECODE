export interface CodingProblem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  functionName: {
    js: string;
    python: string;
    c: string;
  };
  starterCode: {
    js: string;
    python: string;
    c: string;
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
    description: "Write a function named 'square' that accepts a number n and returns its square (n * n).",
    difficulty: 'Easy',
    functionName: {
      js: 'square',
      python: 'square',
      c: 'square',
    },
    starterCode: {
      js: '',
      python: '',
      c: '',
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
    description: "Write a function named 'reverseString' in JavaScript (or 'reverse_string' in Python/C) that accepts a string s and returns the reversed string.",
    difficulty: 'Easy',
    functionName: {
      js: 'reverseString',
      python: 'reverse_string',
      c: 'reverse_string',
    },
    starterCode: {
      js: '',
      python: '',
      c: '',
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
    description: "Write a function named 'isEven' in JavaScript (or 'is_even' in Python/C) that accepts an integer n and returns true (or 1) if n is even, and false (or 0) otherwise.",
    difficulty: 'Easy',
    functionName: {
      js: 'isEven',
      python: 'is_even',
      c: 'is_even',
    },
    starterCode: {
      js: '',
      python: '',
      c: '',
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
    description: "Write a function named 'sumArray' in JavaScript (or 'sum_array' in Python/C; in C: 'int sum_array(const int* arr, int size)') that accepts an array of numbers and returns their total sum. Return 0 for an empty array.",
    difficulty: 'Easy',
    functionName: {
      js: 'sumArray',
      python: 'sum_array',
      c: 'sum_array',
    },
    starterCode: {
      js: '',
      python: '',
      c: '',
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
    description: "Write a function named 'countVowels' in JavaScript (or 'count_vowels' in Python/C) that accepts a string s and returns the total count of vowels (a, e, i, o, u, case-insensitive).",
    difficulty: 'Easy',
    functionName: {
      js: 'countVowels',
      python: 'count_vowels',
      c: 'count_vowels',
    },
    starterCode: {
      js: '',
      python: '',
      c: '',
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
      { input: ['blind coding challenge'], expected: 6 },
      { input: [''], expected: 0 },
    ],
  },
];

