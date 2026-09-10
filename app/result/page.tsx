'use client';
import { trpc } from '@/lib/trpc';

export default function Result() {
  const { data } = trpc.game.state.useQuery(undefined, { refetchInterval: 5000 });
  if (!data) return null;

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-6xl">🏁</div>
      <h1 className="font-mono text-3xl font-bold tracking-[0.25em] text-green-300">COMPLETE</h1>
      <p className="font-mono text-lg text-zinc-200">{data.teamName}</p>
      <p className="max-w-sm font-mono text-sm text-zinc-500">
        Your finishing time has been recorded. Please wait for the coordinators.
      </p>
    </div>
  );
}