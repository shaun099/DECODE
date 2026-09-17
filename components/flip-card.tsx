'use client';

import * as React from 'react';
import { motion, easeOut } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export interface FlipCardData {
  name: string;
  hint?: string;
  game: string;
}

export function FlipCard({
  data,
  state = 'idle',
  onPlay,
}: {
  data: FlipCardData;
  index?: number;
  state?: 'idle' | 'solved';
  onPlay?: () => void;
}) {
  const [flipped, setFlipped] = React.useState(false);
  const [touch, setTouch] = React.useState(false);
  React.useEffect(() => setTouch('ontouchstart' in window), []);

  const solved = state === 'solved';

  const variants = {
    front: { rotateY: 0, transition: { duration: 0.1, ease: easeOut } },
    back: { rotateY: 180, transition: { duration: 0.1, ease: easeOut } },
  };

  const shell =
    'absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl ' +
    'backface-hidden transition-all duration-500 bg-contain bg-center bg-no-repeat ';

  return (
    <div className={`group relative h-full w-full select-none ${solved ? 'pointer-events-none' : ''}`}>
      {/* Glow highlight */}
      <div
        className={
          'pointer-events-none absolute -inset-1.5 -z-10 rounded-2xl blur-xl transition-all duration-500 ' +
          (solved
            ? 'opacity-0'
            : 'bg-emerald-500/0 opacity-0 group-hover:bg-emerald-500/25 group-hover:opacity-100')
        }
      />

      <div
        className={
          'relative h-full w-full transition-transform duration-300 ' +
          (solved ? 'cursor-not-allowed opacity-60' : 'cursor-pointer group-hover:scale-[1.02]')
        }
        style={{ perspective: 1200 }}
        onClick={() => !solved && touch && setFlipped((f) => !f)}
        onMouseEnter={() => !solved && !touch && setFlipped(true)}
        onMouseLeave={() => !solved && !touch && setFlipped(false)}
      >
        {/* ---------------- FRONT (Decode.png) ---------------- */}
        <motion.div
          className={
            shell +
            (solved ? 'grayscale brightness-75' : '')
          }
          style={{
            transformStyle: 'preserve-3d',
            backgroundImage: "url('/Decode.png')",
            backgroundSize: '100% 100%',
          }}
          animate={flipped && !solved ? 'back' : 'front'}
          variants={variants}
        >
          {/* Solved badge if cleared */}
          {solved && (
            <div className="relative z-10 flex justify-end p-3 font-mono">
              <span className="flex items-center gap-1 font-bold text-zinc-900 bg-zinc-400/80 px-2 py-0.5 rounded shadow-xs text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                CLEARED
              </span>
            </div>
          )}
        </motion.div>

        {/* ---------------- BACK (Card.png) ---------------- */}
        <motion.div
          className={
            shell +
            'px-6 py-6 flex flex-col justify-between ' +
            (solved ? 'grayscale brightness-90' : '')
          }
          initial={{ rotateY: 180 }}
          animate={flipped && !solved ? 'front' : 'back'}
          variants={variants}
          style={{
            transformStyle: 'preserve-3d',
            rotateY: 180,
            backgroundImage: "url('/Card.png')",
            backgroundSize: '100% 100%',
          }}
        >
          {/* Details Content */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center px-1 pt-2">
  <h3 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-wide text-emerald-950 leading-tight">
    {data.name}
  </h3>
  <p className="mt-2.5 font-mono text-xs sm:text-[13px] leading-relaxed text-emerald-950 font-bold line-clamp-4">
    {data.hint}
  </p>
</div>

          {/* Action Button: Button.png */}
          <div className="relative z-10 pb-1 flex justify-center">
            {solved ? (
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="flex items-center justify-center grayscale opacity-60 cursor-not-allowed"
              >
                <img
                  src="/Button.png"
                  alt="Cleared"
                  className="h-11 sm:h-13 md:h-14 w-auto max-w-[90%] object-contain"
                />
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay?.();
                }}
                className="group/btn relative flex items-center justify-center transition-transform duration-150 hover:scale-105 active:scale-95 focus:outline-none"
              >
                <img
                  src="/Button.png"
                  alt="Initialize"
                  className="h-11 sm:h-13 md:h-14 w-auto max-w-[90%] object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)] group-hover/btn:drop-shadow-[0_4px_10px_rgba(16,185,129,0.5)]"
                />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}