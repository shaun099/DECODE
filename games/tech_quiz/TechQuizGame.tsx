"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PASS_THRESHOLD, QUESTIONS_PER_ROUND, drawRound } from "./logic";
import type { QuizQuestion } from "./questions";

interface TechQuizGameProps {
  /** Called once when the player passes. The story framework can hook in here. */
  onWin?: () => void;
}

type Phase = "playing" | "won" | "lost";

// Vibrant color cycle for option buttons — one per option index.
const OPTION_STYLES = [
  "border-violet-500/60 hover:border-violet-400 hover:bg-violet-500/20 text-violet-200",
  "border-fuchsia-500/60 hover:border-fuchsia-400 hover:bg-fuchsia-500/20 text-fuchsia-200",
  "border-cyan-500/60 hover:border-cyan-400 hover:bg-cyan-500/20 text-cyan-200",
  "border-lime-500/60 hover:border-lime-400 hover:bg-lime-500/20 text-lime-200",
];

const OPTION_CORRECT = "border-lime-400 bg-lime-500/30 text-lime-100";
const OPTION_WRONG = "border-red-400 bg-red-500/30 text-red-100";

export default function TechQuizGame({ onWin }: TechQuizGameProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("playing");
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

  const answered = picked !== null;

  const pick = useCallback(
    (index: number) => {
      if (answered || phase !== "playing") return;
      setPicked(index);

      const question = questions[current];
      const isCorrect = index === question.answer;
      const nextScore = isCorrect ? score + 1 : score;

      if (isCorrect) setScore(nextScore);

      // Pass as soon as the player reaches PASS_THRESHOLD correct answers; if
      // they run out of questions first without hitting it, they fail.
      window.setTimeout(() => {
        if (nextScore >= PASS_THRESHOLD) {
          if (!wonRef.current) {
            wonRef.current = true;
            setPhase("won");
            onWin?.();
          }
        } else if (current === QUESTIONS_PER_ROUND - 1) {
          setPhase("lost");
        } else {
          setCurrent((c) => c + 1);
          setPicked(null);
        }
      }, 700);
    },
    [answered, phase, questions, current, score, onWin],
  );

  const retry = useCallback(() => {
    startRound();
  }, [startRound]);

  if (questions.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-zinc-500">
        Loading questions…
      </div>
    );
  }

  if (phase === "won" || phase === "lost") {
    const passed = phase === "won";
    return (
      <div className="flex flex-col items-center gap-6 px-4 py-16 text-center">
        <div
          className={`flex flex-col items-center gap-5 rounded-3xl border-2 px-10 py-12 ${
            passed
              ? "border-lime-400/60 bg-lime-500/10 shadow-[0_0_60px_rgba(163,230,53,0.2)]"
              : "border-red-400/60 bg-red-500/10 shadow-[0_0_60px_rgba(248,113,113,0.2)]"
          }`}
        >
          <div className="text-6xl">{passed ? "🎉" : "💀"}</div>
          <h2
            className={`text-3xl font-bold ${
              passed ? "text-lime-300" : "text-red-300"
            }`}
          >
            {passed ? "Quiz Cleared!" : "Quiz Failed"}
          </h2>
          <p className="max-w-sm text-zinc-300">
            {passed
              ? `You scored ${score} out of ${QUESTIONS_PER_ROUND}. A key may be waiting…`
              : `You scored ${score} out of ${QUESTIONS_PER_ROUND} — you need ${PASS_THRESHOLD} to pass. Start again!`}
          </p>
          <button
            type="button"
            onClick={retry}
            className={`mt-2 rounded-xl px-8 py-3 font-bold transition-transform hover:scale-105 ${
              passed
                ? "bg-lime-400 text-zinc-950 hover:bg-lime-300"
                : "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-400 hover:to-fuchsia-400"
            }`}
          >
            {passed ? "Play Again" : "Start Again"}
          </button>
        </div>
      </div>
    );
  }

  const question = questions[current];
  const progressPct = ((current + (answered ? 1 : 0)) / QUESTIONS_PER_ROUND) * 100;

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6 px-4 py-10">
      <h1 className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-4xl font-black tracking-wider text-transparent">
        TECH QUIZ
      </h1>

      {/* Score + progress */}
      <div className="flex w-full items-center justify-between text-sm font-semibold">
        <span className="text-lime-300">
          Score: {score}/{QUESTIONS_PER_ROUND}{" "}
          <span className="text-zinc-500">(need {PASS_THRESHOLD})</span>
        </span>
        <span className="text-zinc-400">
          Q{current + 1} / {QUESTIONS_PER_ROUND}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Question card */}
      <div className="w-full rounded-2xl border border-zinc-700/80 bg-zinc-900/80 p-6 shadow-[0_0_40px_rgba(139,92,246,0.12)]">
        <p className="text-lg font-semibold leading-relaxed text-zinc-100">
          {question.question}
        </p>
      </div>

      {/* Options */}
      <div className="flex w-full flex-col gap-3">
        {question.options.map((option, index) => {
          let style = OPTION_STYLES[index];
          if (answered) {
            // Only reveal correctness for the option the player chose; never
            // reveal the right answer after a wrong pick.
            if (index === picked) {
              style = index === question.answer ? OPTION_CORRECT : OPTION_WRONG;
            } else {
              style = "border-zinc-700 bg-zinc-900 text-zinc-500";
            }
          }
          return (
            <button
              key={index}
              type="button"
              disabled={answered}
              onClick={() => pick(index)}
              className={`flex items-center gap-3 rounded-xl border-2 px-5 py-3.5 text-left font-medium transition-all ${style} ${
                answered ? "cursor-default" : "cursor-pointer hover:scale-[1.01]"
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm font-bold">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-zinc-600">
        Questions never repeat until you&apos;ve seen them all.
      </p>
    </div>
  );
}
