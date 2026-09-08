// Pure sudoku logic: generation, uniqueness, conflicts, win detection.
// No React — kept separate so the story framework can reuse or test it.

export type Cell = number; // 0 = empty, 1-9 = filled

export type Board = Cell[]; // 81 cells, row-major order

export const GRID_SIZE = 9;
export const BOARD_LENGTH = GRID_SIZE * GRID_SIZE;

function rowOf(index: number): number {
  return Math.floor(index / GRID_SIZE);
}

function colOf(index: number): number {
  return index % GRID_SIZE;
}

/** Indices of the 3x3 box a cell belongs to. */
export function boxPeers(index: number): number[] {
  const boxRow = Math.floor(rowOf(index) / 3) * 3;
  const boxCol = Math.floor(colOf(index) / 3) * 3;
  const peers: number[] = [];
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      peers.push(r * GRID_SIZE + c);
    }
  }
  return peers;
}

/** Find a candidate list for an empty cell given current assignments. */
function candidatesFor(board: Board, index: number): number[] {
  const used = new Set<number>();
  const row = rowOf(index);
  const col = colOf(index);
  for (let i = 0; i < GRID_SIZE; i++) {
    const rowCell = board[row * GRID_SIZE + i];
    const colCell = board[i * GRID_SIZE + col];
    if (rowCell !== 0) used.add(rowCell);
    if (colCell !== 0) used.add(colCell);
  }
  for (const peer of boxPeers(index)) {
    if (board[peer] !== 0) used.add(board[peer]);
  }
  const result: number[] = [];
  for (let n = 1; n <= 9; n++) {
    if (!used.has(n)) result.push(n);
  }
  return result;
}

/** Fill an empty board completely using randomized backtracking. */
export function generateSolvedGrid(): Board {
  const board: Board = new Array(BOARD_LENGTH).fill(0) as Board;

  function fill(index: number): boolean {
    if (index === BOARD_LENGTH) return true;
    const candidates = candidatesFor(board, index);
    // Shuffle candidates so each generation is different
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    for (const n of candidates) {
      board[index] = n;
      if (fill(index + 1)) return true;
      board[index] = 0;
    }
    return false;
  }

  fill(0);
  return board;
}

/** Count solutions up to `limit`. Used to guarantee unique puzzles. */
function countSolutions(board: Board, limit: number): number {
  // Find the empty cell with the fewest candidates for faster search
  let bestIndex = -1;
  let bestCandidates: number[] = [];
  for (let i = 0; i < BOARD_LENGTH; i++) {
    if (board[i] === 0) {
      const cands = candidatesFor(board, i);
      if (cands.length === 0) return 0; // dead end
      if (bestIndex === -1 || cands.length < bestCandidates.length) {
        bestIndex = i;
        bestCandidates = cands;
        if (cands.length === 1) break;
      }
    }
  }
  if (bestIndex === -1) return 1; // board complete -> exactly one solution

  let count = 0;
  for (const n of bestCandidates) {
    board[bestIndex] = n;
    count += countSolutions(board, limit - count);
    board[bestIndex] = 0;
    if (count >= limit) break;
  }
  return count;
}

/** Indices of cells whose value clashes with a row/col/box peer. */
export function findConflicts(board: Board): Set<number> {
  const conflicts = new Set<number>();
  for (let i = 0; i < BOARD_LENGTH; i++) {
    const value = board[i];
    if (value === 0) continue;
    const row = rowOf(i);
    const col = colOf(i);
    // Row peers
    for (let c = 0; c < GRID_SIZE; c++) {
      const j = row * GRID_SIZE + c;
      if (j !== i && board[j] === value) {
        conflicts.add(i);
        conflicts.add(j);
      }
    }
    // Column peers
    for (let r = 0; r < GRID_SIZE; r++) {
      const j = r * GRID_SIZE + col;
      if (j !== i && board[j] === value) {
        conflicts.add(i);
        conflicts.add(j);
      }
    }
    // Box peers
    for (const j of boxPeers(i)) {
      if (j !== i && board[j] === value) {
        conflicts.add(i);
        conflicts.add(j);
      }
    }
  }
  return conflicts;
}

/** True when every cell is filled and no two peers share a value. */
export function isBoardSolved(board: Board): boolean {
  for (let i = 0; i < BOARD_LENGTH; i++) {
    if (board[i] === 0) return false;
  }
  return findConflicts(board).size === 0;
}

/**
 * Generate a puzzle with a unique solution.
 * Removes cells from a full grid while uniqueness holds.
 */
export function generatePuzzle(targetEmpty = 45): { puzzle: Board; solution: Board } {
  const solution = generateSolvedGrid();
  const puzzle = [...solution];
  const indices = Array.from({ length: BOARD_LENGTH }, (_, i) => i);
  // Shuffle removal order
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  let empty = 0;
  for (const index of indices) {
    if (empty >= targetEmpty) break;
    const backup = puzzle[index];
    puzzle[index] = 0;
    const count = countSolutions([...puzzle], 2);
    if (count === 1) {
      empty++;
    } else {
      puzzle[index] = backup; // restore to keep uniqueness
    }
  }

  return { puzzle, solution };
}
