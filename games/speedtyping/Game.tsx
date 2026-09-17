'use client';
import { useEffect, useRef, useState } from 'react';
import type { GameProps } from '../registry';
import { LEVEL_COUNT, SENTENCES, TIME_LIMIT_MS, calcAccuracy, calcWpm } from './logic';

export default function SpeedTypingGame({ hud, view, send }: GameProps) {
  const cleared: number[] = view?.cleared ?? [];
  const total: number = view?.total ?? LEVEL_COUNT;
  const finished: boolean = !!view?.finished;

  const serverSentences: string[] = view?.sentences ?? SENTENCES;
  const currentLevel = Math.min(cleared.length, total - 1);
  const target: string = serverSentences[currentLevel] ?? SENTENCES[currentLevel] ?? '';

  // If already finished, let the CardPage "done" screen handle it, but show a local fallback
  if (finished) {
    return (
      <div className="mx-auto flex h-screen max-w-4xl flex-col gap-5 overflow-hidden px-6 py-6">
        {hud}
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-emerald-600/50 bg-emerald-950/20 p-10 text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-emerald-400">ALL LEVELS CLEARED</p>
          <h2 className="mt-3 text-3xl font-black text-emerald-100">Speed Demon</h2>
          <p className="mt-2 text-sm text-zinc-400">All four sentences typed in under 15 seconds each.</p>
        </div>
      </div>
    );
  }

  const [typed, setTyped] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_MS);
  const [failed, setFailed] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const levelSigRef = useRef<string>('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasFailedRef = useRef(false);

  // Reset when level changes
  useEffect(() => {
    const sig = `${currentLevel}-${cleared.join(',')}-${target}`;
    if (levelSigRef.current === sig) return;
    levelSigRef.current = sig;
    setTyped('');
    setTimeLeft(TIME_LIMIT_MS);
    setFailed(false);
    setSucceeded(false);
    setBusy(false);
    setStartedAt(null);
    setWpm(0);
    setAccuracy(100);
    hasFailedRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    // focus next frame
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [currentLevel, target, cleared]);

  // Start timer on first keystroke — more forgiving, but still 15s limit
  // If you want hard-mode from mount, move this to the reset effect above.
  const ensureTimer = () => {
    if (timerRef.current || hasFailedRef.current || succeeded || busy) return;
    setStartedAt(Date.now());
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          hasFailedRef.current = true;
          setFailed(true);
          return 0;
        }
        return prev - 100;
      });
    }, 100);
  };

  // Update live stats
  useEffect(() => {
    if (!startedAt) return;
    const elapsed = Date.now() - startedAt;
    setWpm(calcWpm(typed.length, elapsed));
    setAccuracy(calcAccuracy(target, typed));
  }, [typed, target, startedAt]);

  // If view updates externally (e.g., after send), clear timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const timeSec = (timeLeft / 1000).toFixed(1);
  const progress = Math.max(0, timeLeft / TIME_LIMIT_MS);
  const isUrgent = timeLeft < 5000;
  const isCritical = timeLeft < 3000;

  const retry = () => {
    setTyped('');
    setTimeLeft(TIME_LIMIT_MS);
    setFailed(false);
    setSucceeded(false);
    setBusy(false);
    setStartedAt(null);
    setWpm(0);
    setAccuracy(100);
    hasFailedRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Also allow server reset (like leveldevil death) — expose a reset call if needed
  const handleResetProgress = () => {
    setBusy(true);
    Promise.resolve(send({ reset: true }))
      .then(() => {})
      .catch(() => {})
      .finally(() => setBusy(false));
  };

  const onChange = (val: string) => {
    if (failed || succeeded || busy) return;
    // block overflow past target length + small buffer
    if (val.length > target.length + 10) return;
    if (!startedAt && val.length > 0) ensureTimer();
    else if (!startedAt && timerRef.current === null && val.length === 0) {
      // still not started
    }
    setTyped(val);

    // live stats will update via effect, but also check win
    if (val === target) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      setSucceeded(true);
      setBusy(true);
      // small celebration delay so player sees success
      setTimeout(() => {
        Promise.resolve(send({ level: currentLevel }))
          .catch(() => {})
          .finally(() => setBusy(false));
      }, 350);
    } else if (val.length > 0 && !startedAt) {
      // ensure timer if they typed via paste? still start
      ensureTimer();
    }
  };

  // Render target with highlights
  const renderTarget = () => {
    return (
      <p className="font-mono text-[17px] leading-8 tracking-wide break-words">
        {target.split('').map((ch, i) => {
          const typedChar = typed[i];
          const isTyped = i < typed.length;
          const isCorrect = isTyped && typedChar === ch;
          const isCurrent = i === typed.length;
          let cls = 'text-zinc-600';
          if (isTyped) cls = isCorrect ? 'text-emerald-300' : 'bg-red-500/20 text-red-300 rounded-sm';
          if (isCurrent) cls += ' ring-1 ring-cyan-400 bg-cyan-400/10 rounded-sm';
          // spaces need visible
          return (
            <span key={i} className={cls}>
              {ch === ' ' ? (isCurrent ? '·' : ' ') : ch}
            </span>
          );
        })}
      </p>
    );
  };

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col gap-4 overflow-hidden px-6 py-5">
      {hud}

      {/* Progress header — like quiz/syntax */}
      <div className="flex shrink-0 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs tracking-[0.18em] text-zinc-500">
            LEVEL {currentLevel + 1} OF {total}
          </span>
          <span className="flex items-center gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={
                  'h-2 w-6 rounded-full transition-all ' +
                  (cleared.includes(i)
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.8)]'
                    : i === currentLevel
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,146,60,.8)] animate-pulse'
                      : 'bg-zinc-800')
                }
              />
            ))}
          </span>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs">
          <span className={isCritical ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-zinc-400'}>
            ⏱ {timeSec}s
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">
            {wpm} <span className="text-zinc-600">WPM</span>
          </span>
          <span className={accuracy < 85 ? 'text-red-400' : accuracy < 95 ? 'text-amber-400' : 'text-emerald-400'}>
            {accuracy}% <span className="text-zinc-600">ACC</span>
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-1.5 w-full shrink-0 overflow-hidden rounded-full bg-zinc-900">
        <div
          className={
            'h-full transition-all duration-100 ' +
            (isCritical ? 'bg-red-500' : isUrgent ? 'bg-amber-500' : 'bg-emerald-500')
          }
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Main card — syntax-like */}
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-hidden rounded-xl border-2 border-emerald-900/70 bg-black/60 p-6 shadow-lg shadow-black/30">
        <div className="shrink-0">
          <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-500">
            TYPE EXACTLY — CASE & PUNCTUATION MATTER • 15 SECONDS
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {currentLevel === 0 && 'Warm up. Simple sentence.'}
            {currentLevel === 1 && 'Code snippet. Symbols matter.'}
            {currentLevel === 2 && 'Longer sentence. Stay accurate.'}
            {currentLevel === 3 && 'Final boss. Code + symbols. You got this.'}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          {renderTarget()}
          <p className="mt-3 font-mono text-[11px] tracking-wide text-zinc-600">
            {target.length} chars • {target.split(' ').length} words
          </p>
        </div>

        <div className="relative">
          <textarea
            ref={inputRef}
            value={typed}
            onChange={(e) => onChange(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            disabled={failed || succeeded || busy}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={failed ? 'Time is up — press Retry' : succeeded ? 'Perfect! Loading next...' : 'Start typing — timer begins on first keystroke...'}
            rows={3}
            className="w-full resize-none rounded-xl border-2 bg-zinc-900 px-4 py-3.5 font-mono text-[16px] leading-7 text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-emerald-500/60 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ borderColor: failed ? '#ef4444' : succeeded ? '#10b981' : undefined }}
          />
          <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-[10px] tracking-widest text-zinc-600">
            {typed.length} / {target.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={retry}
            disabled={busy && !failed}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-5 py-2.5 font-mono text-xs font-bold tracking-[0.14em] text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-40"
          >
            ↻ RETRY LEVEL
          </button>

          <button
            type="button"
            onClick={handleResetProgress}
            disabled={busy}
            className="rounded-lg border border-amber-900/50 bg-amber-950/20 px-4 py-2.5 font-mono text-xs tracking-[0.14em] text-amber-300 transition-colors hover:border-amber-700 hover:text-amber-200 disabled:opacity-40"
          >
            RESET PROGRESS
          </button>

          <div className="ml-auto flex items-center gap-2 font-mono text-xs">
            {failed && (
              <span className="rounded-full bg-red-500/10 px-3 py-1.5 text-red-400 ring-1 ring-red-500/30">
                ✕ TIME UP — TRY AGAIN
              </span>
            )}
            {succeeded && (
              <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-emerald-300 ring-1 ring-emerald-500/30">
                ✓ LEVEL CLEARED
              </span>
            )}
            {!failed && !succeeded && typed.length > 0 && (
              <span className={accuracy < 80 ? 'text-red-400' : 'text-zinc-500'}>
                {target.startsWith(typed) ? '✓ on track' : '✕ mismatch'}
              </span>
            )}
          </div>
        </div>

        <p className="shrink-0 text-center font-mono text-[11px] leading-relaxed tracking-wide text-zinc-600">
          Tip: 15s is tight — aim for ~55 WPM. Hard but not brutal. Punctuation must match exactly.
        </p>
      </div>
    </div>
  );
}
