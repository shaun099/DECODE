// Puzzle data and answer checking. Server only — never imported by Game.tsx.

export interface Challenge {
    id: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    code: string;
}

export const CHALLENGES: Challenge[] = [
    {
        id: 1,
        difficulty: 'Easy',
        code: `a = 17
b = 5
c = a // b
d = a % b
print(c + d)`,
    },
    {
        id: 2,
        difficulty: 'Medium',
        code: `score = 84
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "D"
print(grade)`,
    },
    {
        id: 3,
        difficulty: 'Medium',
        code: `total = 0
for i in range(1, 6):
    if i % 2 == 0:
        total += i
print(total)`,
    },
    {
        id: 4,
        difficulty: 'Medium',
        code: `def classify(n):
    if n % 3 == 0 and n % 5 == 0:
        return "F"
    elif n % 3 == 0:
        return "E"
    else:
        return "G"

print(classify(9))`,
    },
    {
        id: 5,
        difficulty: 'Hard',
        code: `total = 0
for i in range(1, 4):
    for j in range(1, 3):
        total += i * j
print(total)`,
    },
    {
        id: 6,
        difficulty: 'Hard',
        code: `def step(n):
    if n % 2 == 0:
        return n // 2
    return n * 3 + 1

value = 7
for i in range(4):
    value = step(value)

print(value)`,
    },
];

export const TOTAL_CHALLENGES = CHALLENGES.length;

/** Never leaves the server. Index-aligned with CHALLENGES. */
const ANSWERS: string[] = ['5', 'B', '6', 'E', '18', '17'];

export const normalize = (v: string) => v.trim().toLowerCase();

export function checkAnswer(index: number, guess: string): boolean {
    const answer = ANSWERS[index];
    if (answer === undefined) return false;
    return normalize(guess) === normalize(answer);
}
