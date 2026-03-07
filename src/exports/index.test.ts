import { Effect } from 'effect'
import { expect, test } from 'bun:test'
import * as Lib from './index.ts'

test(`greet returns effectful greeting`, () => {
  const result = Effect.runSync(Lib.greet('World'))
  expect(result).toEqual('Hello, World!')
})
