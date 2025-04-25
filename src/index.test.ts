import { expect, test } from 'vitest'
import { foo } from '../tests/helpers.js'
import * as Lib from './index.js'

test(`imports using paths config works relative`, () => {
  expect(Lib.todo()).toEqual(foo)
})
