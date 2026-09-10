import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { db } from '../db';

const guard = (pw: string) => {
  if (pw !== process.env.ADMIN_PASSWORD) throw new TRPCError({ code: 'UNAUTHORIZED' });
};

export interface RankRow {
  id: string;
  name: string;
  keys: number;
  lastKeyAt: number;
  finishedAt: number | null;
  lockedMs: number;
}

export const adminRouter = router({
  ranking: publicProcedure
    .input(z.object({ pw: z.string() }))
    .query(async ({ input }): Promise<RankRow[]> => {
      guard(input.pw);

      const { data: teams } = await db.from('teams').select('*').order('created_at');
      const { data: keys } = await db.from('keys').select('team_id, position, won_at');

      const rows: RankRow[] = (teams ?? []).map((t) => {
        const mine = (keys ?? []).filter((k) => k.team_id === t.id);
        const last = mine.length ? Math.max(...mine.map((k) => +new Date(k.won_at))) : 0;
        return {
          id: t.id,
          name: t.name,
          keys: mine.length,
          lastKeyAt: last,
          finishedAt: t.finished_at ? +new Date(t.finished_at) : null,
          lockedMs: t.locked_until ? Math.max(0, +new Date(t.locked_until) - Date.now()) : 0,
        };
      });

      rows.sort((a, b) => {
        if (a.finishedAt && b.finishedAt) return a.finishedAt - b.finishedAt;
        if (a.finishedAt) return -1;
        if (b.finishedAt) return 1;
        if (b.keys !== a.keys) return b.keys - a.keys;
        return a.lastKeyAt - b.lastKeyAt;
      });

      return rows;
    }),

  logs: publicProcedure
    .input(z.object({ pw: z.string() }))
    .query(async ({ input }) => {
      guard(input.pw);
      const { data } = await db
        .from('logs')
        .select('id, kind, card_id, detail, at, teams(name)')
        .order('at', { ascending: false })
        .limit(60);
      return data ?? [];
    }),

  setPassword: publicProcedure
    .input(z.object({ pw: z.string(), roomPassword: z.string().min(3) }))
    .mutation(async ({ input }) => {
      guard(input.pw);
      await db.from('event').update({ room_password: input.roomPassword }).eq('id', 1);
      return { ok: true };
    }),

  unlock: publicProcedure
    .input(z.object({ pw: z.string(), teamId: z.string() }))
    .mutation(async ({ input }) => {
      guard(input.pw);
      await db.from('teams')
        .update({ locked_until: null, active_card: null }).eq('id', input.teamId);
      return { ok: true };
    }),
});