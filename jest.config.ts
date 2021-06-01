import type { InitialOptionsTsJest } from 'ts-jest/dist/types'

const config: InitialOptionsTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
    [
      'jest-watch-suspend',
      {
        'suspend-on-start': true,
      },
    ],
  ],
  globals: {
    'ts-jest': {
      diagnostics: Boolean(process.env.CI),
      compiler: 'ttypescript',
    },
  },
}

export default config
