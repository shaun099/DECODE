'use client';
import { useEffect, useRef, useState } from 'react';

const pad = (n: number) => String(n).padStart(2, '0');

export default function LockClock({
  seconds,
  onComplete,
}: {
  seconds: number;
  onComplete?: () => void;
}) {
  const el = useRef<HTMLParagraphElement>(null);
  const end = useRef(Date.now() + seconds * 1000);
  const [ready, setReady] = useState(false);
  const completed = useRef(false);

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
      if (!ready) setReady(true);        // first real digit painted

      if (s <= 0 && !completed.current) {
        completed.current = true;
        onComplete?.();
      }
    };
    raf = requestAnimationFrame(paint);
    return () => cancelAnimationFrame(raf);
  }, [ready, onComplete]);

  return (
    <p
      ref={el}
      className={
        'mt-7 font-mono text-6xl font-bold text-zinc-100 transition-opacity duration-500 ' +
        (ready ? 'opacity-100' : 'opacity-0')
      }
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      --:--
    </p>
  );
}