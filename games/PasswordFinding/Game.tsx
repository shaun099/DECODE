'use client';

import { useState } from 'react';
import type { GameProps } from '../registry';

interface SitePage {
  id: string;
  nav: string;
  title: string;
  sections: { heading?: string; body: string }[];
}

interface Clue {
  id: number;
  label: string;
  prompt: string;
}

export default function PasswordFindingBoardGame({ hud, view, send }: GameProps) {
  const [activePageId, setActivePageId] = useState(view.activePageId);
  const [guesses, setGuesses] = useState<string[]>(view.guesses);
  const activePage = (view.pages as SitePage[]).find((page) => page.id === activePageId) ?? view.pages[0];
  const results = view.results as boolean[] | null;

  const updateGuess = (index: number, value: string) => {
    setGuesses((previous) => {
      const next = [...previous];
      next[index] = value;
      return next;
    });
  };

  const submit = () => send({ guesses });

  return (
    <div className="mx-auto flex h-screen max-w-6xl flex-col gap-4 overflow-hidden px-6 py-5">
      {hud}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
          <div className="flex items-center gap-2 border-b border-zinc-700 bg-zinc-800 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
            <span className="ml-3 truncate rounded-md bg-zinc-950 px-3 py-1 text-xs text-zinc-400">
              halcyonsystems.example/{activePage.id}
            </span>
          </div>
          <nav className="flex flex-wrap gap-1 border-b border-zinc-700 bg-slate-900 px-3 py-2">
            {(view.pages as SitePage[]).map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => setActivePageId(page.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  page.id === activePageId ? 'bg-teal-500/20 text-teal-300' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {page.nav}
              </button>
            ))}
          </nav>
          <div className="bg-slate-950 px-6 py-7">
            <h2 className="mb-5 text-2xl font-semibold text-slate-100">{activePage.title}</h2>
            <div className="flex flex-col gap-4">
              {activePage.sections.map((section, index) => (
                <div key={index}>
                  {section.heading && <h3 className="mb-1 text-sm font-semibold text-teal-400">{section.heading}</h3>}
                  <p className="text-sm leading-relaxed text-slate-300">{section.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {(view.clues as Clue[]).map((clue, index) => {
            const result = results?.[index];
            return (
              <label key={clue.id} className={`rounded-lg border bg-zinc-900 p-3 ${result === true ? 'border-emerald-500/60' : result === false ? 'border-red-500/60' : 'border-zinc-700'}`}>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">{clue.label}</span>
                <span className="mb-2 block text-sm text-zinc-300">{clue.prompt}</span>
                <input
                  type="text"
                  value={guesses[index] ?? ''}
                  onChange={(event) => updateGuess(index, event.target.value)}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-cyan-500/60"
                />
              </label>
            );
          })}
          <button
            type="button"
            disabled={guesses.some((guess) => guess.trim() === '')}
            onClick={submit}
            className="rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit Password
          </button>
        </div>
      </div>
    </div>
  );
}
