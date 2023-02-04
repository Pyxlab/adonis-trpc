import { initTRPC } from '@trpc/server'

import superjson from 'superjson'
import { Context } from './Context'

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape
  },
})

export const router = t.router

export { TRPCError } from '@trpc/server'
