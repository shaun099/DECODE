"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BOARD_LENGTH,
  GRID_SIZE,
  type Board,
  findConflicts,
  generatePuzzle,
  isBoardSolved,
} from "./logic";

interface SudokuGameProps {
  /** Called once when the puzzle is solved. The story framework can hook in here. */
  onWin?: () => void;
}

const GIVEN_CLASS =
  "text-zinc-100 font-semibold cursor-default";
const PLAYER_CLASS =
  "text-cyan-400 font-medium cursor-pointer hover:bg-zinc-800/80";
const CONFLICT_CLASS = "text-red-400";
const SELECTED_CLASS = "bg-cyan-500/25";

export default function SudokuGame({ onWin }: SudokuGameProps) {
  const router = useRouter();
  // Puzzles use Math.random(), which would break SSR hydration, so the first
  // board is generated client-side after mount. The server renders an empty grid.
  const [puzzle, setPuzzle] = useState<Board>(() => new Array(BOARD_LENGTH).fill(0) as Board);
  const [board, setBoard] = useState<Board>(() => [...puzzle]);
  const [selected, setSelected] = useState<number>(-1);
  const [won, setWon] = useState(false);
  const wonRef = useRef(false);

  const givens = useMemo(() => {
    const set = new Set<number>();
    puzzle.forEach((value, i) => {
      if (value !== 0) set.add(i);
    });
    return set;
  }, [puzzle]);

  const conflicts = useMemo(() => findConflicts(board), [board]);

  const solved = useMemo(() => isBoardSolved(board), [board]);

  // Fire the win callback exactly once when the board is solved.
  useEffect(() => {
    if (solved && !wonRef.current) {
      wonRef.current = true;
      setWon(true);
      onWin?.();
    }
  }, [solved, onWin]);

  const newGame = useCallback(() => {
    const fresh = generatePuzzle().puzzle;
    setPuzzle(fresh);
    setBoard([...fresh]);
    setSelected(-1);
    setWon(false);
    wonRef.current = false;
  }, []);

  // Generate the first puzzle after mount — Math.random() must not run on the
  // server or hydration would fail (the server renders an empty grid).
  useEffect(() => {
    newGame();
  }, [newGame]);

  const setCell = useCallback(
    (index: number, value: number) => {
      if (won || givens.has(index)) return;
      setBoard((prev) => {
        if (prev[index] === value) return prev;
        const next = [...prev];
        next[index] = value;
        return next;
      });
    },
    [won, givens],
  );

  const clearCell = useCallback(
    (index: number) => {
      if (won || givens.has(index)) return;
      setBoard((prev) => {
        if (prev[index] === 0) return prev;
        const next = [...prev];
        next[index] = 0;
        return next;
      });
    },
    [won, givens],
  );

  // Keyboard input: 1-9 to fill, Backspace/Delete/0 to erase, arrows to move.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (won) return;
      const key = event.key;
      if (key >= "1" && key <= "9") {
        event.preventDefault();
        if (selected >= 0) setCell(selected, Number(key));
        return;
      }
      if (key === "Backspace" || key === "Delete" || key === "0") {
        event.preventDefault();
        if (selected >= 0) clearCell(selected);
        return;
      }
      if (selected < 0) return;
      const move: Record<string, number> = {
        ArrowUp: -GRID_SIZE,
        ArrowDown: GRID_SIZE,
        ArrowLeft: -1,
        ArrowRight: 1,
      };
      const delta = move[key];
      if (delta !== undefined) {
        event.preventDefault();
        const next = selected + delta;
        if (next >= 0 && next < BOARD_LENGTH) setSelected(next);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [won, selected, setCell, clearCell]);

  const selectedValue = selected >= 0 ? board[selected] : 0;

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-10">
      <h1 className="text-3xl font-bold tracking-widest text-zinc-100">
        SUDOKU
      </h1>
      <p className="text-sm text-zinc-500">
        Fill the grid so every row, column and 3×3 box contains 1–9.
      </p>

      <div className="grid grid-cols-9 gap-px rounded-lg border-2 border-zinc-600 bg-zinc-600 p-px shadow-[0_0_40px_rgba(34,211,238,0.08)]">
        {board.map((value, index) => {
          const isGiven = givens.has(index);
          const isSelected = selected === index;
          const isConflict = conflicts.has(index);
          const isSameNumber =
            !isSelected && selectedValue !== 0 && value === selectedValue;
          const row = Math.floor(index / GRID_SIZE);
          const col = index % GRID_SIZE;

          let className =
            "flex h-10 w-10 items-center justify-center text-lg select-none outline-none transition-colors sm:h-12 sm:w-12";
          // 3x3 box separators via thicker borders
          if (col % 3 === 0 && col !== 0) className += " border-l-2 border-l-zinc-600";
          if (row % 3 === 0 && row !== 0) className += " border-t-2 border-t-zinc-600";
          if (isSelected) className += ` ${SELECTED_CLASS}`;
          else if (isSameNumber) className += " bg-cyan-500/10";
          else className += " bg-zinc-900";
          if (isGiven) className += ` ${GIVEN_CLASS}`;
          else className += ` ${PLAYER_CLASS}`;
          if (isConflict) className += ` ${CONFLICT_CLASS}`;

          return (
            <button
              key={index}
              type="button"
              aria-label={`Cell row ${row + 1} column ${col + 1}${value ? `, value ${value}` : ", empty"}`}
              className={className}
              onClick={() => setSelected(isSelected ? -1 : index)}
            >
              {value !== 0 ? value : ""}
            </button>
          );
        })}
      </div>

      {/* Number pad */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            disabled={won || selected < 0}
            className="h-11 w-11 rounded-lg border border-zinc-700 bg-zinc-800 text-lg font-semibold text-zinc-100 transition-colors hover:border-cyan-500/60 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setCell(selected, n)}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          disabled={won || selected < 0}
          className="h-11 rounded-lg border border-zinc-700 bg-zinc-800 px-4 text-sm font-semibold text-zinc-400 transition-colors hover:border-red-500/60 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => clearCell(selected)}
        >
          Erase
        </button>
      </div>

      

      {/* Victory overlay */}
      {won && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-cyan-500/40 bg-zinc-900 px-10 py-12 text-center shadow-[0_0_60px_rgba(34,211,238,0.25)]">
            <div className="text-6xl">🔑</div>
            <h2 className="text-3xl font-bold text-zinc-100">
              Puzzle Solved!
            </h2>
            <p className="max-w-xs text-sm text-zinc-400">
              Every row, column and box is complete. A key may be waiting…
            </p>
            <button
              type="button"
              className="mt-2 rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-500"
              onClick={() => router.push("/play")}
            >
              Go Back To Tasks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}