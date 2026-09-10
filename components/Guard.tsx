'use client';
import { usePathname, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

export default function Guard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const q = trpc.game.state.useQuery(undefined, { refetchInterval: 2000, retry: false });

  if (q.isLoading) return null;
  if (q.error) { router.replace('/'); return null; }

  const s = q.data!;

  /* 1 — lockout beats everything */
  if (s.lockedMs > 0) {
    const sec = Math.ceil(s.lockedMs / 1000);
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 px-4 text-center">
        <h2 className="font-mono text-2xl font-bold tracking-widest text-red-400">
          TERMINAL LOCKED
        </h2>
        <p className="max-w-sm font-mono text-sm leading-relaxed text-zinc-400">
          Your attempts on that task were exhausted. No task can be opened until this clears,
          and there is no way out of this screen.
        </p>
        <p className="font-mono text-6xl font-bold tabular-nums text-zinc-100">
          {String(Math.floor(sec / 60)).padStart(2, '0')}:{String(sec % 60).padStart(2, '0')}
        </p>
        <p className="font-mono text-[10px] tracking-[0.25em] text-zinc-700">
          THE CLOCK KEEPS RUNNING
        </p>
      </div>
    );
  }

  /* 2 — committed to a card: only that card is reachable */
  const wanted = s.activeCard ? `/play/card/${s.activeCard}` : null;
  if (wanted && path !== wanted) {
    router.replace(wanted);
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h2 className="font-mono text-xl font-bold tracking-widest text-green-300">
          TASK IN PROGRESS
        </h2>
        <p className="max-w-sm font-mono text-sm text-zinc-400">
          You committed to a task. Returning you to it.
        </p>
      </div>
    );
  }

  /* 3 — already finished */
  if (s.finished && path !== '/result') {
    router.replace('/result');
    return null;
  }

  return <>{children}</>;
}