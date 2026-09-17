'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Guard from '@/components/Guard';
import GameHud from '@/components/GameHud';
import LockClock from '@/components/LockClock';
import { gameFor } from '@/games/registry';
import { trpc } from '@/lib/trpc';

export default function CardPage({ params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = use(params);
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [lockSec, setLockSec] = useState<number | null>(null);
  const [done, setDone] = useState<{ key: any; nextClue: string | null } | null>(null);

  const brief = trpc.game.brief.useQuery({ cardId }, { retry: false });

  const start = trpc.game.start.useMutation({ onSuccess: (d) => setSession(d) });

  const attempt = trpc.game.attempt.useMutation({
    onSuccess: (r) => {
      // show the lock instantly — do not wait for Guard's poll
      if (r.locked) { setLockSec(Math.ceil(r.lockMs / 1000)); return; }
      if (r.done) { setDone({ key: r.key, nextClue: r.nextClue }); return; }
      setSession((s: any) => ({
        ...s,
        attemptsLeft: r.attemptsLeft,      // server is the only counter
        view: r.view ?? s.view,
      }));
    },
  });

  if (brief.isLoading) return null;

  /* ---------- locked out, straight from the attempt response ---------- */
  if (lockSec !== null) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border-2 border-red-500/80 bg-black/80 px-10 py-10 text-center shadow-[0_0_40px_rgba(239,68,68,0.2)] backdrop-blur-md">
          <p className="font-mono text-xl font-black tracking-[0.2em] text-red-400">TERMINAL LOCKED</p>
          <p className="mt-4 font-mono text-sm leading-relaxed text-zinc-300">
            Attempts exhausted. This task has been reset. You will be returned to the board when the lock clears.
          </p>
          <LockClock seconds={lockSec} onComplete={() => router.replace('/play')} />
          <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-zinc-500">
            THE THREE HOUR CLOCK KEEPS RUNNING
          </p>
        </div>
      </div>
    );
  }

  /* ---------- cannot open ---------- */
  if (brief.error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
        <p className="text-lg font-bold tracking-widest text-red-400">CANNOT OPEN THIS TASK</p>
        <p className="max-w-sm font-mono text-[13px] text-zinc-500">{brief.error.message}</p>
        <button onClick={() => router.replace('/play')}
          className="border-2 border-zinc-700 px-6 py-3 font-mono text-[12px] tracking-[0.2em]
                     text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-100">
          BACK TO THE BOARD
        </button>
      </div>
    );
  }

  /* ---------- finished ---------- */
  if (done) {
    return (
      <Guard>
        <div className="flex min-h-screen flex-col items-center justify-center gap-7 px-4 text-center">
          <p className="font-mono text-[11px] tracking-[0.28em] text-emerald-500">
            {done.key ? 'FRAGMENT RECOVERED' : 'NO FRAGMENT FOUND'}
          </p>
          <h2 className="text-3xl font-black tracking-[0.14em] text-emerald-300">
            {done.key ? 'KEY RECOVERED' : 'OOPS! NO KEY PRESENT'}
          </h2>

          {!done.key && (
            <p className="font-mono text-sm text-zinc-400">
              This task contains no key fragment. Keep hunting on the board.
            </p>
          )}

          {done.key && (
            <p className="font-mono text-2xl tracking-[0.3em] text-emerald-300">
              {done.key.value}
              <span className="ml-4 text-sm tracking-normal text-zinc-500">
                position {done.key.position}
              </span>
            </p>
          )}

          {done.nextClue && (
            <div className="max-w-md border-2 border-emerald-900/70 bg-black/50 px-7 py-6">
              <p className="font-mono text-[11px] tracking-[0.28em] text-emerald-500">NEXT</p>
              <p className="mt-3 text-[15px] leading-relaxed text-zinc-200">{done.nextClue}</p>
            </div>
          )}

          <button onClick={() => router.replace('/play')} autoFocus
            className="border-2 border-emerald-600 bg-emerald-500/10 px-9 py-4 text-[13px]
                       font-bold uppercase tracking-[0.2em] text-emerald-300
                       transition-all hover:bg-emerald-500 hover:text-black">
            Back to the board
          </button>
        </div>
      </Guard>
    );
  }

  /* ---------- briefing ---------- */
  if (!session) {
    const b = brief.data!;
    if (b.solved) {
      return (
        <Guard>
          <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-6 text-center">
            <h1 className="text-3xl font-black tracking-[0.14em] text-zinc-400">TASK ALREADY CLEARED</h1>
            <p className="font-mono text-xs text-zinc-500">This task has already been completed by your team.</p>
            <button
              onClick={() => router.replace('/play')}
              className="border-2 border-zinc-700 px-6 py-3 font-mono text-[12px] tracking-[0.2em] text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
            >
              BACK TO THE BOARD
            </button>
          </div>
        </Guard>
      );
    }
    return (
      <Guard>
        <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-7 px-6 py-10">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-emerald-500">TASK BRIEFING & INSTRUCTIONS</p>
            <h1 className="mt-3 text-4xl font-black text-zinc-100">{b.name}</h1>
            <p className="mt-2 text-[15px] text-zinc-400">{b.teaser}</p>
          </div>

          <ol className="space-y-3 border-2 border-emerald-900/70 bg-black/50 px-7 py-6">
            {b.rules.map((r: string, i: number) => (
              <li key={i} className="flex gap-4 text-[15px] leading-relaxed text-zinc-200">
                <span className="font-mono text-emerald-400">{String(i + 1).padStart(2, '0')}</span>
                <span>{r}</span>
              </li>
            ))}
          </ol>

          <p className="border-l-2 border-amber-500 pl-4 text-[13px] leading-relaxed text-amber-300 font-mono">
            TERMINAL ENGAGED: You have initialized this challenge. You cannot return to the main board until this task is completed.
          </p>

          <div className="flex gap-3">
            <button onClick={() => start.mutate({ cardId })} disabled={start.isPending} autoFocus
              className="flex-1 border-2 border-emerald-600 bg-emerald-500/10 py-4 text-[13px]
                         font-bold uppercase tracking-[0.2em] text-emerald-300 transition-all
                         hover:bg-emerald-500 hover:text-black disabled:opacity-35"
            >
              {start.isPending ? 'COMMENCING TASK…' : 'BEGIN CHALLENGE'}
            </button>
          </div>

          {start.error && (
            <p className="text-center font-mono text-[13px] text-red-400">{start.error.message}</p>
          )}
        </div>
      </Guard>
    );
  }

  /* ---------- playing ---------- */
  const Game = gameFor(cardId);
  const send = (payload: any) => attempt.mutateAsync({ cardId, payload });
  const hud = (
    <GameHud
      name={session.name}
      index={session.view?.index}
      total={session.view?.total}
      left={session.attemptsLeft}
      max={session.maxWrong}
    />
  );

  if (!Game) {
    return (
      <Guard>
        <div className="flex min-h-screen items-center justify-center px-4 text-center">
          <p className="font-mono text-sm text-red-400">
            No renderer registered for &ldquo;{cardId}&rdquo;. Add it to games/registry.ts
          </p>
        </div>
      </Guard>
    );
  }

  return (
    <Guard>
      <Game hud={hud} view={session.view} send={send} />
    </Guard>
  );
}