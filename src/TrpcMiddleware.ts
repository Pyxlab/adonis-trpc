import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { AdonisTrpcConfig } from '@ioc:Pyxlab/Adonis/Trpc'
import { resolveHTTPResponse } from '@trpc/server/http'
import { createContext } from './Context'

export class TrpcMiddleware {
  constructor(private config: AdonisTrpcConfig) {}

  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    const { request, response, auth } = ctx

    await auth.check()

    const url = new URL(request.completeUrl(true))

    const isTrpcRoute = url.pathname.startsWith(this.config.basePath)

    if (isTrpcRoute) {
      const path = url.pathname.slice(this.config.basePath.length + 1)

      const { default: router } = await this.config.router()

      const { body, status, headers } = await resolveHTTPResponse({
        createContext: () => createContext(ctx),
        router,
        path,
        req: {
          query: url.searchParams,
          method: request.method(),
          headers: request.headers(),
          body: request.body(),
        },
      })
      if (headers) {
        Object.keys(headers).forEach((key) => {
          const value = headers[key]
          if (value) response.header(key, value)
        })
      }
      response.status(status)
      response.send(body)
    } else {
      await next()
    }
  }
}
