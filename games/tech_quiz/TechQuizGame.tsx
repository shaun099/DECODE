"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { setLock, clearLock } from "@/lib/lockout";
import LockScreen from "@/components/LockScreen";
import { PASS_THRESHOLD, QUESTIONS_PER_ROUND, drawRound } from "./logic";
import type { QuizQuestion } from "./questions";

interface TechQuizGameProps {
  onWin?: () => void;
  onExit?: () => void;
  nextClue?: string;
}

const LOCK_MS = 2 * 60 * 1000;

type Phase = "playing" | "won" | "locked";

export default function TechQuizGame({ onWin, onExit, nextClue }: TechQuizGameProps) {
  const router = useRouter();
  const leave = () => (onExit ? onExit() : router.push("/play"));

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("playing");
  const [attempt, setAttempt] = useState(1);
  const [failReason, setFailReason] = useState("");
  const wonRef = useRef(false);
  const seenRef = useRef<Set<number>>(new Set());

  const startRound = useCallback(() => {
    const round = drawRound(seenRef.current);
    seenRef.current = round.seen;
    setQuestions(round.questions);
    setCurrent(0);
    setScore(0);
    setPicked(null);
    setPhase("playing");
  }, []);

  // Draw the first round after mount — Math.random() must not run on the server.
  useEffect(() => {
    startRound();
  }, [startRound]);

  const unlock = useCallback(() => {
    setAttempt((a) => a + 1);
    startRound();
  }, [startRound]);

  const answered = picked !== null;

  const pick = useCallback(
    (index: number) => {
      if (answered || phase !== "playing") return;
      setPicked(index);

      const question = questions[current];
      const isCorrect = index === question.answer;
      const nextScore = isCorrect ? score + 1 : score;
      if (isCorrect) setScore(nextScore);

      window.setTimeout(() => {
        if (nextScore >= PASS_THRESHOLD) {
          if (!wonRef.current) {
            wonRef.current = true;
            clearLock();
            setPhase("won");
            onWin?.();
          }
        } else if (current === QUESTIONS_PER_ROUND - 1) {
          setLock(LOCK_MS);
          setFailReason(
            `You scored ${nextScore} of ${QUESTIONS_PER_ROUND}. ${PASS_THRESHOLD} are needed to pass.`,
          );
          setPhase("locked");
        } else {
          setCurrent((c) => c + 1);
          setPicked(null);
        }
      }, 700);
    },
    [answered, phase, questions, current, score, onWin],
  );

  /* ---------- locked ---------- */
  if (phase === "locked") {
    return <LockScreen reason={failReason} attempt={attempt} onExpire={unlock} />;
  }

  /* ---------- won ---------- */
  if (phase === "won") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 overflow-y-auto px-4 py-6 text-center">
        <div className="text-5xl">🔑</div>
        <h2 className="font-mono text-2xl font-bold tracking-widest text-green-300">
          QUIZ CLEARED
        </h2>
        <div className="flex gap-8 font-mono text-xs text-zinc-400">
          <span>
            SCORE <b className="text-zinc-100">{score}/{QUESTIONS_PER_ROUND}</b>
          </span>
          <span>
            ATTEMPTS <b className="text-zinc-100">{attempt}</b>
          </span>
        </div>
        {nextClue && (
          <div className="max-w-md rounded-xl border border-green-600/50 bg-green-500/5 px-6 py-5">
            <p className="font-mono text-[10px] tracking-[0.25em] text-green-400">NEXT</p>
            <p className="mt-3 font-mono text-sm leading-relaxed text-green-50">{nextClue}</p>
          </div>
        )}
        <button
          type="button"
          onClick={leave}
          className="rounded-lg border border-green-500/70 bg-green-500/10 px-8 py-3
                     font-mono text-xs font-bold tracking-[0.2em] text-green-300
                     transition-colors hover:bg-green-500 hover:text-black"
        >
          BACK TO TASKS
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center font-mono text-sm text-zinc-500">
        Drawing questions…
      </div>
    );
  }

  const question = questions[current];
  const progressPct = ((current + (answered ? 1 : 0)) / QUESTIONS_PER_ROUND) * 100;
  const shortfall = PASS_THRESHOLD - score;
  const left = QUESTIONS_PER_ROUND - current - (answered ? 1 : 0);
  const doomed = shortfall > left;

  /* ---------- playing ---------- */
  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col gap-4 overflow-hidden px-6 py-6">
      {/* status */}
      <div className="flex shrink-0 items-center justify-between pt-3 font-mono text-base">
        <span className="text-zinc-300">
          {String(current + 1).padStart(2, "0")} / {String(QUESTIONS_PER_ROUND).padStart(2, "0")}
          {attempt > 1 && (
            <span className="ml-4 text-sm text-zinc-500">ATTEMPT {attempt}</span>
          )}
        </span>
        <span className={doomed ? "text-red-400" : "text-green-300"}>
          <b className="text-xl">{score}</b> correct
          <span className="text-zinc-500"> / need {PASS_THRESHOLD}</span>
        </span>
      </div>

      <div className="h-[2px] w-full shrink-0 rounded-full bg-zinc-800">
        <div
          className={
            "h-[2px] rounded-full transition-all duration-300 " +
            (doomed ? "bg-red-500" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]")
          }
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* everything centred in the space that is left */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-y-auto py-2">
        {/* question */}
        <div className="w-full shrink-0 rounded-2xl border border-green-500/50 bg-zinc-950 px-8 py-8 shadow-[0_0_24px_-8px_rgba(34,197,94,0.5)]">
          <p className="text-center font-mono text-xl leading-relaxed text-zinc-50">
            {question.question}
          </p>
        </div>

        {/* options */}
        <div className="flex w-full flex-col gap-3">
          {question.options.map((option, index) => {
            const isPicked = answered && index === picked;
            const isRight = isPicked && index === question.answer;
            const isWrong = isPicked && index !== question.answer;
            const dimmed = answered && !isPicked;

            return (
              <button
                key={index}
                type="button"
                disabled={answered}
                onClick={() => pick(index)}
                className={
                  "flex items-center gap-4 rounded-xl border-2 bg-zinc-950 px-6 py-5 text-left " +
                  "font-mono text-base leading-relaxed transition-all duration-200 " +
                  (isRight
                    ? "border-green-400 bg-green-500/20 text-green-50 shadow-[0_0_28px_-6px_rgba(74,222,128,0.8)]"
                    : isWrong
                      ? "border-red-500 bg-red-500/15 text-red-200 shadow-[0_0_28px_-6px_rgba(248,113,113,0.7)]"
                      : dimmed
                        ? "border-zinc-800 text-zinc-600"
                        : "cursor-pointer border-zinc-700 text-zinc-200 " +
                          "hover:border-green-400 hover:text-green-50 " +
                          "hover:shadow-[0_0_26px_-6px_rgba(34,197,94,0.85)]")
                }
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-current font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="h-5 shrink-0 text-center font-mono text-xs text-zinc-600">
        {left} {left === 1 ? "question" : "questions"} left · no repeats until the pool runs out
      </p>
    </div>
  );
}