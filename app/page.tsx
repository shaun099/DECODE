'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { Users, Key, Eye, EyeOff, Shield, Terminal, AlertTriangle, ArrowRight, Sparkles, Clock, Layers } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);

  const join = trpc.team.join.useMutation({
    onSuccess: () => router.push('/story'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pw.trim() || join.isPending) return;
    join.mutate({ name: name.trim(), password: pw.trim() });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* Cinematic Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />

      {/* Main Terminal Login Card */}
      <div className="relative w-full max-w-md">
        {/* Subtle Outer Neon Border Glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-emerald-500/30 via-emerald-900/10 to-transparent blur-md" />

        <div className="relative rounded-2xl border border-emerald-500/30 bg-zinc-950/85 p-8 shadow-2xl shadow-black/80 backdrop-blur-2xl sm:p-10">
          {/* Cyber Corner Accents */}
          <div className="pointer-events-none absolute left-3 top-3 font-mono text-[10px] text-emerald-500/40">┌</div>
          <div className="pointer-events-none absolute right-3 top-3 font-mono text-[10px] text-emerald-500/40">┐</div>
          <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] text-emerald-500/40">└</div>
          <div className="pointer-events-none absolute bottom-3 right-3 font-mono text-[10px] text-emerald-500/40">┘</div>

          {/* Header Brand Area */}
          <div className="mb-8 flex flex-col items-center text-center">
            {/* Holographic Logo Icon */}
            <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/20 to-emerald-950/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <Shield className="h-8 w-8 text-emerald-400" />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-black">
                <Sparkles className="h-2.5 w-2.5" />
              </span>
            </div>

            {/* Event Tag */}
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 font-mono text-[10px] font-bold tracking-[0.2em] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              ASTHRA 2026 // CIPHER MATRIX
            </div>

            {/* Title */}
            <h1 className="font-mono text-4xl font-black tracking-[0.35em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-emerald-100 to-green-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] sm:text-5xl">
              DECODE
            </h1>
            <p className="mt-2 font-mono text-xs text-zinc-400 max-w-xs">
              Cryptographic Challenge Terminal. Enter your team credentials to initialize session.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Team Name Input */}
            <div>
              <label className="mb-1.5 flex items-center justify-between font-mono text-[11px] font-semibold tracking-wider text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-emerald-400" />
                  TEAM IDENTIFIER
                </span>
                <span className="text-[10px] text-zinc-600">REQUIRED</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. CyberKnights"
                  autoFocus
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-3.5 font-mono text-sm tracking-wide text-zinc-100 placeholder-zinc-600 outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-zinc-900 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Room Password Input */}
            <div>
              <label className="mb-1.5 flex items-center justify-between font-mono text-[11px] font-semibold tracking-wider text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-emerald-400" />
                  ROOM ACCESS KEY
                </span>
                <span className="text-[10px] text-zinc-600">FROM ORGANIZER</span>
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Enter event room password"
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-3.5 pr-12 font-mono text-sm tracking-wide text-zinc-100 placeholder-zinc-600 outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-zinc-900 focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-200"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {join.error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 p-3 font-mono text-xs text-red-400 animate-in fade-in slide-in-from-top-1">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{join.error.message}</span>
              </div>
            )}

            {/* Enter Button */}
            <button
              type="submit"
              disabled={join.isPending || !name.trim() || !pw.trim()}
              className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-emerald-500/60 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-emerald-500/20 py-4 font-mono text-xs font-bold tracking-[0.25em] text-emerald-300 shadow-lg shadow-emerald-950/50 transition-all duration-300 hover:border-emerald-400 hover:bg-emerald-500 hover:text-black hover:shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {join.isPending ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-300 border-t-transparent" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  <span>INITIALIZE SYSTEM</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Event Features Pill Chips */}
          <div className="mt-8 border-t border-zinc-900/90 pt-5">
            <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px]">
              <div className="flex flex-col items-center rounded-lg border border-zinc-900 bg-zinc-900/40 p-2 text-zinc-400">
                <Layers className="mb-1 h-3.5 w-3.5 text-emerald-400" />
                <span>15 Cards</span>
              </div>
              <div className="flex flex-col items-center rounded-lg border border-zinc-900 bg-zinc-900/40 p-2 text-zinc-400">
                <Key className="mb-1 h-3.5 w-3.5 text-yellow-400" />
                <span>5 Real Keys</span>
              </div>
              <div className="flex flex-col items-center rounded-lg border border-zinc-900 bg-zinc-900/40 p-2 text-zinc-400">
                <Clock className="mb-1 h-3.5 w-3.5 text-cyan-400" />
                <span>3-Hour Clock</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between font-mono text-[10px] text-zinc-600">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3 w-3 text-emerald-500" />
                TERMINAL ONLINE
              </span>
              <span>v2.6 // PRODUCTION</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}