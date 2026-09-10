'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Guard from '@/components/Guard';
import GameHud from '@/components/GameHud';
import LinesRenderer from '@/components/renderers/LinesRenderer';
import McqRenderer from '@/components/renderers/McqRenderer';
import { trpc } from '@/lib/trpc';

export default function CardPage({ params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = use(params);
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState<{ key: any; nextClue: string | null } | null>(null);

  const brief = trpc.game.brief.useQuery({ cardId }, { retry: false });

  const start = trpc.game.start.useMutation({
    onSuccess: (d) => { setSession(d); setWrong(d.wrong); },
  });

  const attempt = trpc.game.attempt.useMutation({
    onSuccess: (r) => {
      if (r.locked) return;                    // Guard takes over on the next poll
      if (r.done) { setDone({ key: r.key, nextClue: r.nextClue }); return; }
      if (!r.correct) setWrong((w) => w + 1);
      if (r.view) setSession((s: any) => ({ ...s, view: r.view }));
    },
  });

  if (brief.isLoading) return null;

  if (brief.error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-5 px-4 text-center">
        <h2 className="font-mono text-lg tracking-widest text-red-400">CANNOT OPEN THIS TASK</h2>
        <p className="max-w-sm font-mono text-xs text-zinc-500">{brief.error.message}</p>
        <button onClick={() => router.replace('/play')}
          className="rounded-lg border border-zinc-700 px-6 py-2.5 font-mono text-xs
                     tracking-[0.2em] text-zinc-400 hover:text-zinc-100">
          BACK TO THE BOARD
        </button>
      </div>
    );
  }

  /* ---------- finished ---------- */
  if (done) {
    return (
      <Guard>
        <div className="flex h-screen flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="text-5xl">{done.key ? '🔑' : '🕳️'}</div>
          <h2 className="font-mono text-2xl font-bold tracking-widest text-green-300">
            {done.key ? 'KEY RECOVERED' : 'NOTHING HERE'}
          </h2>
          {done.key && (
            <p className="font-mono text-lg text-green-100">
              {done.key.value}
              <span className="text-zinc-500"> · position {done.key.position}</span>
            </p>
          )}
          {done.nextClue && (
            <div className="max-w-md rounded-xl border border-green-500/50 bg-zinc-950 px-6 py-5">
              <p className="font-mono text-[10px] tracking-[0.25em] text-green-400">NEXT</p>
              <p className="mt-3 font-mono text-sm leading-relaxed text-green-50">{done.nextClue}</p>
            </div>
          )}
          <button onClick={() => router.replace('/play')}
            className="rounded-lg border-2 border-green-500/70 bg-zinc-950 px-8 py-3.5 font-mono
                       text-sm font-bold tracking-[0.2em] text-green-300
                       hover:bg-green-500 hover:text-black">
            BACK TO THE BOARD
          </button>
        </div>
      </Guard>
    );
  }

  /* ---------- briefing: last chance to walk away ---------- */
  if (!session) {
    const b = brief.data!;
    return (
      <div className="mx-auto flex h-screen max-w-lg flex-col justify-center gap-6 overflow-y-auto px-6 py-8">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-green-500">BRIEFING</p>
          <h1 className="mt-2 font-mono text-3xl font-bold text-zinc-100">{b.name}</h1>
          <p className="mt-2 font-mono text-sm text-zinc-400">{b.teaser}</p>
        </div>

        <ol className="space-y-2.5 rounded-xl border-2 border-green-500/40 bg-zinc-950 px-6 py-5">
          {b.rules.map((r: string, i: number) => (
            <li key={i} className="font-mono text-sm leading-relaxed text-zinc-300">
              <span className="text-green-400">{String(i + 1).padStart(2, '0')}</span>
              &nbsp;&nbsp;{r}
            </li>
          ))}
        </ol>

        <div className="rounded-lg border border-red-500/40 bg-red-500/5 px-5 py-4">
          <p className="font-mono text-xs leading-relaxed text-red-300">
            Once you begin you cannot return to the board, open another task, or leave this
            screen until the task is complete.
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => router.replace('/play')}
            className="flex-1 rounded-lg border border-zinc-700 py-3.5 font-mono text-xs
                       tracking-[0.2em] text-zinc-400 hover:text-zinc-100">
            NOT YET
          </button>
          <button onClick={() => start.mutate({ cardId })} disabled={start.isPending}
            className="flex-1 rounded-lg border-2 border-green-500/70 bg-zinc-950 py-3.5 font-mono
                       text-xs font-bold tracking-[0.2em] text-green-300
                       hover:bg-green-500 hover:text-black">
            {start.isPending ? 'STARTING…' : 'BEGIN'}
          </button>
        </div>

        {start.error && (
          <p className="text-center font-mono text-xs text-red-400">{start.error.message}</p>
        )}
      </div>
    );
  }

  /* ---------- playing ---------- */
  const send = (payload: any) => attempt.mutate({ cardId, payload });
  const hud = (
    <GameHud
      name={session.name}
      index={session.view?.index}
      total={session.view?.total}
      wrong={wrong}
      maxWrong={session.maxWrong}
    />
  );

  return (
    <Guard>
      {session.ui === 'lines' && (
        <LinesRenderer hud={hud} view={session.view} onPick={(line) => send({ line })} />
      )}
      {session.ui === 'mcq' && (
        <McqRenderer hud={hud} view={session.view} onPick={(pick) => send({ pick })} />
      )}
      {(session.ui === 'spans' || session.ui === 'sudoku') && (
        <div className="flex h-screen items-center justify-center font-mono text-sm text-zinc-500">
          Renderer not built yet: {session.ui}
        </div>
      )}
    </Guard>
  );
}