import * as Lib from '~/index'
import test from 'ava'

test('imports using paths config works relative', (t) => {
  t.deepEqual(Lib.todo(), 'todo')
})
