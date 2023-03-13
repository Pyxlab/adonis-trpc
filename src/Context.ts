import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { inferAsyncReturnType } from '@trpc/server'

export const createContext = async (ctx: HttpContextContract) => {
  return ctx
}

export type Context = inferAsyncReturnType<typeof createContext>
