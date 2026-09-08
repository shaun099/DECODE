'use client';

import { claim, release } from '@/lib/session-lock'
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setLock, clearLock, lockLeft as readLock } from '@/lib/lockout';
import LockScreen from '@/components/LockScreen';
import { EMAILS, parse, type Email } from './logic';

interface Props {
  onWin?: () => void;
  onExit?: () => void;
  nextClue?: string;
}

const TOTAL_MS = 10 * 60 * 1000;
const LOCK_MS = 2 * 60 * 1000;
const LIVES = 4;

type Phase = 'intro' | 'play' | 'locked' | 'won';

export default function PhishingGame({ onWin, onExit, nextClue }: Props) {
  const router = useRouter();
  const leave = () => (onExit ? onExit() : router.push('/play'));

  const [phase, setPhase] = useState<Phase>('intro');
  const [attempt, setAttempt] = useState(1);
  const [step, setStep] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [cleared, setCleared] = useState(false);
  const [lives, setLives] = useState(LIVES);
  const [note, setNote] = useState<{ text: string; ok: boolean } | null>(null);
  const [failReason, setFailReason] = useState('');
  const [endsAt, setEndsAt] = useState(0);
  const [left, setLeft] = useState(TOTAL_MS);

  const email: Email | undefined = EMAILS[step];
  const isLast = step + 1 >= EMAILS.length;
  const remaining = useMemo(
    () => (email ? email.suspects.filter((s) => !found.includes(s)).length : 0),
    [email, found],
  );

  const beginRun = useCallback(() => {
    claim('phishing');
    setStep(0);
    setFound([]);
    setWrong([]);
    setCleared(false);
    setLives(LIVES);
    setNote(null);
    setEndsAt(Date.now() + TOTAL_MS);
    setLeft(TOTAL_MS);
    setPhase('play');
  }, []);

  const failRun = useCallback((why: string) => {
    setLock(LOCK_MS);              // locks the whole terminal, not just this game
    setFailReason(why);
    setPhase('locked');
  }, []);

  const unlock = useCallback(() => {
    release();
    clearLock();
    setPhase('play');
  }, [beginRun]);

  /** Move on when the player presses NEXT. */
  const advance = useCallback(() => {
    if (isLast) {
      release();
      clearLock();
      setPhase('won');
      onWin?.();
      return;
    }
    setStep((s) => s + 1);
    setFound([]);
    setWrong([]);
    setCleared(false);
    setNote(null);
  }, [isLast, onWin]);

  // Restore an active lockout on mount. Runs after render, never during it,
  // because localStorage does not exist on the server.
  useEffect(() => {
    if (readLock() > 0) {
      setFailReason('You are still locked out from a failed attempt.');
      setPhase('locked');
    }
  }, []);

  // main clock — keeps running while they read, so NEXT is not a free pause
  useEffect(() => {
    if (phase !== 'play') return;
    const t = setInterval(() => {
      const ms = endsAt - Date.now();
      setLeft(ms);
      if (ms <= 0) failRun('The clock ran out.');
    }, 250);
    return () => clearInterval(t);
  }, [phase, endsAt, failRun]);

  function click(id: string) {
    if (phase !== 'play' || !email || cleared) return;
    if (found.includes(id) || wrong.includes(id)) return;

    const why = email.reason[id] ?? '';

    if (email.suspects.includes(id)) {
      const next = [...found, id];
      setFound(next);
      setNote({ text: why, ok: true });
      if (email.suspects.every((s) => next.includes(s))) setCleared(true);
      return;
    }

    const livesNow = lives - 1;
    setWrong((w) => [...w, id]);
    setLives(livesNow);
    if (livesNow <= 0) {
      failRun('Out of chances. Everything resets — including the emails you had already cleared.');
    } else {
      setNote({ text: why, ok: false });
    }
  }

  const mmss = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  function seg(line: string) {
    return parse(line).map((s, i) => {
      if (!s.id) return <span key={i}>{s.text}</span>;
      const hit = found.includes(s.id);
      const miss = wrong.includes(s.id);
      return (
        <button
          key={i}
          type="button"
          disabled={cleared}
          onClick={() => click(s.id!)}
          className={
            'rounded-sm px-1 transition-colors ' +
            (hit
              ? 'bg-green-500/30 text-green-100 ring-1 ring-green-400'
              : miss
                ? 'text-zinc-500 line-through decoration-zinc-600'
                : cleared
                  ? 'text-zinc-400'
                  : 'text-zinc-100 underline decoration-zinc-700 decoration-dotted underline-offset-4 hover:bg-green-500/20 hover:decoration-green-400')
          }
        >
          {s.text}
        </button>
      );
    });
  }

  /* ---------- intro ---------- */
  if (phase === 'intro') {
    return (
      <Center>
        <h1 className="font-mono text-3xl font-bold tracking-widest text-green-300">PHISHING HUNT</h1>
        <ol className="max-w-md space-y-3 text-left font-mono text-sm leading-relaxed text-zinc-300">
          <li><span className="text-green-400">01</span>&nbsp; {EMAILS.length} emails, one at a time.</li>
          <li><span className="text-green-400">02</span>&nbsp; Each hides one or two details that give it away.</li>
          <li><span className="text-green-400">03</span>&nbsp; Click the detail that is wrong. Underlined text is clickable.</li>
          <li><span className="text-green-400">04</span>&nbsp; <b className="text-red-400">{LIVES} wrong clicks for the whole game.</b> Spend them and everything resets.</li>
          <li><span className="text-green-400">05</span>&nbsp; A failed run locks your terminal for 2 minutes. No other task can be opened.</li>
          <li><span className="text-green-400">06</span>&nbsp; 10 minutes for all {EMAILS.length}. The clock never pauses.</li>
        </ol>
        <Btn onClick={beginRun}>BEGIN</Btn>
      </Center>
    );
  }

  /* ---------- locked out ---------- */
  if (phase === 'locked') {
    return <LockScreen reason={failReason} attempt={attempt} onExpire={unlock} />;
  }

  /* ---------- won ---------- */
  if (phase === 'won') {
    return (
      <Center>
        <div className="text-5xl">🔑</div>
        <h2 className="font-mono text-2xl font-bold tracking-widest text-green-300">
          ALL {EMAILS.length} IDENTIFIED
        </h2>
        <div className="flex gap-8 font-mono text-xs text-zinc-400">
          <span>TIME LEFT <b className="text-zinc-100">{mmss(left)}</b></span>
          <span>LIVES LEFT <b className="text-zinc-100">{lives}</b></span>
          <span>ATTEMPTS <b className="text-zinc-100">{attempt}</b></span>
        </div>
        {nextClue && (
          <div className="max-w-md rounded-xl border border-green-600/50 bg-green-500/5 px-6 py-5">
            <p className="font-mono text-[10px] tracking-[0.25em] text-green-400">NEXT</p>
            <p className="mt-3 font-mono text-sm leading-relaxed text-green-50">{nextClue}</p>
          </div>
        )}
        <Btn onClick={leave}>BACK TO TASKS</Btn>
      </Center>
    );
  }

  if (!email) return null;
  const urgent = left < 60_000;

  /* ---------- play ---------- */
  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col gap-3 overflow-hidden px-4 py-4">
      <div className="flex shrink-0 items-center justify-between font-mono text-xs">
        <span className="text-zinc-400">
          {String(step + 1).padStart(2, '0')} / {String(EMAILS.length).padStart(2, '0')}
          {attempt > 1 && <span className="ml-3 text-zinc-600">ATTEMPT {attempt}</span>}
        </span>
        <span className="flex items-center gap-4">
          <span className="flex gap-1" aria-label={`${lives} chances left`}>
            {Array.from({ length: LIVES }).map((_, i) => (
              <span
                key={i}
                className={'h-2 w-2 rounded-full ' + (i < lives ? 'bg-green-400' : 'bg-zinc-700')}
              />
            ))}
          </span>
          <span className={urgent ? 'text-red-400' : 'text-green-400'}>{mmss(left)}</span>
        </span>
      </div>

      <div className="h-px w-full shrink-0 bg-zinc-800">
        <div
          className={'h-px transition-all duration-300 ' + (urgent ? 'bg-red-500' : 'bg-green-500')}
          style={{ width: `${Math.max(0, (left / TOTAL_MS) * 100)}%` }}
        />
      </div>

      <p className="shrink-0 font-mono text-xs text-zinc-400">
        {cleared ? (
          <span className="text-green-400">Message cleared. Read the finding, then continue.</span>
        ) : (
          <>
            Click what is wrong.
            <span className="text-zinc-600"> {remaining} left in this message.</span>
          </>
        )}
      </p>

      {/* the email — the only thing that scrolls */}
      <div
        className={
          'flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-[#0b0b0b] transition-colors ' +
          (cleared ? 'border-green-600/50' : 'border-zinc-700')
        }
      >
        <div className="shrink-0 border-b border-zinc-700 bg-zinc-900 px-5 py-3 font-mono text-xs font-bold tracking-[0.2em] text-zinc-200">
          {email.brand}
        </div>
        <div
          className="min-h-0 flex-1 overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#3f3f46 transparent' }}
        >
          <div className="space-y-1.5 border-b border-zinc-800 px-5 py-4 font-mono text-[11px]">
            <Row label="From">{seg(email.from)}</Row>
            {email.replyTo && <Row label="Reply-To">{seg(email.replyTo)}</Row>}
            <Row label="To">{seg(email.to)}</Row>
            <Row label="Subject">{seg(email.subject)}</Row>
            <Row label="Date">{seg(email.date)}</Row>
          </div>
          <div className="space-y-2.5 px-5 py-4 font-mono text-[13px] leading-6 text-zinc-200">
            {email.body.map((line, i) => (
              <p key={i}>{seg(line)}</p>
            ))}
          </div>
        </div>
      </div>

      {/* verdict + continue */}
      <div className={'shrink-0 ' + (cleared ? '' : 'h-[74px]')}>
        {note && (
          <div
            className={
              'overflow-y-auto rounded-lg border px-4 py-3 font-mono text-[11px] leading-relaxed ' +
              (cleared ? 'max-h-32' : 'h-full ') +
              (note.ok
                ? ' border-green-600/60 bg-green-500/10 text-green-100'
                : ' border-zinc-600 bg-zinc-900 text-zinc-300')
            }
          >
            <span className={'font-bold ' + (note.ok ? 'text-green-400' : 'text-zinc-400')}>
              {note.ok ? 'CAUGHT — ' : 'LEGITIMATE — '}
            </span>
            {note.text}
          </div>
        )}

        {cleared && (
          <button
            type="button"
            onClick={advance}
            autoFocus
            className="mt-3 w-full rounded-lg border border-green-500/70 bg-green-500/10 py-3
                       font-mono text-xs font-bold tracking-[0.2em] text-green-300
                       transition-colors hover:bg-green-500 hover:text-black"
          >
            {isLast ? 'FINISH' : `NEXT EMAIL  ${step + 2} / ${EMAILS.length}  →`}
          </button>
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

function Btn({
  onClick,
  disabled,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="shrink-0 rounded-lg border border-green-500/70 bg-green-500/10 px-8 py-3
                 font-mono text-xs font-bold tracking-[0.2em] text-green-300
                 transition-colors hover:bg-green-500 hover:text-black
                 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-transparent
                 disabled:text-zinc-600 disabled:hover:bg-transparent disabled:hover:text-zinc-600"
    >
      {children}
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="w-[74px] shrink-0 text-zinc-500">{label}</span>
      <span className="text-zinc-200">{children}</span>
    </div>
  );
}