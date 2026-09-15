'use client';
import { useEffect, useRef, useState } from 'react';
import type { GameProps } from '../registry';

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');
const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
};

export default function CaptchaGame({ hud, view, send }: GameProps) {
  const level: number = view?.level ?? 0;
  const levelName: string = view?.levelName ?? '';
  const levelSeconds: number = view?.levelSeconds ?? 45;
  const totalLevels: number = view?.totalLevels ?? 5;
  const index: number = view?.index ?? 0;
  const perLevel: number = view?.perLevel ?? 1;
  const hint: string = view?.hint ?? '';
  const runs: number = view?.runs ?? 0;
  const lastPenalty: number = view?.lastPenalty ?? 0;
  const captcha: string | null = view?.captcha ?? null;

  const [text, setText] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [levelMs, setLevelMs] = useState<number>(view?.levelMs ?? 0);
  const [globalMs, setGlobalMs] = useState<number>(view?.globalMs ?? 0);
  const [penaltyFlash, setPenaltyFlash] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const sigRef = useRef<string>('');
  const penRef = useRef<number>(lastPenalty);

  /* a new challenge arrived — clear and refocus */
  useEffect(() => {
    const sig = `${level}-${index}-${runs}-${lastPenalty}`;
    if (sig === sigRef.current) return;
    sigRef.current = sig;
    setText('');
    setBusy(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [level, index, runs, lastPenalty]);

  /* a penalty just landed — flash the global clock */
  useEffect(() => {
    if (lastPenalty === penRef.current) return;
    penRef.current = lastPenalty;
    if (!lastPenalty) return;
    setPenaltyFlash(true);
    const t = setTimeout(() => setPenaltyFlash(false), 2500);
    return () => clearTimeout(t);
  }, [lastPenalty]);

  /* re-anchor the clocks whenever the server reports them */
  useEffect(() => {
    setLevelMs(view?.levelMs ?? 0);
    setGlobalMs(view?.globalMs ?? 0);
  }, [view?.levelMs, view?.globalMs]);

  /* tick locally, and tell the server when the level clock runs out */
  useEffect(() => {
    const t = setInterval(() => {
      setLevelMs((v: number) => {
        if (v <= 250 && !busy) {
          setBusy(true);
          send({ answer: '' });          // an empty answer reads as a timeout
        }
        return Math.max(0, v - 250);
      });
      setGlobalMs((v: number) => Math.max(0, v - 250));
    }, 250);
    return () => clearInterval(t);
  }, [busy, send]);

  const act = (payload: Record<string, unknown>) => {
    if (busy) return;
    setBusy(true);
    send(payload);
  };

  const levelUrgent = levelMs < 10_000;
  const globalUrgent = penaltyFlash || globalMs < 60_000;

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col gap-4 overflow-hidden px-6 py-5">
      {hud}

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-2xl border border-[#d9e1ea] bg-white">
        <div className="flex shrink-0 items-center justify-between gap-5 border-b border-[#e5eaf0] px-7 py-5">
          <div>
            <p className="text-[20px] font-extrabold text-[#172033]">Humanity Verification</p>
            <p className="mt-0.5 text-xs text-[#738096]">A deliberately ridiculous CAPTCHA</p>
          </div>
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#edf5ff] text-2xl">✓</span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-7 py-6">
          <p className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[#657287]">
            Level {level + 1} · {levelName}
          </p>

          <div className="my-5 flex gap-1.5">
            {Array.from({ length: totalLevels }).map((_, i) => (
              <span
                key={i}
                className={
                  'h-1.5 flex-1 rounded-full ' +
                  (i < level ? 'bg-[#69b578]' : i === level ? 'bg-[#2f6fed]' : 'bg-[#e4e9ef]')
                }
              />
            ))}
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#e6ebf1] bg-[#f7f9fb] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-[#7b8798]">Level time</p>
              <p
                className={
                  'mt-0.5 text-[21px] font-extrabold transition-colors ' +
                  (levelUrgent ? 'text-[#a12525]' : 'text-[#172033]')
                }
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {fmt(levelMs)}
              </p>
            </div>
            <div className="rounded-xl border border-[#e6ebf1] bg-[#f7f9fb] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.08em] text-[#7b8798]">Global time</p>
              <p
                className={
                  'mt-0.5 text-[21px] font-extrabold transition-colors ' +
                  (globalUrgent ? 'text-[#a12525]' : 'text-[#172033]')
                }
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {fmt(globalMs)}
              </p>
            </div>
          </div>

          <p className="mb-3 text-[15px] text-[#667085]">
            Challenge {index + 1} of {perLevel} · {levelSeconds}s for this level. {hint}
          </p>

          {penaltyFlash && (
            <div className="mb-3 rounded-xl border border-[#ffd2d2] bg-[#fff1f1] px-4 py-3
                            text-[14px] font-semibold text-[#a12525]">
              Failed. 60 seconds taken from the global clock. Level restarted.
            </div>
          )}

          {captcha && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={captcha}
              alt="Verification challenge"
              draggable={false}
              className="w-full select-none rounded-xl border border-[#d6dee8]"
            />
          )}

          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) act({ answer: text }); }}
            disabled={busy}
            autoComplete="off"
            spellCheck={false}
            placeholder="Type exactly what you see"
            className="mt-4 w-full rounded-xl border border-[#d6dee8] px-4 py-3.5 font-mono
                       text-[16px] text-[#172033] outline-none transition-colors
                       focus:border-[#2f6fed] disabled:bg-[#f2f5f8]"
          />

          <button
            type="button"
            onClick={() => act({ answer: text })}
            disabled={busy || !text.trim()}
            className="mt-4 w-full rounded-xl bg-[#172033] py-3.5 text-[15px] font-extrabold
                       text-white transition-colors hover:bg-[#25314a]
                       disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? 'Verifying…' : 'Verify'}
          </button>

          {runs > 0 && (
            <p className="mt-4 text-center text-xs text-[#7a8698]">
              Attempt {runs + 1} at the full verification.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}