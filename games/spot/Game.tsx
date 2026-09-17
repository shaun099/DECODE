'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameProps } from '../registry';
import { renderCanvasScene } from './scene';

interface Mark { id: string; x: number; y: number; radius: number; panel: 'A' | 'B'; n: number }

const LOUPE = 200;

export default function SpotGame({ hud, view, send }: GameProps) {
  const W: number = view?.width ?? 1000;
  const H: number = view?.height ?? 700;
  const total: number = view?.total ?? 10;
  const marks: Mark[] = view?.marks ?? [];
  const remaining: number = view?.remaining ?? total - marks.length;

  const aRef = useRef<HTMLCanvasElement | null>(null);
  const bRef = useRef<HTMLCanvasElement | null>(null);
  const loupeA = useRef<HTMLCanvasElement | null>(null);
  const loupeB = useRef<HTMLCanvasElement | null>(null);

  const [lensOn, setLensOn] = useState(true);
  const [zoom, setZoom] = useState(4);
  const [stacked, setStacked] = useState(false);
  const [pos, setPos] = useState<{ px: number; py: number } | null>(null);
  const [ripple, setRipple] = useState<{ id: number; x: number; y: number; panel: string } | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const countRef = useRef(marks.length);

  /* callback refs paint the moment the canvas attaches */
  const attachA = useCallback((node: HTMLCanvasElement | null) => {
    aRef.current = node;
    const ctx = node?.getContext('2d');
    if (ctx) renderCanvasScene(ctx, 'A');
  }, []);

  const attachB = useCallback((node: HTMLCanvasElement | null) => {
    bRef.current = node;
    const ctx = node?.getContext('2d');
    if (ctx) renderCanvasScene(ctx, 'B');
  }, []);

  /* a difference was marked — countRef tracks previous marks count */
  useEffect(() => {
    if (marks.length === countRef.current) return;
    const wasCorrect = marks.length > countRef.current;
    countRef.current = marks.length;
    setBusy(false);
    setRipple(null);
    if (!wasCorrect) return;
    const latest = marks[marks.length - 1];
    if (!latest) return;
    setFlash(latest.id);
    const t = setTimeout(() => setFlash(null), 1800);
    return () => clearTimeout(t);
  }, [marks]);

  /* repaint both lenses on every pointer move */
  useEffect(() => {
    if (!pos) return;
    const cx = (pos.px / 100) * W;
    const cy = (pos.py / 100) * H;
    const span = LOUPE / zoom;

    ([[loupeA, aRef], [loupeB, bRef]] as const).forEach(([lens, src]) => {
      const ctx = lens.current?.getContext('2d');
      if (!ctx || !src.current) return;
      ctx.imageSmoothingEnabled = false;      // crisp pixels when magnified
      ctx.fillStyle = '#0b0a10';
      ctx.fillRect(0, 0, LOUPE, LOUPE);
      ctx.drawImage(src.current, cx - span / 2, cy - span / 2, span, span, 0, 0, LOUPE, LOUPE);
    });
  }, [pos, zoom, W, H]);

  // Calibrated: map client coords via the *canvas* rect, not the panel div.
  // The panel can stretch (flex) and include borders/empty black area below the
  // canvas, so using panel.getBoundingClientRect() skews Y and makes marks
  // appear above/below the click. Canvas rect gives exact CSS-pixel mapping.
  const toCanvas = useCallback((panel: 'A' | 'B', clientX: number, clientY: number) => {
    const canvas = panel === 'A' ? aRef.current : bRef.current;
    if (!canvas) return null;
    const r = canvas.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return null;
    const px = ((clientX - r.left) / r.width) * 100;
    const py = ((clientY - r.top) / r.height) * 100;
    const x = (px / 100) * W;
    const y = (py / 100) * H;
    return { x, y, px, py };
  }, [W, H]);

  function click(e: React.MouseEvent, panel: 'A' | 'B') {
    if (busy) return;
    const p = toCanvas(panel, e.clientX, e.clientY);
    if (!p) return;
    // ignore clicks on the panel's empty area outside the canvas (when flex
    // leaves black padding below canvas) — nothing to hit there
    if (p.px < 0 || p.px > 100 || p.py < 0 || p.py > 100) return;
    const { x, y, px, py } = p;
    const before = countRef.current;
    setBusy(true);
    send({ x, y, panel });
    // Use a timeout to check if the server added a new mark.
    // We compare against countRef (updated by the effect) to avoid stale closure.
    setTimeout(() => {
      if (countRef.current === before) {
        // No new mark was added — wrong click
        setRipple({ id: Date.now(), x: px, y: py, panel });
        setBusy(false);
        setTimeout(() => setRipple(null), 700);
      }
    }, 450);
  }

  function handleMove(e: React.MouseEvent, panel: 'A' | 'B') {
    if (!lensOn) return;
    const p = toCanvas(panel, e.clientX, e.clientY);
    if (!p) return;
    // hide lens when cursor leaves the canvas area (e.g. black padding)
    if (p.px < 0 || p.px > 100 || p.py < 0 || p.py > 100) {
      setPos(null);
      return;
    }
    setPos({ px: p.px, py: p.py });
  }

  const panels = [
    { label: 'A' as const, attach: attachA, lens: loupeA },
    { label: 'B' as const, attach: attachB, lens: loupeB },
  ];

  return (
    <div className="mx-auto flex h-screen max-w-[1500px] flex-col gap-3 overflow-hidden px-6 py-5">
      {hud}

      {/* progress + controls */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span
            className="font-mono text-4xl font-bold text-emerald-300"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {marks.length}
          </span>
          <span className="font-mono text-lg text-zinc-500">/ {total}</span>
          <span
            className={
              'ml-2 font-mono text-[13px] font-bold tracking-[0.16em] ' +
              (remaining === 0 ? 'text-emerald-300' : 'text-amber-400')
            }
          >
            {remaining === 0 ? 'ALL FOUND' : `${remaining} STILL TO FIND`}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={
                'h-2.5 w-6 rounded-full transition-all duration-300 ' +
                (i < marks.length
                  ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]'
                  : 'bg-zinc-800')
              }
            />
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => { setLensOn((v) => !v); setPos(null); }}
            className={
              'rounded border-2 px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.14em] transition-all ' +
              (lensOn
                ? 'border-amber-400 bg-amber-400/15 text-amber-300'
                : 'border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300')
            }
          >
            {lensOn ? 'LENS ON' : 'LENS OFF'}
          </button>

          <button
            type="button"
            onClick={() => setZoom((z) => (z >= 8 ? 2 : z + 2))}
            disabled={!lensOn}
            className="rounded border-2 border-amber-600 px-3 py-1.5 font-mono text-[11px]
                       font-bold tracking-[0.14em] text-amber-300 transition-all
                       hover:bg-amber-500 hover:text-black disabled:border-zinc-800
                       disabled:text-zinc-700"
          >
            {zoom}×
          </button>

          <button
            type="button"
            onClick={() => setStacked((v) => !v)}
            className="rounded border-2 border-zinc-700 px-3 py-1.5 font-mono text-[11px]
                       font-bold tracking-[0.14em] text-zinc-400 transition-all
                       hover:border-zinc-500 hover:text-zinc-100"
          >
            {stacked ? 'SIDE BY SIDE' : 'STACKED'}
          </button>
        </div>
      </div>

      <div
        className={
          'flex min-h-0 flex-1 gap-3 ' +
          (stacked ? 'flex-col overflow-y-auto' : 'flex-row items-start')
        }
      >
        {panels.map(({ label, attach, lens }) => (
          <div
            key={label}
            className={
              'relative overflow-hidden rounded-lg border-2 border-emerald-800 bg-black ' +
              'shadow-[0_0_30px_-12px_rgba(52,211,153,.7)] ' +
              (stacked ? 'w-full shrink-0' : 'flex-1 self-start')
            }
            style={{ cursor: busy ? 'wait' : 'crosshair' }}
            onClick={(e) => click(e, label)}
            onMouseMove={(e) => handleMove(e, label)}
            onMouseLeave={() => setPos(null)}
          >
            {/* Inner wrapper is sized exactly to the canvas. All absolute marks /
                lens / ripple are positioned inside this wrapper so their %
                coordinates map 1:1 to canvas pixels, regardless of panel flex
                stretch or borders. This calibrates the magnifier and marks. */}
            <div className="relative w-full">
              <span className="pointer-events-none absolute left-2 top-2 z-20 rounded bg-black/85
                               px-2 py-0.5 font-mono text-[11px] font-bold tracking-widest text-emerald-400">
                SCENE {label}
              </span>

              <canvas ref={attach} width={W} height={H} className="block h-auto w-full" />

              {/* marks — show on BOTH panels so user sees which differences are found */}
              {marks.map((m) => {
                const fresh = flash === m.id;
                return (
                  <span
                    key={m.id}
                    className={
                      'pointer-events-none absolute flex items-center justify-center rounded-full ' +
                      'border-[3px] transition-all duration-300 ' +
                      (fresh
                        ? 'z-30 border-emerald-200 bg-emerald-400/50'
                        : 'z-10 border-emerald-400 bg-emerald-400/20')
                    }
                    style={{
                      left: `${(m.x / W) * 100}%`,
                      top: `${(m.y / H) * 100}%`,
                      width: `${((m.radius * 2) / W) * 100}%`,
                      aspectRatio: '1',
                      transform: `translate(-50%,-50%) scale(${fresh ? 1.35 : 1})`,
                      boxShadow: fresh
                        ? '0 0 38px 6px rgba(52,211,153,1)'
                        : '0 0 16px rgba(52,211,153,.9)',
                    }}
                  >
                    <span
                      className={
                        'rounded-full bg-black font-bold ' +
                        (fresh
                          ? 'px-2 py-0.5 text-lg text-white'
                          : 'px-1.5 font-mono text-[10px] text-emerald-300')
                      }
                    >
                      {fresh ? '✓' : m.n}
                    </span>
                  </span>
                );
              })}

              {ripple?.panel === label && (
                <span
                  key={ripple.id}
                  className="pointer-events-none absolute z-20 h-9 w-9 rounded-full border-2
                             border-red-500 bg-red-500/30"
                  style={{
                    left: `${ripple.x}%`,
                    top: `${ripple.y}%`,
                    transform: 'translate(-50%,-50%)',
                  }}
                />
              )}

              {lensOn && pos && (
                <div
                  className="pointer-events-none absolute z-40 overflow-hidden rounded-full
                             border-[3px] border-amber-400"
                  style={{
                    width: LOUPE,
                    height: LOUPE,
                    left: `${pos.px}%`,
                    top: `${pos.py}%`,
                    transform: 'translate(-50%,-50%)',
                    boxShadow: '0 0 26px rgba(251,191,36,.65), inset 0 0 16px rgba(0,0,0,.85)',
                  }}
                >
                  <canvas ref={lens} width={LOUPE} height={LOUPE} className="block" />
                  <span className="absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2
                                   -translate-y-1/2 bg-amber-400/80" />
                  <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2
                                   -translate-y-1/2 bg-amber-400/80" />
                  <span className="absolute bottom-1.5 left-0 right-0 text-center font-mono
                                   text-[10px] font-bold tracking-widest text-amber-300">
                    {label}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
