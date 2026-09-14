'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { GameProps } from '../registry';

interface Clue {
  key: string;
  number: number;
  direction: 'across' | 'down';
  clue: string;
  length: number;
  row: number;
  col: number;
}

export default function CrosswordGame({ hud, view, send }: GameProps) {
  const rows: number = view?.rows ?? 15;
  const cols: number = view?.cols ?? 15;
  const open: boolean[] = view?.open ?? [];
  const numbers: (number | null)[] = view?.numbers ?? [];
  const letters: Record<number, string> = view?.letters ?? {};
  const solved: string[] = view?.solved ?? [];
  const clues: Clue[] = view?.clues ?? [];
  const total: number = view?.total ?? clues.length;

  const [active, setActive] = useState<string | null>(null);
  const [guess, setGuess] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  const [miss, setMiss] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const countRef = useRef(solved.length);

  /* a response landed — unlock and clear if the answer went in */
  useEffect(() => {
    if (solved.length === countRef.current) return;
    countRef.current = solved.length;
    setGuess('');
    setActive(null);
    setMiss(null);
    setPending(null);
  }, [solved.length]);

  const cur = clues.find((c) => c.key === active) ?? null;

  /** Cells the selected clue covers. */
  const litCells = useMemo(() => {
    if (!cur) return new Set<number>();
    const dr = cur.direction === 'across' ? 0 : 1;
    const dc = cur.direction === 'across' ? 1 : 0;
    return new Set(
      Array.from(
        { length: cur.length },
        (_, i) => (cur.row + dr * i) * cols + (cur.col + dc * i),
      ),
    );
  }, [cur, cols]);

  function pick(k: string) {
    if (solved.includes(k)) return;
    setActive(k);
    setGuess('');
    setMiss(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function submit() {
    if (!cur || pending) return;
    const g = guess.trim().toUpperCase();
    if (g.length !== cur.length) return;

    const before = solved.length;
    setPending(cur.key);
    setMiss(null);
    send({ key: cur.key, guess: g });

    // no change to the solved count shortly after means it was wrong
    setTimeout(() => {
      if (solved.length === before) {
        setMiss(cur.key);
        setPending(null);
        setGuess('');
        inputRef.current?.focus();
      }
    }, 600);
  }

  const across = clues.filter((c) => c.direction === 'across');
  const down = clues.filter((c) => c.direction === 'down');

  const ClueList = ({ list, title }: { list: Clue[]; title: string }) => (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <p className="sticky top-0 z-10 bg-black py-1.5 font-mono text-[10px] font-bold
                    tracking-[0.22em] text-emerald-400">
        {title}
      </p>
      <ul className="space-y-1">
        {list.map((c) => {
          const done = solved.includes(c.key);
          const on = active === c.key;
          return (
            <li key={c.key}>
              <button
                type="button"
                onClick={() => pick(c.key)}
                className={
                  'flex w-full gap-2.5 rounded-sm px-2.5 py-1.5 text-left text-[13px] ' +
                  'leading-snug transition-colors ' +
                  (done
                    ? 'bg-emerald-950/40 text-emerald-600 line-through'
                    : on
                      ? 'bg-amber-200 font-medium text-neutral-900'
                      : 'text-zinc-200 hover:bg-white/10 hover:text-white')
                }
              >
                <span
                  className={
                    'w-5 shrink-0 text-right font-mono font-bold ' +
                    (on ? 'text-neutral-700' : done ? 'text-emerald-700' : 'text-emerald-400')
                  }
                >
                  {c.number}
                </span>
                <span>
                  {c.clue}
                  <span className={'ml-1.5 font-mono ' + (on ? 'text-neutral-600' : 'text-zinc-500')}>
                    ({c.length})
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className="mx-auto flex h-screen max-w-6xl flex-col gap-4 overflow-hidden px-6 py-6">
      {hud}

      <div className="flex min-h-0 flex-1 gap-6">
        {/* ---------------- grid + entry ---------------- */}
        <div className="flex shrink-0 flex-col items-center gap-3">
          <div
            className="grid gap-[2px] rounded-sm bg-neutral-900 p-[2px]
                       shadow-[0_0_30px_-10px_rgba(52,211,153,.6)]"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: rows * cols }).map((_, i) => {
              if (!open[i]) return <div key={i} className="h-8 w-8 bg-neutral-900" />;

              const lit = litCells.has(i);
              const ch = letters[i] ?? '';

              return (
                <div
                  key={i}
                  className={
                    'relative flex h-8 w-8 items-center justify-center text-[15px] font-bold ' +
                    'transition-colors duration-150 ' +
                    (lit
                      ? 'bg-amber-200 text-neutral-900'
                      : ch
                        ? 'bg-white text-neutral-900'
                        : 'bg-neutral-100 text-neutral-900')
                  }
                >
                  {numbers[i] !== null && (
                    <span className="absolute left-[2px] top-[1px] text-[8px] font-semibold
                                     leading-none text-neutral-500">
                      {numbers[i]}
                    </span>
                  )}
                  {ch}
                </div>
              );
            })}
          </div>

          <div className="w-full">
            {cur ? (
              <div className="space-y-2 rounded-md border-2 border-emerald-800 bg-black/70 p-4">
                <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-emerald-400">
                  {cur.number} {cur.direction.toUpperCase()} · {cur.length} LETTERS
                </p>
                <p className="text-[14px] leading-snug text-zinc-100">{cur.clue}</p>

                <div className="flex gap-2 pt-1">
                  <input
                    ref={inputRef}
                    value={guess}
                    maxLength={cur.length}
                    onChange={(e) =>
                      setGuess(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase())
                    }
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                    placeholder={'·'.repeat(cur.length)}
                    className={
                      'flex-1 border-2 bg-white px-4 py-2.5 text-center text-lg font-bold ' +
                      'tracking-[0.35em] text-neutral-900 outline-none transition-colors ' +
                      'placeholder:text-neutral-400 ' +
                      (miss === cur.key
                        ? 'border-amber-400'
                        : 'border-neutral-300 focus:border-emerald-500')
                    }
                  />
                  <button
                    type="button"
                    onClick={submit}
                    disabled={guess.length !== cur.length || !!pending}
                    className="border-2 border-emerald-500 bg-emerald-500 px-6 text-[11px]
                               font-black tracking-[0.2em] text-black transition-all
                               hover:bg-emerald-400 disabled:border-neutral-700
                               disabled:bg-transparent disabled:text-neutral-600"
                  >
                    {pending ? '…' : 'SUBMIT'}
                  </button>
                </div>

                {miss === cur.key && (
                  <p className="font-mono text-[12px] text-amber-400">
                    Not that one. Try again — guessing is free here.
                  </p>
                )}
              </div>
            ) : (
              <p className="rounded-md border-2 border-dashed border-neutral-800 py-5 text-center
                            font-mono text-[12px] tracking-[0.18em] text-neutral-500">
                SELECT A CLUE TO BEGIN
              </p>
            )}
          </div>
        </div>

        {/* ---------------- clues ---------------- */}
        <div className="flex min-h-0 flex-1 gap-5">
          <ClueList list={across} title={`ACROSS · ${across.length}`} />
          <ClueList list={down} title={`DOWN · ${down.length}`} />
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-center gap-4">
        <div className="h-1.5 w-64 rounded-full bg-neutral-800">
          <div
            className="h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.9)]
                       transition-all duration-500"
            style={{ width: `${(solved.length / Math.max(1, total)) * 100}%` }}
          />
        </div>
        <span className="font-mono text-[12px] tracking-[0.16em] text-zinc-400">
          {solved.length} / {total} locked in
        </span>
      </div>
    </div>
  );
}