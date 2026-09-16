'use client';
import { useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The three hour clock. Never re-renders — the deadline is fetched rarely and
 * the digits are written straight to the DOM on a rAF loop, so heavy work
 * elsewhere on the page can never drop a tick.
 */
export default function Countdown() {
  const el = useRef<HTMLSpanElement>(null);
  const deadline = useRef<number | null>(null);

  const { data } = trpc.game.state.useQuery(undefined, {
    refetchInterval: 30000,
    select: (d) => d.remainingMs,
  });

  useEffect(() => {
    if (typeof data === 'number') deadline.current = Date.now() + data;
  }, [data]);

  useEffect(() => {
    let raf = 0;
    let shown = '';

    const paint = () => {
      raf = requestAnimationFrame(paint);
      if (!deadline.current || !el.current) return;

      const left = Math.max(0, deadline.current - Date.now());
      const s = Math.floor(left / 1000);
      const text = `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;

      if (text === shown) return;           // only touch the DOM when a digit changes
      shown = text;
      el.current.textContent = text;
      el.current.style.color = left < 15 * 60 * 1000 ? '#f87171' : '#6ee7b7';
    };

    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span
      ref={el}
      className="font-mono text-lg font-bold text-emerald-300"
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      --:--:--
    </span>
  );
}

/**
 * The lockout counter. Same technique, counting down from a fixed number
 * of seconds handed in once.
 */
export function LockClock({ seconds }: { seconds: number }) {
  const el = useRef<HTMLParagraphElement>(null);
  const end = useRef(Date.now() + seconds * 1000);

  // re-anchor if the server reports a different remaining time
  useEffect(() => {
    const next = Date.now() + seconds * 1000;
    if (Math.abs(next - end.current) > 1500) end.current = next;
  }, [seconds]);

  useEffect(() => {
    let raf = 0;
    let shown = '';

    const paint = () => {
      raf = requestAnimationFrame(paint);
      if (!el.current) return;
      const s = Math.max(0, Math.ceil((end.current - Date.now()) / 1000));
      const text = `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
      if (text === shown) return;
      shown = text;
      el.current.textContent = text;
    };

    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <p
      ref={el}
      className="mt-7 font-mono text-6xl font-bold text-zinc-100"
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      --:--
    </p>
  );
}