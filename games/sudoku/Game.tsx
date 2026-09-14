'use client';
import { useEffect, useMemo, useState } from 'react';
import type { GameProps } from '../registry';

/** Indices that clash with another cell in the same row, column or box. */
function findConflicts(board: number[]): Set<number> {
  const bad = new Set<number>();
  const mark = (group: number[]) => {
    const seen = new Map<number, number[]>();
    for (const i of group) {
      const v = board[i];
      if (!v) continue;
      const list = seen.get(v) ?? [];
      list.push(i);
      seen.set(v, list);
    }
    for (const list of seen.values()) {
      if (list.length > 1) list.forEach((i) => bad.add(i));
    }
  };

  for (let r = 0; r < 9; r++) mark(Array.from({ length: 9 }, (_, c) => r * 9 + c));
  for (let c = 0; c < 9; c++) mark(Array.from({ length: 9 }, (_, r) => r * 9 + c));
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const g: number[] = [];
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 3; c++) g.push((br * 3 + r) * 9 + (bc * 3 + c));
      mark(g);
    }
  }
  return bad;
}

export default function SudokuGame({ hud, view, send }: GameProps) {
  const puzzle: number[] = Array.isArray(view?.puzzle) ? view.puzzle : [];

  const [board, setBoard] = useState<number[]>(puzzle);
  const [sel, setSel] = useState(-1);

  useEffect(() => { setBoard(puzzle); setSel(-1); }, [view?.puzzle]);

  const givens = useMemo(
    () => new Set(puzzle.map((v, i) => (v !== 0 ? i : -1)).filter((i) => i >= 0)),
    [view?.puzzle],
  );

  const conflicts = useMemo(() => findConflicts(board), [board]);

  /** How many of each digit are still to be placed. */
  const remaining = useMemo(() => {
    const count: Record<number, number> = {};
    for (let n = 1; n <= 9; n++) count[n] = 9;
    board.forEach((v) => { if (v) count[v]--; });
    return count;
  }, [board]);

  const set = (v: number) => {
    if (sel < 0 || givens.has(sel)) return;
    setBoard((b) => { const n = [...b]; n[sel] = v; return n; });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '9') set(Number(e.key));
      if (e.key === 'Backspace' || e.key === '0') set(0);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (puzzle.length !== 81) {
    return (
      <div className="mx-auto flex h-screen max-w-4xl flex-col gap-6 px-8 py-7">
        {hud}
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="font-mono text-sm text-red-400">
            Grid failed to load — {puzzle.length} cells received, 81 expected.
          </p>
          <p className="max-w-sm font-mono text-[12px] leading-relaxed text-zinc-500">
            A stale progress row may be holding a broken grid. Clear this team&rsquo;s sudoku
            row in the progress table and reopen the task.
          </p>
        </div>
      </div>
    );
  }

  const filled = board.every((v) => v !== 0);
  const clean = conflicts.size === 0;
  const selVal = sel >= 0 ? board[sel] : 0;
  const placed = board.filter((v, i) => v !== 0 && !givens.has(i)).length;
  const blanks = 81 - givens.size;

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col gap-4 overflow-hidden px-8 py-7">
      {hud}

      {/* legend — says which colour means what */}
      <div className="flex shrink-0 items-center justify-center gap-7 font-mono text-[11px]
                      tracking-[0.14em] text-zinc-500">
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-zinc-800" />
          <span className="font-bold text-zinc-200">GIVEN</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-sky-500/30" />
          <span className="text-sky-300">YOURS</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-500/40" />
          <span className="text-red-300">CONFLICT</span>
        </span>
        <span className="ml-2">{placed} / {blanks} filled</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-y-auto">
        <div className="border border-emerald-900/60 bg-black/45 p-4">
          <div className="grid grid-cols-9 gap-px bg-emerald-950">
            {board.map((v, i) => {
              const given = givens.has(i);
              const mine = !given && v !== 0;
              const clash = conflicts.has(i);
              const r = Math.floor(i / 9), c = i % 9;
              const peer =
                sel >= 0 &&
                (Math.floor(sel / 9) === r ||
                  sel % 9 === c ||
                  (Math.floor(Math.floor(sel / 9) / 3) === Math.floor(r / 3) &&
                    Math.floor((sel % 9) / 3) === Math.floor(c / 3)));
              const same = !clash && selVal !== 0 && v === selVal && i !== sel;

              /* base: empty cell */
              let tone = 'bg-black/60 text-zinc-600 hover:bg-emerald-500/10';

              /* printed by the puzzle — white, heavy, never editable */
              if (given) tone = 'bg-zinc-900/80 font-bold text-zinc-100';

              /* placed by the player — blue, lighter weight */
              if (mine) tone = 'bg-sky-500/12 font-medium text-sky-300 hover:bg-sky-500/20';

              /* row / column / box of the selected cell */
              if (peer && !clash) {
                if (given) tone = 'bg-zinc-800/80 font-bold text-zinc-100';
                else if (mine) tone = 'bg-sky-500/20 font-medium text-sky-300';
                else tone = 'bg-emerald-950/50 text-zinc-600 hover:bg-emerald-500/10';
              }

              /* same digit as the selected cell */
              if (same) tone = given
                ? 'bg-emerald-500/15 font-bold text-zinc-100'
                : 'bg-emerald-500/15 font-medium text-sky-200';

              /* clash beats everything except selection */
              if (clash) tone = given
                ? 'bg-red-950/70 font-bold text-red-300'
                : 'bg-red-500/25 font-bold text-red-300';

              if (sel === i) tone = clash
                ? 'bg-red-500/45 font-bold text-red-100 ring-2 ring-red-400'
                : 'bg-emerald-500/25 font-medium text-emerald-100 ring-2 ring-emerald-400';

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSel(sel === i ? -1 : i)}
                  className={
                    'relative flex h-12 w-12 items-center justify-center font-mono text-xl transition-colors ' +
                    (c % 3 === 0 && c !== 0 ? 'border-l-2 border-l-emerald-800 ' : '') +
                    (r % 3 === 0 && r !== 0 ? 'border-t-2 border-t-emerald-800 ' : '') +
                    tone
                  }
                >
                  {v || ''}
                </button>
              );
            })}
          </div>
        </div>

        <p className="font-mono text-[12px] tracking-[0.16em] text-zinc-500">
          {sel < 0
            ? 'SELECT A CELL FIRST'
            : givens.has(sel)
              ? 'THIS CELL WAS GIVEN — IT CANNOT BE CHANGED'
              : 'TYPE 1–9, OR CLICK BELOW'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
            const done = remaining[n] <= 0;
            return (
              <button
                key={n}
                type="button"
                onClick={() => set(n)}
                disabled={sel < 0}
                className={
                  'relative flex h-14 w-14 items-center justify-center rounded-md border-2 ' +
                  'font-mono text-2xl font-bold transition-all ' +
                  (sel < 0
                    ? 'border-zinc-800 bg-transparent text-zinc-700'
                    : done
                      ? 'border-zinc-800 bg-transparent text-zinc-700'
                      : 'border-emerald-800 bg-emerald-950/60 text-emerald-200 ' +
                        'shadow-[0_0_14px_-6px_rgba(52,211,153,.8)] ' +
                        'hover:border-emerald-400 hover:bg-emerald-500 hover:text-black')
                }
              >
                {n}
                {sel >= 0 && !done && (
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center
                                   justify-center rounded-full bg-black font-mono text-[10px]
                                   text-zinc-500">
                    {remaining[n]}
                  </span>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => set(0)}
            disabled={sel < 0}
            className="ml-2 flex h-14 items-center rounded-md border-2 border-red-900 bg-red-950/40
                       px-6 text-[13px] font-bold uppercase tracking-[0.18em] text-red-300
                       transition-all hover:border-red-400 hover:bg-red-500 hover:text-black
                       disabled:border-zinc-800 disabled:bg-transparent disabled:text-zinc-700"
          >
            Erase
          </button>
        </div>
      </div>

      <div className="shrink-0 space-y-2">
        {!clean && (
          <p className="text-center font-mono text-[13px] tracking-[0.14em] text-red-400">
            ▲ {conflicts.size} {conflicts.size === 1 ? 'cell conflicts' : 'cells conflict'} with
            another in the same row, column or box
          </p>
        )}

        <button
          type="button"
          onClick={() => send({ board })}
          disabled={!filled || !clean}
          className="w-full border-2 border-emerald-600 bg-emerald-500/10 py-4 text-[13px]
                     font-bold uppercase tracking-[0.2em] text-emerald-300
                     hover:bg-emerald-500 hover:text-black
                     disabled:border-zinc-800 disabled:bg-transparent disabled:text-zinc-600"
        >
          {!filled ? 'Grid incomplete' : !clean ? 'Resolve conflicts first' : 'Submit grid'}
        </button>
      </div>
    </div>
  );
}