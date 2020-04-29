# project-lib-typescript

Project template for TypeScript libraries

#### Features

1. TypeScript
   1. Strict mode
   1. Target es2018 which Node as low as version 10 has good support for ([kangax compat table](https://node.green/#ES2018))
   1. cache setup
   1. test/src config split
1. `jest` setup with `ts-jest` and handy watch plugins for testing
1. `dripip` for release management
1. GitHub actions for:
   1. Automated trunk and PR testing across matrix of mac/linux/windows OSes and Node 10/12/14
   1. Automated preview releases on trunk commits
   1. OS Matrix
1. Five issue templates: feature, bug, docs, question, other
1. Renovate configuration
1. npm scripts for development lifecycle

#### After starting a new project with this template

1. Setup the repo with an npm token repo secret called `NPM_TOKEN` for CI package publishing.
1. If your repo does not have GitHub discussions beta feature then adjust the question issue template to not mention them.
1. Update the package.json repo field
1. Update your GitHub org's label-sync repo to include config for your new repo, assuming your org has such a thing. For example for Prisma Labs: [prisma-labs/label-sync](https://github.com/prisma-labs/prisma-labs-labelsync).
1. Uncomment the trunk publishing in `.github/workflows/trunk.yml`
