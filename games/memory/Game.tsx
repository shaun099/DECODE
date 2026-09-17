'use client';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { GameProps } from '../registry';

interface Tile { id: number; face: string | null; matched: boolean }

const pad = (n: number) => String(n).padStart(2, '0');
const GAP = 8; // px, must match the gap applied to the board grid

export default function MemoryGame({ hud, view, send }: GameProps) {
  const cols: number = view?.cols ?? 6;
  const tiles: Tile[] = view?.tiles ?? [];
  const pairs: number = view?.pairs ?? 18;
  const matchedCount: number = view?.matchedCount ?? 0;
  const moves: number = view?.moves ?? 0;
  const peekMs: number = view?.peekMs ?? 0;
  const runs: number = view?.runs ?? 0;

  const rows = Math.max(1, Math.ceil(tiles.length / cols));

  const [msLeft, setMsLeft] = useState<number>(view?.msLeft ?? 0);
  const [pending, setPending] = useState<number[]>([]);
  const [tileSize, setTileSize] = useState(0);
  const sigRef = useRef('');
  const settleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  /* ---- board sizing: one tile size that fits width AND height ---- */
  useLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      const byWidth = (width - GAP * (cols - 1)) / cols;
      const byHeight = (height - GAP * (rows - 1)) / rows;
      setTileSize(Math.max(0, Math.floor(Math.min(byWidth, byHeight))));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cols, rows]);

  useEffect(() => {
    const sig = tiles.map((t) => `${t.id}${t.face ?? ''}${t.matched ? 'm' : ''}`).join('|');
    if (sig === sigRef.current) return;
    sigRef.current = sig;
    setPending((p) => p.filter((id) => tiles.find((t) => t.id === id)?.face == null));
  }, [tiles]);

  useEffect(() => {
    if (peekMs <= 0) return;
    settleRef.current = setTimeout(() => {
      setPending([]);
      send({ action: 'settle' });
    }, peekMs + 60);
    return () => { if (settleRef.current) clearTimeout(settleRef.current); };
  }, [peekMs, send]);

  useEffect(() => { setMsLeft(view?.msLeft ?? 0); }, [view?.msLeft]);
  useEffect(() => {
    const t = setInterval(() => setMsLeft((v: number) => Math.max(0, v - 250)), 250);
    return () => clearInterval(t);
  }, []);

  /* progress dots derived from `pairs` instead of hard-coded 9 × 2 */
  const dotRows = useMemo(() => {
    const perRow = pairs > 12 ? Math.ceil(pairs / 2) : pairs;
    const out: number[][] = [];
    for (let i = 0; i < pairs; i += perRow) {
      out.push(Array.from({ length: Math.min(perRow, pairs - i) }, (_, k) => i + k));
    }
    return out;
  }, [pairs]);

  const faceUpCount = tiles.filter((t) => t.face !== null && !t.matched).length;

  function flip(t: Tile) {
    if (peekMs > 0) return;
    if (t.matched || t.face !== null) return;
    if (pending.includes(t.id)) return;
    if (pending.length + faceUpCount >= 2) return;

    setPending((p) => [...p, t.id]);
    send({ tile: t.id });
  }

  const s = Math.ceil(msLeft / 1000);
  const urgent = s <= 30;
  const wrongPair = peekMs > 0;

  return (
    <div className="mx-auto flex h-[100dvh] max-h-[100dvh] w-full max-w-3xl flex-col
                    gap-3 overflow-hidden px-4 py-4">
      <style>{`
        .mem-scene {
          display: block; padding: 0; border: 0; background: none;
          perspective: 1000px;
        }
        .mem-inner {
          position: relative; width: 100%; height: 100%;
          transform-style: preserve-3d;
          transition: transform .42s cubic-bezier(.34,1.3,.5,1);
          will-change: transform;
        }
        .mem-inner.up { transform: rotateY(180deg); }
        .mem-face {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          border-radius: 12px;
          backface-visibility: hidden; -webkit-backface-visibility: hidden;
          transform: translateZ(0);
        }
        .mem-back { transform: rotateY(180deg) translateZ(0); }
        @keyframes mem-pop {
          0% { transform: scale(1); } 45% { transform: scale(1.08); } 100% { transform: scale(1); }
        }
        .mem-pop { animation: mem-pop .42s ease-out; }
        @keyframes mem-shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-4px); } 75% { transform: translateX(4px); }
        }
        .mem-shake { animation: mem-shake .3s ease-in-out; }
        @keyframes mem-spin { to { transform: rotate(360deg); } }
        .mem-wait { animation: mem-spin .9s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .mem-inner { transition: none; }
          .mem-pop, .mem-shake, .mem-wait { animation: none; }
        }
      `}</style>

      <div className="shrink-0">{hud}</div>

      {/* scoreboard — wraps instead of colliding on narrow screens */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold text-emerald-300"
            style={{ fontVariantNumeric: 'tabular-nums' }}>
            {matchedCount}
          </span>
          <span className="font-mono text-base text-zinc-500">/ {pairs} pairs</span>
        </div>

        <div className="order-3 hidden w-full flex-col gap-1 sm:order-none sm:flex sm:w-auto">
          {dotRows.map((row, r) => (
            <div key={r} className="flex gap-1">
              {row.map((idx) => (
                <span key={idx}
                  className={
                    'h-2 w-4 rounded-full transition-all duration-500 ' +
                    (idx < matchedCount
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.9)]'
                      : 'bg-zinc-800')
                  } />
              ))}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 font-mono text-sm">
          <span className="text-zinc-500">
            Moves <span className="text-zinc-200">{moves}</span>
          </span>
          <span className={urgent ? 'text-red-400' : 'text-emerald-300'}
            style={{ fontVariantNumeric: 'tabular-nums' }}>
            {pad(Math.floor(s / 60))}:{pad(s % 60)}
          </span>
        </div>
      </div>

      {/* board: the wrapper owns the leftover space, the grid is measured against it */}
      <div ref={boardRef} className="relative min-h-0 w-full flex-1">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="grid"
            style={{
              gap: `${GAP}px`,
              gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
              gridTemplateRows: `repeat(${rows}, ${tileSize}px)`,
              visibility: tileSize > 0 ? 'visible' : 'hidden',
            }}
          >
            {tiles.map((t) => {
              const waiting = pending.includes(t.id) && t.face === null;
              const up = t.face !== null || waiting;
              const shaking = wrongPair && t.face !== null && !t.matched;
              const clickable = !up && !wrongPair && pending.length + faceUpCount < 2;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => flip(t)}
                  aria-disabled={!clickable}
                  className={
                    'mem-scene rounded-xl outline-none focus-visible:ring-2 ' +
                    'focus-visible:ring-emerald-400 ' +
                    (clickable ? 'cursor-pointer' : 'cursor-default') +
                    (shaking ? ' mem-shake' : '') +
                    (t.matched ? ' mem-pop' : '')
                  }
                  style={{ width: tileSize, height: tileSize }}
                >
                  <div className={'mem-inner' + (up ? ' up' : '')}>
                    {/* face down */}
                    <div
                      className={
                        'mem-face border-2 transition-colors duration-200 ' +
                        (clickable
                          ? 'border-emerald-900/70 hover:border-emerald-600'
                          : 'border-emerald-950')
                      }
                      style={{
                        background: 'linear-gradient(145deg,#0d1a12 0%,#071009 55%,#040906 100%)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.05)',
                      }}
                    >
                      <span className="font-black tracking-widest text-emerald-900"
                        style={{
                          fontSize: Math.max(12, Math.round(tileSize * 0.32)),
                          textShadow: '0 0 18px rgba(16,185,129,.35)',
                        }}>
                        ?
                      </span>
                    </div>

                    {/* face up */}
                    <div
                      className={
                        'mem-face mem-back border-2 ' +
                        (t.matched
                          ? 'border-emerald-400'
                          : waiting ? 'border-zinc-700' : 'border-amber-400/80')
                      }
                      style={{
                        background: t.matched
                          ? 'linear-gradient(145deg,rgba(16,185,129,.28),rgba(6,78,59,.55))'
                          : waiting
                            ? 'linear-gradient(145deg,#12161c,#0a0d11)'
                            : 'linear-gradient(145deg,rgba(251,191,36,.22),rgba(120,53,15,.5))',
                        boxShadow: t.matched
                          ? '0 0 28px -6px rgba(52,211,153,.95)'
                          : waiting ? 'none' : '0 0 22px -8px rgba(251,191,36,.9)',
                      }}
                    >
                      {waiting ? (
                        <span
                          className="mem-wait block rounded-full border-2 border-zinc-700
                                     border-t-emerald-400"
                          style={{
                            width: Math.max(12, Math.round(tileSize * 0.28)),
                            height: Math.max(12, Math.round(tileSize * 0.28)),
                          }}
                        />
                      ) : (
                        <span
                          className="select-none leading-none"
                          style={{ fontSize: Math.max(14, Math.round(tileSize * 0.5)) }}
                        >
                          {t.face}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className={
        'h-5 shrink-0 text-center font-mono text-[12px] font-bold tracking-[0.16em] ' +
        'transition-colors ' + (wrongPair ? 'text-amber-400' : 'text-zinc-600')
      }>
        {wrongPair ? 'Not a match'
          : runs > 0 ? `Attempt ${runs + 1} · new board`
          : 'Click two tiles'}
      </p>
    </div>
  );
}