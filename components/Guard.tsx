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

  /* locked out — 2-minute cooldown before unlocking itself */
  if (s!.locked) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-zinc-950 bg-[url('/bg_play.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <div className="relative z-10 max-w-md rounded-3xl border-2 border-red-500/40 bg-zinc-950/95 p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <p className="font-mono text-xs font-bold tracking-[0.25em] text-red-400">
            SYSTEM COOLDOWN // ATTEMPTS EXHAUSTED
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.15em] text-white">
            TERMINAL LOCKED
          </h2>
          <p className="mt-3 font-mono text-xs leading-relaxed text-zinc-400">
            Attempts exhausted. This challenge has been reset. The terminal is locked for 2 minutes and will automatically unlock.
          </p>

          <LockClock seconds={s!.lockedSec} onComplete={() => router.replace('/play')} />

          <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-zinc-500">
            THE MAIN EVENT CLOCK KEEPS RUNNING
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
