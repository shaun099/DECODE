'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

export default function Guard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const wasLocked = useRef(false);
  const [remount, setRemount] = useState(0);

  const q = trpc.game.state.useQuery(undefined, { refetchInterval: 2000, retry: false });
  const locked = (q.data?.lockedMs ?? 0) > 0;

  /* A lock just cleared. The server reset the card, so discard stale UI state. */
  useEffect(() => {
    if (wasLocked.current && !locked) {
      setRemount((n) => n + 1);
      router.replace('/play');
    }
    wasLocked.current = locked;
  }, [locked, router]);

  if (q.isLoading) return null;
  if (q.error) { router.replace('/'); return null; }

  const s = q.data!;

  /* 1 — time is up */
  if (s.expired && path !== '/result') { router.replace('/result'); return null; }

  /* 2 — lockout */
  if (s.lockedMs > 0) {
    const sec = Math.ceil(s.lockedMs / 1000);
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 px-4 text-center">
        <h2 className="font-mono text-2xl font-bold tracking-widest text-red-400">
          TERMINAL LOCKED
        </h2>
        <p className="max-w-sm font-mono text-sm leading-relaxed text-zinc-400">
          Your attempts on that task were exhausted. The task has been reset to the beginning.
          No task can be opened until this clears.
        </p>
        <p className="font-mono text-6xl font-bold tabular-nums text-zinc-100">
          {String(Math.floor(sec / 60)).padStart(2, '0')}:{String(sec % 60).padStart(2, '0')}
        </p>
        <p className="font-mono text-[10px] tracking-[0.25em] text-zinc-700">
          THE THREE HOUR CLOCK KEEPS RUNNING
        </p>
      </div>
    );
  }

  /* 3 — committed to a card */
  const wanted = s.activeCard ? `/play/card/${s.activeCard}` : null;
  if (wanted && path !== wanted) {
    router.replace(wanted);
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h2 className="font-mono text-xl font-bold tracking-widest text-green-300">
          TASK IN PROGRESS
        </h2>
        <p className="max-w-sm font-mono text-sm text-zinc-400">Returning you to it.</p>
      </div>
    );
  }

  /* 4 — already finished */
  if (s.finished && path !== '/result') { router.replace('/result'); return null; }

  return <div key={remount}>{children}</div>;
}