'use client';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Trophy, ArrowLeft, Radio } from 'lucide-react';

export default function LeaderboardPage() {
  const { data: topTeams, isLoading } = trpc.team.leaderboard.useQuery(undefined, {
    refetchInterval: 3000,
  });

  return (
    <div
      className="relative flex min-h-screen h-screen w-screen items-center justify-center p-4 sm:p-8 bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      {/* Background blur filter overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Main black container occupying most of the screen */}
      <div className="relative z-10 flex flex-col justify-between w-[94vw] max-w-5xl h-[84vh] max-h-[850px] rounded-3xl border-2 border-green-500/50 bg-zinc-950/85 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_0_70px_rgba(34,197,94,0.18)]">
        
        {/* Header box */}
        <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-green-500/30">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-green-500/15 border border-green-400/40 text-green-400 shadow-[0_0_20px_rgba(74,222,128,0.25)]">
              <Trophy className="h-5 w-5 sm:h-7 sm:w-7 text-green-300" />
            </div>
            <div>
              <h1 className="font-mono text-lg sm:text-2xl md:text-3xl font-black tracking-[0.22em] text-green-300 uppercase drop-shadow-[0_0_12px_rgba(74,222,128,0.4)]">
                TOP 5 LEADERBOARD
              </h1>
              <p className="font-mono text-[11px] sm:text-xs text-zinc-400 tracking-widest flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                LIVE EVENT RANKINGS
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-2.5 sm:px-5 sm:py-3 font-mono text-xs sm:text-sm font-bold tracking-widest text-zinc-300 hover:border-green-400 hover:text-green-300 hover:bg-green-500/10 transition-all active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>BACK</span>
          </Link>
        </div>

        {/* Top 5 list */}
        <div className="flex-1 flex flex-col justify-center gap-3 sm:gap-4 my-4 sm:my-6 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-zinc-800 bg-black/50 p-8 text-center font-mono text-sm sm:text-base tracking-[0.2em] text-zinc-400">
              <div className="flex items-center gap-3">
                <Radio className="h-5 w-5 animate-pulse text-green-400" />
                <span>SYNCHRONIZING LEADERBOARD DATA...</span>
              </div>
            </div>
          ) : !topTeams || topTeams.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-zinc-800 bg-black/50 p-8 text-center font-mono text-sm sm:text-base tracking-[0.2em] text-zinc-400">
              NO TEAMS REGISTERED YET
            </div>
          ) : (
            topTeams.map((team) => {
              const isFirst = team.position === 1;
              const isSecond = team.position === 2;
              const isThird = team.position === 3;

              return (
                <div
                  key={team.position}
                  className={`flex flex-1 items-center justify-between rounded-2xl border-2 px-5 sm:px-8 py-3 sm:py-4 font-mono transition-all duration-300 ${
                    isFirst
                      ? 'border-yellow-400/90 bg-gradient-to-r from-yellow-950/40 via-zinc-950/80 to-zinc-950/80 text-yellow-300 shadow-[0_0_30px_rgba(250,204,21,0.25)]'
                      : isSecond
                      ? 'border-zinc-300/80 bg-gradient-to-r from-zinc-800/30 via-zinc-950/80 to-zinc-950/80 text-zinc-100 shadow-[0_0_20px_rgba(228,228,231,0.15)]'
                      : isThird
                      ? 'border-amber-600/80 bg-gradient-to-r from-amber-950/30 via-zinc-950/80 to-zinc-950/80 text-amber-300 shadow-[0_0_20px_rgba(217,119,6,0.15)]'
                      : 'border-zinc-800/90 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    {/* Position Badge */}
                    <span
                      className={`flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl font-mono text-base sm:text-2xl font-black ${
                        isFirst
                          ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-black shadow-[0_0_20px_rgba(250,204,21,0.5)]'
                          : isSecond
                          ? 'bg-gradient-to-br from-zinc-100 to-zinc-300 text-black shadow-[0_0_15px_rgba(228,228,231,0.4)]'
                          : isThird
                          ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-black shadow-[0_0_15px_rgba(217,119,6,0.3)]'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {team.position}
                    </span>

                    {/* Team Name */}
                    <span className="truncate font-black text-base sm:text-xl md:text-2xl tracking-wider sm:tracking-widest">
                      {team.name}
                    </span>
                  </div>

                  {/* Right slot label */}
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <span className="font-mono text-xs sm:text-sm md:text-base font-bold tracking-widest text-zinc-500">
                      RANK <span className="text-zinc-200">#{team.position}</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info line */}
        <div className="pt-2 text-center border-t border-zinc-900">
          <p className="font-mono text-[10px] sm:text-xs text-zinc-600 tracking-[0.25em] uppercase">
            DECODE // OFFICIAL EVENT SCOREBOARD
          </p>
        </div>

      </div>
    </div>
  );
}
