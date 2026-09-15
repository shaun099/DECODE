'use client';
import { useEffect, useRef, useState } from 'react';
import type { GameProps } from '../registry';

interface SitePage {
    id: string;
    nav: string;
    title: string;
    sections: { heading?: string; body: string }[];
}
interface Clue { id: number; label: string; prompt: string }

export default function PasswordGame({ hud, view, send }: GameProps) {
    const pages: SitePage[] = view?.pages ?? [];
    const clues: Clue[] = view?.clues ?? [];
    const results: boolean[] | null = view?.results ?? null;
    const tries: number = view?.tries ?? 0;

    const [activeId, setActiveId] = useState(pages[0]?.id ?? '');
    const [guesses, setGuesses] = useState<string[]>(view?.guesses ?? ['', '', '', '']);
    const [busy, setBusy] = useState(false);
    const [seen, setSeen] = useState<Set<string>>(new Set([pages[0]?.id ?? '']));
    const triesRef = useRef(tries);

    /* unlock when the server answers */
    useEffect(() => {
        if (tries !== triesRef.current) {
            triesRef.current = tries;
            setBusy(false);
        }
    }, [tries]);

    const activePage = pages.find((p) => p.id === activeId) ?? pages[0];
    const ready = guesses.every((g) => g.trim() !== '');

    function open(id: string) {
        setActiveId(id);
        setSeen((s) => new Set(s).add(id));
    }

    function update(i: number, v: string) {
        setGuesses((prev) => { const n = [...prev]; n[i] = v; return n; });
    }

    function submit() {
        if (busy || !ready) return;
        setBusy(true);
        send({ guesses });
    }

    if (!activePage) return null;

    return (
        <div className="mx-auto flex h-screen max-w-6xl flex-col gap-4 overflow-hidden px-6 py-5">
            {hud}

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
                {/* ---------- the browser ---------- */}
                <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
                    <div className="flex shrink-0 items-center gap-2 border-b border-zinc-700 bg-zinc-800 px-4 py-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                        <span className="ml-3 truncate rounded-md bg-zinc-950 px-3 py-1 text-xs text-zinc-400">
                            halcyonsystems.example/{activePage.id}
                        </span>
                        <span className="ml-auto shrink-0 font-mono text-[10px] tracking-[0.18em] text-zinc-600">
                            {seen.size} / {pages.length} PAGES READ
                        </span>
                    </div>

                    <nav className="flex shrink-0 flex-wrap gap-1 border-b border-zinc-700 bg-slate-900 px-3 py-2">
                        {pages.map((page) => (
                            <button
                                key={page.id}
                                type="button"
                                onClick={() => open(page.id)}
                                className={
                                    'relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ' +
                                    (page.id === activeId
                                        ? 'bg-teal-500/20 text-teal-300'
                                        : 'text-slate-300 hover:bg-slate-800')
                                }
                            >
                                {page.nav}
                                {!seen.has(page.id) && (
                                    <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-teal-400" />
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="min-h-0 flex-1 overflow-y-auto bg-slate-950 px-7 py-7">
                        <h2 className="mb-5 text-2xl font-semibold text-slate-100">{activePage.title}</h2>
                        <div className="flex flex-col gap-4">
                            {activePage.sections.map((s, i) => (
                                <div key={i}>
                                    {s.heading && (
                                        <h3 className="mb-1 text-sm font-semibold text-teal-400">{s.heading}</h3>
                                    )}
                                    <p className="text-[15px] leading-relaxed text-slate-300">{s.body}</p>
                                </div>
                            ))}
                        </div>
                        {view?.footer && (
                            <p className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-600">
                                {view.footer}
                            </p>
                        )}
                    </div>
                </div>

                {/* ---------- the clue panel ---------- */}
                <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
                    <p className="shrink-0 font-mono text-[11px] tracking-[0.24em] text-emerald-500">
                        FOUR PARTS, IN ORDER
                    </p>

                    {clues.map((clue, i) => {
                        const r = results?.[i];
                        return (
                            <label
                                key={clue.id}
                                className={
                                    'shrink-0 rounded-lg border-2 bg-zinc-900 p-3.5 transition-colors ' +
                                    (r === true
                                        ? 'border-emerald-500'
                                        : r === false
                                            ? 'border-red-500/70'
                                            : 'border-zinc-700')
                                }
                            >
                                <span className="mb-1 flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                        {clue.label}
                                    </span>
                                    {r === true && <span className="text-xs font-bold text-emerald-400">✓ CORRECT</span>}
                                    {r === false && <span className="text-xs font-bold text-red-400">✕ WRONG</span>}
                                </span>

                                <span className="mb-2 block text-sm text-zinc-300">{clue.prompt}</span>

                                <input
                                    type="text"
                                    value={guesses[i] ?? ''}
                                    onChange={(e) => update(i, e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                                    disabled={r === true || busy}
                                    className={
                                        'w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors ' +
                                        (r === true
                                            ? 'border-emerald-700 bg-emerald-950/40 text-emerald-200'
                                            : 'border-zinc-700 bg-zinc-800 text-zinc-100 focus:border-cyan-500/60')
                                    }
                                />
                            </label>
                        );
                    })}

                    <button
                        type="button"
                        disabled={!ready || busy}
                        onClick={submit}
                        className="shrink-0 rounded-lg bg-cyan-600 px-4 py-3 text-sm font-semibold text-zinc-950
                       transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed
                       disabled:bg-zinc-800 disabled:text-zinc-600"
                    >
                        {busy ? 'Checking…' : !ready ? 'Fill all four parts' : 'Submit password'}
                    </button>

                    {results && !results.every(Boolean) && !busy && (
                        <p className="shrink-0 text-center font-mono text-[12px] text-amber-400">
                            {results.filter(Boolean).length} of {results.length} parts correct.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}