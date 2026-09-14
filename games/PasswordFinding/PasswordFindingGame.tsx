"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CLUES,
  DISPLAY_PASSWORD,
  FOOTER_NOTE,
  SITE_PAGES,
  checkParts,
  isPasswordCorrect,
} from "./logic";

interface PasswordFindingGameProps {
  /** Called once when the password is cracked. The story framework can hook in here. */
  onWin?: () => void;
}

export default function PasswordFindingGame({ onWin }: PasswordFindingGameProps) {
  const router = useRouter();
  const [activePageId, setActivePageId] = useState(SITE_PAGES[0].id);
  const [guesses, setGuesses] = useState<string[]>(["", "", "", ""]);
  const [results, setResults] = useState<boolean[] | null>(null);
  const [won, setWon] = useState(false);
  const wonRef = useRef(false);

  const activePage = useMemo(
    () => SITE_PAGES.find((p) => p.id === activePageId) ?? SITE_PAGES[0],
    [activePageId],
  );

  const updateGuess = useCallback((index: number, value: string) => {
    setResults(null);
    setGuesses((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const submit = useCallback(() => {
    const parts = checkParts(guesses);
    setResults(parts);
    if (isPasswordCorrect(guesses) && !wonRef.current) {
      wonRef.current = true;
      setWon(true);
      onWin?.();
    }
  }, [guesses, onWin]);

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-10">
      <h1 className="text-3xl font-bold tracking-widest text-zinc-100">
        PASSWORD FINDING
      </h1>
      <p className="max-w-md text-center text-sm text-zinc-500">
        Explore the company&apos;s website and match each clue to something you
        find on it. Combine all four parts to crack the password.
      </p>

      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Fake website, shown inside a mock browser frame */}
        <div className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-[0_0_40px_rgba(34,211,238,0.06)]">
          <div className="flex items-center gap-2 border-b border-zinc-700 bg-zinc-800 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
            <span className="ml-3 truncate rounded-md bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
              halcyonsystems.example/{activePage.id}
            </span>
          </div>

          <nav className="flex flex-wrap gap-1 border-b border-zinc-700 bg-slate-900 px-3 py-2">
            {SITE_PAGES.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => setActivePageId(page.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  page.id === activePageId
                    ? "bg-teal-500/20 text-teal-300"
                    : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                {page.nav}
              </button>
            ))}
          </nav>

          <div className="bg-slate-950 px-6 py-8">
            <h2 className="mb-5 text-2xl font-semibold text-slate-100">
              {activePage.title}
            </h2>
            <div className="flex flex-col gap-4">
              {activePage.sections.map((section, i) => (
                <div key={i}>
                  {section.heading && (
                    <h3 className="mb-1 text-sm font-semibold text-teal-400">
                      {section.heading}
                    </h3>
                  )}
                  <p className="text-sm leading-relaxed text-slate-300">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-500">
              {FOOTER_NOTE}
            </p>
          </div>
        </div>

        {/* Clues and password entry */}
        <div className="flex flex-col gap-4">
          {CLUES.map((clue, i) => {
            const state = results?.[i];
            return (
              <div
                key={clue.id}
                className={`rounded-lg border bg-zinc-900 p-3 transition-colors ${
                  state === true
                    ? "border-cyan-500/60"
                    : state === false
                      ? "border-red-500/60"
                      : "border-zinc-700"
                }`}
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {clue.label}
                </p>
                <p className="mb-2 text-sm text-zinc-300">{clue.prompt}</p>
                <input
                  type="text"
                  value={guesses[i]}
                  disabled={won}
                  onChange={(e) => updateGuess(i, e.target.value)}
                  placeholder="Your answer"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-cyan-500/60 disabled:opacity-50"
                />
              </div>
            );
          })}

          <button
            type="button"
            disabled={won || guesses.some((g) => g.trim() === "")}
            onClick={submit}
            className="mt-1 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit Password
          </button>

          {results && !won && (
            <p className="text-center text-sm text-red-400">
              Not quite — the highlighted parts are wrong.
            </p>
          )}
        </div>
      </div>

      {/* Victory overlay */}
      {won && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-cyan-500/40 bg-zinc-900 px-10 py-12 text-center shadow-[0_0_60px_rgba(34,211,238,0.25)]">
            <div className="text-6xl">🔓</div>
            <h2 className="text-3xl font-bold text-zinc-100">
              Access Granted
            </h2>
            <p className="max-w-xs text-sm text-zinc-400">
              Password cracked:{" "}
              <span className="font-mono text-cyan-300">
                {DISPLAY_PASSWORD}
              </span>
            </p>
            <button
              type="button"
              className="mt-2 rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-500"
              onClick={() => router.push("/play")}
            >
              Go Back To Tasks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}