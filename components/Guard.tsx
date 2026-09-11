'use client';
import { memo, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import LockClock from '@/components/LockClock';
import { trpc } from '@/lib/trpc';

/** Children are memoised so a poll never rebuilds the game tree. */
const Pass = memo(function Pass({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
});

export default function Guard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const wasLocked = useRef(false);
  const [remount, setRemount] = useState(0);

  const q = trpc.game.state.useQuery(undefined, {
    refetchInterval: 4000,
    retry: false,
    // narrowed so serverNow and remainingMs never cause a render here
    select: (d) => ({
      locked: d.lockedMs > 0,
      lockedSec: Math.ceil(d.lockedMs / 1000),
      activeCard: d.activeCard,
      finished: d.finished,
      expired: d.expired,
    }),
    structuralSharing: true,
  });

  const locked = q.data?.locked ?? false;

  // a lock just cleared — the server reset the card, so discard stale UI state
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

  /* 2 — locked out */
  if (s.locked) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md border-2 border-red-900 bg-black/60 px-10 py-10 text-center">
          <p className="text-xl font-black tracking-[0.2em] text-red-400">TERMINAL LOCKED</p>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            Attempts exhausted. The task has been reset to its beginning, and no other task
            can be opened until this clears.
          </p>

          <LockClock seconds={s.lockedSec} />

          <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-zinc-600">
            THE THREE HOUR CLOCK KEEPS RUNNING
          </p>
        </div>
      </div>
    );
  }

  /* 3 — committed to a card */
  const wanted = s.activeCard ? `/play/card/${s.activeCard}` : null;
  if (wanted && path !== wanted) {
    router.replace(wanted);
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-lg font-bold tracking-[0.2em] text-emerald-300">TASK IN PROGRESS</p>
        <p className="text-sm text-zinc-500">Returning you to it.</p>
      </div>
    );
  }

  /* 4 — already finished */
  if (s.finished && path !== '/result') { router.replace('/result'); return null; }

  return <Pass key={remount}>{children}</Pass>;
}