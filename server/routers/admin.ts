import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { db, log } from '../db';
import { CARDS, byId } from '../cards';

const getCleanAdminPassword = () => {
  const envPw = process.env.ADMIN_PASSWORD ?? '';
  return envPw.trim().replace(/^["']|["']$/g, '');
};

const guard = (pw: string) => {
  const expected = getCleanAdminPassword();
  const input = (pw ?? '').trim().replace(/^["']|["']$/g, '');
  if (!expected || input !== expected) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid admin password.' });
  }
};

export interface KeyDetail {
  position: number;
  value: string;
  cardId: string;
  cardName: string;
  wonAt: string;
  wonAtMs: number;
}

export interface RankRow {
  id: string;
  name: string;
  rank: number;
  status: 'finished' | 'locked' | 'playing' | 'idle' | 'lobby';
  keys: number;
  totalClues: number;
  keyDetails: KeyDetail[];
  lastKeyAt: number;
  startedAt: number | null;
  createdAt: number;
  finishedAt: number | null;
  elapsedMs: number;
  lockedMs: number;
  activeCard: string | null;
  activeCardName: string | null;
  activeCardIsReal: boolean;
  solvedTotal: number;
  solvedReal: number;
  solvedDecoys: number;
}

export interface LogItem {
  id: number;
  teamId: string;
  teamName: string;
  kind: string;
  cardId: string | null;
  cardName: string | null;
  isReal: boolean;
  keyPosition: number | null;
  detail: string | null;
  at: string;
  timestampMs: number;
  formattedTime: string;
  formattedDate: string;
}

export const adminRouter = router({
  login: publicProcedure
    .input(z.object({ pw: z.string() }))
    .mutation(async ({ input }) => {
      guard(input.pw);
      const { data: ev } = await db.from('event').select('*').eq('id', 1).single();
      return {
        ok: true,
        roomPassword: ev?.room_password ?? 'DECODE1826',
        eventState: ev?.state ?? 'lobby',
      };
    }),

  event: publicProcedure
    .input(z.object({ pw: z.string() }))
    .query(async ({ input }) => {
      guard(input.pw);
      const { data: ev } = await db.from('event').select('*').eq('id', 1).single();
      return ev;
    }),

  ranking: publicProcedure
    .input(z.object({ pw: z.string() }))
    .query(async ({ input }): Promise<RankRow[]> => {
      guard(input.pw);

      const { data: teams } = await db.from('teams').select('*').order('created_at');
      const { data: keys } = await db
        .from('keys')
        .select('team_id, position, value, card_id, won_at');
      const { data: progress } = await db
        .from('progress')
        .select('team_id, card_id, solved_at, attempts');

      const totalClues = CARDS.filter((c) => c.real).length; // 5 real clue cards

      const rows = (teams ?? []).map((t) => {
        const teamKeys = (keys ?? []).filter((k) => k.team_id === t.id);
        const teamProg = (progress ?? []).filter((p) => p.team_id === t.id && p.solved_at);

        const keyDetails: KeyDetail[] = teamKeys
          .map((k) => {
            const card = byId(k.card_id);
            const wonAtMs = k.won_at ? new Date(k.won_at).getTime() : 0;
            return {
              position: k.position,
              value: k.value,
              cardId: k.card_id,
              cardName: card?.name ?? k.card_id,
              wonAt: k.won_at,
              wonAtMs,
            };
          })
          .sort((a, b) => a.position - b.position);

        const lastKeyAt = keyDetails.length
          ? Math.max(...keyDetails.map((k) => k.wonAtMs))
          : 0;

        const lockedMs = t.locked_until
          ? Math.max(0, new Date(t.locked_until).getTime() - Date.now())
          : 0;

        const startedAt = t.started_at ? new Date(t.started_at).getTime() : null;
        const createdAt = t.created_at ? new Date(t.created_at).getTime() : Date.now();
        const finishedAt = t.finished_at ? new Date(t.finished_at).getTime() : null;

        let elapsedMs = 0;
        if (finishedAt && startedAt) {
          elapsedMs = Math.max(0, finishedAt - startedAt);
        } else if (startedAt) {
          elapsedMs = Math.max(0, Date.now() - startedAt);
        }

        let status: 'finished' | 'locked' | 'playing' | 'idle' | 'lobby' = 'lobby';
        if (finishedAt) {
          status = 'finished';
        } else if (lockedMs > 0) {
          status = 'locked';
        } else if (t.active_card) {
          status = 'playing';
        } else if (startedAt) {
          status = 'idle';
        }

        const activeCardObj = t.active_card ? byId(t.active_card) : null;
        const solvedReal = teamProg.filter((p) => byId(p.card_id)?.real).length;
        const solvedDecoys = teamProg.filter((p) => !byId(p.card_id)?.real).length;

        return {
          id: t.id as string,
          name: t.name as string,
          status,
          keys: keyDetails.length,
          totalClues,
          keyDetails,
          lastKeyAt,
          startedAt,
          createdAt,
          finishedAt,
          elapsedMs,
          lockedMs,
          activeCard: (t.active_card ?? null) as string | null,
          activeCardName: activeCardObj ? activeCardObj.name : t.active_card ?? null,
          activeCardIsReal: activeCardObj?.real ?? false,
          solvedTotal: teamProg.length,
          solvedReal,
          solvedDecoys,
          rank: 0,
        };
      });

      // Tie-Breaking Ranking Sort:
      // 1. Finished teams first, sorted by earliest finishedAt ascending
      // 2. Teams still playing, sorted by keys count descending (5 > 4 > 3 > 2 > 1 > 0)
      // 3. TIE-BREAKER: For teams with equal keys count (> 0), earliest lastKeyAt ascending wins!
      // 4. Secondary tie-breaker: Total challenges completed (solvedTotal descending)
      // 5. Tertiary tie-breaker: Earlier startedAt or createdAt ascending
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

      return rows.map((r, index) => ({
        ...r,
        rank: index + 1,
      }));
    }),

  logs: publicProcedure
    .input(
      z.object({
        pw: z.string(),
        teamId: z.string().optional(),
        kind: z.string().optional(),
        limit: z.number().default(150).optional(),
      })
    )
    .query(async ({ input }): Promise<LogItem[]> => {
      guard(input.pw);

      let query = db
        .from('logs')
        .select('id, team_id, kind, card_id, detail, at, teams(name)')
        .order('at', { ascending: false })
        .limit(input.limit ?? 150);

      if (input.teamId) {
        query = query.eq('team_id', input.teamId);
      }
      if (input.kind && input.kind !== 'all') {
        query = query.eq('kind', input.kind);
      }

      const { data } = await query;

      return (data ?? []).map((l: any) => {
        const cardObj = l.card_id ? byId(l.card_id) : null;
        const d = new Date(l.at);
        const teamName =
          (Array.isArray(l.teams) ? l.teams[0]?.name : l.teams?.name) ?? 'Unknown Player';

        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        const ms = String(d.getMilliseconds()).padStart(3, '0');

        return {
          id: l.id,
          teamId: l.team_id,
          teamName,
          kind: l.kind,
          cardId: l.card_id,
          cardName: cardObj ? cardObj.name : l.card_id ?? null,
          isReal: cardObj?.real ?? false,
          keyPosition: cardObj?.key?.position ?? null,
          detail: l.detail,
          at: l.at,
          timestampMs: d.getTime(),
          formattedTime: `${hours}:${minutes}:${seconds}.${ms}`,
          formattedDate: d.toLocaleDateString(),
        };
      });
    }),

  setPassword: publicProcedure
    .input(z.object({ pw: z.string(), roomPassword: z.string().min(3) }))
    .mutation(async ({ input }) => {
      guard(input.pw);
      await db.from('event').update({ room_password: input.roomPassword.trim() }).eq('id', 1);
      return { ok: true };
    }),

  unlock: publicProcedure
    .input(z.object({ pw: z.string(), teamId: z.string() }))
    .mutation(async ({ input }) => {
      guard(input.pw);
      await db.from('teams')
        .update({ locked_until: null, active_card: null }).eq('id', input.teamId);
      await log(input.teamId, 'admin_unlock', undefined, 'Lock cleared by administrator');
      return { ok: true };
    }),
});