'use client';
import { useRouter } from 'next/navigation';
import Guard from '@/components/Guard';
import { FlipCard } from '@/components/flip-card';
import { TreasureBox } from '@/components/modals/TreasureBox';
import { trpc } from '@/lib/trpc';

export default function Play() {
  const router = useRouter();
  const { data } = trpc.game.state.useQuery(undefined, { refetchInterval: 3000 });

  if (!data) return null;
  const all = data.keys.length >= data.totalKeys;

  return (
    <Guard>
      <div className="flex h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-4">
        <TreasureBox
          keys={data.keys.map((k) => ({ value: k.value, game: `position ${k.position}` }))}
        />

        <p className="mb-4 shrink-0 font-mono text-[10px] tracking-[0.25em] text-zinc-500">
          {data.teamName} · {data.keys.length} / {data.totalKeys} KEYS
        </p>

        <div className="grid w-full max-w-4xl grid-cols-5 gap-5">
          {data.board.map((c, i) => (
            <FlipCard
              key={c.id}
              index={i}
              data={{ name: c.name, hint: c.teaser, game: c.id }}
              state={c.solved ? 'solved' : 'idle'}
              onPlay={() => router.push(`/play/card/${c.id}`)}
            />
          ))}
        </div>

        {all && (
          <button
            onClick={() => router.push('/final')}
            className="mt-6 shrink-0 rounded-lg border-2 border-green-400 bg-green-500/15 px-10 py-3
                       font-mono text-xs font-bold tracking-[0.2em] text-green-200
                       shadow-[0_0_30px_-6px_rgba(74,222,128,0.9)]"
          >
            ASSEMBLE THE ANSWER →
          </button>
        )}
      </div>
    </Guard>
  );
}