import { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: `ts-jest/presets/default-esm`,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': `$1`,
  },
  snapshotFormat: {
    // Drop this once using Jest 29, where it becomes the default.
    // https://jestjs.io/blog/2022/04/25/jest-28#future
    printBasicPrototype: false,
  },
  watchPlugins: [
    `jest-watch-typeahead/filename`,
    `jest-watch-typeahead/testname`,
    `jest-watch-select-projects`,
    `jest-watch-suspend`,
  ],
}

export default config
