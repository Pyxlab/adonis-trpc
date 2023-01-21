import { join } from 'path'
import * as sinkStatic from '@adonisjs/sink'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'

function getStub(...relativePaths: string[]) {
  return join(__dirname, 'templates', ...relativePaths)
}

/**
 * Instructions to be executed when setting up the package.
 */
type InstructionsState = {
  basePathName: string
}

/**
 * Instructions to be executed when setting up the package.
 */
export default async function instructions(
  projectRoot: string,
  app: ApplicationContract,
  sink: typeof sinkStatic
) {
  const instructionsState: InstructionsState = {
    basePathName: '/api/trpc',
  }

  const providerLucidExist = app.rcFile.aceProviders.find(
    (provider) => provider !== '@adonisjs/lucid'
  )

  if (!providerLucidExist) {
    sink.logger.error('You need to install @adonisjs/lucid to use this package')

    return
  }

  const providerAuthExist = app.rcFile.aceProviders.find(
    (provider) => provider !== '@adonisjs/auth'
  )

  if (!providerAuthExist) {
    sink.logger.error('You need to install @adonisjs/auth to use this package')

    return
  }

  instructionsState.basePathName = await sink
    .getPrompt()
    .ask('How do you want it to be called the trpc route?', {
      hint: '/api/trpc',
      format: (value: string) => {
        if (value[0] !== '/') {
          return `/${value}`
        }

        return value
      },
      result: (value: string) => {
        if (!value.length) {
          return '/api/trpc'
        }

        return value[0] === '/' ? value : `/${value}`
      },
    })

  const preloadFilePath = app.makePath('start/trpc.ts')
  const preloadFile = new sink.files.MustacheFile(
    projectRoot,
    preloadFilePath,
    getStub('start.txt')
  )

  if (preloadFile.exists()) {
    sink.logger.action('create').skipped(`${preloadFilePath} file already exists`)
  } else {
    preloadFile.overwrite = true

    preloadFile.apply(instructionsState).commit()
    sink.logger.action('create').succeeded('start/trpc.ts')

    const preload = new sink.files.AdonisRcFile(projectRoot)
    preload.setPreload('./start/trpc')
    preload.commit()

    sink.logger.action('update').succeeded('.adonisrc.json')
  }

  const configPath = app.configPath('trpc.ts')
  const configFile = new sink.files.MustacheFile(projectRoot, configPath, getStub('config.txt'))

  if (configFile.exists()) {
    sink.logger.action('create').skipped(`${configPath} file already exists`)
  } else {
    configFile.overwrite = true

    configFile.apply(instructionsState).commit()
    sink.logger.action('create').succeeded('config/trpc.ts')
  }

  const routesDir = app.makePath('app/Routes/index.ts')
  const routesFile = new sink.files.MustacheFile(projectRoot, routesDir, getStub('router.txt'))

  if (routesFile.exists()) {
    sink.logger.action('create').skipped(`${routesDir} file already exists`)
  } else {
    routesFile.overwrite = true

    routesFile.apply().commit()
    sink.logger.action('create').succeeded('app/Routes/index.ts')
  }
}
