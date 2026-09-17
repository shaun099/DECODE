'use client';
import { memo, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import LockClock from '@/components/LockClock';
import FullscreenGuard from '@/components/FullscreenGuard';
import { trpc } from '@/lib/trpc';

/** Children are memoised so a poll never rebuilds the game tree. */
const Pass = memo(function Pass({ children }: { children: React.ReactNode }) {
  return <FullscreenGuard>{children}</FullscreenGuard>;
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

  const s = q.data;
  const locked = s?.locked ?? false;

  /* Work out where the player is allowed to be. No navigation during render. */
  let target: string | null = null;
  if (q.error) {
    target = '/';
  } else if (s) {
    if (s.expired && path !== '/result') target = '/result';
    else if (s.finished && path !== '/result') target = '/result';
    else if (!s.locked && s.activeCard && path !== `/play/card/${s.activeCard}`) {
      target = `/play/card/${s.activeCard}`;
    } else if (!s.activeCard && (path.startsWith('/play/card/') || path.startsWith('/card/'))) {
      // Admin kicked the player — active_card cleared, bring them back to board
      // User requested /card (board) not /card/game_name, so go to /play (board)
      target = '/play';
    }
  }

  /* All navigation happens here, after render — this is what React was complaining about. */
  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);

  /* A lock just cleared — the server reset the card, so discard stale UI state. */
  useEffect(() => {
    if (wasLocked.current && !locked) {
      setRemount((n) => n + 1);
      router.replace('/play');
    }
    wasLocked.current = locked;
  }, [locked, router]);

  if (q.isLoading) return null;

  if (q.error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="font-mono text-sm text-zinc-500">Signing you out…</p>
      </div>
    );
  }

  /* locked out — admin must kick/unlock (indefinite) */
  if (s!.locked) {
    const adminOnly = s!.lockedSec > 86400; // kick/unlock far-future = admin-only
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md border-2 border-red-900 bg-black/60 px-10 py-10 text-center">
          <p className="text-xl font-black tracking-[0.2em] text-red-400">TERMINAL LOCKED</p>
          <p className="mt-4 text-sm leading-relaxed text-zinc-400">
            Attempts exhausted. The task has been reset to its beginning, and no other task
            can be opened until an admin clears it.
          </p>

          {adminOnly ? (
            <p className="mt-7 rounded-lg border border-amber-900/50 bg-amber-950/20 px-4 py-3 font-mono text-sm font-bold tracking-wide text-amber-300">
              🔒 LOCKED — CONTACT ADMIN TO KICK/UNLOCK
            </p>
          ) : (
            <LockClock seconds={s!.lockedSec} />
          )}

          <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-zinc-600">
            THE THREE HOUR CLOCK KEEPS RUNNING
          </p>
        </div>
      </div>
    );
  }

  /* being redirected — hold, never show the children */
  if (target) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-lg font-bold tracking-[0.2em] text-emerald-300">
          {target.startsWith('/play/card/') ? 'TASK IN PROGRESS' : 'ONE MOMENT'}
        </p>
        <p className="text-sm text-zinc-500">Taking you there.</p>
      </div>
    );
  }

  return <Pass key={remount}>{children}</Pass>;
}
