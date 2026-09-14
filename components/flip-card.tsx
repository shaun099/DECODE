'use client';

import * as React from 'react';
import { motion, easeOut } from 'motion/react';
import { CheckCircle2, Lock, ArrowUpRight, Terminal } from 'lucide-react';

export interface FlipCardData {
  name: string;
  hint: string;
  game: string;
}

/**
 * Hard-edged diagonal panels. Clip-path shards, no blur — the whole look
 * comes from crisp boundaries between lit and unlit faces.
 */
function Shards({ dim = false, lit = false }: { dim?: boolean; lit?: boolean }) {
  const k = lit ? 1.35 : 1;

  const shards = [
    // left cluster
    { clip: 'polygon(0% 0%, 26% 0%, 0% 82%)', g: '160deg, #3ddc84, #157a42', o: 0.90 * k },
    { clip: 'polygon(0% 42%, 22% 0%, 34% 0%, 0% 100%)', g: '160deg, #1f9c56, #0a3d22', o: 0.62 * k },
    { clip: 'polygon(0% 88%, 30% 34%, 44% 66%, 16% 100%)', g: '150deg, #2fbd6c, #0d4d2b', o: 0.48 * k },
    // right cluster
    { clip: 'polygon(100% 0%, 100% 74%, 66% 0%)', g: '200deg, #3ddc84, #12683a', o: 0.86 * k },
    { clip: 'polygon(78% 0%, 100% 0%, 100% 100%, 88% 100%)', g: '200deg, #1a8c4c, #072d19', o: 0.55 * k },
    { clip: 'polygon(100% 46%, 100% 100%, 62% 100%)', g: '210deg, #2aa862, #0a3f24', o: 0.44 * k },
  ];

  return (
    <div
      className={
        'pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-700 ' +
        (dim ? 'opacity-30' : 'opacity-100')
      }
    >
      {shards.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            clipPath: s.clip,
            background: `linear-gradient(${s.g})`,
            opacity: s.o,
          }}
        />
      ))}
    </div>
  );
}

export function FlipCard({
  data,
  index,
  state = 'idle',
  onPlay,
}: {
  data: FlipCardData;
  index: number;
  state?: 'idle' | 'solved';
  onPlay?: () => void;
}) {
  const [flipped, setFlipped] = React.useState(false);
  const [touch, setTouch] = React.useState(false);
  React.useEffect(() => setTouch('ontouchstart' in window), []);

  const solved = state === 'solved';
  const cardNum = String(index + 1).padStart(2, '0');

  const variants = {
    front: { rotateY: 0, transition: { duration: 0.6, ease: easeOut } },
    back: { rotateY: 180, transition: { duration: 0.6, ease: easeOut } },
  };

  const shell =
    'absolute inset-0 flex flex-col justify-between overflow-hidden rounded-xl border ' +
    'backface-hidden transition-colors duration-500 bg-black ';

  return (
    <div className="group relative h-full w-full select-none">
      <div
        className={
          'pointer-events-none absolute -inset-1.5 -z-10 rounded-2xl blur-xl transition-all duration-500 ' +
          (solved
            ? 'bg-emerald-500/25 opacity-100'
            : 'bg-emerald-500/0 opacity-0 group-hover:bg-emerald-500/20 group-hover:opacity-100')
        }
      />

      <div
        className="relative h-full w-full cursor-pointer transition-transform duration-300 group-hover:scale-[1.02]"
        style={{ perspective: 1200 }}
        onClick={() => touch && setFlipped((f) => !f)}
        onMouseEnter={() => !touch && setFlipped(true)}
        onMouseLeave={() => !touch && setFlipped(false)}
      >
        {/* ---------------- FRONT ---------------- */}
        <motion.div
          className={
            shell + 'p-3 ' +
            (solved
              ? 'border-emerald-400/70'
              : 'border-emerald-900/60 group-hover:border-emerald-500/70')
          }
          animate={flipped ? 'back' : 'front'}
          variants={variants}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <Shards lit={solved} />

          {/* black core, so the panels stay at the edges */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 62% 58% at 50% 50%, #000 40%, rgba(0,0,0,.85) 68%, transparent 100%)',
            }}
          />

          {/* top bar */}
          <div className="relative z-10 flex items-start justify-between font-mono text-[9px]">
            <span className="font-bold tracking-widest text-emerald-400/80">{cardNum}</span>
            {solved ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
            ) : (
              <Lock className="h-3 w-3 text-zinc-600" />
            )}
          </div>

          {/* DECODE — large, diagonal, running with the shards */}
          <div className="relative z-10 flex flex-1 items-center justify-center">
            <h2
              className={
                'whitespace-nowrap font-black leading-none tracking-[0.16em] transition-colors duration-300 ' +
                (solved ? 'text-emerald-200' : 'text-zinc-100 group-hover:text-emerald-200')
              }
              style={{
                transform: 'rotate(-54deg)',
                fontSize: 'clamp(20px, 3.4vw, 34px)',
                textShadow: '0 0 26px rgba(0,0,0,.95), 0 0 40px rgba(52,211,153,.35)',
              }}
            >
              DECODE
            </h2>
          </div>

          {/* bottom */}
          <div className="relative z-10 text-center font-mono text-[8px] tracking-[0.26em]">
            <span className={solved ? 'text-emerald-300' : 'text-zinc-600'}>
              {solved ? 'CLEARED' : 'SEALED'}
            </span>
          </div>
        </motion.div>

        {/* ---------------- BACK ---------------- */}
        <motion.div
          className={
            shell + 'p-4 ' +
            (solved ? 'border-emerald-400/70' : 'border-emerald-700/60')
          }
          initial={{ rotateY: 180 }}
          animate={flipped ? 'front' : 'back'}
          variants={variants}
          style={{ transformStyle: 'preserve-3d', rotateY: 180 }}
        >
          <Shards dim />
          <div className="pointer-events-none absolute inset-0 bg-black/86" />

          <div className="relative z-10 flex items-center justify-between font-mono text-[9px]">
            <span className="flex items-center gap-1 font-bold text-emerald-400">
              <Terminal className="h-2.5 w-2.5" />
              BRIEFING
            </span>
            <span className="text-zinc-600">{cardNum}</span>
          </div>

          <div className="relative z-10 min-h-0 flex-1 py-2">
            <h3 className="text-[13px] font-bold leading-snug text-emerald-200">{data.name}</h3>
            <div className="my-2 h-px w-8 bg-emerald-500/50" />
            <p className="font-mono text-[10px] leading-relaxed text-zinc-300">{data.hint}</p>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPlay?.(); }}
            className={
              'relative z-10 flex w-full items-center justify-center gap-1.5 rounded-lg border py-2.5 ' +
              'font-mono text-[10px] font-bold tracking-[0.2em] transition-all duration-200 ' +
              (solved
                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500 hover:text-black'
                : 'border-emerald-600/70 bg-emerald-500/10 text-emerald-300 ' +
                'hover:border-emerald-400 hover:bg-emerald-500 hover:text-black')
            }
          >
            <span>{solved ? 'REOPEN' : 'INITIALIZE'}</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}