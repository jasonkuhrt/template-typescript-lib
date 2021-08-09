// TODO remove once done: https://github.com/LeDDGroup/typescript-transform-paths/issues/129
// https://github.com/LeDDGroup/typescript-transform-paths#ts-node--ts-compiler-api-usage

import { register } from 'ts-node'
import transformer, { TsTransformPathsConfig } from 'typescript-transform-paths'

const pluginConfig: TsTransformPathsConfig = {
  useRootDirs: false,
}

register({
  transpileOnly: true,
  transformers: {
    before: [transformer(/* Program */ undefined, pluginConfig)],
  },
})
