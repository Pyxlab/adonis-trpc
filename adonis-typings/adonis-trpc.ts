declare module '@ioc:Pyxlab/Adonis/Trpc' {
  import { AnyRouter } from '@trpc/server'

  export const t: typeof import('../src/TRPC').t

  export const router: typeof import('../src/TRPC').router
  export const publicProcedure: typeof import('../src/TRPC').publicProcedure
  export const protectedProcedure: typeof import('../src/TRPC').protectedProcedure

  /**
   * TRPC config
   * A way to tell typescript that the config file will have a property called
   * `basePath` and `routes`
   * @example
   * // config/trpc.ts
   * import { AdonisTrpcConfig } from '@ioc:Pyxlab/Adonis/Trcp'
   *
   * const trpc: AdonisTrpcConfig = {
   *  basePath: '/api/trpc',
   *  router: () => import('App/Routes')
   * }
   *
   * export default trpc
   */
  export interface AdonisTrpcConfig {
    basePath: string
    router: () => Promise<{ default: AnyRouter }>
  }
}
