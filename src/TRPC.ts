import { initTRPC, TRPCError } from '@trpc/server'

import superjson from 'superjson'
import { Context } from './Context'

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape
  },
})

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  const isAuth = ctx.auth.check()

  if (!isAuth) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated',
    })
  }

  return next({
    ctx,
  })
})

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthenticated)
