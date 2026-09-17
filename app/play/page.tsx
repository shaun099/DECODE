'use client';

import { useRouter } from 'next/navigation';
import Guard from '@/components/Guard';
import Countdown from '@/components/Countdown';
import { FlipCard } from '@/components/flip-card';
import { TreasureBox } from '@/components/modals/TreasureBox';
import { trpc } from '@/lib/trpc';
import { User, Sparkles, ArrowRight } from 'lucide-react';

export default function Play() {
  const router = useRouter();
  const { data } = trpc.game.state.useQuery(undefined, { refetchInterval: 5000 });

  if (!data) return null;
  const all = data.keys.length >= data.totalKeys;

  return (
    <Guard>
      <div
        className="relative flex h-screen w-full flex-col items-center justify-between overflow-hidden bg-black px-4 py-3 sm:px-6 sm:py-4 select-none"
        style={{
          backgroundImage: "url('/bg_play.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <TreasureBox
          keys={data.keys.map((k) => ({ value: k.value, game: `position ${k.position}` }))}
        />

        {/* Top Header Pill */}
        <header className="z-10 flex w-full max-w-5xl shrink-0 items-center justify-between rounded-2xl border-2 border-lime-500/80 bg-black/60 px-5 py-2 sm:px-7 sm:py-2.5 backdrop-blur-md shadow-[0_0_20px_rgba(132,204,22,0.15)]">
          {/* Left: Avatar + Team Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-black shadow-xs">
              <User className="h-4 w-4 fill-current text-zinc-900" />
            </div>
            <span className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-zinc-100">
              {data.teamName}
            </span>
          </div>

          {/* Center: Fragments status */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="font-mono text-[11px] sm:text-xs text-zinc-400">
              Fragments
            </span>
            <div className="flex items-center gap-1 sm:gap-1.5">
              {Array.from({ length: data.totalKeys }).map((_, i) => (
                <span
                  key={i}
                  className={
                    'h-1.5 sm:h-2 w-5 sm:w-7 rounded-full transition-all duration-300 ' +
                    (i < data.keys.length
                      ? 'bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.9)]'
                      : 'bg-zinc-700/80')
                  }
                />
              ))}
            </div>
            <span className="font-mono text-xs sm:text-sm font-medium text-zinc-300">
              {data.keys.length}/{data.totalKeys}
              {`${data.keys.length} / ${data.totalKeys}`}
            </span>
          </div>

          {/* Right: Digital Countdown Timer */}
          <div className="flex items-center">
            <Countdown />
          </div>
        </header>

        {/* Main Card Selection Container */}
        <main className="z-10 flex min-h-0 w-full max-w-5xl flex-1 flex-col items-center justify-center my-2 sm:my-3">
          <div className="relative flex h-full max-h-[82vh] w-full flex-col items-center justify-between rounded-3xl border-2 border-lime-500/80 bg-black/45 p-4 sm:p-6 backdrop-blur-xs shadow-[0_0_30px_rgba(132,204,22,0.1)]">
            {/* Box Header Titles */}
            <div className="flex flex-col items-center text-center pb-2 shrink-0">
              <h1 className="font-mono text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-[0.22em] text-[#86efac] drop-shadow-[0_0_12px_rgba(134,239,172,0.6)]">
                CARD SELECTION
              </h1>
              <p className="font-serif text-[10px] sm:text-xs tracking-[0.35em] uppercase text-lime-100/90 mt-1">
                SELECT YOUR DESTINATION
              </p>
            </div>

            {/* 5x3 Cards Grid */}
            <div className="flex min-h-0 w-full flex-1 items-center justify-center">
              <div
                className="grid h-full max-h-full grid-cols-5 grid-rows-3 gap-2 sm:gap-3 md:gap-3.5"
                style={{
                  width: 'min(100%, calc((100% / 3 - 8px) * 0.72 * 5 + 48px))',
                  aspectRatio: '5 / 3.8',
                }}
              >
                {data.board.map((c, i) => (
                  <FlipCard
                    key={c.id}
                    index={i}
                    data={{ name: c.name, hint: c.teaser, game: c.id }}
                    state={c.solved ? 'solved' : 'idle'}
                    onPlay={c.solved ? undefined : () => router.push(`/play/card/${c.id}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Final assembly */}
        {all && (
          <div className="z-20 shrink-0 pb-2">
            <button
              onClick={() => router.push('/final')}
              className="group relative flex items-center gap-3 overflow-hidden rounded-xl border-2
                         border-emerald-400 bg-emerald-500/20 px-8 py-2.5 font-mono text-xs
                         font-black tracking-[0.22em] text-emerald-100
                         shadow-[0_0_30px_rgba(52,211,153,0.4)] transition-all
                         hover:bg-emerald-500 hover:text-black
                         hover:shadow-[0_0_40px_rgba(52,211,153,0.6)]"
            >
              <Sparkles className="h-4 w-4 text-emerald-300 group-hover:text-black" />
              <span>ALL KEYS RECOVERED // ASSEMBLE ANSWER</span>
              <span>{'ALL KEYS RECOVERED // ASSEMBLE ANSWER'}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
            </button>
          </div>
        )}
      </div>
    </Guard>
  );
}