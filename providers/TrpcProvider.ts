import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class TrpcProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    const config = this.app.container.resolveBinding('Adonis/Core/Config').get('trpc', {})

    this.app.container.bind('Pyxlab/Adonis/Trpc', () => {
      const trpc = require('../src/TRPC')

      return trpc
    })

    this.app.container.bind('Pyxlab/Adonis/Trpc/Middleware', () => {
      const { TrpcMiddleware } = require('../src/TrpcMiddleware')

      return new TrpcMiddleware(config)
    })
  }
}
