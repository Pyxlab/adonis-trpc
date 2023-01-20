import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { inferAsyncReturnType } from '@trpc/server'

export const createContext = async ({ auth }: HttpContextContract) => {
  return {
    auth,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
