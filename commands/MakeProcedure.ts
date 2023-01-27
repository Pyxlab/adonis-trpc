import { BaseCommand, args, flags } from '@adonisjs/core/build/standalone'
import { StringTransformer } from '@adonisjs/ace/build/src/Generator/StringTransformer'
import { join } from 'node:path'
import { existsSync, readdirSync, readFileSync, unlinkSync } from 'node:fs'

interface Resources {
  prefix: string
  suffix: string
  type: 'query' | 'mutation'
  protected: boolean
}

interface Procedures {
  name: string
  filename: string
  procedure: string
}

interface Router {
  name: string
  filename: string
}

const getStub = (...paths: string[]) => join(__dirname, '..', 'templates', ...paths)

export default class MakeProcedure extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'make:procedure'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Create a new procedure file in app/Routes directory'

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: true,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  @args.string({ description: 'Name of the model with create procedure' })
  public name: string

  @args.string({ description: 'Name of the procedure call', required: false })
  public procedure: string

  @flags.boolean({
    description: 'Create the procedure with the exact name as provided',
    alias: 'e',
  })
  public exact: boolean

  @flags.boolean({ description: 'Generate model', alias: 'm' })
  public model: boolean

  @flags.boolean({ description: 'Generate migration', alias: 't' })
  public table: boolean

  @flags.boolean({ description: 'Add resourceful methods to the procedure file', alias: 'r' })
  public resource: boolean

  private readonly resources: Resources[] = [
    { prefix: 'get', suffix: 'ById', type: 'query', protected: true },
    { prefix: 'create', suffix: '', type: 'mutation', protected: true },
    { prefix: 'list', suffix: '', type: 'query', protected: false },
    { prefix: 'update', suffix: '', type: 'mutation', protected: true },
    { prefix: 'delete', suffix: '', type: 'mutation', protected: true },
  ]

  private readonly ignoreList = ['Auth']

  public async run() {
    const modelName = new StringTransformer(this.name)
      .changeCase('pascalcase')
      .changeForm('singular')
      .toValue()

    const procedureName = this.getProcedureName(modelName)

    const routerStub = getStub('procedures', 'router.txt')

    const path = this.application.resolveNamespaceDirectory('routes')

    const rootDir = this.application.cliCwd || this.application.appRoot

    const modelIndexesPath = join(path || 'app/Routes', modelName, 'index.ts')
    const modelIndexesPathExist = existsSync(modelIndexesPath)

    const modelPath = this.procedure
      ? join(path || 'app/Routes', modelName, `${procedureName}.ts`)
      : modelIndexesPath

    const resourcesPath = this.resources.map(({ prefix, suffix, ...rest }) => ({
      ...rest,
      resourcePath: join(path || 'app/Routes', modelName, `${prefix}${modelName}${suffix}.ts`),
    }))

    const queryStub = getStub('procedures', 'query.txt')
    const mutationStub = getStub('procedures', 'mutation.txt')

    const dir = join(path || 'app/Routes', modelName)

    if (this.resource) {
      for await (const resource of resourcesPath) {
        const resourcePathExist = existsSync(resource.resourcePath)

        if (resourcePathExist) {
          this.logger
            .action('create resource')
            .skipped(resource.resourcePath, 'Resource already exists')
        } else {
          const filename = resource.resourcePath.split('/').at(-1)?.split('.')[0]!
          const stub = resource.type === 'query' ? queryStub : mutationStub

          this.generator
            .addFile(filename)
            .stub(stub)
            .destinationDir(dir)
            .useMustache()
            .apply({ isProtected: resource.protected, procedure: filename })
            .appRoot(rootDir)

          await this.generator.run()
        }

        this.generator.clear()
      }
    }

    const modelPathExist = existsSync(modelPath)

    if (modelPathExist && !this.resource) {
      this.logger.action('create').skipped(modelPath, 'File already exists')
    } else if (this.procedure) {
      const type = await this.prompt.choice('Choose the type of procedure', [
        { name: 'query', hint: 'A query is used to retrieve data from the resource' },
        {
          name: 'mutation',
          hint: 'A mutation is used to create, update or delete data in the resource',
        },
      ])

      const stub = type === 'query' ? queryStub : mutationStub

      const isProtected = await this.prompt.ask('This is procedure is protected', {
        hint: 'Y/n',
        validate: (value) => /^[yYnN]$/.test(value),
        result: (value) => value.toLowerCase(),
      })

      this.generator
        .addFile(procedureName)
        .stub(stub)
        .destinationDir(dir)
        .useMustache()
        .apply({ isProtected: isProtected === 'y', procedure: procedureName })
        .appRoot(rootDir)

      await this.generator.run()

      const procedures: Procedures[] = []

      const currentProceduresFiles = this.listFiles(join(rootDir, dir))

      for (const filename of currentProceduresFiles) {
        const procedure = this.findProcedure(join(rootDir, dir, filename))

        if (procedure) {
          const newFilename = filename.replace('.ts', '')
          procedures.push({
            name: newFilename.replace(modelName, ''),
            filename: newFilename,
            procedure,
          })
        }
      }

      this.generator.clear()

      if (modelIndexesPathExist) {
        unlinkSync(modelIndexesPath)
      }

      const router = this.getRouterName(modelName)

      this.generator
        .addFile('index')
        .stub(routerStub)
        .destinationDir(dir)
        .useMustache()
        .apply({ router, importProcedures: procedures })
        .appRoot(rootDir)

      await this.generator.run()
    } else if (!modelPathExist || this.resource) {
      const procedures: Procedures[] = []

      if (this.resource) {
        const currentProceduresFiles = this.listFiles(join(rootDir, dir))

        for (const filename of currentProceduresFiles) {
          const procedure = this.findProcedure(join(rootDir, dir, filename))

          if (procedure) {
            const newFilename = filename.replace('.ts', '')
            procedures.push({
              name: newFilename.replace(modelName, ''),
              filename: newFilename,
              procedure,
            })
          }
        }

        if (modelIndexesPathExist) {
          unlinkSync(modelIndexesPath)
        }
      }

      const router = this.getRouterName(modelName)

      this.generator
        .addFile('index')
        .stub(routerStub)
        .destinationDir(dir)
        .useMustache()
        .apply({ router, importProcedures: procedures })
        .appRoot(rootDir)

      await this.generator.run()
    }

    this.generator.clear()

    if (!modelIndexesPathExist) {
      const appStub = getStub('procedures', 'app.txt')
      const files = readdirSync(join(rootDir, path || 'app/Routes')).filter(
        (file) => file !== 'index.ts'
      )

      const routes: Router[] = []

      for (const model of files) {
        const router = this.getRouterName(model)

        routes.push({
          name: router,
          filename: model,
        })
      }

      if (existsSync(join(rootDir, path || 'app/Routes', 'index.ts'))) {
        unlinkSync(join(rootDir, path || 'app/Routes', 'index.ts'))
      }

      this.generator
        .addFile('index')
        .stub(appStub)
        .destinationDir(path || 'app/Routes')
        .useMustache()
        .apply({ importRoutes: routes })
        .appRoot(rootDir)

      await this.generator.run()
    }

    this.generator.clear()

    this.runMakeModel()
    this.runMakeMigration()
  }

  /**
   * List all files in a directory, filtered by .ts extension
   * @param path - The directory path
   * @returns An array of string with the file names
   */
  private listFiles(path: string): string[] {
    return readdirSync(path).filter((file) => file.endsWith('.ts'))
  }

  /**
   * Find the name of the procedure in a file
   * @param filePath - The file path
   * @returns The name of the procedure or null if not found
   */
  private findProcedure(filePath: string): string | null {
    const fileContent = readFileSync(filePath, 'utf-8')
    const lines = fileContent.split('\n')
    for (const line of lines) {
      if (line.startsWith('export const') || line.startsWith('const')) {
        const match = line.match(/const (\w+) = procedure/)
        if (match) {
          return match[1]
        }
      }
    }
    return null
  }

  private getProcedureName(modelName: string) {
    const name = this.procedure
      ? new StringTransformer(this.procedure).changeCase('camelcase').toValue()
      : ''

    if (!this.exact && !name.includes(modelName)) {
      return name + modelName
    }

    return name
  }
  /**
   * If the model name is in the ignore list, then return the model name in
   * camelcase. Otherwise, return the model name in plural camelcase
   * @param {string} modelName - The name of the model.
   * @returns The router name.
   */
  private getRouterName(modelName: string) {
    const ignore = this.ignoreList.find((name) => name === modelName)

    return ignore
      ? new StringTransformer(modelName).changeCase('camelcase').toValue()
      : new StringTransformer(modelName).changeCase('camelcase').changeForm('plural').toValue()
  }

  /**
   * Run migrations
   */
  private async runMakeModel() {
    if (!this.model) {
      return
    }

    const makeModel = await this.kernel.exec('make:model', [this.name])
    this.exitCode = makeModel.exitCode
    this.error = makeModel.error
  }

  /**
   * Run migrations
   */
  private async runMakeMigration() {
    if (!this.table) {
      return
    }

    const makeMigration = await this.kernel.exec('make:migration', [this.name])
    this.exitCode = makeMigration.exitCode
    this.error = makeMigration.error
  }
}
