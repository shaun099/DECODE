'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Key,
  Clock,
  Lock,
  Unlock,
  Shield,
  Search,
  RefreshCw,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Eye,
  EyeOff,
  LogOut,
  GitCompare,
  History,
  Radio,
  Sparkles,
  Award,
  Zap,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import type { RankRow, LogItem } from '@/server/routers/admin';

export default function AdminPage() {
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Auto-refresh control
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'audit' | 'live' | 'tiebreak'>('audit');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [logKindFilter, setLogKindFilter] = useState('all');

  // Tie-breaker comparison selection
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);

  // Room Password edit
  const [editRoomPw, setEditRoomPw] = useState(false);
  const [newRoomPw, setNewRoomPw] = useState('');
  const [pwSuccessMsg, setPwSuccessMsg] = useState<string | null>(null);

  // Try loading saved password from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('decode_admin_pw');
    if (saved) {
      setPw(saved);
      setIsAuth(true);
    }
  }, []);

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: (data) => {
      setIsAuth(true);
      setAuthError(null);
      sessionStorage.setItem('decode_admin_pw', pw);
    },
    onError: (err) => {
      setAuthError(err.message || 'Incorrect admin password.');
    },
  });

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pw.trim()) {
      setAuthError('Please enter the admin password.');
      return;
    }
    setAuthError(null);
    loginMutation.mutate({ pw: pw.trim() });
  };

  const handleLogout = () => {
    sessionStorage.removeItem('decode_admin_pw');
    setIsAuth(false);
    setPw('');
    setSelectedTeamId(null);
  };

  // Queries
  const rankQuery = trpc.admin.ranking.useQuery(
    { pw },
    {
      enabled: isAuth,
      refetchInterval: autoRefresh ? 2500 : false,
      refetchOnWindowFocus: true,
    }
  );

  const logsQuery = trpc.admin.logs.useQuery(
    { pw, teamId: selectedTeamId && activeTab === 'audit' ? selectedTeamId : undefined, limit: 120 },
    {
      enabled: isAuth,
      refetchInterval: autoRefresh ? 2500 : false,
      refetchOnWindowFocus: true,
    }
  );

  const eventQuery = trpc.admin.event.useQuery(
    { pw },
    {
      enabled: isAuth,
      refetchInterval: 10000,
    }
  );

  const unlockMutation = trpc.admin.unlock.useMutation({
    onSuccess: () => {
      rankQuery.refetch();
      logsQuery.refetch();
    },
  });

  const setPasswordMutation = trpc.admin.setPassword.useMutation({
    onSuccess: () => {
      eventQuery.refetch();
      setEditRoomPw(false);
      setPwSuccessMsg('Room password updated successfully!');
      setTimeout(() => setPwSuccessMsg(null), 3000);
    },
  });

  // Select first team automatically if none selected
  useEffect(() => {
    if (!selectedTeamId && rankQuery.data && rankQuery.data.length > 0) {
      setSelectedTeamId(rankQuery.data[0].id);
    }
  }, [rankQuery.data, selectedTeamId]);

  // Set default comparison teams
  useEffect(() => {
    if (rankQuery.data && rankQuery.data.length >= 2) {
      if (!compareA) setCompareA(rankQuery.data[0].id);
      if (!compareB) setCompareB(rankQuery.data[1].id);
    }
  }, [rankQuery.data, compareA, compareB]);

  const teams = rankQuery.data ?? [];
  const selectedTeam = teams.find((t) => t.id === selectedTeamId) ?? (teams[0] || null);

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams;
    const q = searchQuery.toLowerCase();
    return teams.filter(
      (t) => t.name.toLowerCase().includes(q) || t.activeCardName?.toLowerCase().includes(q)
    );
  }, [teams, searchQuery]);

  const logs = logsQuery.data ?? [];
  const filteredLogs = useMemo(() => {
    if (logKindFilter === 'all') return logs;
    return logs.filter((l) => l.kind === logKindFilter);
  }, [logs, logKindFilter]);

  // Total stats
  const totalTeams = teams.length;
  const activeCount = teams.filter((t) => t.status === 'playing').length;
  const lockedCount = teams.filter((t) => t.status === 'locked').length;
  const finishedCount = teams.filter((t) => t.status === 'finished').length;
  const totalKeysDiscovered = teams.reduce((acc, t) => acc + t.keys, 0);

  // Teams for comparison
  const teamA = teams.find((t) => t.id === compareA) || null;
  const teamB = teams.find((t) => t.id === compareB) || null;

  /* =========================================================================================
     LOGIN SCREEN
     ========================================================================================= */
  if (!isAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/90 p-8 shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-inner">
              <Shield className="h-7 w-7" />
            </div>
            <h1 className="font-mono text-2xl font-black tracking-[0.25em] text-zinc-100">
              DECODE <span className="text-emerald-400">ADMIN</span>
            </h1>
            <p className="mt-1 font-mono text-xs text-zinc-400">
              Live Competition Leaderboard & Audit Control
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block font-mono text-xs tracking-wider text-zinc-400">
                MASTER ADMIN ACCESS KEY
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="Enter administrator key"
                  autoFocus
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-3.5 pr-12 font-mono text-sm tracking-wider text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-200"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/30 p-3 text-xs text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/15 py-3.5 font-mono text-xs font-bold tracking-[0.2em] text-emerald-300 transition-all hover:border-emerald-400 hover:bg-emerald-500 hover:text-black disabled:opacity-50"
            >
              {loginMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                'ENTER TERMINAL'
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-zinc-900 pt-4 text-center">
            <p className="font-mono text-[11px] text-zinc-600">
              Decryption Protocol v2.4 • Asthra 2026
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================================
     AUTHENTICATED ADMIN DASHBOARD
     ========================================================================================= */
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-black tracking-[0.25em] text-zinc-100">
                  DECODE
                </span>
                <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-emerald-400">
                  LIVE CONTROLLER
                </span>
              </div>
              <p className="font-mono text-[11px] text-zinc-500">
                5 Real Clue Keys / 15 Total Cards Matrix
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Auto-Refresh Status Pill */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
                autoRefresh
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400'
              }`}
            >
              <Radio
                className={`h-3.5 w-3.5 ${autoRefresh ? 'animate-pulse text-emerald-400' : 'text-zinc-600'}`}
              />
              <span className="font-bold">{autoRefresh ? 'LIVE 2.5s' : 'PAUSED'}</span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={() => {
                rankQuery.refetch();
                logsQuery.refetch();
                eventQuery.refetch();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-100"
              title="Refresh All"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${rankQuery.isFetching ? 'animate-spin text-emerald-400' : ''}`}
              />
            </button>

            {/* Room Password Info Pill */}
            <div className="hidden items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 md:flex">
              <Key className="h-3.5 w-3.5 text-zinc-400" />
              <span className="font-mono text-xs text-zinc-400">ROOM PW:</span>
              <span className="font-mono text-xs font-bold text-emerald-300">
                {eventQuery.data?.room_password ?? '...'}
              </span>
              <button
                onClick={() => {
                  setNewRoomPw(eventQuery.data?.room_password ?? '');
                  setEditRoomPw(true);
                }}
                className="ml-1 text-[11px] text-zinc-500 hover:text-zinc-200 underline"
              >
                edit
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:border-red-900 hover:bg-red-950/30 hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">EXIT</span>
            </button>
          </div>
        </div>

        {/* Room password modal edit */}
        {editRoomPw && (
          <div className="border-t border-zinc-800 bg-zinc-900/95 px-6 py-3">
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              <span className="font-mono text-xs text-zinc-300">CHANGE ROOM PASSWORD:</span>
              <input
                type="text"
                value={newRoomPw}
                onChange={(e) => setNewRoomPw(e.target.value)}
                placeholder="Enter new room password"
                className="rounded border border-zinc-700 bg-zinc-950 px-3 py-1 font-mono text-xs text-zinc-100 outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => setPasswordMutation.mutate({ pw, roomPassword: newRoomPw })}
                disabled={setPasswordMutation.isPending || !newRoomPw.trim()}
                className="rounded bg-emerald-600 px-3 py-1 font-mono text-xs font-bold text-black hover:bg-emerald-500 disabled:opacity-50"
              >
                SAVE
              </button>
              <button
                onClick={() => setEditRoomPw(false)}
                className="font-mono text-xs text-zinc-400 hover:text-zinc-200"
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {pwSuccessMsg && (
          <div className="bg-emerald-950/80 px-4 py-1 text-center font-mono text-xs text-emerald-300">
            {pwSuccessMsg}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        {/* Metric Overview Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="font-mono text-[11px] tracking-wider">TEAMS</span>
              <Users className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-1 font-mono text-2xl font-black text-zinc-100">{totalTeams}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="font-mono text-[11px] tracking-wider">ACTIVE NOW</span>
              <Zap className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="mt-1 font-mono text-2xl font-black text-cyan-300">{activeCount}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="font-mono text-[11px] tracking-wider">LOCKED OUT</span>
              <Lock className="h-4 w-4 text-red-400" />
            </div>
            <p className="mt-1 font-mono text-2xl font-black text-red-400">{lockedCount}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="font-mono text-[11px] tracking-wider">FINISHED</span>
              <Award className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="mt-1 font-mono text-2xl font-black text-yellow-300">{finishedCount}</p>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3.5">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="font-mono text-[11px] tracking-wider">KEYS WON</span>
              <Key className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-1 font-mono text-2xl font-black text-emerald-300">
              {totalKeysDiscovered} <span className="text-xs font-normal text-emerald-600">/ {totalTeams * 5}</span>
            </p>
          </div>
        </div>

        {/* 2-Column Split: Leaderboard vs Inspector */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT: Live Leaderboard (7 Cols on desktop) */}
          <div className="flex flex-col lg:col-span-7">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <h2 className="font-mono text-sm font-bold tracking-[0.2em] text-zinc-100">
                  LIVE RANKING SYSTEM
                </h2>
                <span className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                  Key Count & Timestamp Tie-Breaker
                </span>
              </div>

              {/* Search filter */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter team..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/80 py-1 pl-8 pr-3 font-mono text-xs text-zinc-200 outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            {/* Ranking Table */}
            <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="border-b border-zinc-800 bg-zinc-900/90 text-[11px] text-zinc-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-3 w-12 text-center">Rank</th>
                      <th className="px-3 py-3">Team / Player</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3 text-center">Clues (Keys)</th>
                      <th className="px-3 py-3 text-right">Last Key At</th>
                      <th className="px-3 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {filteredTeams.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-zinc-500">
                          {rankQuery.isLoading ? 'Loading live participants...' : 'No players registered yet.'}
                        </td>
                      </tr>
                    ) : (
                      filteredTeams.map((team, index) => {
                        const isSelected = selectedTeam?.id === team.id;
                        const isFinished = team.status === 'finished';
                        const isLocked = team.status === 'locked';

                        return (
                          <tr
                            key={team.id}
                            onClick={() => {
                              setSelectedTeamId(team.id);
                              if (activeTab === 'tiebreak') {
                                if (!compareA) setCompareA(team.id);
                                else if (!compareB && compareA !== team.id) setCompareB(team.id);
                              }
                            }}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-emerald-950/30 ring-1 ring-inset ring-emerald-500/40'
                                : 'hover:bg-zinc-800/40'
                            }`}
                          >
                            {/* Rank Badge */}
                            <td className="px-3 py-3.5 text-center font-bold">
                              {team.rank === 1 ? (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-300 ring-1 ring-yellow-500/50">
                                  🥇
                                </span>
                              ) : team.rank === 2 ? (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-400/20 text-zinc-300 ring-1 ring-zinc-400/50">
                                  🥈
                                </span>
                              ) : team.rank === 3 ? (
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-700/20 text-amber-400 ring-1 ring-amber-700/50">
                                  🥉
                                </span>
                              ) : (
                                <span className="text-zinc-500">#{team.rank}</span>
                              )}
                            </td>

                            {/* Team Name */}
                            <td className="px-3 py-3.5 font-bold text-zinc-100">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{team.name}</span>
                                {isFinished && (
                                  <span className="rounded bg-yellow-400/10 px-1.5 py-0.5 text-[10px] text-yellow-400 ring-1 ring-yellow-400/30">
                                    SOLVED
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] font-normal text-zinc-500">
                                Joined {new Date(team.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {team.startedAt && ` • Started ${new Date(team.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                              </div>
                            </td>

                            {/* Live Status Pill */}
                            <td className="px-3 py-3.5">
                              {isFinished ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                                  🏁 Finished
                                </span>
                              ) : isLocked ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-red-500/20 px-2 py-0.5 text-[11px] font-bold text-red-400">
                                  <Lock className="h-3 w-3" />
                                  Locked ({Math.ceil(team.lockedMs / 1000)}s)
                                </span>
                              ) : team.activeCard ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/15 px-2 py-0.5 text-[11px] font-semibold text-cyan-300">
                                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                  {team.activeCardName || team.activeCard}
                                  {!team.activeCardIsReal && (
                                    <span className="text-[9px] text-zinc-400">(decoy)</span>
                                  )}
                                </span>
                              ) : team.startedAt ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">
                                  Idle on board
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800/60 px-2 py-0.5 text-[11px] text-zinc-500">
                                  In lobby
                                </span>
                              )}
                            </td>

                            {/* Keys Count & 5 Key Chips */}
                            <td className="px-3 py-3.5 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-mono text-xs font-black text-emerald-300">
                                  {team.keys} / 5
                                </span>
                                {/* Visual Chips for Position 1 to 5 */}
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((pos) => {
                                    const keyFound = team.keyDetails.find((k) => k.position === pos);
                                    return (
                                      <span
                                        key={pos}
                                        title={
                                          keyFound
                                            ? `Key ${pos}: ${keyFound.value} (${keyFound.cardName}) - Won at ${new Date(
                                                keyFound.wonAt
                                              ).toLocaleTimeString()}`
                                            : `Key ${pos}: Not found`
                                        }
                                        className={`flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold ${
                                          keyFound
                                            ? 'bg-emerald-500 text-black shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                            : 'bg-zinc-800 text-zinc-600'
                                        }`}
                                      >
                                        {pos}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>

                            {/* Tie-breaker timestamp (Last key won at) */}
                            <td className="px-3 py-3.5 text-right font-mono text-[11px]">
                              {team.finishedAt ? (
                                <div className="text-emerald-300">
                                  {new Date(team.finishedAt).toLocaleTimeString('en-US', {
                                    hour12: false,
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                  })}
                                  .{String(new Date(team.finishedAt).getMilliseconds()).padStart(3, '0')}
                                </div>
                              ) : team.lastKeyAt > 0 ? (
                                <div className="text-zinc-200">
                                  {new Date(team.lastKeyAt).toLocaleTimeString('en-US', {
                                    hour12: false,
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                  })}
                                  <span className="text-zinc-500">
                                    .{String(new Date(team.lastKeyAt).getMilliseconds()).padStart(3, '0')}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-zinc-600">—</span>
                              )}
                              <div className="text-[10px] text-zinc-500">
                                {team.solvedTotal > 0 ? `${team.solvedTotal}/15 challenges` : '0 solved'}
                              </div>
                            </td>

                            {/* Action Button */}
                            <td className="px-3 py-3.5 text-center">
                              {isLocked ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    unlockMutation.mutate({ pw, teamId: team.id });
                                  }}
                                  disabled={unlockMutation.isPending}
                                  className="inline-flex items-center gap-1 rounded bg-red-500/20 px-2 py-1 text-[10px] font-bold text-red-300 transition-colors hover:bg-red-500 hover:text-black"
                                >
                                  <Unlock className="h-3 w-3" />
                                  UNLOCK
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTeamId(team.id);
                                    setActiveTab('audit');
                                  }}
                                  className="rounded border border-zinc-700 bg-zinc-800/80 px-2 py-1 text-[10px] font-semibold text-zinc-300 hover:border-emerald-500 hover:text-emerald-300"
                                >
                                  AUDIT
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tie-breaker Notice Alert */}
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3 text-[11px] text-zinc-400 font-mono">
              <Sparkles className="h-4 w-4 text-yellow-400 shrink-0" />
              <span>
                <strong className="text-zinc-200">Tie-Breaking Protocol:</strong> When teams hold the same key count, the system ranks the team that recovered their latest key earlier as winner. Click <em>Compare</em> on the right panel to inspect exact millisecond offsets.
              </span>
            </div>
          </div>

          {/* RIGHT: Detail Inspector & Player Logs (5 Cols on desktop) */}
          <div className="flex flex-col lg:col-span-5">
            {/* Inspector Tab Switcher */}
            <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-colors ${
                    activeTab === 'audit'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <History className="h-3.5 w-3.5" />
                  PLAYER AUDIT
                </button>

                <button
                  onClick={() => setActiveTab('live')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-colors ${
                    activeTab === 'live'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Radio className="h-3.5 w-3.5" />
                  LIVE STREAM
                </button>

                <button
                  onClick={() => setActiveTab('tiebreak')}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-colors ${
                    activeTab === 'tiebreak'
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <GitCompare className="h-3.5 w-3.5" />
                  TIE-BREAKER
                </button>
              </div>

              {activeTab === 'live' && (
                <select
                  value={logKindFilter}
                  onChange={(e) => setLogKindFilter(e.target.value)}
                  className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1 font-mono text-[11px] text-zinc-300 outline-none"
                >
                  <option value="all">All Events</option>
                  <option value="key">🔑 Keys Only</option>
                  <option value="lock">🔒 Locks Only</option>
                  <option value="start">🎮 Tasks Started</option>
                  <option value="final_ok">🏁 Finishes</option>
                </select>
              )}
            </div>

            {/* TAB 1: Selected Player Audit */}
            {activeTab === 'audit' && (
              <div className="flex flex-1 flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-xl">
                {selectedTeam ? (
                  <>
                    {/* Player Dossier Header */}
                    <div className="mb-4 border-b border-zinc-800 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-mono text-lg font-black text-zinc-100">
                              {selectedTeam.name}
                            </h3>
                            <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-xs font-bold text-emerald-400">
                              RANK #{selectedTeam.rank}
                            </span>
                          </div>
                          <p className="mt-1 font-mono text-xs text-zinc-400">
                            ID: <span className="text-zinc-500">{selectedTeam.id.slice(0, 16)}...</span>
                          </p>
                        </div>

                        {selectedTeam.status === 'locked' && (
                          <button
                            onClick={() => unlockMutation.mutate({ pw, teamId: selectedTeam.id })}
                            disabled={unlockMutation.isPending}
                            className="flex items-center gap-1 rounded bg-red-500 px-2.5 py-1 font-mono text-xs font-bold text-black hover:bg-red-400"
                          >
                            <Unlock className="h-3 w-3" />
                            FORCE UNLOCK
                          </button>
                        )}
                      </div>

                      {/* 5 Real Clue Keys Progress Bar */}
                      <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/80 p-3">
                        <div className="flex items-center justify-between text-xs font-mono mb-2">
                          <span className="text-zinc-400">RECOVERED KEYS MATRIX</span>
                          <span className="font-bold text-emerald-400">
                            {selectedTeam.keys} / 5 Solved
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[1, 2, 3, 4, 5].map((pos) => {
                            const k = selectedTeam.keyDetails.find((item) => item.position === pos);
                            return (
                              <div
                                key={pos}
                                className={`flex flex-col items-center rounded-md p-1.5 text-center font-mono transition-all ${
                                  k
                                    ? 'border border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                                    : 'border border-zinc-800 bg-zinc-900/80 text-zinc-600'
                                }`}
                              >
                                <span className="text-[10px] text-zinc-500">KEY {pos}</span>
                                <span className="text-xs font-black tracking-wider">
                                  {k ? k.value : '—'}
                                </span>
                                {k && (
                                  <span className="mt-0.5 text-[9px] text-emerald-400 font-mono">
                                    {new Date(k.wonAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      second: '2-digit',
                                    })}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Chronological Event Log Timeline */}
                    <div className="flex-1">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-mono text-xs font-bold tracking-wider text-zinc-400">
                          HIGH-PRECISION EVENT LOGS (TIMESTAMP)
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500">
                          {logs.length} logged actions
                        </span>
                      </div>

                      <div className="max-h-[460px] space-y-2 overflow-y-auto pr-1">
                        {logs.length === 0 ? (
                          <div className="py-8 text-center font-mono text-xs text-zinc-500">
                            No logs recorded for this player yet.
                          </div>
                        ) : (
                          logs.map((log) => {
                            const isKey = log.kind === 'key';
                            const isLock = log.kind === 'lock';
                            const isFinal = log.kind === 'final_ok' || log.kind === 'final_fail';
                            const isStart = log.kind === 'start';

                            return (
                              <div
                                key={log.id}
                                className={`flex flex-col gap-1 rounded-lg border p-2.5 font-mono text-xs transition-colors ${
                                  isKey
                                    ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
                                    : isLock
                                    ? 'border-red-500/40 bg-red-950/20 text-red-200'
                                    : isFinal
                                    ? 'border-yellow-500/40 bg-yellow-950/20 text-yellow-200'
                                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center gap-1.5 font-bold">
                                    {isKey && <Key className="h-3.5 w-3.5 text-emerald-400" />}
                                    {isLock && <Lock className="h-3.5 w-3.5 text-red-400" />}
                                    {isFinal && <Trophy className="h-3.5 w-3.5 text-yellow-400" />}
                                    {isStart && <Zap className="h-3.5 w-3.5 text-cyan-400" />}
                                    <span className="uppercase">{log.kind.replace('_', ' ')}</span>
                                  </span>
                                  <span className="font-mono text-[11px] font-semibold text-zinc-400">
                                    {log.formattedTime}
                                  </span>
                                </div>

                                {(log.cardName || log.cardId) && (
                                  <div className="text-[11px] text-zinc-300">
                                    Task:{' '}
                                    <span className="font-semibold text-zinc-100">
                                      {log.cardName || log.cardId}
                                    </span>{' '}
                                    {log.isReal ? (
                                      <span className="text-emerald-400">
                                        (Real Clue Card • Key #{log.keyPosition})
                                      </span>
                                    ) : (
                                      <span className="text-zinc-500">(Decoy Challenge)</span>
                                    )}
                                  </div>
                                )}

                                {log.detail && (
                                  <div className="text-[10px] text-zinc-400">
                                    Details: <span className="text-zinc-300">{log.detail}</span>
                                  </div>
                                )}

                                <div className="text-[9px] text-zinc-600">
                                  Date: {log.formattedDate} • ISO: {log.at}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-64 flex-col items-center justify-center text-center text-zinc-500 font-mono text-xs">
                    <User className="mb-2 h-8 w-8 text-zinc-600" />
                    Select a player from the leaderboard to inspect their full timeline.
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Live Rolling Stream (All Players) */}
            {activeTab === 'live' && (
              <div className="flex flex-1 flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-xl">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-mono text-xs font-bold text-zinc-200">
                      LIVE AUDIT FEED (ALL PLAYERS)
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-zinc-500">
                    {filteredLogs.length} events
                  </span>
                </div>

                <div className="max-h-[580px] space-y-2 overflow-y-auto pr-1">
                  {filteredLogs.length === 0 ? (
                    <div className="py-12 text-center font-mono text-xs text-zinc-500">
                      No matching events in the live stream.
                    </div>
                  ) : (
                    filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-2.5 font-mono text-xs transition-colors hover:border-zinc-700"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-emerald-400">{log.teamName}</span>
                          <span className="text-zinc-500">{log.formattedTime}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                              log.kind === 'key'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : log.kind === 'lock'
                                ? 'bg-red-500/20 text-red-300'
                                : log.kind === 'final_ok'
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {log.kind}
                          </span>
                          <span className="text-zinc-300 text-[11px]">
                            {log.cardName || log.cardId || log.detail || 'Action'}
                          </span>
                        </div>
                        {log.detail && (
                          <p className="mt-1 text-[10px] text-zinc-500">{log.detail}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Tie-Breaker Comparison Tool */}
            {activeTab === 'tiebreak' && (
              <div className="flex flex-1 flex-col rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 shadow-xl">
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <GitCompare className="h-4 w-4 text-yellow-400" />
                    <h3 className="font-mono text-sm font-bold text-zinc-100">
                      HEAD-TO-HEAD TIE BREAKER
                    </h3>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-zinc-400">
                    Compare key timestamps down to milliseconds between two players to resolve game ties.
                  </p>
                </div>

                {/* Team Selectors */}
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-mono text-[10px] text-zinc-400">
                      PLAYER / TEAM A
                    </label>
                    <select
                      value={compareA ?? ''}
                      onChange={(e) => setCompareA(e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 font-mono text-xs text-zinc-200 outline-none focus:border-yellow-500"
                    >
                      <option value="">Select Team A</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          #{t.rank} {t.name} ({t.keys} keys)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block font-mono text-[10px] text-zinc-400">
                      PLAYER / TEAM B
                    </label>
                    <select
                      value={compareB ?? ''}
                      onChange={(e) => setCompareB(e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 font-mono text-xs text-zinc-200 outline-none focus:border-yellow-500"
                    >
                      <option value="">Select Team B</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          #{t.rank} {t.name} ({t.keys} keys)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {teamA && teamB ? (
                  <div className="space-y-4">
                    {/* Winner announcement pill */}
                    <div className="rounded-xl border border-yellow-500/40 bg-yellow-950/20 p-3 text-center">
                      <p className="font-mono text-[11px] uppercase tracking-wider text-yellow-400">
                        OFFICIAL TIE-BREAKER VERDICT
                      </p>
                      <p className="mt-1 font-mono text-base font-black text-yellow-200">
                        {teamA.rank < teamB.rank ? (
                          <>🏆 {teamA.name} takes precedence</>
                        ) : teamB.rank < teamA.rank ? (
                          <>🏆 {teamB.name} takes precedence</>
                        ) : (
                          <>Both players are perfectly tied</>
                        )}
                      </p>
                      <p className="mt-1 font-mono text-xs text-zinc-400">
                        {teamA.keys !== teamB.keys ? (
                          `${teamA.keys > teamB.keys ? teamA.name : teamB.name} has more clue keys (${Math.max(teamA.keys, teamB.keys)} vs ${Math.min(teamA.keys, teamB.keys)}).`
                        ) : teamA.finishedAt && teamB.finishedAt ? (
                          `Finished difference: ${Math.abs(teamA.finishedAt - teamB.finishedAt) / 1000}s.`
                        ) : teamA.lastKeyAt && teamB.lastKeyAt ? (
                          `Key tie-breaker: ${teamA.lastKeyAt < teamB.lastKeyAt ? teamA.name : teamB.name} found key ${(Math.abs(teamA.lastKeyAt - teamB.lastKeyAt) / 1000).toFixed(3)}s earlier.`
                        ) : (
                          'Compared by initial start timestamp.'
                        )}
                      </p>
                    </div>

                    {/* Side-by-side Keys breakdown */}
                    <div className="space-y-2 font-mono text-xs">
                      <p className="text-[11px] font-bold text-zinc-400 tracking-wider">
                        KEY-BY-KEY TIMESTAMP COMPARISON (POSITIONS 1–5)
                      </p>
                      {[1, 2, 3, 4, 5].map((pos) => {
                        const kA = teamA.keyDetails.find((k) => k.position === pos);
                        const kB = teamB.keyDetails.find((k) => k.position === pos);

                        const aFaster =
                          kA && kB ? kA.wonAtMs < kB.wonAtMs : kA && !kB ? true : false;
                        const bFaster =
                          kA && kB ? kB.wonAtMs < kA.wonAtMs : kB && !kA ? true : false;

                        return (
                          <div
                            key={pos}
                            className="grid grid-cols-11 items-center rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-[11px]"
                          >
                            {/* Team A side */}
                            <div className="col-span-5 flex items-center justify-between pr-2">
                              <span
                                className={`font-semibold ${
                                  aFaster ? 'text-emerald-400' : kA ? 'text-zinc-300' : 'text-zinc-600'
                                }`}
                              >
                                {kA ? `${kA.value} • ${new Date(kA.wonAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}.${String(new Date(kA.wonAt).getMilliseconds()).padStart(3, '0')}` : 'Not Found'}
                              </span>
                              {aFaster && <span className="text-[10px] text-emerald-400 font-bold">★ Faster</span>}
                            </div>

                            {/* Position Badge in Center */}
                            <div className="col-span-1 text-center font-bold text-zinc-500">
                              K{pos}
                            </div>

                            {/* Team B side */}
                            <div className="col-span-5 flex items-center justify-between pl-2">
                              {bFaster && <span className="text-[10px] text-emerald-400 font-bold">★ Faster</span>}
                              <span
                                className={`font-semibold ml-auto ${
                                  bFaster ? 'text-emerald-400' : kB ? 'text-zinc-300' : 'text-zinc-600'
                                }`}
                              >
                                {kB ? `${kB.value} • ${new Date(kB.wonAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}.${String(new Date(kB.wonAt).getMilliseconds()).padStart(3, '0')}` : 'Not Found'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Overall Summary Details */}
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 font-mono text-[11px] text-zinc-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Total Keys Held:</span>
                        <span className="font-bold text-zinc-200">
                          {teamA.name}: {teamA.keys} | {teamB.name}: {teamB.keys}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Key Timestamp:</span>
                        <span className="font-bold text-zinc-200">
                          {teamA.lastKeyAt ? new Date(teamA.lastKeyAt).toLocaleTimeString() : '—'} vs{' '}
                          {teamB.lastKeyAt ? new Date(teamB.lastKeyAt).toLocaleTimeString() : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Solved Challenges:</span>
                        <span className="font-bold text-zinc-200">
                          {teamA.solvedTotal} vs {teamB.solvedTotal}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center font-mono text-xs text-zinc-500">
                    Select two players above to inspect their side-by-side tie breaker data.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}