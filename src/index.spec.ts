import { expect, test } from 'vitest'
import * as Lib from './index.js'

test(`imports using paths config works relative`, () => {
  expect(Lib.todo()).toEqual(`nothing`)
})
