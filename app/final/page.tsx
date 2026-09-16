'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Guard from '@/components/Guard';
import { trpc } from '@/lib/trpc';

export default function Final() {
  const router = useRouter();
  const [answer, setAnswer] = useState('');
  const { data } = trpc.game.state.useQuery();
  const submit = trpc.game.final.useMutation({
    onSuccess: (r) => { if (r.ok) router.replace('/result'); },
  });

  if (!data) return null;

  return (
    <Guard>
      <div className="mx-auto flex h-screen max-w-lg flex-col items-center justify-center gap-6 px-6">
        <h1 className="font-mono text-2xl font-bold tracking-[0.25em] text-green-300">THE ANSWER</h1>

        <div className="w-full space-y-2">
          {data.keys.map((k) => (
            <div key={k.position}
              className="flex items-center gap-4 rounded-lg border border-green-600/40 bg-zinc-950 px-5 py-3">
              <span className="font-mono text-xs text-zinc-500">POSITION {k.position}</span>
              <span className="font-mono text-lg tracking-widest text-green-200">{k.value}</span>
            </div>
          ))}
        </div>

        <input value={answer} onChange={(e) => setAnswer(e.target.value)}
          placeholder="ASSEMBLE THE KEYS IN ORDER"
          className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-950 px-5 py-4 text-center
                     font-mono text-lg tracking-[0.3em] text-green-200 outline-none focus:border-green-500" />

        <button onClick={() => submit.mutate({ answer })} disabled={submit.isPending}
          className="w-full rounded-lg border-2 border-green-500/70 bg-zinc-950 py-4 font-mono
                     text-sm font-bold tracking-[0.2em] text-green-300 hover:bg-green-500 hover:text-black">
          SUBMIT
        </button>

        {submit.data && !submit.data.ok && (
          <p className="font-mono text-xs text-red-400">Rejected.</p>
        )}
      </div>
    </Guard>
  );
}