import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: teams } = await db.from('teams').select('*').order('created_at');
    const { data: keys } = await db
      .from('keys')
      .select('team_id, position, value, card_id, won_at');
    const { data: progress } = await db
      .from('progress')
      .select('team_id, card_id, solved_at, attempts');

    const rows = (teams ?? []).map((t) => {
      const teamKeys = (keys ?? []).filter((k) => k.team_id === t.id);
      const teamProg = (progress ?? []).filter((p) => p.team_id === t.id && p.solved_at);
      const wonAtTimes = teamKeys.map((k) => (k.won_at ? new Date(k.won_at).getTime() : 0));
      const lastKeyAt = wonAtTimes.length ? Math.max(...wonAtTimes) : 0;
      const startedAt = t.started_at ? new Date(t.started_at).getTime() : null;
      const createdAt = t.created_at ? new Date(t.created_at).getTime() : Date.now();
      const finishedAt = t.finished_at ? new Date(t.finished_at).getTime() : null;

      return {
        id: t.id as string,
        name: t.name as string,
        keys: teamKeys.length,
        lastKeyAt,
        startedAt,
        createdAt,
        finishedAt,
        solvedTotal: teamProg.length,
      };
    });

    // Tie-Breaking Ranking Sort
    rows.sort((a, b) => {
      if (a.finishedAt && b.finishedAt) return a.finishedAt - b.finishedAt;
      if (a.finishedAt) return -1;
      if (b.finishedAt) return 1;

      if (b.keys !== a.keys) return b.keys - a.keys;

      if (a.keys > 0 && b.keys > 0 && a.lastKeyAt !== b.lastKeyAt) {
        return a.lastKeyAt - b.lastKeyAt;
      }

      if (b.solvedTotal !== a.solvedTotal) {
        return b.solvedTotal - a.solvedTotal;
      }

      const aStart = a.startedAt ?? a.createdAt;
      const bStart = b.startedAt ?? b.createdAt;
      return aStart - bStart;
    });

    const top5 = rows.slice(0, 5).map((r, index) => ({
      position: index + 1,
      name: r.name,
    }));

    return NextResponse.json({ leaderboard: top5 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

