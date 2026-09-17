'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Guard from '@/components/Guard';
import GameHud from '@/components/GameHud';
import LockClock from '@/components/LockClock';
import { gameFor } from '@/games/registry';
import { trpc } from '@/lib/trpc';
import { KeyRound, Compass, Copy, Check, ArrowLeft, ShieldAlert, Sparkles } from 'lucide-react';

export default function CardPage({ params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = use(params);
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [lockSec, setLockSec] = useState<number | null>(null);
  const [done, setDone] = useState<{ key: any; nextClue: string | null } | null>(null);
  const [copied, setCopied] = useState(false);

  const brief = trpc.game.brief.useQuery({ cardId }, { retry: false });

  const start = trpc.game.start.useMutation({ onSuccess: (d) => setSession(d) });

  const attempt = trpc.game.attempt.useMutation({
    onSuccess: (r) => {
      // show the lock instantly — do not wait for Guard's poll
      if (r.locked) { setLockSec(Math.ceil(r.lockMs / 1000)); return; }
      if (r.done) { setDone({ key: r.key, nextClue: r.nextClue }); return; }
      setSession((s: any) => ({
        ...s,
        attemptsLeft: r.attemptsLeft,      // server is the only counter
        view: r.view ?? s.view,
      }));
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (brief.isLoading) return null;

  /* ---------- locked out, straight from the attempt response ---------- */
  if (lockSec !== null) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-zinc-950 bg-[url('/bg_play.png')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
        <div className="relative z-10 max-w-md rounded-3xl border-2 border-red-500/40 bg-zinc-950/95 p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
          <p className="font-mono text-xs font-bold tracking-[0.25em] text-red-400">
            SYSTEM COOLDOWN // ATTEMPTS EXHAUSTED
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-[0.15em] text-white">
            TERMINAL LOCKED
          </h2>
          <p className="mt-3 font-mono text-xs leading-relaxed text-zinc-400">
            Attempts exhausted. This challenge has been reset. The terminal is locked for 2 minutes and will automatically unlock.
          </p>

          <LockClock seconds={lockSec} onComplete={() => router.replace('/play')} />

          <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-zinc-500">
            THE MAIN EVENT CLOCK KEEPS RUNNING
          </p>
        </div>
      </div>
    );
  }

  /* ---------- cannot open ---------- */
  if (brief.error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 text-center">
        <p className="text-lg font-bold tracking-widest text-red-400">CANNOT OPEN THIS TASK</p>
        <p className="max-w-sm font-mono text-[13px] text-zinc-500">{brief.error.message}</p>
        <button onClick={() => router.replace('/play')}
          className="border-2 border-zinc-700 px-6 py-3 font-mono text-[12px] tracking-[0.2em]
                     text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-100">
          BACK TO THE BOARD
        </button>
      </div>
    );
  }

  /* ---------- finished / solved view ---------- */
  const finalKey = done?.key ?? (brief.data?.solved ? brief.data.key : null);
  const finalNextClue = done?.nextClue ?? (brief.data?.solved ? brief.data.nextClue : null);
  const isCompleted = !!done || !!brief.data?.solved;

  if (isCompleted) {
    return (
      <Guard>
        <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12 bg-zinc-950 bg-[url('/bg_play.png')] bg-cover bg-center overflow-y-auto">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

          <div className="relative z-10 w-full max-w-xl flex flex-col items-center gap-6 rounded-3xl border border-[#a3e635]/40 bg-zinc-950/90 p-6 sm:p-10 shadow-[0_0_50px_rgba(163,230,53,0.15)] text-center">
            
            {/* Status Header Badge */}
            {finalKey ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/40 bg-lime-500/10 px-4 py-1.5 font-mono text-xs font-semibold tracking-wider text-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.2)]">
                <Sparkles className="h-4 w-4 text-lime-400" />
                <span>MISSION ACCOMPLISHED // FRAGMENT SECURED</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/80 px-4 py-1.5 font-mono text-xs font-semibold tracking-wider text-zinc-300">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span>CHALLENGE CLEARED // DECOY NODE</span>
              </div>
            )}

            {/* Main Title */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.12em] text-white">
                {finalKey ? 'KEY FRAGMENT RECOVERED' : 'OOPS! NO KEY PRESENT'}
              </h2>
              <p className="mt-2 font-mono text-xs sm:text-sm text-zinc-400">
                {finalKey
                  ? 'Encryption fragment decrypted and archived into your team Key Vault.'
                  : 'This challenge was a decoy node. No encryption fragment is hidden here.'}
              </p>
            </div>

            {/* Key Fragment Card */}
            {finalKey && (
              <div className="w-full rounded-2xl border-2 border-lime-400/50 bg-black/80 p-5 sm:p-6 shadow-[inset_0_0_30px_rgba(163,230,53,0.08)]">
                <div className="flex items-center justify-between pb-3 border-b border-lime-900/40">
                  <span className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest text-lime-400">
                    <KeyRound className="h-4 w-4" />
                    FRAGMENT #{finalKey.position}
                  </span>
                  <span className="rounded bg-lime-400/20 px-2 py-0.5 font-mono text-[11px] font-bold text-lime-300">
                    SLOT {finalKey.position} / 5
                  </span>
                </div>

                <div className="my-5 flex flex-col items-center justify-center gap-2">
                  <div className="rounded-xl border border-lime-400/30 bg-lime-950/20 px-6 py-4">
                    <span className="font-mono text-3xl sm:text-4xl font-black tracking-[0.25em] text-lime-300 drop-shadow-[0_0_12px_rgba(163,230,53,0.6)]">
                      {finalKey.value}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(finalKey.value)}
                  className="mx-auto flex items-center justify-center gap-2 rounded-lg border border-lime-400/40 bg-lime-500/10 px-4 py-2 font-mono text-xs font-semibold text-lime-300 transition-all hover:bg-lime-500 hover:text-black active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-lime-400" />
                      COPIED TO CLIPBOARD
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-lime-400" />
                      COPY FRAGMENT VALUE
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Next Card Clue */}
            {finalNextClue && (
              <div className="w-full rounded-2xl border border-lime-500/30 bg-black/60 p-5 sm:p-6 text-left">
                <div className="flex items-center gap-2 font-mono text-xs font-bold tracking-widest text-lime-400 pb-2 border-b border-zinc-800">
                  <Compass className="h-4 w-4" />
                  <span>INTERCEPTED TRANSMISSION // NEXT CARD CLUE</span>
                </div>
                <p className="mt-3.5 font-mono text-sm leading-relaxed text-zinc-100 font-medium">
                  &ldquo;{finalNextClue}&rdquo;
                </p>
              </div>
            )}

            {/* Action Return Button */}
            <button
              onClick={() => router.replace('/play')}
              autoFocus
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl border-2 border-lime-400 bg-lime-500/20 py-4 font-mono text-xs sm:text-sm font-black tracking-[0.2em] text-lime-300 shadow-[0_0_30px_rgba(163,230,53,0.3)] transition-all hover:bg-lime-400 hover:text-black hover:shadow-[0_0_40px_rgba(163,230,53,0.5)] active:scale-[0.98]"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>RETURN TO CARD SELECTION</span>
            </button>
          </div>
        </div>
      </Guard>
    );
  }

  /* ---------- briefing ---------- */
  if (!session) {
    const b = brief.data!;
    return (
      <Guard>
        <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-7 px-6 py-10">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-emerald-500">TASK BRIEFING & INSTRUCTIONS</p>
            <h1 className="mt-3 text-4xl font-black text-zinc-100">{b.name}</h1>
            <p className="mt-2 text-[15px] text-zinc-400">{b.teaser}</p>
          </div>

          <ol className="space-y-3 border-2 border-emerald-900/70 bg-black/50 px-7 py-6">
            {b.rules.map((r: string, i: number) => (
              <li key={i} className="flex gap-4 text-[15px] leading-relaxed text-zinc-200">
                <span className="font-mono text-emerald-400">{String(i + 1).padStart(2, '0')}</span>
                <span>{r}</span>
              </li>
            ))}
          </ol>

          <p className="border-l-2 border-amber-500 pl-4 text-[13px] leading-relaxed text-amber-300 font-mono">
            TERMINAL ENGAGED: You have initialized this challenge. You cannot return to the main board until this task is completed.
          </p>

          <div className="flex gap-3">
            <button onClick={() => start.mutate({ cardId })} disabled={start.isPending} autoFocus
              className="flex-1 border-2 border-emerald-600 bg-emerald-500/10 py-4 text-[13px]
                         font-bold uppercase tracking-[0.2em] text-emerald-300 transition-all
                         hover:bg-emerald-500 hover:text-black disabled:opacity-35"
            >
              {start.isPending ? 'COMMENCING TASK…' : 'BEGIN CHALLENGE'}
            </button>
          </div>

          {start.error && (
            <p className="text-center font-mono text-[13px] text-red-400">{start.error.message}</p>
          )}
        </div>
      </Guard>
    );
  }

  /* ---------- playing ---------- */
  const Game = gameFor(cardId);
  const send = (payload: any) => attempt.mutateAsync({ cardId, payload });
  const hud = (
    <GameHud
      name={session.name}
      index={session.view?.index}
      total={session.view?.total}
      left={session.attemptsLeft}
      max={session.maxWrong}
    />
  );

  if (!Game) {
    return (
      <Guard>
        <div className="flex min-h-screen items-center justify-center px-4 text-center">
          <p className="font-mono text-sm text-red-400">
            No renderer registered for &ldquo;{cardId}&rdquo;. Add it to games/registry.ts
          </p>
        </div>
      </Guard>
    );
  }

  return (
    <Guard>
      <Game hud={hud} view={session.view} send={send} />
    </Guard>
  );
}