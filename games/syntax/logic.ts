export interface CBug {
  id: string;
  level: 1 | 2 | 3;
  brief: string;
  lines: string[];
  badLine: number;          // 0-based index of the line that actually contains the fault
  reason: string;
}

/* ---------- rules ---------- */
export const TARGET_SCORE = 500;                 // points needed to clear the game
export const MAX_QUESTIONS = 12;                 // hard cap on snippets in one run
export const QUESTION_MS = 60 * 1000;            // clock per snippet
export const CLICK_LIMIT = 2;                    // wrong clicks before the panel locks
export const CLICK_LOCK_MS = 60 * 1000;          // how long the panel stays locked
export const TIMEOUT_POINTS = 5;                 // worth once the 60 seconds are gone
export const TIMEOUT_PENALTY_MS = 60 * 1000;     // wait before the next snippet loads

/** 100 / 80 / 60 / 40 by speed, then 5 once the clock has run out. */
export function pointsFor(elapsedMs: number): number {
  const s = elapsedMs / 1000;
  if (s <= 15) return 100;
  if (s <= 30) return 80;
  if (s <= 45) return 60;
  if (s <= 60) return 40;
  return TIMEOUT_POINTS;
}

/* ---------- snippets ---------- */
export const BUGS: CBug[] = [
  // ================= level 1 =================
  {
    id: 'c1', level: 1,
    brief: 'A running total will not compile.',
    lines: [
      '#include <stdio.h>', '',
      'int main(void) {',
      '    int total = 0',
      '    for (int i = 1; i <= 5; i++) {',
      '        total += i;',
      '    }',
      '    printf("%d\\n", total);',
      '    return 0;',
      '}',
    ],
    badLine: 3,
    reason: 'The declaration is missing its semicolon. gcc reports the error on the for line below, because that is where it first notices — the fault is one line higher.',
  },
  {
    id: 'c2', level: 1,
    brief: 'A greeting refuses to build.',
    lines: [
      '#include <stdio.h', '',
      'int main(void) {',
      '    printf("hello\\n");',
      '    return 0;',
      '}',
    ],
    badLine: 0,
    reason: 'The include is missing its closing angle bracket. The preprocessor fails before the compiler ever sees your code.',
  },
  {
    id: 'c3', level: 1,
    brief: 'A function that adds two numbers will not compile.',
    lines: [
      '#include <stdio.h>', '',
      'int add(int a, int b {',
      '    return a + b;',
      '}', '',
      'int main(void) {',
      '    printf("%d\\n", add(2, 3));',
      '    return 0;',
      '}',
    ],
    badLine: 2,
    reason: 'The parameter list is never closed. The opening brace arrives while the compiler is still expecting a closing parenthesis.',
  },
  {
    id: 'c4', level: 1,
    brief: 'A name will not print.',
    lines: [
      '#include <stdio.h>', '',
      'int main(void) {',
      '    char name[20] = "meera;',
      '    printf("%s\\n", name);',
      '    return 0;',
      '}',
    ],
    badLine: 3,
    reason: 'The string literal is never closed. The compiler swallows the rest of the line looking for the second quote.',
  },
  {
    id: 'c5', level: 1,
    brief: 'A variable will not initialise.',
    lines: [
      '#include <stdio.h>', '',
      'int main(void) {',
      '    int x = ;',
      '    printf("%d\\n", x);',
      '    return 0;',
      '}',
    ],
    badLine: 3,
    reason: 'There is nothing on the right of the assignment. C expects an expression before the semicolon.',
  },
  {
    id: 'c6', level: 1,
    brief: 'A variable name the compiler will not accept.',
    lines: [
      '#include <stdio.h>', '',
      'int main(void) {',
      '    int 2count = 5;',
      '    printf("%d\\n", 2count);',
      '    return 0;',
      '}',
    ],
    badLine: 3,
    reason: 'An identifier cannot begin with a digit. The compiler reads 2count as the number 2 followed by nonsense.',
  },

  // ================= level 2 =================
  {
    id: 'c7', level: 2,
    brief: 'A loop over an array will not compile.',
    lines: [
      '#include <stdio.h>', '',
      'int main(void) {',
      '    int n = 4;',
      '    for (int i = 0, i < n, i++) {',
      '        printf("%d ", i);',
      '    }',
      '    return 0;',
      '}',
    ],
    badLine: 4,
    reason: 'A for header is separated by semicolons, not commas. With commas the compiler reads the whole thing as one declaration and gives up at the comparison.',
  },
  {
    id: 'c8', level: 2,
    brief: 'A day-of-week printer will not compile.',
    lines: [
      '#include <stdio.h>', '',
      'int main(void) {',
      '    int day = 3;',
      '    switch (day) {',
      '        case 1;',
      '            printf("Mon");',
      '            break;',
      '        default:',
      '            printf("Other");',
      '    }',
      '    return 0;',
      '}',
    ],
    badLine: 5,
    reason: 'A case label ends with a colon, not a semicolon. The default label below has its colon, which is what makes the odd one out easy to walk past.',
  },
  {
    id: 'c9', level: 2,
    brief: 'A marks printer will not compile.',
    lines: [
      '#include <stdio.h>', '',
      'int main(void) {',
      '    int marks[5] = {40, 55, 90, 72, 68};',
      '    int i = 0;',
      '    while (i < 5] {',
      '        printf("%d ", marks[i]);',
      '        i++;',
      '    }',
      '    return 0;',
      '}',
    ],
    badLine: 5,
    reason: 'The while condition opens with a parenthesis and closes with a square bracket. Square brackets appear twice more here, which is why the mismatch reads as normal.',
  },
  {
    id: 'c10', level: 2,
    brief: 'A counter prints its total, or would.',
    lines: [
      '#include <stdio.h>', '',
      'int main(void) {',
      '    int count = 0;',
      '    while (count < 3) {',
      '        printf("%d\\n", count);',
      '        count++;',
      '    }',
      '    printf("total = %d\\n" count);',
      '    return 0;',
      '}',
    ],
    badLine: 8,
    reason: 'The comma between the format string and the argument is missing. The printf three lines above has its comma, which is exactly why this one looks right.',
  },
  {
    id: 'c11', level: 2,
    brief: 'A do-while loop will not compile.',
    lines: [
      '#include <stdio.h>', '',
      'int main(void) {',
      '    int i = 0;',
      '    do {',
      '        printf("%d ", i);',
      '        i++;',
      '    } while (i < 3)',
      '    return 0;',
      '}',
    ],
    badLine: 7,
    reason: 'A do-while must end with a semicolon after the closing parenthesis. It is the one loop in C that does, which is why it is forgotten.',
  },
  {
    id: 'c12', level: 2,
    brief: 'A two-argument call will not compile.',
    lines: [
      '#include <stdio.h>',
      'void show(int a, int b);', '',
      'int main(void) {',
      '    show(4 7);',
      '    return 0;',
      '}', '',
      'void show(int a, int b) {',
      '    printf("%d %d\\n", a, b);',
      '}',
    ],
    badLine: 4,
    reason: 'The two arguments are not separated by a comma. The compiler stops at the second number, expecting a closing parenthesis.',
  },
  {
    id: 'c13', level: 2,
    brief: 'A conditional that reads like another language.',
    lines: [
      '#include <stdio.h>', '',
      'int main(void) {',
      '    int a = 5;',
      '    if (a > 3) then {',
      '        printf("yes\\n");',
      '    }',
      '    return 0;',
      '}',
    ],
    badLine: 4,
    reason: 'C has no then keyword. The condition in parentheses is followed directly by the block.',
  },
  {
    id: 'c14', level: 2,
    brief: 'An array will not initialise.',
    lines: [
      '#include <stdio.h>', '',
      'int main(void) {',
      '    int values[3] = (10, 20, 30);',
      '    printf("%d\\n", values[0]);',
      '    return 0;',
      '}',
    ],
    badLine: 3,
    reason: 'An array initialiser uses braces, not parentheses. With parentheses this becomes a comma expression, which cannot initialise an array.',
  },

  // ================= level 3 =================
  {
    id: 'c15', level: 3,
    brief: 'A struct program fails, and the error points at main.',
    lines: [
      '#include <stdio.h>', '',
      'struct point { int x; int y; }', '',
      'int main(void) {',
      '    struct point p = {1, 2};',
      '    printf("%d\\n", p.x);',
      '    return 0;',
      '}',
    ],
    badLine: 2,
    reason: 'A struct definition needs a semicolon after its closing brace. Without it the compiler reads int main as part of the same declaration and reports the error two lines below the fault.',
  },
  {
    id: 'c16', level: 3,
    brief: 'A comparison program fails at the very last line.',
    lines: [
      '#include <stdio.h>', '',
      'int main(void) {',
      '    int a = 7, b = 3;',
      '    if (a > b) {',
      '        printf("bigger\\n");',
      '    printf("done\\n");',
      '    return 0;',
      '}',
    ],
    badLine: 5,
    reason: 'The if block is never closed. The compiler only discovers this when the file runs out, so it blames the last line. The missing brace belongs after the printf inside the if.',
  },
  {
    id: 'c17', level: 3,
    brief: 'A totals program has one brace too many.',
    lines: [
      '#include <stdio.h>', '',
      'int main(void) {',
      '    int total = 0;',
      '    int marks[3] = {10, 20, 30};',
      '    for (int i = 0; i < 3; i++) {',
      '        total += marks[i];',
      '    }',
      '    }',
      '    printf("%d\\n", total);',
      '    return 0;',
      '}',
    ],
    badLine: 8,
    reason: 'The extra brace closes main early. Everything after it sits outside any function, so the compiler complains about the printf rather than the brace.',
  },
  {
    id: 'c18', level: 3,
    brief: 'An if-else that closes itself twice.',
    lines: [
      '#include <stdio.h>', '',
      'int main(void) {',
      '    int a = 4;',
      '    if (a > 2) {',
      '        printf("big\\n");',
      '    }',
      '    else',
      '    printf("small\\n");',
      '    }',
      '    return 0;',
      '}',
    ],
    badLine: 9,
    reason: 'The else branch is a single statement needing no braces, so the closing brace after it has nothing to close. It ends main, and the return below is left stranded outside any function.',
  },
];

/* ---------- drawing ---------- */

/** Easy for the first two snippets, medium next three, hard after that. */
export function tierFor(questionIndex: number): 1 | 2 | 3 {
  if (questionIndex < 2) return 1;
  if (questionIndex < 5) return 2;
  return 3;
}

/** Draw an unseen snippet, preferring the right difficulty tier. */
export function drawBug(seen: Set<string>, questionIndex: number): CBug | null {
  const unseen = BUGS.filter((b) => !seen.has(b.id));
  if (unseen.length === 0) return null;
  const tier = tierFor(questionIndex);
  const pool = unseen.filter((b) => b.level === tier);
  const from = pool.length ? pool : unseen;
  return from[Math.floor(Math.random() * from.length)];
}