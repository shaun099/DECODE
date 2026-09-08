'use client';

import { useEffect, useState } from 'react';
import { lockLeft } from '@/lib/lockout';

export default function LockScreen({
  reason,
  attempt,
  onExpire,
}: {
  reason: string;
  attempt: number;
  onExpire: () => void;
}) {
  const [left, setLeft] = useState(lockLeft());

  useEffect(() => {
    const t = setInterval(() => {
      const ms = lockLeft();
      setLeft(ms);
      if (ms <= 0) {
        clearInterval(t);
        onExpire();
      }
    }, 250);
    return () => clearInterval(t);
  }, [onExpire]);

  const s = Math.max(0, Math.ceil(left / 1000));
  const mmss = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h2 className="font-mono text-2xl font-bold tracking-widest text-red-400">RUN FAILED</h2>
      <p className="max-w-md font-mono text-sm leading-relaxed text-zinc-300">{reason}</p>
      <div className="rounded-xl border border-red-500/40 bg-red-500/5 px-10 py-6">
        <p className="font-mono text-[10px] tracking-[0.25em] text-red-400">RETRY IN</p>
        <p className="mt-2 font-mono text-4xl font-bold tabular-nums text-zinc-100">{mmss}</p>
      </div>
      <p className="max-w-sm font-mono text-xs leading-relaxed text-zinc-500">
        Attempt {attempt} ended. Your terminal is locked — no other task can be opened
        until this expires.
      </p>
      <button
        disabled
        className="rounded-lg border border-zinc-700 px-8 py-3 font-mono text-xs font-bold
                   tracking-[0.2em] text-zinc-600 cursor-not-allowed"
      >
        BACK TO TASKS
      </button>
    </div>
  );
}