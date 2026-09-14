'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  const join = trpc.team.join.useMutation({ onSuccess: () => router.push('/story') });

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 px-4">
      <h1 className="font-mono text-6xl font-bold tracking-[0.3em] text-green-300">DECODE</h1>
      <div className="w-full max-w-sm space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="TEAM NAME"
          className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-950 px-4 py-3.5 font-mono
                     text-sm tracking-widest text-zinc-100 outline-none focus:border-green-500" />
        <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="ROOM PASSWORD"
          className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-950 px-4 py-3.5 font-mono
                     text-sm tracking-widest text-zinc-100 outline-none focus:border-green-500" />
        <button onClick={() => join.mutate({ name, password: pw })} disabled={join.isPending}
          className="w-full rounded-lg border-2 border-green-500/70 bg-zinc-950 py-3.5 font-mono
                     text-sm font-bold tracking-[0.2em] text-green-300 hover:bg-green-500 hover:text-black">
          {join.isPending ? 'CHECKING…' : 'ENTER'}
        </button>
        {join.error && (
          <p className="text-center font-mono text-xs text-red-400">{join.error.message}</p>
        )}
      </div>
    </div>
  );
}