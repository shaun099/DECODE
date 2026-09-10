import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { currentTeamId } from './session';

export async function createContext() {
  return { teamId: await currentTeamId() };
}
type Ctx = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Ctx>().create({ transformer: superjson });

export const router = t.router;
export const publicProcedure = t.procedure;

export const teamProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.teamId) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { teamId: ctx.teamId } });
});