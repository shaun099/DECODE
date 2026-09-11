import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, teamProcedure } from '../trpc';
import { db, log } from '../db';
import { CARDS, boardView, byId } from '../cards';

const LOCK_MS = 60_000;
const GAME_MS = 3 * 60 * 60 * 1000;

async function getTeam(id: string) {
  const { data } = await db.from('teams').select('*').eq('id', id).single();
  return data!;
}

const lockedFor = (t: { locked_until: string | null }) =>
  t.locked_until ? Math.max(0, new Date(t.locked_until).getTime() - Date.now()) : 0;

const timeLeft = (t: { started_at: string | null }) =>
  t.started_at ? Math.max(0, new Date(t.started_at).getTime() + GAME_MS - Date.now()) : GAME_MS;

export const gameRouter = router({
  state: teamProcedure.query(async ({ ctx }) => {
    const t = await getTeam(ctx.teamId);
    const { data: keys } = await db
      .from('keys').select('*').eq('team_id', ctx.teamId).order('position');
    const { data: prog } = await db
      .from('progress').select('card_id, solved_at').eq('team_id', ctx.teamId);

    const startedAt = t.started_at ? +new Date(t.started_at) : null;
    const remainingMs = timeLeft(t);

    return {
      teamName: t.name as string,
      startedAt,
      remainingMs,
      expired: !!startedAt && remainingMs <= 0,
      lockedMs: lockedFor(t),
      activeCard: (t.active_card ?? null) as string | null,
      finished: !!t.finished_at,
      totalKeys: CARDS.filter((c) => c.real).length,
      keys: (keys ?? []) as { position: number; value: string; card_id: string }[],
      board: boardView(t.seed).map((c) => ({
        ...c,
        solved: !!prog?.find((p) => p.card_id === c.id && p.solved_at),
      })),
      serverNow: Date.now(),
    };
  }),

  /** Stamps the three-hour clock. Safe to call twice — it only writes once. */
  begin: teamProcedure.mutation(async ({ ctx }) => {
    const t = await getTeam(ctx.teamId);
    if (t.started_at) return { startedAt: +new Date(t.started_at) };
    const now = new Date().toISOString();
    await db.from('teams').update({ started_at: now }).eq('id', ctx.teamId);
    await log(ctx.teamId, 'begin');
    return { startedAt: +new Date(now) };
  }),

  /** Read-only briefing. Does NOT commit the team. */
  brief: teamProcedure
    .input(z.object({ cardId: z.string() }))
    .query(async ({ ctx, input }) => {
      const t = await getTeam(ctx.teamId);
      if (timeLeft(t) <= 0 && t.started_at)
        throw new TRPCError({ code: 'FORBIDDEN', message: 'time is up' });
      if (lockedFor(t) > 0) throw new TRPCError({ code: 'FORBIDDEN', message: 'locked' });
      if (t.active_card && t.active_card !== input.cardId)
        throw new TRPCError({ code: 'FORBIDDEN', message: 'another task is in progress' });

      const card = byId(input.cardId);
      if (!card) throw new TRPCError({ code: 'NOT_FOUND' });

      const { data: p } = await db.from('progress')
        .select('solved_at').eq('team_id', ctx.teamId).eq('card_id', card.id).maybeSingle();

      return {
        name: card.name,
        teaser: card.teaser,
        rules: card.rules,
        maxWrong: card.maxWrong,
        committed: t.active_card === card.id,
        solved: !!p?.solved_at,
      };
    }),

  /** Commits the team. No exit until solved or locked. */
  start: teamProcedure
    .input(z.object({ cardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const t = await getTeam(ctx.teamId);
      if (timeLeft(t) <= 0 && t.started_at)
        throw new TRPCError({ code: 'FORBIDDEN', message: 'time is up' });
      if (lockedFor(t) > 0) throw new TRPCError({ code: 'FORBIDDEN', message: 'locked' });
      if (t.active_card && t.active_card !== input.cardId)
        throw new TRPCError({ code: 'FORBIDDEN', message: 'another task is in progress' });

      const card = byId(input.cardId);
      if (!card) throw new TRPCError({ code: 'NOT_FOUND' });

      const { data: existing } = await db.from('progress')
        .select('*').eq('team_id', ctx.teamId).eq('card_id', card.id).maybeSingle();

      let state = existing?.state;
      if (!existing) {
        state = card.init();
        await db.from('progress').insert({ team_id: ctx.teamId, card_id: card.id, state });
      }

      await db.from('teams').update({ active_card: card.id }).eq('id', ctx.teamId);
      await log(ctx.teamId, 'start', card.id);

      return {
        name: card.name,
        maxWrong: card.maxWrong,
        wrong: existing?.attempts ?? 0,
        attemptsLeft: Math.max(0, card.maxWrong - (existing?.attempts ?? 0)),
        view: card.view(state),
      };
    }),

  attempt: teamProcedure
    .input(z.object({ cardId: z.string(), payload: z.any() }))
    .mutation(async ({ ctx, input }) => {
      const t = await getTeam(ctx.teamId);
      if (timeLeft(t) <= 0 && t.started_at)
        throw new TRPCError({ code: 'FORBIDDEN', message: 'time is up' });
      if (lockedFor(t) > 0) throw new TRPCError({ code: 'FORBIDDEN', message: 'locked' });
      if (t.active_card !== input.cardId)
        throw new TRPCError({ code: 'FORBIDDEN', message: 'not the committed task' });

      const card = byId(input.cardId);
      if (!card) throw new TRPCError({ code: 'NOT_FOUND' });

      const { data: row } = await db.from('progress')
        .select('*').eq('team_id', ctx.teamId).eq('card_id', card.id).single();
      if (!row || row.solved_at) throw new TRPCError({ code: 'BAD_REQUEST' });

      const res = card.attempt(row.state, input.payload);
      const attempts = row.attempts + (res.correct ? 0 : 1);

      /* attempts exhausted -> lock, and reset the card */
      if ((!res.correct && attempts >= card.maxWrong) || (res as any).exhausted) {
        const until = new Date(Date.now() + LOCK_MS).toISOString();
        await db.from('progress')
          .update({ state: card.init(), attempts: 0 })
          .eq('team_id', ctx.teamId).eq('card_id', card.id);
        await db.from('teams')
          .update({ locked_until: until, active_card: null }).eq('id', ctx.teamId);
        await log(ctx.teamId, 'lock', card.id, 'attempts exhausted');
        return {
          correct: false,
          done: false,
          locked: true,
          lockMs: LOCK_MS,
          attemptsLeft: 0,
          lastAnswer: (res as any).lastAnswer ?? null,
          lastPick: (res as any).lastPick ?? null,
          key: null as null | { value: string; position: number },
          nextClue: null as string | null,
          view: null,
        };
      }

      /* still going */
      if (!res.done) {
        await db.from('progress').update({ state: res.state, attempts })
          .eq('team_id', ctx.teamId).eq('card_id', card.id);
        return {
          correct: res.correct,
          done: false,
          locked: false,
          lockMs: 0,
          attemptsLeft: Math.max(0, card.maxWrong - attempts),
          lastAnswer: (res as any).lastAnswer ?? null,
          lastPick: (res as any).lastPick ?? null,
          key: null as null | { value: string; position: number },
          nextClue: null as string | null,
          view: card.view(res.state),
        };
      }

      /* solved */
      await db.from('progress')
        .update({ state: res.state, attempts, solved_at: new Date().toISOString() })
        .eq('team_id', ctx.teamId).eq('card_id', card.id);
      await db.from('teams').update({ active_card: null }).eq('id', ctx.teamId);

      if (card.real && card.key) {
        await db.from('keys').upsert({
          team_id: ctx.teamId,
          position: card.key.position,
          value: card.key.value,
          card_id: card.id,
          won_at: new Date().toISOString(),
        });
        await log(ctx.teamId, 'key', card.id, `position ${card.key.position}`);
        return {
          correct: true,
          done: true,
          locked: false,
          lockMs: 0,
          attemptsLeft: Math.max(0, card.maxWrong - attempts),
          lastAnswer: (res as any).lastAnswer ?? null,
          lastPick: (res as any).lastPick ?? null,
          key: card.key,
          nextClue: card.nextClue ?? null,
          view: null,
        };
      }

      await log(ctx.teamId, 'decoy', card.id);
      return {
        correct: true,
        done: true,
        locked: false,
        lockMs: 0,
        attemptsLeft: Math.max(0, card.maxWrong - attempts),
        lastAnswer: (res as any).lastAnswer ?? null,
        lastPick: (res as any).lastPick ?? null,
        key: null as null | { value: string; position: number },
        nextClue: null as string | null,
        view: null,
      };
    }),

  final: teamProcedure
    .input(z.object({ answer: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const t = await getTeam(ctx.teamId);
      if (timeLeft(t) <= 0 && t.started_at)
        throw new TRPCError({ code: 'FORBIDDEN', message: 'time is up' });

      const { data: keys } = await db
        .from('keys').select('*').eq('team_id', ctx.teamId).order('position');

      const need = CARDS.filter((c) => c.real).length;
      if ((keys?.length ?? 0) < need)
        throw new TRPCError({ code: 'FORBIDDEN', message: 'not all keys held' });

      const expected = keys!.map((k) => k.value).join('');
      const ok = input.answer.trim().toUpperCase() === expected.toUpperCase();

      await log(ctx.teamId, ok ? 'final_ok' : 'final_fail', undefined, input.answer);
      if (ok) {
        await db.from('teams')
          .update({ finished_at: new Date().toISOString() }).eq('id', ctx.teamId);
      }
      return { ok };
    }),
});