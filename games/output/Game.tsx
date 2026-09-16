'use client';
import { useEffect, useRef, useState } from 'react';
import type { GameProps } from '../registry';

interface ChallengeView {
    id: number;
    difficulty: string;
    code: string;
}

export default function OutputGame({ hud, view, send }: GameProps) {
    const challenge: ChallengeView | undefined = view?.challenge;
    const challengeNumber: number = view?.challengeNumber ?? 1;
    const totalChallenges: number = view?.totalChallenges ?? 0;
    const solvedCount: number = view?.solvedCount ?? 0;
    const attempts: number = view?.attempts ?? 0;
    const lastResult: boolean | null = view?.lastResult ?? null;
    const finished: boolean = view?.finished ?? false;

    const [answer, setAnswer] = useState('');
    const [busy, setBusy] = useState(false);
    const attemptsRef = useRef(attempts);

    /* unlock the form once the server has answered, and clear the draft */
    useEffect(() => {
        if (attempts !== attemptsRef.current) {
            attemptsRef.current = attempts;
            setBusy(false);
            setAnswer('');
        }
    }, [attempts]);

    function submit() {
        if (busy || finished || answer.trim() === '') return;
        setBusy(true);
        send({ answer });
    }

    if (!challenge) return null;

    return (
        <div className="mx-auto flex h-screen max-w-3xl flex-col gap-5 overflow-hidden px-6 py-6">
            {hud}

            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto">
                {/* ---------- progress ---------- */}
                <div className="flex shrink-0 items-center justify-between">
                    <span className="font-mono text-xs text-zinc-500">
                        Snippet {challengeNumber} of {totalChallenges}
                    </span>
                    <span className="rounded-full border border-teal-800/60 px-2.5 py-0.5 font-mono text-[11px] text-teal-400">
                        {challenge.difficulty}
                    </span>
                </div>

                <div className="flex shrink-0 gap-1.5">
                    {Array.from({ length: totalChallenges }).map((_, i) => (
                        <span
                            key={i}
                            className={
                                'h-1.5 flex-1 rounded-full ' +
                                (i < solvedCount
                                    ? 'bg-teal-500'
                                    : i === solvedCount
                                        ? 'bg-amber-500/70'
                                        : 'bg-zinc-800')
                            }
                        />
                    ))}
                </div>

                {/* ---------- code panel ---------- */}
                <div className="shrink-0 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
                    <div className="flex items-center gap-2 border-b border-zinc-700 bg-zinc-900 px-4 py-2.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
                        <span className="ml-3 font-mono text-xs text-zinc-500">snippet.py</span>
                    </div>
                    <pre className="overflow-x-auto whitespace-pre p-5 font-mono text-[15px] leading-relaxed text-zinc-200">
                        {challenge.code}
                    </pre>
                </div>

                {/* ---------- answer ---------- */}
                <div className="flex shrink-0 flex-col gap-2">
                    <p className="text-sm text-zinc-300">What will be the exact output?</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && submit()}
                            disabled={busy || finished}
                            placeholder="Type the output exactly as printed"
                            className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100
                         outline-none focus:border-teal-500/60 disabled:opacity-60"
                        />
                        <button
                            type="button"
                            onClick={submit}
                            disabled={busy || finished || answer.trim() === ''}
                            className="shrink-0 rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-zinc-950
                         transition-colors hover:bg-teal-500 disabled:cursor-not-allowed
                         disabled:bg-zinc-800 disabled:text-zinc-600"
                        >
                            {busy ? 'Checking…' : 'Submit'}
                        </button>
                    </div>

                    {lastResult === false && !busy && (
                        <p className="font-mono text-[12px] text-red-400">
                            Incorrect. Try again.
                        </p>
                    )}
                    {finished && (
                        <p className="font-mono text-[12px] text-teal-400">
                            All snippets traced. Fragment unlocked.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
