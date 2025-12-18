# template-typescript-lib

[![trunk](https://github.com/jasonkuhrt/template-typescript-lib/actions/workflows/trunk.yaml/badge.svg)](https://github.com/jasonkuhrt/template-typescript-lib/actions/workflows/trunk.yaml)

Project template for Node libraries. Features:

- ESM Module
- Types: TypeScript
- Tests: Vitest
- Linting: oxlint
- Formatting: dprint
- Publishing: Dripip
- Continuous Integration: GitHub Actions
- Dependency Management: Renovate
- Community: Issue Templates

## Quick Start

Make sure you have `corepack` enabled:

```
$ corepack enable
```

### Used as a GitHub Template Repo

The following will get you a ready to go new repository on GitHub based on this one.

1. Run:

   ```
   gh repo create foobar --template jasonkuhrt/template-typescript-lib --clone --public && \
   cd foobar && \
   pnpm install && \
   pnpm bootstrap
   ```

2. [Setup a repo secret](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets) called `NPM_TOKEN` containing an [npm token](https://docs.npmjs.com/creating-and-viewing-authentication-tokens) for CI package publishing.

### Used With Manual Git Setup

The following will get you a ready to go new repository on GitHub based on this one.

1. Run:

   ```
   gh repo clone jasonkuhrt/template-typescript-lib <directory> && \
   cd <directory> && \
   pnpm install && \
   pnpm bootstrap
   ```

2. [Setup a repo secret](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets) called `NPM_TOKEN` containing an [npm token](https://docs.npmjs.com/creating-and-viewing-authentication-tokens) for CI package publishing.

## Details

<!-- toc -->

- [TypeScript](#typescript)
- [oxlint](#oxlint)
- [Vitest](#vitest)
- [Dripip](#dripip)
- [Simple succinct friendly low-barrier issue templates](#simple-succinct-friendly-low-barrier-issue-templates)
- [dprint](#dprint)
- [npm scripts for development lifecycle](#npm-scripts-for-development-lifecycle)
- [CI with GitHub Actions](#ci-with-github-actions)
- [Renovate](#renovate)
- [PnPM](#pnpm)
- [Zed Settings](#zed-settings)
- [Readme Table of Contents](#readme-table-of-contents)
- [Useful TypeScript Libraries](#useful-typescript-libraries)

<!-- tocstop -->

#### [TypeScript](https://www.typescriptlang.org/) for Type Safety & Productivity

1. Optimal settings for type safety via `@tsconfig/node22` and `@tsconfig/strictest`
1. `.tsbuildinfo` cache setup, output discretely into `node_modules/.cache`
1. Base `tsconfig.json` shared across `tests` and `src`.
1. Optimal output setup for your users

   1. [`declaration`](https://www.typescriptlang.org/tsconfig#declaration) so your users can power their intellisense with your packages typings.
   1. [`declarationMap`](https://www.typescriptlang.org/tsconfig#declarationMap) enabled to make your published source code be navigated to when your users use "go to definition".
   1. [`sourceMap`](https://www.typescriptlang.org/tsconfig#sourceMap) enabled to allow your users' tools to base off the source for e.g. stack traces instead of the less informative derived built JS.
   1. Publish `src` with build files so that jump-to-definition tools work optimally for users.

1. `tsx` for running TypeScript scripts/modules.

#### [oxlint](https://oxc.rs/docs/guide/usage/linter) For Linting

1. Rust-based, extremely fast (~100x faster than ESLint)
1. Zero config needed
1. Setup as a CI check for PRs

#### [Vitest](https://vitest.dev) for Testing

Just Works :)

#### [Dripip](https://github.com/prisma-labs/dripip) for Releasing

#### Simple succinct friendly low-barrier issue templates

1. Emojis ✈️
1. Feature / bug / docs / something-else
1. Config to display discussions link right in new issue type listing UI

#### [dprint](https://dprint.dev/) for code formatting

1. Setup as a CI check for PRs
1. npm script

#### npm scripts for development lifecycle

1. `clean` to remove cache and build files
1. `build` that runs `clean` beforehand
1. `prepublishOnly` that runs `build` beforehand
1. `format` to run `dprint` over whole codebase
1. `lint` to run `oxlint` over whole codebase

#### CI with GitHub Actions

1. Separate trunk and pull-request (PR) workflows.
1. [Dependency install cache](https://github.com/actions/setup-node/blob/main/docs/advanced-usage.md#caching-packages-dependencies) enabled.
1. On PR:
   1. Formatting Check
   1. Lint Check
   1. Type Check
   1. Tests across matrix of mac/linux/windows for Node 22
1. On trunk:
   1. Tests across matrix of mac/linux/windows for Node 22
   1. Automated canary release

#### [Renovate](https://github.com/renovatebot/renovate) configuration

1. JSON Schema setup for optimal intellisense
1. Group all non-major devDependency updates into single PR (which "chore" conventional commit type)
1. Group all major devDependency updates into single PR (with "chore" conventional commit type)
1. Group all non-major dependency updates into single PR (with "deps" conventional commit type)
1. Each major dependency update in own PR (with "deps" conventional commit type)

#### [PnPM](https://pnpm.io/) for package management

1. Using [Corepack](https://nodejs.org/api/corepack.html#enabling-the-feature). This means the PnPM specified in `package.json` will be used. And note this is a PnPM binary shipped with Node now. In a future version of Node you will not need to even opt-in into Corepack. Make sure you've done `corepack enable` at least once.

#### Zed Settings

This template does not include a `.zed` directory. Instead, it assumes you configure [tsgo](https://zed.dev/extensions/tsgo) (the native Go-based TypeScript language server) in your global Zed settings (`~/.config/zed/settings.json`):

```json
{
  "languages": {
    "TypeScript": {
      "language_servers": ["tsgo", "!vtsls", "oxc"]
    },
    "TSX": {
      "language_servers": ["tsgo", "!vtsls", "oxc"]
    }
  }
}
```

#### Readme Table of Contents

1. Using [`markdown-toc`](https://github.com/jonschlinkert/markdown-toc)

#### Useful TypeScript Libraries

Here are some TypeScript libraries you might want to use for your new project:

https://github.com/stars/jasonkuhrt/lists/typescript

![Alt](https://repobeats.axiom.co/api/embed/3c932f1cb76da4ad21328bfdd0ad1c6fbbe76a0b.svg 'Repobeats analytics image')
