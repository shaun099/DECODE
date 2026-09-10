'use client';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export default function Admin() {
  const [pw, setPw] = useState('');
  const [go, setGo] = useState(false);
  const rank = trpc.admin.ranking.useQuery({ pw }, { enabled: go, refetchInterval: 3000 });
  const logs = trpc.admin.logs.useQuery({ pw }, { enabled: go, refetchInterval: 3000 });
  const unlock = trpc.admin.unlock.useMutation({ onSuccess: () => rank.refetch() });

  if (!go) {
    return (
      <div className="flex h-screen items-center justify-center gap-2 px-4">
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
          placeholder="ADMIN PASSWORD"
          className="rounded-lg border-2 border-zinc-700 bg-zinc-950 px-4 py-3 font-mono text-sm text-zinc-100" />
        <button onClick={() => setGo(true)}
          className="rounded-lg border-2 border-green-500/70 px-6 py-3 font-mono text-xs
                     font-bold tracking-widest text-green-300">ENTER</button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid h-screen max-w-6xl grid-cols-1 gap-6 overflow-hidden p-6 lg:grid-cols-3">
      <div className="col-span-2 flex min-h-0 flex-col">
        <h2 className="mb-3 font-mono text-xs tracking-[0.25em] text-green-400">RANKING</h2>
        <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-zinc-800">
          <table className="w-full font-mono text-xs">
            <thead className="sticky top-0 bg-zinc-900 text-zinc-400">
              <tr><th className="p-2 text-left">#</th><th className="p-2 text-left">Team</th>
                  <th className="p-2">Keys</th><th className="p-2">Finished</th>
                  <th className="p-2">Locked</th><th className="p-2"></th></tr>
            </thead>
            <tbody>
              {rank.data?.map((r, i) => (
                <tr key={r.id} className="border-t border-zinc-800 text-zinc-200">
                  <td className="p-2 text-green-400">{i + 1}</td>
                  <td className="p-2">{r.name}</td>
                  <td className="p-2 text-center">{r.keys}</td>
                  <td className="p-2 text-center text-zinc-500">
                    {r.finishedAt ? new Date(r.finishedAt).toLocaleTimeString() : '—'}
                  </td>
                  <td className="p-2 text-center text-red-400">
                    {r.lockedMs > 0 ? Math.ceil(r.lockedMs / 1000) + 's' : ''}
                  </td>
                  <td className="p-2 text-center">
                    {r.lockedMs > 0 && (
                      <button onClick={() => unlock.mutate({ pw, teamId: r.id })}
                        className="text-[10px] tracking-widest text-zinc-400 hover:text-green-300">
                        UNLOCK
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex min-h-0 flex-col">
        <h2 className="mb-3 font-mono text-xs tracking-[0.25em] text-green-400">LIVE LOG</h2>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto rounded-xl border border-zinc-800 p-3">
          {logs.data?.map((l: any) => (
            <div key={l.id} className="font-mono text-[11px] text-zinc-400">
              <span className="text-zinc-600">{new Date(l.at).toLocaleTimeString()}</span>{' '}
              <span className="text-zinc-200">{l.teams?.name}</span>{' '}
              <span className={l.kind === 'key' ? 'text-green-400' : 'text-zinc-500'}>{l.kind}</span>{' '}
              {l.card_id}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}