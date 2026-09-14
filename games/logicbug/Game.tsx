'use client';
import { useEffect, useRef, useState } from 'react';
import type { GameProps } from '../registry';

export default function LogicGame({ hud, view, send }: GameProps) {
  const lines: string[] = view?.lines ?? [];
  const wrong: number[] = view?.wrong ?? [];
  const spec: string[] = view?.spec ?? [];

  const [pending, setPending] = useState<number | null>(null);
  const sigRef = useRef(JSON.stringify([view?.index, view?.wrong]));

  useEffect(() => {
    const sig = JSON.stringify([view?.index, view?.wrong]);
    if (sig !== sigRef.current) { sigRef.current = sig; setPending(null); }
  }, [view?.index, view?.wrong]);

  const locked = pending !== null;

  function choose(i: number) {
    if (locked || wrong.includes(i) || !lines[i]?.trim()) return;
    setPending(i);
    send({ line: i });
  }

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col gap-4 overflow-hidden px-8 py-7">
      {hud}

      <div className="shrink-0 rounded-md border-2 border-emerald-600/70 bg-emerald-950/30 px-7 py-5">
        <p className="font-mono text-[11px] tracking-[0.28em] text-emerald-400">THE BRIEF</p>
        {spec.map((l, i) => (
          <p key={i} className="mt-2 text-[17px] leading-8 text-zinc-100">{l}</p>
        ))}
      </div>

      <p className="shrink-0 text-[14px] text-zinc-400">
        The program runs. It answers wrongly.
        <span className="ml-2 text-zinc-600">Click the line that disagrees with the brief.</span>
      </p>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-md border-2 border-emerald-900/70
                      bg-black/60 p-3">
        {lines.map((line, i) => {
          const blank = !line.trim();
          const bad = wrong.includes(i);
          const isPending = pending === i;

          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              aria-disabled={blank || bad || locked}
              className={
                'flex w-full items-start gap-5 rounded-sm px-4 py-1 text-left font-mono ' +
                'text-[16px] leading-8 transition-colors ' +
                (isPending
                  ? 'bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-600'
                  : bad
                    ? 'cursor-default bg-red-950/40 text-red-400/70 line-through decoration-red-700'
                    : blank
                      ? 'cursor-default text-zinc-700'
                      : locked
                        ? 'cursor-wait text-zinc-200'
                        : 'text-zinc-200 hover:bg-emerald-500/15 hover:text-emerald-200')
              }
            >
              <span className={
                'w-8 shrink-0 select-none text-right ' +
                (bad ? 'text-red-700' : 'text-emerald-800')
              }>
                {i + 1}
              </span>
              <span className="whitespace-pre">{line || ' '}</span>
            </button>
          );
        })}
      </div>

      <div className="h-6 shrink-0 text-center font-mono text-[13px] tracking-[0.14em]">
        {locked ? (
          <span className="inline-flex items-center gap-2 text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            CHECKING LINE {pending! + 1}
          </span>
        ) : wrong.length > 0 ? (
          <span className="text-red-400">
            ▲ {wrong.length} {wrong.length === 1 ? 'line ruled out' : 'lines ruled out'}
          </span>
        ) : null}
      </div>
    </div>
  );
}