'use client';
import { useEffect, useRef, useState } from 'react';
import type { GameProps } from '../registry';

export default function DecoyGame({ hud, view, send }: GameProps) {
  const lines: string[] = view?.lines ?? [];
  const [busy, setBusy] = useState(false);
  const sigRef = useRef(JSON.stringify(lines));

  useEffect(() => {
    const sig = JSON.stringify(lines);
    if (sig !== sigRef.current) { sigRef.current = sig; setBusy(false); }
  }, [view?.lines]);

  const go = () => { if (!busy) { setBusy(true); send({}); } };

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col gap-5 overflow-hidden px-8 py-7">
      {hud}

      <p className="shrink-0 text-center font-mono text-[12px] tracking-[0.18em]">
        {busy ? (
          <span className="inline-flex items-center gap-2 text-emerald-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            WORKING
          </span>
        ) : (
          <span className="text-zinc-600">CLICK ANY LINE TO CONTINUE</span>
        )}
      </p>

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto">
        <div className="w-full rounded-md border-2 border-emerald-900/70 bg-black/60 p-6">
          {lines.map((line, i) => (
            <button
              key={i}
              type="button"
              onClick={go}
              aria-disabled={!line.trim() || busy}
              className={
                'block w-full rounded-sm px-4 py-1 text-left font-mono text-[16px] leading-8 ' +
                'transition-colors ' +
                (!line.trim()
                  ? 'cursor-default text-zinc-700'
                  : busy
                    ? 'cursor-wait text-zinc-200'
                    : 'text-zinc-200 hover:bg-emerald-500/15 hover:text-emerald-200')
              }
            >
              {line || ' '}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}