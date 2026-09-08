'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { lockLeft } from '@/lib/lockout';
import { activeGame } from '@/lib/session-lock';

export default function LockGate({
  children,
  gameId,
}: {
  children: React.ReactNode;
  gameId?: string;      // pass on a game route, omit on the board
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [left, setLeft] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const check = () => {
      setLeft(lockLeft());
      const active = activeGame();
      // A game is running and this is not it -> send them back to it.
      if (active && active !== gameId) {
        setBusy(active);
        router.replace(`/play/game/${active}`);
      } else {
        setBusy(null);
      }
    };
    check();
    setChecked(true);
    const t = setInterval(check, 400);
    return () => clearInterval(t);
  }, [gameId, router]);

  if (!checked) return null;

  if (left > 0) {
    const s = Math.ceil(left / 1000);
    const mmss = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 px-4 text-center">
        <h2 className="font-mono text-2xl font-bold tracking-widest text-red-400">SYSTEM LOCKED</h2>
        <p className="max-w-sm font-mono text-sm leading-relaxed text-zinc-300">
          A failed attempt has locked your terminal. No task can be opened until it expires.
        </p>
        <div className="rounded-xl border border-red-500/40 bg-red-500/5 px-10 py-6">
          <p className="font-mono text-[10px] tracking-[0.25em] text-red-400">UNLOCKS IN</p>
          <p className="mt-2 font-mono text-4xl font-bold tabular-nums text-zinc-100">{mmss}</p>
        </div>
      </div>
    );
  }

  if (busy) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h2 className="font-mono text-xl font-bold tracking-widest text-green-300">TASK IN PROGRESS</h2>
        <p className="max-w-sm font-mono text-sm text-zinc-400">
          You cannot leave a task once it has begun. Returning you to it.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}