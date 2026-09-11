'use client';
import { useEffect, useState } from 'react';

/** Ticks locally between polls. The server owns the actual remaining time. */
export default function Countdown({ remainingMs }: { remainingMs: number }) {
  const [anchor, setAnchor] = useState({ at: Date.now(), ms: remainingMs });
  const [left, setLeft] = useState(remainingMs);

  useEffect(() => {
    setAnchor({ at: Date.now(), ms: remainingMs });
    setLeft(remainingMs);
  }, [remainingMs]);

  useEffect(() => {
    const t = setInterval(
      () => setLeft(Math.max(0, anchor.ms - (Date.now() - anchor.at))),
      250,
    );
    return () => clearInterval(t);
  }, [anchor]);

  const s = Math.floor(left / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const urgent = left < 15 * 60 * 1000;

  return (
    <div className="flex items-center gap-2 font-mono tabular-nums">
      <span className="text-[9px] tracking-[0.25em] text-zinc-600">TIME LEFT</span>
      <span className={'text-lg font-bold ' + (urgent ? 'text-red-400' : 'text-green-300')}>
        {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(sec).padStart(2, '0')}
      </span>
    </div>
  );
}