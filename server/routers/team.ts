import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { db, log } from '../db';
import { setSession } from '../session';

export const teamRouter = router({
  join: publicProcedure
    .input(z.object({ name: z.string().trim().min(2).max(40), password: z.string() }))
    .mutation(async ({ input }) => {
      const { data: ev } = await db.from('event').select('*').eq('id', 1).single();
      if (!ev || input.password !== ev.room_password) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Wrong room password.' });
      }

      const name = input.name.replace(/\s+/g, ' ');
      const { data: existing } = await db
        .from('teams').select('id').ilike('name', name).maybeSingle();

      let id = existing?.id as string | undefined;
      if (!id) {
        const { data, error } = await db.from('teams').insert({ name }).select('id').single();
        if (error) throw new TRPCError({ code: 'CONFLICT', message: 'That name is taken.' });
        id = data.id;
      }

      await setSession(id!);
      await log(id!, 'join');
      return { ok: true };
    }),
}); 