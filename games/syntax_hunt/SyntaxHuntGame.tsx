'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setLock, clearLock, lockLeft as readLock } from '@/lib/lockout';
import LockScreen from '@/components/LockScreen';
import {
  CLICK_LIMIT, CLICK_LOCK_MS, MAX_QUESTIONS, QUESTION_MS, TARGET_SCORE,
  TIMEOUT_PENALTY_MS, TIMEOUT_POINTS, drawBug, pointsFor, type CBug,
} from './logic';

interface Props {
  onWin?: () => void;
  onExit?: () => void;
  nextClue?: string;
}

const LOCK_MS = 2 * 60 * 1000;

type Phase = 'intro' | 'play' | 'review' | 'locked' | 'won';

export default function SyntaxHuntGame({ onWin, onExit, nextClue }: Props) {
  const router = useRouter();
  const leave = () => (onExit ? onExit() : router.push('/play'));

  const [phase, setPhase] = useState<Phase>('intro');
  const [attempt, setAttempt] = useState(1);
  const [score, setScore] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [bug, setBug] = useState<CBug | null>(null);
  const [wrong, setWrong] = useState<number[]>([]);
  const [tries, setTries] = useState(CLICK_LIMIT);
  const [panelLockUntil, setPanelLockUntil] = useState(0);
  const [panelLeft, setPanelLeft] = useState(0);
  const [penaltyUntil, setPenaltyUntil] = useState(0);
  const [penaltyLeft, setPenaltyLeft] = useState(0);
  const [awarded, setAwarded] = useState(0);
  const [expired, setExpired] = useState(false);
  const [failReason, setFailReason] = useState('');
  const [startedAt, setStartedAt] = useState(0);
  const [left, setLeft] = useState(QUESTION_MS);
  const seenRef = useRef<Set<string>>(new Set());
  const scoreRef = useRef(0);

  const failWith = useCallback((why: string) => {
    setLock(LOCK_MS);
    setFailReason(why);
    setPhase('locked');
  }, []);

  const nextQuestion = useCallback(
    (index: number) => {
      if (index >= MAX_QUESTIONS) {
        failWith(
          `You used all ${MAX_QUESTIONS} snippets and finished on ${scoreRef.current} points. ${TARGET_SCORE} are needed. The whole run resets.`,
        );
        return;
      }
      const next = drawBug(seenRef.current, index);
      if (!next) {
        failWith(`No snippets left, and you are on ${scoreRef.current} points. The whole run resets.`);
        return;
      }
      seenRef.current.add(next.id);
      setBug(next);
      setQIndex(index);
      setWrong([]);
      setTries(CLICK_LIMIT);
      setPanelLockUntil(0);
      setPanelLeft(0);
      setPenaltyUntil(0);
      setPenaltyLeft(0);
      setExpired(false);
      setAwarded(0);
      setStartedAt(Date.now());
      setLeft(QUESTION_MS);
      setPhase('play');
    },
    [failWith],
  );

  const beginRun = useCallback(() => {
    seenRef.current = new Set();
    scoreRef.current = 0;
    setScore(0);
    nextQuestion(0);
  }, [nextQuestion]);

  const unlock = useCallback(() => {
    setAttempt((a) => a + 1);
    beginRun();
  }, [beginRun]);

  useEffect(() => {
    if (readLock() > 0) {
      setFailReason('You are still locked out from a failed attempt.');
      setPhase('locked');
    }
  }, []);

  // question clock — expires but never replaces the snippet
  useEffect(() => {
    if (phase !== 'play') return;
    const t = setInterval(() => {
      const ms = QUESTION_MS - (Date.now() - startedAt);
      setLeft(ms);
      if (ms <= 0) setExpired(true);
    }, 100);
    return () => clearInterval(t);
  }, [phase, startedAt]);

  // panel lock after too many wrong clicks
  useEffect(() => {
    if (phase !== 'play' || !panelLockUntil) return;
    const t = setInterval(() => {
      const ms = panelLockUntil - Date.now();
      setPanelLeft(ms);
      if (ms <= 0) {
        setPanelLockUntil(0);
        setTries(CLICK_LIMIT);
      }
    }, 200);
    return () => clearInterval(t);
  }, [phase, panelLockUntil]);

  // penalty wait before the next snippet, after a timed-out solve
  useEffect(() => {
    if (phase !== 'review' || !penaltyUntil) return;
    const t = setInterval(() => {
      const ms = penaltyUntil - Date.now();
      setPenaltyLeft(ms);
      if (ms <= 0) {
        clearInterval(t);
        nextQuestion(qIndex + 1);
      }
    }, 200);
    return () => clearInterval(t);
  }, [phase, penaltyUntil, qIndex, nextQuestion]);

  const panelLocked = panelLockUntil > 0;

  function click(i: number) {
    if (phase !== 'play' || !bug || panelLocked) return;
    if (wrong.includes(i) || !bug.lines[i].trim()) return;

    if (i !== bug.badLine) {
      const remaining = tries - 1;
      setWrong((w) => [...w, i]);
      setTries(remaining);
      if (remaining <= 0) {
        setPanelLockUntil(Date.now() + CLICK_LOCK_MS);
        setPanelLeft(CLICK_LOCK_MS);
      }
      return;
    }

    const wasExpired = expired;
    const pts = pointsFor(Date.now() - startedAt);
    const total = scoreRef.current + pts;
    scoreRef.current = total;
    setScore(total);
    setAwarded(pts);

    if (total >= TARGET_SCORE) {
      clearLock();
      setPhase('won');
      onWin?.();
      return;
    }

    if (qIndex + 1 >= MAX_QUESTIONS) {
      failWith(
        `You used all ${MAX_QUESTIONS} snippets and finished on ${total} points. ${TARGET_SCORE} are needed. The whole run resets.`,
      );
      return;
    }

    if (wasExpired) {
      setPenaltyUntil(Date.now() + TIMEOUT_PENALTY_MS);
      setPenaltyLeft(TIMEOUT_PENALTY_MS);
    }
    setPhase('review');
  }

  const secs = Math.max(0, Math.ceil(left / 1000));
  const elapsed = (Date.now() - startedAt) / 1000;
  const band = expired
    ? TIMEOUT_POINTS
    : elapsed <= 15 ? 100 : elapsed <= 30 ? 80 : elapsed <= 45 ? 60 : 40;

  /* ---------- intro ---------- */
  if (phase === 'intro') {
    return (
      <Center>
        <h1 className="font-mono text-3xl font-bold tracking-widest text-green-300">THE COMPILER</h1>
        <p className="max-w-md font-mono text-sm leading-relaxed text-zinc-300">
          C snippets that will not compile. One line in each is at fault, and the snippet does
          not go away until you find it.
        </p>
        <div className="w-full max-w-xs rounded-xl border-2 border-green-500/40 bg-zinc-950 px-6 py-4">
          <p className="mb-2 font-mono text-[10px] tracking-[0.25em] text-green-400">SCORING</p>
          {[['0 – 15 s', '100'], ['16 – 30 s', '80'], ['31 – 45 s', '60'],
            ['46 – 60 s', '40'], ['after 60 s', '5']].map(([t, p]) => (
            <div key={t} className="flex justify-between font-mono text-sm text-zinc-200">
              <span>{t}</span>
              <span className={p === '5' ? 'text-zinc-500' : 'text-green-300'}>{p}</span>
            </div>
          ))}
        </div>
        <ol className="max-w-md space-y-2.5 text-left font-mono text-sm leading-relaxed text-zinc-300">
          <li><span className="text-green-400">01</span>&nbsp; Reach <b className="text-green-300">{TARGET_SCORE} points</b> within <b className="text-green-300">{MAX_QUESTIONS} snippets</b>.</li>
          <li><span className="text-green-400">02</span>&nbsp; <b className="text-red-400">{CLICK_LIMIT} wrong clicks and the panel locks for a minute.</b></li>
          <li><span className="text-green-400">03</span>&nbsp; The clock runs out at 60 seconds, but the snippet stays. It is then worth {TIMEOUT_POINTS}.</li>
          <li><span className="text-green-400">04</span>&nbsp; Solving a timed-out snippet costs a <b className="text-red-400">1 minute wait</b> before the next one.</li>
          <li><span className="text-green-400">05</span>&nbsp; Run out of snippets short of {TARGET_SCORE} and the run is lost.</li>
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
          THRESHOLD REACHED
        </h2>
        <div className="flex gap-8 font-mono text-sm text-zinc-400">
          <span>SCORE <b className="text-green-300">{score}</b></span>
          <span>SNIPPETS <b className="text-zinc-100">{qIndex + 1} / {MAX_QUESTIONS}</b></span>
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

  if (!bug) return null;
  const reviewing = phase === 'review';
  const urgent = secs <= 10 && !expired && !reviewing;
  const waiting = penaltyUntil > 0 && penaltyLeft > 0;
  const snippetsLeft = MAX_QUESTIONS - qIndex - 1;

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col gap-3 overflow-hidden px-6 py-6">
      {/* score + timer */}
      <div className="flex shrink-0 items-center justify-between pt-2 font-mono">
        <span className="text-base text-zinc-300">
          <b className="text-xl text-green-300">{score}</b>
          <span className="text-zinc-500"> / {TARGET_SCORE} pts</span>
          <span className="ml-4 text-sm text-zinc-500">
            SNIPPET {qIndex + 1} / {MAX_QUESTIONS}
          </span>
          {attempt > 1 && <span className="ml-4 text-sm text-zinc-500">ATTEMPT {attempt}</span>}
        </span>
        <span className="flex items-center gap-4 text-base">
          {!reviewing && (
            <span className="flex gap-1.5" aria-label={`${tries} clicks left`}>
              {Array.from({ length: CLICK_LIMIT }).map((_, i) => (
                <span
                  key={i}
                  className={
                    'h-2.5 w-2.5 rounded-full ' +
                    (i < tries ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.9)]' : 'bg-zinc-700')
                  }
                />
              ))}
            </span>
          )}
          {!reviewing && (
            <span className={expired ? 'text-sm text-zinc-500' : 'text-sm text-zinc-400'}>
              worth {band}
            </span>
          )}
          <span
            className={
              'tabular-nums ' +
              (reviewing ? 'text-zinc-600' : expired ? 'text-zinc-500' : urgent ? 'text-red-400' : 'text-green-300')
            }
          >
            {expired ? '00s' : `${String(secs).padStart(2, '0')}s`}
          </span>
        </span>
      </div>

      <div className="h-[2px] w-full shrink-0 rounded-full bg-zinc-800">
        <div
          className="h-[2px] rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] transition-all duration-300"
          style={{ width: `${Math.min(100, (score / TARGET_SCORE) * 100)}%` }}
        />
      </div>

      <div className="h-[3px] w-full shrink-0 rounded-full bg-zinc-800">
        <div
          className={
            'h-[3px] rounded-full transition-all duration-100 ' +
            (expired ? 'bg-zinc-700' : urgent ? 'bg-red-500' : 'bg-zinc-500')
          }
          style={{ width: `${Math.max(0, (left / QUESTION_MS) * 100)}%` }}
        />
      </div>

      <p className="shrink-0 font-mono text-sm text-zinc-400">
        {reviewing ? (
          <span className="text-green-300">
            Found it — {awarded} points.
            <span className="text-zinc-500">
              {' '}{snippetsLeft} snippet{snippetsLeft === 1 ? '' : 's'} left.
            </span>
          </span>
        ) : panelLocked ? (
          <span className="text-red-400">
            Panel locked. Clicks return in {Math.max(0, Math.ceil(panelLeft / 1000))}s.
          </span>
        ) : expired ? (
          <span className="text-zinc-500">
            Time is gone. The snippet stays and is now worth {TIMEOUT_POINTS} points — and solving
            it will cost a minute before the next one.
          </span>
        ) : (
          <>
            {bug.brief}
            <span className="text-zinc-600"> Click the faulty line.</span>
          </>
        )}
      </p>

      {/* the code */}
      <div
        className={
          'relative min-h-0 flex-1 overflow-y-auto rounded-2xl border-2 bg-zinc-950 p-2 transition-colors ' +
          (reviewing
            ? 'border-green-400 shadow-[0_0_28px_-8px_rgba(74,222,128,0.7)]'
            : panelLocked
              ? 'border-red-500/60'
              : 'border-zinc-700')
        }
      >
        {bug.lines.map((line, i) => {
          const blank = !line.trim();
          const isRight = reviewing && i === bug.badLine;
          const isWrong = wrong.includes(i);
          const dead = reviewing || blank || panelLocked;
          return (
            <button
              key={i}
              type="button"
              disabled={dead}
              onClick={() => click(i)}
              className={
                'flex w-full items-start gap-4 rounded-lg px-4 py-1.5 text-left font-mono text-[15px] leading-7 transition-colors ' +
                (isRight
                  ? 'bg-green-500/25 text-green-50 ring-1 ring-green-400'
                  : isWrong
                    ? 'text-zinc-600 line-through decoration-zinc-700'
                    : dead
                      ? 'text-zinc-400'
                      : 'text-zinc-200 hover:bg-green-500/15 hover:text-green-100')
              }
            >
              <span className="w-6 shrink-0 select-none text-right text-zinc-600">{i + 1}</span>
              <span className="whitespace-pre">{line || ' '}</span>
            </button>
          );
        })}

        {panelLocked && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="rounded-xl border-2 border-red-500/50 bg-zinc-950 px-8 py-5 text-center">
              <p className="font-mono text-[10px] tracking-[0.25em] text-red-400">PANEL LOCKED</p>
              <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-zinc-100">
                {Math.max(0, Math.ceil(panelLeft / 1000))}s
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0">
        {reviewing && (
          <>
            <div className="max-h-28 overflow-y-auto rounded-lg border border-green-500/60 bg-zinc-950 px-5 py-4 font-mono text-sm leading-relaxed text-green-50">
              {bug.reason}
            </div>
            <button
              type="button"
              onClick={() => !waiting && nextQuestion(qIndex + 1)}
              disabled={waiting}
              autoFocus={!waiting}
              className="mt-3 w-full rounded-lg border-2 bg-zinc-950 py-3.5 font-mono text-sm
                         font-bold tracking-[0.2em] transition-all
                         border-green-500/70 text-green-300 hover:border-green-400 hover:text-green-50
                         hover:shadow-[0_0_26px_-6px_rgba(34,197,94,0.85)]
                         disabled:cursor-not-allowed disabled:border-red-500/40 disabled:text-red-300
                         disabled:hover:border-red-500/40 disabled:hover:text-red-300 disabled:hover:shadow-none"
            >
              {waiting
                ? `TIME PENALTY · NEXT SNIPPET IN ${Math.max(0, Math.ceil(penaltyLeft / 1000))}s`
                : `NEXT SNIPPET · ${TARGET_SCORE - score} POINTS TO GO →`}
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