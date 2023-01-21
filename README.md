<br />

<div align="center">
  <img src="https://raw.githubusercontent.com/Pyxlab/adonis-trpc/84c2e5f6d36cf6e5d12145e139c992011587fd84/assets/adonis-trpc.svg" width="400px">
</div>

<br />

<div align="center">
  <h3>A <a href="https://github.com/trpc/trpc">tRPC</a> provider for <a href="https://github.com/adonisjs/core">AdonisJs</a></h3>
  <p>@pyxlab/adonis-trpc provides an easy way to start using tRPC.</p>
</div>

<br />

<div align="center">

[![npm-image]][npm-url] [![license-image]][license-url] [![typescript-image]][typescript-url]

</div>

## Installation

Let's start by installing the package in our project.

**Yarn**:

```sh
yarn add @pyxlab/adonis-trpc
```

**NPM**:

```sh
npm install @pyxlab/adonis-trpc
```

## Usage

### Configuration

In command line, run the following command to generate the configuration file.

```sh
node ace configure @pyxlab/adonis-trpc
```

### Start

Procedures should be placed inside `app/Routes` folder.

All routes are defined inside `app/Routes/index.ts` file. The routes are grouped by the folder name. For example, the `app/Routes/Posts` folder contains all routes related to posts.

The `app/Routes/index.ts` file is the entry point for all routes. It is used to import all routes and export them as a single object.

```ts
import { router } from '@ioc:Pyxlab/Adonis/Trpc'
import { postRouter } from 'App/Routes/Posts'

const appRouter = router({
    posts: postRouter,
})

export default appRouter

export type AppRouter = typeof appRouter
```

The `app/Routes/Posts/index.ts` file is the entry point for all posts routes. It is used to import all routes and export them as a single object.

```ts
import { router } from '@ioc:Pyxlab/Adonis/Trpc'
import { createPost } from 'App/Routes/Posts/createPost'
import { getPosts } from 'App/Routes/Posts/getPosts'

export const postRouter = router({
    createPost,
    getPosts,
})
```

The `app/Routes/Posts/createPost.ts` file is the route handler for the `createPost` route.

```ts
import { protectedProcedure } from '@ioc:Pyxlab/Adonis/Trpc'
import { z } from 'zod'

const input = z.object({
    title: z.string(),
    body: z.string(),
})

export const createPost = protectedProcedure
    .input(input)
    .mutation(async ({ ctx: { auth }, input }) => {
        const user = auth.user!

        const post = await user.related('posts').create(input)

        return post.serialize()
    })

```

In the above example, the `createPost` route is defined. The `protectedProcedure` is used to define a protected route. The `input` method is used to define the input schema for the route. The `mutation` method is used to define the route handler.

The `ctx` object is the AdonisJS context object. The `auth` property is the AdonisJS authentication object. The `auth.user` property is the authenticated user.

The `mutation` method is used to define the route handler. The `mutation` method is used to define a route that modifies the database. The `query` method is used to define a route that does not modify the database.

The `createPost` route handler creates a new post for the authenticated user. The `post.serialize()` method is used to serialize the post model.

The `app/Routes/Posts/getPosts.ts` file is the route handler for the `getPosts` route.

```ts
import { protectedProcedure } from '@ioc:Pyxlab/Adonis/Trpc'

export const getPosts = protectedProcedure
    .query(async ({ ctx: { auth } }) => {
        const user = auth.user!

        const posts = await user.related('posts').findMany()

        return posts.serialize()
    })

```

In the above example, the `getPosts` route is defined. The `protectedProcedure` is used to define a protected route. The `query` method is used to define the route handler.

The method serializes the posts models and returns them. but the `serialize` method is inherited from the `BaseModel` class. So that infer the type of the model without BaselModel, we need to override the `serialize` method.

```ts
import { BaseModel, column, InferTypeModel } from '@ioc:Adonis/Lucid/Orm'

export default class Post extends BaseModel {
    @column({ isPrimary: true })
    public id: number

    @column()
    public title: string

    @column()
    public body: string

    @column()
    public userId: number

    public override serialize(cherryPick?: CherryPick) {
        return super.serialize(cherryPick) as InferTypeModel<Role>
    }
}

```

The `InferTypeModel` type is used to infer the type of the model. The `serialize` method is overridden to return the type of the model.

## Contributing

Thank you for being interested in making this package better. We encourage everyone to help improve this project with new features, bug fixes, or performance improvements. Please take a little bit of your time to read our guide to make this process faster and easier.

### Contribution Guidelines

To understand how to submit an issue, commit and create pull requests, check our [Contribution Guidelines](/.github/CONTRIBUTING.md).

### Code of Conduct

We expect you to follow our [Code of Conduct](/.github/CODE_OF_CONDUCT.md). You can read it to understand what kind of behavior will and will not be tolerated.

## License

MIT License © [Pyxlab](https://github.com/Pyxlab)

<div align="center">
  <sub>Built with ❤︎ by <a href="https://github.com/lncitador">Walaff Fernandes</a>
</div>

[npm-image]: https://img.shields.io/npm/v/@pyxlab/adonis-trpc.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@pyxlab/adonis-trpc "npm"

[license-image]: https://img.shields.io/npm/l/@pyxlab/adonis-trpc?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"
