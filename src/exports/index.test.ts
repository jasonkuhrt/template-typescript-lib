import { expect, test } from 'bun:test'
import { foo } from '../../tests/helpers.ts'
import * as Lib from './index.ts'

test(`imports using paths config works relative`, () => {
  expect(Lib.todo()).toEqual(foo)
})
