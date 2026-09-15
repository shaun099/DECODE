export const MIN_NUMBER = 1000;
export const MAX_NUMBER = 9999;
export const MAX_GUESSES = 4;

export interface Clue {
  id: string;
  text: string;
}

interface CandidateClue {
  id: string;
  text: (number: number) => string;
  test: (candidate: number, secret: number) => boolean;
}

function digits(number: number): number[] {
  return String(number)
    .padStart(4, '0')
    .split('')
    .map(Number);
}

function digitSum(number: number): number {
  return digits(number).reduce((sum, digit) => sum + digit, 0);
}

function digitProduct(number: number): number {
  return digits(number).reduce((product, digit) => product * digit, 1);
}

function reverseNumber(number: number): number {
  return Number(String(number).split('').reverse().join(''));
}

function firstTwo(number: number): number {
  return Math.floor(number / 100);
}

function lastTwo(number: number): number {
  return number % 100;
}

function middleTwo(number: number): number {
  const d = digits(number);
  return d[1] * 10 + d[2];
}

function allDigitsDistinct(number: number): boolean {
  return new Set(digits(number)).size === 4;
}

function exactlyOneRepeatedDigit(number: number): boolean {
  const counts = new Map<number, number>();

  for (const digit of digits(number)) {
    counts.set(digit, (counts.get(digit) ?? 0) + 1);
  }

  return [...counts.values()].filter((count) => count === 2).length === 1;
}

function countEvenDigits(number: number): number {
  return digits(number).filter((digit) => digit % 2 === 0).length;
}

function countOddDigits(number: number): number {
  return digits(number).filter((digit) => digit % 2 !== 0).length;
}

function hasZero(number: number): boolean {
  return digits(number).includes(0);
}

function isPrime(number: number): boolean {
  if (number < 2) return false;

  for (let i = 2; i * i <= number; i++) {
    if (number % i === 0) return false;
  }

  return true;
}

/*
 * The clue pool intentionally mixes mathematical,
 * structural and story-style clues.
 *
 * None of these directly reveal an individual digit.
 */
const CLUE_POOL: CandidateClue[] = [
  {
    id: 'thousands',
    text: (n) => {
      const first = digits(n)[0];

      return `The archive places the code in the ${first}000s.`;
    },
    test: (candidate, secret) =>
      Math.floor(candidate / 1000) === Math.floor(secret / 1000),
  },

  {
    id: 'digit-sum-parity',
    text: (n) =>
      `The sum of the four digits is ${
        digitSum(n) % 2 === 0 ? 'even' : 'odd'
      }.`,
    test: (candidate, secret) =>
      digitSum(candidate) % 2 === digitSum(secret) % 2,
  },

  {
    id: 'digit-sum-range',
    text: (n) => {
      const sum = digitSum(n);

      if (sum <= 12) {
        return 'The four symbols together carry a surprisingly small numerical weight: their sum is 12 or less.';
      }

      if (sum <= 20) {
        return 'The four symbols together have a moderate numerical weight: their sum lies between 13 and 20.';
      }

      if (sum <= 28) {
        return 'The four symbols together carry considerable numerical weight: their sum lies between 21 and 28.';
      }

      return 'The four symbols together are unusually heavy: their sum is above 28.';
    },
    test: (candidate, secret) => {
      const sum = digitSum(candidate);
      const secretSum = digitSum(secret);

      const bucket = sum <= 12 ? 0 : sum <= 20 ? 1 : sum <= 28 ? 2 : 3;
      const secretBucket =
        secretSum <= 12
          ? 0
          : secretSum <= 20
            ? 1
            : secretSum <= 28
              ? 2
              : 3;

      return bucket === secretBucket;
    },
  },

  {
    id: 'last-parity',
    text: (n) =>
      `The final symbol belongs to the ${
        digits(n)[3] % 2 === 0 ? 'even' : 'odd'
      } side of the number line.`,
    test: (candidate, secret) =>
      digits(candidate)[3] % 2 === digits(secret)[3] % 2,
  },

  {
    id: 'first-last',
    text: (n) => {
      const [first, , , last] = digits(n);

      if (first > last) {
        return 'The opening symbol stands numerically above the closing symbol.';
      }

      if (first < last) {
        return 'The closing symbol stands numerically above the opening symbol.';
      }

      return 'The opening and closing symbols occupy the same numerical level.';
    },
    test: (candidate, secret) => {
      const a = digits(candidate);
      const b = digits(secret);

      const relation = a[0] > a[3] ? 1 : a[0] < a[3] ? -1 : 0;
      const secretRelation = b[0] > b[3] ? 1 : b[0] < b[3] ? -1 : 0;

      return relation === secretRelation;
    },
  },

  {
    id: 'middle-relation',
    text: (n) => {
      const d = digits(n);
      const difference = Math.abs(d[1] - d[2]);

      if (difference === 0) {
        return 'The two middle symbols are identical in value.';
      }

      if (difference <= 2) {
        return 'The two middle symbols are very close neighbours.';
      }

      if (difference <= 5) {
        return 'The two middle symbols are separated by a moderate distance.';
      }

      return 'The two middle symbols are far apart.';
    },
    test: (candidate, secret) => {
      const d = digits(candidate);
      const s = digits(secret);

      const bucket = Math.min(3, Math.floor(Math.abs(d[1] - d[2]) / 3));
      const secretBucket = Math.min(
        3,
        Math.floor(Math.abs(s[1] - s[2]) / 3),
      );

      return bucket === secretBucket;
    },
  },

  {
    id: 'distinct',
    text: (n) =>
      allDigitsDistinct(n)
        ? 'No symbol repeats. Every position carries a different value.'
        : 'The code contains a repeated symbol somewhere within its four positions.',
    test: (candidate, secret) =>
      allDigitsDistinct(candidate) === allDigitsDistinct(secret),
  },

  {
    id: 'repeated-once',
    text: (n) =>
      exactlyOneRepeatedDigit(n)
        ? 'One value appears exactly twice, while the other two positions remain different.'
        : 'The code does not follow the one-pair pattern.',
    test: (candidate, secret) =>
      exactlyOneRepeatedDigit(candidate) ===
      exactlyOneRepeatedDigit(secret),
  },

  {
    id: 'even-count',
    text: (n) =>
      `Exactly ${countEvenDigits(n)} of the four symbols are even.`,
    test: (candidate, secret) =>
      countEvenDigits(candidate) === countEvenDigits(secret),
  },

  {
    id: 'zero',
    text: (n) =>
      hasZero(n)
        ? 'A silent zero is hiding somewhere in the code.'
        : 'There is no zero hiding in this code.',
    test: (candidate, secret) =>
      hasZero(candidate) === hasZero(secret),
  },

  {
  id: 'divisible-three',
  text: (n) =>
    n % 3 === 0
      ? 'The archivist notes that the code can be divided evenly into groups of three.'
      : 'Groups of three do not divide this code evenly.',
  test: (candidate, secret) =>
    (candidate % 3 === 0) === (secret % 3 === 0),
},

{
  id: 'divisible-five',
  text: (n) =>
    n % 5 === 0
      ? 'The final mark makes the entire code divisible by five.'
      : 'Five leaves a remainder behind when tested against the code.',
  test: (candidate, secret) =>
    (candidate % 5 === 0) === (secret % 5 === 0),
},

{
  id: 'divisible-seven',
  text: (n) =>
    n % 7 === 0
      ? 'Seven divides the code without leaving a remainder.'
      : 'Seven refuses to divide the code cleanly.',
  test: (candidate, secret) =>
    (candidate % 7 === 0) === (secret % 7 === 0),
},

  {
    id: 'outer-balance',
    text: (n) => {
      const d = digits(n);
      const left = d[0] + d[1];
      const right = d[2] + d[3];

      if (left === right) {
        return 'The two halves of the code have perfectly balanced digit sums.';
      }

      if (left > right) {
        return 'The first half carries a greater digit sum than the second half.';
      }

      return 'The second half carries a greater digit sum than the first half.';
    },
    test: (candidate, secret) => {
      const a = digits(candidate);
      const b = digits(secret);

      const relation =
        a[0] + a[1] > a[2] + a[3]
          ? 1
          : a[0] + a[1] < a[2] + a[3]
            ? -1
            : 0;

      const secretRelation =
        b[0] + b[1] > b[2] + b[3]
          ? 1
          : b[0] + b[1] < b[2] + b[3]
            ? -1
            : 0;

      return relation === secretRelation;
    },
  },

  {
    id: 'halves',
    text: (n) =>
      firstTwo(n) > lastTwo(n)
        ? 'Read as two two-digit fragments, the first fragment is larger.'
        : firstTwo(n) < lastTwo(n)
          ? 'Read as two two-digit fragments, the second fragment is larger.'
          : 'Read as two two-digit fragments, both halves are equal.',
    test: (candidate, secret) => {
      const a = firstTwo(candidate);
      const b = lastTwo(candidate);

      const sa = firstTwo(secret);
      const sb = lastTwo(secret);

      const relation = a > b ? 1 : a < b ? -1 : 0;
      const secretRelation = sa > sb ? 1 : sa < sb ? -1 : 0;

      return relation === secretRelation;
    },
  },

  {
    id: 'middle-parity',
    text: (n) =>
      middleTwo(n) % 2 === 0
        ? 'The two middle positions form an even two-digit value.'
        : 'The two middle positions form an odd two-digit value.',
    test: (candidate, secret) =>
      middleTwo(candidate) % 2 === middleTwo(secret) % 2,
  },

  {
    id: 'reverse-distance',
    text: (n) => {
      const difference = Math.abs(n - reverseNumber(n));

      if (difference === 0) {
        return 'Read backwards and the code remains unchanged.';
      }

      if (difference < 1000) {
        return 'Read backwards, the code changes by less than one thousand.';
      }

      if (difference < 5000) {
        return 'Reversing the code changes its value by a moderate amount.';
      }

      return 'Reversing the code creates a very large numerical shift.';
    },
    test: (candidate, secret) => {
      const difference = Math.abs(candidate - reverseNumber(candidate));
      const secretDifference = Math.abs(
        secret - reverseNumber(secret),
      );

      const bucket =
        difference === 0
          ? 0
          : difference < 1000
            ? 1
            : difference < 5000
              ? 2
              : 3;

      const secretBucket =
        secretDifference === 0
          ? 0
          : secretDifference < 1000
            ? 1
            : secretDifference < 5000
              ? 2
              : 3;

      return bucket === secretBucket;
    },
  },

  {
    id: 'prime',
    text: (n) =>
      isPrime(n)
        ? 'The entire code is itself a prime number.'
        : 'The entire code is not a prime number.',
    test: (candidate, secret) =>
      isPrime(candidate) === isPrime(secret),
  },
];

function candidateCount(
  secret: number,
  selected: CandidateClue[],
): number {
  let count = 0;

  for (let candidate = MIN_NUMBER; candidate <= MAX_NUMBER; candidate++) {
    if (selected.every((clue) => clue.test(candidate, secret))) {
      count++;
    }
  }

  return count;
}

/*
 * Generate a clue set that narrows the search,
 * but does not simply reveal the answer.
 *
 * The target range deliberately remains reasonably large,
 * making the four higher/lower guesses meaningful.
 */
export function generateClues(secret: number): Clue[] {
  const available = [...CLUE_POOL];
  const selected: CandidateClue[] = [];

  const targetMin = 8;
  const targetMax = 250;

  while (available.length > 0 && selected.length < 5) {
    let bestIndex = -1;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let i = 0; i < available.length; i++) {
      const candidateSelection = [
        ...selected,
        available[i],
      ];

      const count = candidateCount(secret, candidateSelection);

      if (count < 2) continue;

      const score =
        count >= targetMin && count <= targetMax
          ? Math.abs(80 - count)
          : count < targetMin
            ? targetMin - count + 500
            : count - targetMax + 200;

      if (score < bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    if (bestIndex === -1) break;

    selected.push(available[bestIndex]);
    available.splice(bestIndex, 1);

    const count = candidateCount(secret, selected);

    if (
      selected.length >= 4 &&
      count >= targetMin &&
      count <= targetMax
    ) {
      break;
    }
  }

  /*
   * Always return at least four clues.
   */
  if (selected.length < 4) {
    for (const clue of CLUE_POOL) {
      if (
        !selected.some((existing) => existing.id === clue.id)
      ) {
        selected.push(clue);
      }

      if (selected.length === 4) break;
    }
  }

  return selected.map((clue) => ({
    id: clue.id,
    text: clue.text(secret),
  }));
}

export function generateNumber(): number {
  return (
    Math.floor(
      Math.random() * (MAX_NUMBER - MIN_NUMBER + 1),
    ) + MIN_NUMBER
  );
}

export function compareGuess(
  guess: number,
  secret: number,
): 'higher' | 'lower' | 'correct' {
  if (guess === secret) return 'correct';

  return guess < secret ? 'higher' : 'lower';
}