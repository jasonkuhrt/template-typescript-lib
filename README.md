# template-typescript-lib

[![trunk](https://github.com/jasonkuhrt/template-typescript-lib/actions/workflows/trunk.yml/badge.svg)](https://github.com/jasonkuhrt/template-typescript-lib/actions/workflows/trunk.yml)

Project template for TypeScript libraries

#### Features

1. [TypeScript](https://www.typescriptlang.org/)
   1. Strict mode
   1. All strict flags not included in strict mode
   1. Target ES 2018 which Node as low as version 10 has good support for ([kangax compat table](https://node.green/#ES2018))
   1. `.tsbuildinfo` cache setup, output discretely into `node_modules/.cache`
   1. Separate `tsconfig.json` for `tests` and `src` respectively
1. [`jest`](https://jestjs.io) for testing
   1. Setup with `ts-jest`
   1. Handy watch mode plugin [`jest-watch-typeahead`](https://github.com/jest-community/jest-watch-typeahead)
   1. `jest.config.ts` for type safe & intellisense configuration!
1. [`dripip`](https://github.com/prisma-labs/dripip) for release management
1. Simple succinct friendly low-barrier issue templates
   1. Emojis ✈️
   1. Feature / bug / docs / something-else
   1. Config to display discussions link right in new issue type listing UI
1. [Prettier](https://prettier.io/) for code formating
   1. Prisma Labs config preset, 110 line width
1. npm scripts for development lifecycle
   1. `clean` to remove cache files and dist
   1. `build` that runs `clean` beforehand
   1. `prepublishOnly` that runs `build` beforehand
   1. `format` to quickly run prttier over whole codebase
1. CI with GitHub Actions
   1. Separate trunk and pull-request workflows.
   1. Automated trunk and PR testing across matrix of mac/linux/windows OSes and Node 12/14
   1. Automated preview releases on trunk commits
   1. OS Matrix
1. [Renovate](https://github.com/renovatebot/renovate) configuration
   1. JSON Schema setup for optimal intellisense
1. [Yarn 1](https://classic.yarnpkg.com/lang/en/) for package management (mostly for great script runner behaviour)
1. Hybrid package build CJS+ESM (see [Dr. Axel's article about this](https://2ality.com/2019/10/hybrid-npm-packages.html))
   1. Use `exports` field to give support to both modern `import` and legacy `require` consumers using Node 12.x and up. For details about the `exports` field refer to the [Official Node.js Docs](https://nodejs.org/api/packages.html#packages_package_entry_points) about it.
   1. Use `main` field for legacy versions of Node (before `12.x`) requiring the CJS build.
   1. Use `module` field for legacy bundlers importing the ESM build.
1. VSCode Settings
   1. Optimize project search by ignoring `dist`/`dist-esm` directories.
   1. Enable `typescript.enablePromptUseWorkspaceTsdk` so that oneself and collaborators will get prompted to use the workspace version of TypeScript instead of the one in the editor.

#### After starting a new project with this template

1. [Setup a repo secret ](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets) called `NPM_TOKEN` containing an [npm token](https://docs.npmjs.com/creating-and-viewing-authentication-tokens) for CI package publishing.
1. Adjust `.github/ISSUE_TEMPLATE/config.yml` to point to your repo discussions URL (or whever else you want!)
1. Uncomment the trunk publishing in `.github/workflows/trunk.yml`
1. Search-replace all instances of `jasonkuhrt/project-lib-typescript` to `<your org>/<your repo>`
1. Update `<YOUR NAME>` in `LICENSE` file

#### Tips

1. Update your GitHub org's label-sync repo to include config for your new repo, assuming your org has such a thing. For example for Prisma Labs: [prisma-labs/label-sync](https://github.com/prisma-labs/prisma-labs-labelsync/blob/master/labelsync.ts).
