import { router } from '../trpc';
import { teamRouter } from './team';
import { gameRouter } from './game';
import { adminRouter } from './admin';

export const appRouter = router({ team: teamRouter, game: gameRouter, admin: adminRouter });
export type AppRouter = typeof appRouter;