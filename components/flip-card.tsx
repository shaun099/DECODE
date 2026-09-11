'use client';

import * as React from 'react';
import { motion, easeOut } from 'motion/react';
import { Cpu, Shield, CheckCircle2, Lock, ArrowUpRight, Sparkles, Terminal } from 'lucide-react';

export interface FlipCardData {
  name: string;
  hint: string;
  game: string;
}

/** Soft holographic light streaks creating depth on the dark card surface */
function HolographicStreaks({ dim = false }: { dim?: boolean }) {
  const bars = [
    { l: -5, w: 16, o: 0.25 },
    { l: 12, w: 6, o: 0.15 },
    { l: 24, w: 10, o: 0.2 },
    { l: 48, w: 5, o: 0.12 },
    { l: 68, w: 12, o: 0.18 },
    { l: 85, w: 14, o: 0.22 },
  ];

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-700 ${
        dim ? 'opacity-20' : 'opacity-100'
      }`}
    >
      {bars.map((b, i) => (
        <div
          key={i}
          className="absolute -top-1/3 h-[180%] rounded-full"
          style={{
            left: `${b.l}%`,
            width: `${b.w}%`,
            transform: 'rotate(32deg)',
            background: `linear-gradient(180deg, rgba(16,185,129,0) 0%, rgba(52,211,153,${b.o}) 50%, rgba(16,185,129,0) 100%)`,
            filter: 'blur(10px)',
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

  React.useEffect(() => {
    setTouch('ontouchstart' in window);
  }, []);

  const solved = state === 'solved';
  const cardNum = String(index + 1).padStart(2, '0');

  const variants = {
    front: { rotateY: 0, transition: { duration: 0.6, ease: easeOut } },
    back: { rotateY: 180, transition: { duration: 0.6, ease: easeOut } },
  };

  return (
    <div className="group relative aspect-[3/4] w-full select-none">
      {/* Dynamic Hover Aura Glow */}
      <div
        className={`pointer-events-none absolute -inset-1.5 -z-10 rounded-3xl blur-xl transition-all duration-500 ${
          solved
            ? 'bg-emerald-500/25 opacity-100 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
            : 'bg-emerald-500/0 opacity-0 group-hover:bg-emerald-500/20 group-hover:opacity-100'
        }`}
      />

      <div
        className="relative h-full w-full cursor-pointer transition-transform duration-300 group-hover:scale-[1.02]"
        style={{ perspective: 1200 }}
        onClick={() => touch && setFlipped((f) => !f)}
        onMouseEnter={() => !touch && setFlipped(true)}
        onMouseLeave={() => !touch && setFlipped(false)}
      >
        {/* =========================================================================
            FRONT FACE (The Sealed / Encrypted Matrix Node)
            ========================================================================= */}
        <motion.div
          className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border p-3.5 backface-hidden transition-colors duration-500 ${
            solved
              ? 'border-emerald-400/60 bg-gradient-to-b from-[#0d1812] via-[#070e0a] to-[#040806] shadow-[0_0_20px_rgba(16,185,129,0.25)]'
              : 'border-emerald-500/20 bg-gradient-to-b from-[#0c1510] via-[#070b09] to-[#040605] group-hover:border-emerald-400/70 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'
          }`}
          animate={flipped ? 'back' : 'front'}
          variants={variants}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Cyber Micro-Grid Background Pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'radial-gradient(circle, #10b981 0.75px, transparent 0.75px)',
              backgroundSize: '14px 14px',
            }}
          />

          {/* Holographic Streaks & Vignette */}
          <HolographicStreaks />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(4,7,5,0.85)_25%,rgba(4,7,5,0.35)_75%,transparent_100%)]" />

          {/* Tech Corner Brackets */}
          <span className="pointer-events-none absolute left-2 top-2 font-mono text-[9px] text-emerald-500/40">┌</span>
          <span className="pointer-events-none absolute right-2 top-2 font-mono text-[9px] text-emerald-500/40">┐</span>
          <span className="pointer-events-none absolute bottom-2 left-2 font-mono text-[9px] text-emerald-500/40">└</span>
          <span className="pointer-events-none absolute bottom-2 right-2 font-mono text-[9px] text-emerald-500/40">┘</span>

          {/* Top Bar: Card Tag + Solved Chip */}
          <div className="relative z-10 flex items-center justify-between font-mono text-[9px]">
            <span className="flex items-center gap-1 font-bold tracking-widest text-emerald-500/80">
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              NODE//{cardNum}
            </span>

            {solved ? (
              <span className="flex items-center gap-0.5 rounded bg-emerald-500/20 px-1.5 py-0.5 font-bold text-emerald-300 ring-1 ring-emerald-500/50">
                <CheckCircle2 className="h-2.5 w-2.5" />
                CLEARED
              </span>
            ) : (
              <span className="flex items-center gap-0.5 rounded bg-zinc-900/90 px-1.5 py-0.5 text-zinc-500 border border-zinc-800">
                <Lock className="h-2 w-2" />
                SEALED
              </span>
            )}
          </div>

          {/* Center Graphic: Futuristic Cipher Core */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            {/* Holographic Emblem */}
            <div
              className={`relative mb-2.5 flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-500 ${
                solved
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                  : 'border-emerald-500/30 bg-emerald-950/40 text-emerald-400/70 group-hover:border-emerald-400 group-hover:text-emerald-300 group-hover:shadow-[0_0_15px_rgba(52,211,153,0.3)]'
              }`}
            >
              <Cpu className="h-6 w-6" />
              <div className="absolute -inset-0.5 rounded-xl border border-emerald-500/20 animate-pulse" />
            </div>

            {/* DECODE Title */}
            <h2 className="font-mono text-xs font-black tracking-[0.38em] text-zinc-300 transition-colors duration-300 group-hover:text-emerald-200">
              DECODE
            </h2>
            <span className="mt-0.5 font-mono text-[8px] tracking-[0.2em] text-emerald-600">
              ENCRYPTED MATRIX
            </span>
          </div>

          {/* Bottom Bar: Status Pill */}
          <div className="relative z-10 text-center font-mono text-[8px] tracking-[0.24em]">
            <span
              className={`inline-block rounded-full px-2 py-0.5 transition-colors ${
                solved
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                  : 'bg-zinc-900/70 text-zinc-500 border border-zinc-800/80 group-hover:border-emerald-500/30 group-hover:text-emerald-400/80'
              }`}
            >
              {solved ? 'FRAGMENT DECRYPTED' : 'HOVER TO SCAN'}
            </span>
          </div>
        </motion.div>

        {/* =========================================================================
            BACK FACE (The Decrypted Briefing / Challenge Card)
            ========================================================================= */}
        <motion.div
          className={`absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border p-4 backface-hidden transition-colors duration-500 ${
            solved
              ? 'border-emerald-400/70 bg-gradient-to-b from-[#0e1a14] via-[#07110c] to-[#040906] shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              : 'border-emerald-500/40 bg-gradient-to-b from-[#0b1712] via-[#07100b] to-[#040806] shadow-xl'
          }`}
          initial={{ rotateY: 180 }}
          animate={flipped ? 'front' : 'back'}
          variants={variants}
          style={{ transformStyle: 'preserve-3d', rotateY: 180 }}
        >
          {/* Subtle Streaks and Grid */}
          <HolographicStreaks dim />
          <div className="pointer-events-none absolute inset-0 bg-[#040806]/80 backdrop-blur-sm" />

          {/* Tech Corner Brackets */}
          <span className="pointer-events-none absolute left-2 top-2 font-mono text-[9px] text-emerald-500/40">┌</span>
          <span className="pointer-events-none absolute right-2 top-2 font-mono text-[9px] text-emerald-500/40">┐</span>
          <span className="pointer-events-none absolute bottom-2 left-2 font-mono text-[9px] text-emerald-500/40">└</span>
          <span className="pointer-events-none absolute bottom-2 right-2 font-mono text-[9px] text-emerald-500/40">┘</span>

          {/* Top Tag Bar */}
          <div className="relative z-10 flex items-center justify-between font-mono text-[9px]">
            <span className="flex items-center gap-1 font-bold text-emerald-400">
              <Terminal className="h-2.5 w-2.5" />
              BRIEFING
            </span>
            <span className="text-zinc-500">#{cardNum}</span>
          </div>

          {/* Mission Info Area */}
          <div className="relative z-10 min-h-0 flex-1 py-2">
            <h3 className="font-mono text-xs font-bold leading-snug text-emerald-200">
              {data.name}
            </h3>
            <div className="my-2 h-px w-8 bg-emerald-500/40" />
            <p className="font-mono text-[10px] leading-relaxed text-zinc-300">
              {data.hint}
            </p>
          </div>

          {/* Action Trigger Button */}
          <div className="relative z-10 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPlay?.();
              }}
              className={`flex w-full items-center justify-center gap-1.5 rounded-xl border py-2.5 font-mono text-[10px] font-bold tracking-[0.2em] transition-all duration-200 ${
                solved
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500 hover:text-black shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500 hover:text-black hover:shadow-[0_0_15px_rgba(52,211,153,0.4)]'
              }`}
            >
              <span>{solved ? 'REOPEN TASK' : 'INITIALIZE'}</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}