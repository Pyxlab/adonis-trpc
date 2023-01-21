import { router, publicProcedure } from '@ioc:Pyxlab/Adonis/Trpc';

const appRouter = router({
  hello: publicProcedure.query(() => ({ message: 'Hello world!' }))
});

export default appRouter;

export type AppRouter = typeof appRouter;
