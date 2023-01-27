import { TRPCError } from '@trpc/server'
import { t } from './TRPC'

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  const isAuth = ctx.auth.isAuthenticated

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

const publicProcedure = t.procedure
const protectedProcedure = t.procedure.use(isAuthenticated)

const procedure = Object.assign(publicProcedure, {
  protected: protectedProcedure,
})

export default procedure
