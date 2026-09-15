// Server only. Maze generation, question banks, answers.

export interface Question { q: string; options: string[]; answer: number }
export interface Cell { r: number; c: number }

export const ROWS = 21;
export const COLS = 31;
export const TOTAL_MS = 5 * 60 * 1000;
export const LIVES = 3;
export const DOORS_L1 = 5;
export const DOORS_L2 = 10;

export const EASY: Question[] = [
  { q: 'Which data structure follows LIFO?', options: ['Queue', 'Stack', 'Graph', 'Heap'], answer: 1 },
  { q: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Primary Utility', 'Core Program Unit', 'Central Program User'], answer: 0 },
  { q: 'Which language is mainly used to style web pages?', options: ['HTML', 'CSS', 'SQL', 'C'], answer: 1 },
  { q: 'Which SQL command is used to retrieve data?', options: ['GET', 'SELECT', 'FETCHROW', 'READ'], answer: 1 },
  { q: 'Which data structure follows FIFO?', options: ['Stack', 'Queue', 'Tree', 'Array'], answer: 1 },
  { q: 'What is the main purpose of an operating system?', options: ['Manage computer resources', 'Design websites', 'Compile only Java', 'Store only images'], answer: 0 },
  { q: 'Which is a valid primary key property?', options: ['It can be duplicated', 'It uniquely identifies a row', 'It must be a password', 'It stores only text'], answer: 1 },
  { q: 'What is an algorithm?', options: ['A programming language', 'A step-by-step solution to a problem', 'A database', 'A CPU register'], answer: 1 },
  { q: 'Which protocol is commonly used for web pages?', options: ['HTTP', 'FTP only', 'SMTP only', 'BIOS'], answer: 0 },
  { q: 'What does RAM provide?', options: ['Temporary working memory', 'Permanent optical storage', 'Internet access', 'Power supply'], answer: 0 },
];

export const HARD: Question[] = [
  { q: 'What is the average-case time complexity of binary search on a sorted array?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answer: 1 },
  { q: 'Which normal form removes partial dependency on a composite key?', options: ['1NF', '2NF', '3NF', 'BCNF'], answer: 1 },
  { q: 'Which CPU scheduling algorithm can cause starvation?', options: ['FCFS', 'Round Robin', 'Priority Scheduling', 'FIFO disk scheduling'], answer: 2 },
  { q: 'Which traversal of a BST visits keys in sorted order?', options: ['Preorder', 'Postorder', 'Inorder', 'Level order'], answer: 2 },
  { q: 'Which protocol maps an IP address to a MAC address on a local network?', options: ['DNS', 'ARP', 'HTTP', 'DHCP'], answer: 1 },
  { q: 'What does a page fault indicate?', options: ['A CPU overflow', 'A referenced page is not currently in physical memory', 'A database lock', 'A syntax error'], answer: 1 },
  { q: 'Which compiler phase converts source code into tokens?', options: ['Lexical analysis', 'Code generation', 'Optimization', 'Linking'], answer: 0 },
  { q: 'For a connected graph with n vertices, a spanning tree has how many edges?', options: ['n-1', 'n', 'n+1', '2n'], answer: 0 },
  { q: 'Which ACID property ensures a transaction is all-or-nothing?', options: ['Consistency', 'Isolation', 'Atomicity', 'Durability'], answer: 2 },
  { q: 'Which technique uses overlapping subproblems and optimal substructure?', options: ['Dynamic programming', 'Linear probing', 'Paging', 'Lexical analysis'], answer: 0 },
];

const key = (r: number, c: number) => `${r},${c}`;
const same = (a: Cell, b: Cell) => a.r === b.r && a.c === b.c;
const inside = (r: number, c: number) => r > 0 && c > 0 && r < ROWS - 1 && c < COLS - 1;

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Depth-first maze. Returns the wall grid as a flat 0/1 string. */
export function generateMaze(): string {
  const walls = new Set<string>();
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) walls.add(key(r, c));

  const stack: Cell[] = [{ r: 1, c: 1 }];
  walls.delete(key(1, 1));
  const dirs = [{ dr: -2, dc: 0 }, { dr: 2, dc: 0 }, { dr: 0, dc: -2 }, { dr: 0, dc: 2 }];

  while (stack.length) {
    const cur = stack[stack.length - 1];
    const choices = shuffled(dirs).filter(
      (d) => inside(cur.r + d.dr, cur.c + d.dc) && walls.has(key(cur.r + d.dr, cur.c + d.dc)),
    );
    if (!choices.length) { stack.pop(); continue; }
    const d = choices[0];
    walls.delete(key(cur.r + d.dr, cur.c + d.dc));
    walls.delete(key(cur.r + d.dr / 2, cur.c + d.dc / 2));
    stack.push({ r: cur.r + d.dr, c: cur.c + d.dc });
  }

  // guarantee the exit corner is reachable
  walls.delete(key(ROWS - 2, COLS - 2));
  walls.delete(key(ROWS - 2, COLS - 3));
  walls.delete(key(ROWS - 3, COLS - 2));
  walls.delete(key(1, 2));

  let out = '';
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) out += walls.has(key(r, c)) ? '1' : '0';
  return out;
}

export const isWall = (grid: string, r: number, c: number) => grid[r * COLS + c] === '1';

/** Shortest route from the entrance to the exit. */
export function findPath(grid: string): Cell[] {
  const start = { r: 1, c: 1 };
  const exit = { r: ROWS - 2, c: COLS - 2 };
  const q: Cell[] = [start];
  const prev = new Map<string, string>();
  const seen = new Set<string>([key(1, 1)]);

  while (q.length) {
    const cur = q.shift()!;
    if (same(cur, exit)) break;
    const around = [
      { r: cur.r - 1, c: cur.c }, { r: cur.r + 1, c: cur.c },
      { r: cur.r, c: cur.c - 1 }, { r: cur.r, c: cur.c + 1 },
    ].filter((n) => n.r >= 0 && n.r < ROWS && n.c >= 0 && n.c < COLS && !isWall(grid, n.r, n.c));

    for (const n of around) {
      if (seen.has(key(n.r, n.c))) continue;
      seen.add(key(n.r, n.c));
      prev.set(key(n.r, n.c), key(cur.r, cur.c));
      q.push(n);
    }
  }

  const path: Cell[] = [];
  let cur: Cell | undefined = exit;
  while (cur) {
    path.push(cur);
    if (same(cur, start)) break;
    const p = prev.get(key(cur.r, cur.c));
    if (!p) break;
    const [r, c] = p.split(',').map(Number);
    cur = { r, c };
  }
  return path.reverse();
}

/** Spread N doors along the main route so each one genuinely blocks it. */
export function placeDoors(grid: string, count: number): Cell[] {
  const path = findPath(grid);
  const usable = path.slice(3, -3);
  const step = Math.max(1, Math.floor(usable.length / (count + 1)));
  const out: Cell[] = [];

  for (let i = 1; i <= count && out.length < count; i++) {
    const p = usable[Math.min(usable.length - 1, i * step)];
    if (p && !out.some((x) => same(x, p))) out.push(p);
  }
  for (const p of usable) {
    if (out.length >= count) break;
    if (!out.some((x) => same(x, p))) out.push(p);
  }
  return out.slice(0, count);
}

export const questionFor = (level: number, index: number): Question => {
  const bank = level === 1 ? EASY : HARD;
  return bank[index % bank.length];
};