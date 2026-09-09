'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setLock, clearLock, lockLeft as readLock } from '@/lib/lockout';
import LockScreen from '@/components/LockScreen';
import { BUGS } from './logic';

interface Props {
  onWin?: () => void;
  onExit?: () => void;
  nextClue?: string;
}

const TOTAL_MS = 12 * 60 * 1000;
const LOCK_MS = 2 * 60 * 1000;
const LIVES = 4;

type Phase = 'intro' | 'play' | 'locked' | 'won';

export default function LogicHuntGame({ onWin, onExit, nextClue }: Props) {
  const router = useRouter();
  const leave = () => (onExit ? onExit() : router.push('/play'));

  const [phase, setPhase] = useState<Phase>('intro');
  const [attempt, setAttempt] = useState(1);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [cleared, setCleared] = useState(false);
  const [lives, setLives] = useState(LIVES);
  const [failReason, setFailReason] = useState('');
  const [endsAt, setEndsAt] = useState(0);
  const [left, setLeft] = useState(TOTAL_MS);

  const bug = BUGS[step];
  const isLast = step + 1 >= BUGS.length;

  const beginRun = useCallback(() => {
    setStep(0);
    setPicked(null);
    setWrong([]);
    setCleared(false);
    setLives(LIVES);
    setEndsAt(Date.now() + TOTAL_MS);
    setLeft(TOTAL_MS);
    setPhase('play');
  }, []);

  const failRun = useCallback((why: string) => {
    setLock(LOCK_MS);
    setFailReason(why);
    setPhase('locked');
  }, []);

  const unlock = useCallback(() => {
    setAttempt((a) => a + 1);
    beginRun();
  }, [beginRun]);

  const advance = useCallback(() => {
    if (isLast) {
      clearLock();
      setPhase('won');
      onWin?.();
      return;
    }
    setStep((s) => s + 1);
    setPicked(null);
    setWrong([]);
    setCleared(false);
  }, [isLast, onWin]);

  useEffect(() => {
    if (readLock() > 0) {
      setFailReason('You are still locked out from a failed attempt.');
      setPhase('locked');
    }
  }, []);

  useEffect(() => {
    if (phase !== 'play') return;
    const t = setInterval(() => {
      const ms = endsAt - Date.now();
      setLeft(ms);
      if (ms <= 0) failRun('The clock ran out.');
    }, 250);
    return () => clearInterval(t);
  }, [phase, endsAt, failRun]);

  function click(i: number) {
    if (phase !== 'play' || cleared) return;
    if (wrong.includes(i)) return;
    if (!bug.lines[i].trim()) return;

    if (i === bug.badLine) {
      setPicked(i);
      setCleared(true);
      return;
    }
    const livesNow = lives - 1;
    setWrong((w) => [...w, i]);
    setLives(livesNow);
    if (livesNow <= 0) {
      failRun('Out of chances. The whole run resets, including the rounds you had already cleared.');
    }
  }

  const mmss = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  if (phase === 'intro') {
    return (
      <Center>
        <h1 className="font-mono text-3xl font-bold tracking-widest text-green-300">THE POLITE LIAR</h1>
        <p className="max-w-lg font-mono text-sm leading-relaxed text-zinc-300">
          Six Python programs. Every one of them runs without complaint. Every one of them
          returns the wrong answer.
        </p>
        <ol className="max-w-md space-y-3 text-left font-mono text-sm leading-relaxed text-zinc-300">
          <li><span className="text-green-400">01</span>&nbsp; Read the brief first. It says what the program is <b>supposed</b> to do.</li>
          <li><span className="text-green-400">02</span>&nbsp; Click the one line that disagrees with the brief.</li>
          <li><span className="text-green-400">03</span>&nbsp; The grammar is perfect. Python will not help you here.</li>
          <li><span className="text-green-400">04</span>&nbsp; <b className="text-red-400">{LIVES} wrong clicks for the whole run.</b></li>
          <li><span className="text-green-400">05</span>&nbsp; A failed run locks your terminal for 2 minutes.</li>
          <li><span className="text-green-400">06</span>&nbsp; 12 minutes for all six. The clock never pauses.</li>
        </ol>
        <Btn onClick={beginRun}>BEGIN</Btn>
      </Center>
    );
  }

  if (phase === 'locked') {
    return <LockScreen reason={failReason} attempt={attempt} onExpire={unlock} />;
  }

  if (phase === 'won') {
    return (
      <Center>
        <div className="text-5xl">🔑</div>
        <h2 className="font-mono text-2xl font-bold tracking-widest text-green-300">
          ALL SIX CAUGHT
        </h2>
        <div className="flex gap-8 font-mono text-sm text-zinc-400">
          <span>TIME LEFT <b className="text-zinc-100">{mmss(left)}</b></span>
          <span>LIVES LEFT <b className="text-zinc-100">{lives}</b></span>
          <span>ATTEMPTS <b className="text-zinc-100">{attempt}</b></span>
        </div>
        {nextClue && (
          <div className="max-w-md rounded-xl border border-green-500/50 bg-zinc-950 px-6 py-5 shadow-[0_0_24px_-8px_rgba(34,197,94,0.5)]">
            <p className="font-mono text-[10px] tracking-[0.25em] text-green-400">NEXT</p>
            <p className="mt-3 font-mono text-sm leading-relaxed text-green-50">{nextClue}</p>
          </div>
        )}
        <Btn onClick={leave}>BACK TO TASKS</Btn>
      </Center>
    );
  }

  const urgent = left < 60_000;

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col gap-3 overflow-hidden px-6 py-6">
      <div className="flex shrink-0 items-center justify-between pt-2 font-mono text-base">
        <span className="text-zinc-300">
          {bug.title}
          <span className="ml-3 text-sm text-zinc-500">{step + 1} / {BUGS.length}</span>
          {attempt > 1 && <span className="ml-4 text-sm text-zinc-500">ATTEMPT {attempt}</span>}
        </span>
        <span className="flex items-center gap-4">
          <span className="flex gap-1.5">
            {Array.from({ length: LIVES }).map((_, i) => (
              <span
                key={i}
                className={
                  'h-2.5 w-2.5 rounded-full ' +
                  (i < lives ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.9)]' : 'bg-zinc-700')
                }
              />
            ))}
          </span>
          <span className={urgent ? 'text-red-400' : 'text-green-300'}>{mmss(left)}</span>
        </span>
      </div>

      <div className="h-[2px] w-full shrink-0 rounded-full bg-zinc-800">
        <div
          className={
            'h-[2px] rounded-full transition-all duration-300 ' +
            (urgent ? 'bg-red-500' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]')
          }
          style={{ width: `${Math.max(0, (left / TOTAL_MS) * 100)}%` }}
        />
      </div>

      {/* the brief — this is the whole game */}
      <div className="shrink-0 rounded-xl border-2 border-green-500/40 bg-zinc-950 px-5 py-4">
        <p className="mb-2 font-mono text-[10px] tracking-[0.25em] text-green-400">THE BRIEF</p>
        {bug.spec.map((line, i) => (
          <p key={i} className="font-mono text-[15px] leading-7 text-zinc-100">{line}</p>
        ))}
      </div>

      {/* the program */}
      <div
        className={
          'min-h-0 flex-1 overflow-y-auto rounded-2xl border-2 bg-zinc-950 p-2 transition-colors ' +
          (cleared
            ? 'border-green-400 shadow-[0_0_28px_-8px_rgba(74,222,128,0.7)]'
            : 'border-zinc-700')
        }
      >
        {bug.lines.map((line, i) => {
          const blank = !line.trim();
          const isRight = cleared && i === picked;
          const isWrong = wrong.includes(i);
          return (
            <button
              key={i}
              type="button"
              disabled={cleared || blank}
              onClick={() => click(i)}
              className={
                'flex w-full items-start gap-4 rounded-lg px-4 py-1.5 text-left font-mono text-[15px] leading-7 transition-colors ' +
                (isRight
                  ? 'bg-green-500/25 text-green-50 ring-1 ring-green-400'
                  : isWrong
                    ? 'text-zinc-600 line-through decoration-zinc-700'
                    : blank || cleared
                      ? 'text-zinc-400'
                      : 'text-zinc-200 hover:bg-green-500/15 hover:text-green-100')
              }
            >
              <span className="w-6 shrink-0 select-none text-right text-zinc-600">{i + 1}</span>
              <span className="whitespace-pre">{line || ' '}</span>
            </button>
          );
        })}
      </div>

      <div className="shrink-0">
        {cleared && (
          <>
            <div className="max-h-32 overflow-y-auto rounded-lg border border-green-500/60 bg-zinc-950 px-5 py-4 font-mono text-sm leading-relaxed text-green-50">
              {bug.reason}
            </div>
            <button
              type="button"
              onClick={advance}
              autoFocus
              className="mt-3 w-full rounded-lg border-2 border-green-500/70 bg-zinc-950 py-3.5
                         font-mono text-sm font-bold tracking-[0.2em] text-green-300 transition-all
                         hover:border-green-400 hover:text-green-50
                         hover:shadow-[0_0_26px_-6px_rgba(34,197,94,0.85)]"
            >
              {isLast ? 'FINISH' : `NEXT  ${step + 2} / ${BUGS.length}  →`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 overflow-y-auto px-4 py-6 text-center">
      {children}
    </div>
  );
}

function Btn({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border-2 border-green-500/70 bg-zinc-950 px-8 py-3.5 font-mono text-sm
                 font-bold tracking-[0.2em] text-green-300 transition-all hover:border-green-400
                 hover:text-green-50 hover:shadow-[0_0_26px_-6px_rgba(34,197,94,0.85)]"
    >
      {children}
    </button>
  );
}