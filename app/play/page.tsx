'use client';

import { useRouter } from 'next/navigation';
import Guard from '@/components/Guard';
import Countdown from '@/components/Countdown';
import { FlipCard } from '@/components/flip-card';
import { TreasureBox } from '@/components/modals/TreasureBox';
import { trpc } from '@/lib/trpc';
import { Shield, Sparkles, ArrowRight, Key } from 'lucide-react';

export default function Play() {
  const router = useRouter();
  const { data } = trpc.game.state.useQuery(undefined, { refetchInterval: 5000 });

  if (!data) return null;
  const all = data.keys.length >= data.totalKeys;

  return (
    <Guard>
      <div className="flex h-screen w-full flex-col items-center overflow-hidden px-4 py-3">
        <TreasureBox
          keys={data.keys.map((k) => ({ value: k.value, game: `position ${k.position}` }))}
        />

        {/* Matrix header bar */}
        <div className="flex w-full max-w-5xl shrink-0 flex-wrap items-center justify-between gap-3
                        rounded-xl border border-emerald-500/30 bg-zinc-950/80 px-5 py-2.5
                        shadow-xl shadow-black/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg border
                             border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
              <Shield className="h-3.5 w-3.5" />
            </span>
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-zinc-100">
              {data.teamName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-mono text-[11px] tracking-wider text-zinc-400">FRAGMENTS</span>
            </div>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: data.totalKeys }).map((_, i) => (
                <span
                  key={i}
                  className={
                    'h-2 w-7 rounded-full transition-all duration-300 ' +
                    (i < data.keys.length
                      ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]'
                      : 'bg-zinc-800')
                  }
                />
              ))}
            </div>
            <span className="font-mono text-xs font-bold text-emerald-300">
              {data.keys.length} / {data.totalKeys}
            </span>
          </div>

          <Countdown />
        </div>

        {/* Board — fills the remaining height, never scrolls */}
        <div className="flex min-h-0 w-full flex-1 items-center justify-center py-3">
          <div
            className="grid h-full grid-cols-5 grid-rows-3 gap-3"
            style={{
              // keep the 3:4 card ratio: row height x 0.75 x 5 columns + gaps
              width: 'min(100%, calc((100% / 3 - 8px) * 0.75 * 5 + 48px))',
              maxWidth: '64rem',
              aspectRatio: '5 / 4',
            }}
          >
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
        </div>

        {/* Final assembly */}
        {all && (
          <div className="flex shrink-0 flex-col items-center pb-1">
            <button
              onClick={() => router.push('/final')}
              className="group relative flex items-center gap-3 overflow-hidden rounded-xl border-2
                         border-emerald-400 bg-emerald-500/20 px-10 py-3 font-mono text-xs
                         font-black tracking-[0.22em] text-emerald-100
                         shadow-[0_0_30px_rgba(52,211,153,0.4)] transition-all
                         hover:bg-emerald-500 hover:text-black
                         hover:shadow-[0_0_40px_rgba(52,211,153,0.6)]"
            >
              <Sparkles className="h-4 w-4 text-emerald-300 group-hover:text-black" />
              <span>ALL KEYS RECOVERED // ASSEMBLE ANSWER</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
            </button>
          </div>
        )}
      </div>
    </Guard>
  );
}