'use client';

import { useState, useEffect, useRef } from 'react';
import type { GameProps } from '../registry';

interface ResultState {
  correct: boolean;
  correctAnswer: number | null;
  picked: number;
}

export default function QuizGame({ hud, view, send }: GameProps) {
  const options: string[] = view?.options ?? [];
  const score = view?.score ?? 0;
  const need = view?.need ?? 7;
  const total = view?.total ?? 10;
  const index = view?.index ?? 0;
  const question = view?.question ?? '';

  // Local interaction state
  const [picked, setPicked] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [nextTimer, setNextTimer] = useState<NodeJS.Timeout | null>(null);

  // Track question change to reset state cleanly
  const currentQRef = useRef<string>(question);

  useEffect(() => {
    if (question && question !== currentQRef.current) {
      currentQRef.current = question;
      setPicked(null);
      setIsSubmitting(false);
      setResult(null);
      if (nextTimer) {
        clearTimeout(nextTimer);
        setNextTimer(null);
      }
    }
  }, [question, nextTimer]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (nextTimer) clearTimeout(nextTimer);
    };
  }, [nextTimer]);

  const handleChoose = async (optionIndex: number) => {
    if (picked !== null || isSubmitting || result !== null) return;

    setPicked(optionIndex);
    setIsSubmitting(true);

    try {
      const res: any = await send({ pick: optionIndex });

      if (!res) {
        setIsSubmitting(false);
        return;
      }

      const isCorrect = !!res.correct;
      const rightAnswerIndex =
        typeof res.lastAnswer === 'number' ? res.lastAnswer : isCorrect ? optionIndex : null;

      setResult({
        correct: isCorrect,
        correctAnswer: rightAnswerIndex,
        picked: optionIndex,
      });
      setIsSubmitting(false);

      // If finished or locked, CardPage handles the transition immediately
      if (res.done || res.locked) {
        return;
      }

      // Auto-advance after 1.4s so player has smooth time to review
      const timer = setTimeout(() => {
        setPicked(null);
        setResult(null);
      }, 1400);
      setNextTimer(timer);
    } catch {
      setIsSubmitting(false);
      setPicked(null);
    }
  };

  const handleAdvanceNow = () => {
    if (nextTimer) {
      clearTimeout(nextTimer);
      setNextTimer(null);
    }
    setPicked(null);
    setResult(null);
  };

  const remainingNeeded = Math.max(0, need - score);
  const questionsLeft = total - index;
  const isOutOfReach = remainingNeeded > questionsLeft;

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col justify-between overflow-hidden px-6 py-6 sm:px-8">
      {/* Top HUD */}
      {hud}

      {/* Progress & Score Bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-4">
          <p className="font-mono text-sm text-zinc-400">
            <span
              className={`text-2xl font-black ${
                isOutOfReach ? 'text-amber-400' : 'text-emerald-300'
              }`}
            >
              {score}
            </span>
            <span className="ml-2">/ {need} correct needed to pass</span>
          </p>

          {isOutOfReach && (
            <span className="rounded bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] text-amber-400 border border-amber-500/30">
              Pass unreachable in this round
            </span>
          )}
        </div>

        {/* 7 Progress Dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: need }).map((_, i) => (
            <span
              key={i}
              className={`h-2.5 w-6 rounded-full transition-all duration-300 ${
                i < score
                  ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                  : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question Card & Options Container */}
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-5 py-4 overflow-y-auto">
        {/* Question Box with subtle glow */}
        <div className="shrink-0 rounded-xl border-2 border-emerald-600/50 bg-emerald-950/20 px-8 py-7 shadow-lg shadow-emerald-950/20 backdrop-blur-sm transition-all">
          <div className="mb-2 flex items-center justify-between font-mono text-xs text-emerald-400">
            <span>QUESTION {index + 1} OF {total}</span>
            <span>PASS THRESHOLD: 70%</span>
          </div>
          <p className="text-center text-xl font-bold leading-relaxed text-zinc-100 sm:text-2xl">
            {question}
          </p>
        </div>

        {/* 4 Interactive Options */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((option, i) => {
            const isSelected = picked === i;
            const isCorrectAnswer = result?.correctAnswer === i;
            const isWrongPick = result && !result.correct && isSelected;
            const isRightPick = result && result.correct && isSelected;

            let cardStyle =
              'border-zinc-800 bg-zinc-900/60 text-zinc-200 hover:border-emerald-500/70 hover:bg-emerald-500/10 hover:text-emerald-100';
            let badgeStyle = 'border-zinc-700 bg-zinc-800 text-zinc-400';

            if (isSubmitting && isSelected) {
              cardStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-200 animate-pulse';
              badgeStyle = 'border-emerald-500 bg-emerald-500 text-black';
            } else if (isRightPick) {
              cardStyle =
                'border-emerald-400 bg-emerald-500/25 text-emerald-100 shadow-[0_0_16px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400';
              badgeStyle = 'border-emerald-400 bg-emerald-400 text-black font-black';
            } else if (isWrongPick) {
              cardStyle =
                'border-red-500 bg-red-500/20 text-red-100 shadow-[0_0_16px_rgba(239,68,68,0.3)] ring-1 ring-red-500';
              badgeStyle = 'border-red-500 bg-red-500 text-white font-black';
            } else if (result && isCorrectAnswer) {
              // Highlight the real answer if player was wrong
              cardStyle =
                'border-emerald-500/80 bg-emerald-500/15 text-emerald-200 border-dashed ring-1 ring-emerald-500/50';
              badgeStyle = 'border-emerald-400 bg-emerald-500/40 text-emerald-200';
            } else if (result && !isSelected) {
              cardStyle = 'border-zinc-900 bg-zinc-950/40 text-zinc-600 opacity-60';
            }

            const letter = String.fromCharCode(65 + i);

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleChoose(i)}
                disabled={picked !== null || isSubmitting}
                className={`flex items-center gap-4 rounded-xl border-2 px-5 py-4 text-left text-base leading-snug transition-all duration-200 ${
                  picked !== null ? 'cursor-default' : 'cursor-pointer'
                } ${cardStyle}`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 font-mono text-sm font-bold transition-all ${badgeStyle}`}
                >
                  {isRightPick ? (
                    '✓'
                  ) : isWrongPick ? (
                    '✕'
                  ) : result && isCorrectAnswer ? (
                    '✓'
                  ) : (
                    letter
                  )}
                </span>
                <span className="flex-1 font-medium">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fixed Footer Bar */}
      <div className="h-14 shrink-0">
        {isSubmitting ? (
          <div className="flex h-full items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60">
            <span className="h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400" />
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-zinc-300">
              CHECKING ANSWER...
            </span>
          </div>
        ) : result ? (
          <button
            type="button"
            autoFocus
            onClick={handleAdvanceNow}
            className={`flex h-full w-full items-center justify-between rounded-xl border-2 px-6 font-mono text-xs font-bold uppercase tracking-[0.2em] transition-all ${
              result.correct
                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500 hover:text-black'
                : 'border-red-500/80 bg-red-500/15 text-red-200 hover:bg-red-500 hover:text-white'
            }`}
          >
            <span>
              {result.correct ? '✓ CORRECT ANSWER (+1)' : '✕ INCORRECT ATTEMPT'}
            </span>
            <span className="flex items-center gap-1.5 text-[11px] lowercase tracking-normal text-zinc-300">
              click to advance <span className="text-sm font-bold">→</span>
            </span>
          </button>
        ) : (
          <div className="flex h-full items-center justify-between px-2 font-mono text-[11px] text-zinc-500">
            <span>Select one option to submit. No second guesses.</span>
            <span>4 mistakes allowed per round</span>
          </div>
        )}
      </div>
    </div>
  );
}