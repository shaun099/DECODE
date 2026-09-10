'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Guard from '@/components/Guard';

export default function Story() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  return (
    <Guard>
      <div className="mx-auto flex h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-8">
        <h1 className="font-mono text-3xl font-bold tracking-[0.25em] text-green-300">THE BRIEFING</h1>

        <div className="space-y-4 overflow-y-auto rounded-2xl border-2 border-green-500/40 bg-zinc-950 px-7 py-6">
          <p className="font-mono text-[15px] leading-7 text-zinc-100">
            [ your story goes here ]
          </p>
          <p className="font-mono text-[15px] leading-7 text-zinc-100">
            Fifteen files sit on the board. Not all of them are real.
          </p>
          <p className="font-mono text-[15px] leading-7 text-green-200">
            Begin with the one that asks ten questions and accepts nine.
          </p>
        </div>

        {!confirming ? (
          <button onClick={() => setConfirming(true)}
            className="rounded-lg border-2 border-green-500/70 bg-zinc-950 py-4 font-mono text-sm
                       font-bold tracking-[0.2em] text-green-300 hover:bg-green-500 hover:text-black">
            START
          </button>
        ) : (
          <div className="rounded-lg border-2 border-red-500/50 bg-zinc-950 px-6 py-5 text-center">
            <p className="font-mono text-sm text-zinc-200">
              Once started you cannot stop or leave. Ready?
            </p>
            <div className="mt-4 flex gap-3">
              <button onClick={() => setConfirming(false)}
                className="flex-1 rounded-lg border border-zinc-700 py-3 font-mono text-xs
                           tracking-widest text-zinc-400 hover:text-zinc-100">
                NOT YET
              </button>
              <button onClick={() => router.replace('/play')}
                className="flex-1 rounded-lg border-2 border-green-500/70 py-3 font-mono text-xs
                           font-bold tracking-widest text-green-300 hover:bg-green-500 hover:text-black">
                BEGIN
              </button>
            </div>
          </div>
        )}
      </div>
    </Guard>
  );
}