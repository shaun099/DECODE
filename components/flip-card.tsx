'use client';
import { easeOut, motion } from 'motion/react';
import * as React from 'react';

export interface FlipCardData { name: string; hint: string; game: string }

/** Soft diagonal light, tuned to sit on the dotted background rather than fight it. */
function Streaks({ dim = false }: { dim?: boolean }) {
  const bars = [
    { l: -4, w: 14, o: 0.30 }, { l: 8, w: 5, o: 0.16 }, { l: 16, w: 9, o: 0.24 },
    { l: 30, w: 4, o: 0.12 },  { l: 64, w: 11, o: 0.22 }, { l: 76, w: 5, o: 0.14 },
    { l: 84, w: 13, o: 0.28 },
  ];
  return (
    <div
      className={
        'pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-500 ' +
        (dim ? 'opacity-30' : 'opacity-100')
      }
    >
      {bars.map((b, i) => (
        <div
          key={i}
          className="absolute -top-1/3 h-[170%] rounded-full"
          style={{
            left: `${b.l}%`,
            width: `${b.w}%`,
            transform: 'rotate(34deg)',
            background: `linear-gradient(180deg,
              rgba(34,197,94,0) 0%,
              rgba(34,197,94,${b.o}) 50%,
              rgba(34,197,94,0) 100%)`,
            filter: 'blur(9px)',
          }}
        />
      ))}
    </div>
  );
}

export function FlipCard({
  data, index, state = 'idle', onPlay,
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

  const face =
    'absolute inset-0 overflow-hidden rounded-2xl backface-hidden border ' +
    'bg-[#070a08] transition-colors duration-500 ' +
    (solved
      ? 'border-green-500/50 shadow-[0_0_22px_-10px_rgba(74,222,128,0.8)]'
      : 'border-green-900/50 group-hover:border-green-600/60');

  const v = {
    front: { rotateY: 0, transition: { duration: 0.6, ease: easeOut } },
    back:  { rotateY: 180, transition: { duration: 0.6, ease: easeOut } },
  };

  return (
    <div className="group relative aspect-[3/4] w-full">
      {/* halo, only on hover */}
      <div className="pointer-events-none absolute -inset-2 -z-10 rounded-3xl bg-green-500/0 blur-2xl
                      transition-all duration-500 group-hover:bg-green-500/15" />

      <div
        className="relative h-full w-full cursor-pointer"
        style={{ perspective: 1200 }}
        onClick={() => touch && setFlipped((f) => !f)}
        onMouseEnter={() => !touch && setFlipped(true)}
        onMouseLeave={() => !touch && setFlipped(false)}
      >
        {/* FRONT — identical on all fifteen */}
        <motion.div
          className={`${face} flex items-center justify-center`}
          animate={flipped ? 'back' : 'front'}
          variants={v}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* the same dot grid as the page, so the card belongs to it */}
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage: 'radial-gradient(circle, #0d401f 1px, transparent 1px)',
              backgroundSize: '12px 12px',
            }}
          />
          <Streaks />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(3,6,4,0.92)_20%,rgba(3,6,4,0.35)_70%,transparent_100%)]" />

          <span className="absolute left-3 top-3 font-mono text-[9px] tracking-[0.2em] text-green-900">
            {String(index + 1).padStart(2, '0')}
          </span>
          {solved && (
            <span className="absolute right-3 top-3 font-mono text-[10px] text-green-400">✓</span>
          )}

          <h2 className="relative font-mono text-[13px] font-semibold tracking-[0.34em] text-zinc-400
                         transition-colors duration-500 group-hover:text-green-200">
            DECODE
          </h2>

          <span className="absolute bottom-3 left-0 right-0 text-center font-mono
                           text-[8px] tracking-[0.28em] text-green-900">
            {solved ? 'CLEARED' : 'SEALED'}
          </span>
        </motion.div>

        {/* BACK — texture pushed right back, text in front */}
        <motion.div
          className={`${face} flex flex-col justify-between p-4`}
          initial={{ rotateY: 180 }}
          animate={flipped ? 'front' : 'back'}
          variants={v}
          style={{ transformStyle: 'preserve-3d', rotateY: 180 }}
        >
          <Streaks dim />
          <div className="absolute inset-0 bg-[#050807]/85" />

          <div className="relative min-h-0 flex-1">
            <h3 className="font-mono text-[13px] font-bold leading-snug text-green-200">
              {data.name}
            </h3>
            <div className="my-2.5 h-px w-8 bg-green-600/50" />
            <p className="font-mono text-[10px] leading-relaxed text-zinc-400">{data.hint}</p>
          </div>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPlay?.(); }}
            className="relative w-full shrink-0 rounded-lg border border-green-600/50 bg-green-500/10 py-2.5
                       font-mono text-[9px] font-bold tracking-[0.22em] text-green-300
                       transition-colors hover:bg-green-500 hover:text-black"
          >
            {solved ? 'REOPEN' : 'OPEN'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}