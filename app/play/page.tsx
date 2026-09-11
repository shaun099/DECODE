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
      <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 py-8">
        <TreasureBox keys={data.keys.map((k) => ({ value: k.value, game: `position ${k.position}` }))} />

        {/* Matrix Header Navigation Bar */}
        <div className="mb-6 flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-zinc-950/80 px-6 py-3.5 shadow-xl shadow-black/60 backdrop-blur-md">
          {/* Team Name Pill */}
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
              <Shield className="h-3.5 w-3.5" />
            </span>
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-zinc-100">
              {data.teamName}
            </span>
          </div>

          {/* Key Fragments Status Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-mono text-[11px] tracking-wider text-zinc-400">FRAGMENTS:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: data.totalKeys }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-7 rounded-full transition-all duration-300 ${
                    i < data.keys.length
                      ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]'
                      : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-xs font-bold text-emerald-300">
              {data.keys.length} / {data.totalKeys}
            </span>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2">
            <Countdown />
          </div>
        </div>

        {/* 15 Matrix Cards Grid (3 Rows x 5 Columns on desktop) */}
        <div className="grid w-full max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
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

        {/* Final Solution Assembly Button (appears when all 5 keys are found) */}
        {all && (
          <div className="mt-8 flex flex-col items-center">
            <button
              onClick={() => router.push('/final')}
              className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border-2 border-emerald-400 bg-emerald-500/20 px-12 py-4 font-mono text-xs font-black tracking-[0.25em] text-emerald-100 shadow-[0_0_30px_rgba(52,211,153,0.4)] transition-all hover:bg-emerald-500 hover:text-black hover:shadow-[0_0_40px_rgba(52,211,153,0.6)]"
            >
              <Sparkles className="h-4 w-4 animate-spin text-emerald-300 group-hover:text-black" />
              <span>ALL KEYS RECOVERED // ASSEMBLE ANSWER</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
            </button>
            <p className="mt-2 font-mono text-[11px] text-emerald-400/80">
              All 5 fragments unlocked. Proceed to finalize decryption.
            </p>
          </div>
        )}
      </div>
    </Guard>
  );
}