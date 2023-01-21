declare module '@ioc:Pyxlab/Adonis/Trpc/Middleware' {
  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
  import { AdonisTrpcConfig } from '@ioc:Pyxlab/Adonis/Trpc'

  export interface TrpcMiddlewareContract {
    new (config: AdonisTrpcConfig): {
      handle: (ctx: HttpContextContract, next: () => Promise<void>) => Promise<void>
    }
  }

  const TrpcMiddleware: TrpcMiddlewareContract

  export default TrpcMiddleware
}
