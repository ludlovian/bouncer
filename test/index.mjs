import { test } from 'uvu'
import * as assert from 'uvu/assert'

import Bouncer from '../src/index.mjs'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

test('simple construction', () => {
  const b = new Bouncer()
  assert.ok(b instanceof Bouncer, 'instance is created')
})

test('waiter with no leading edge', async () => {
  let calls = 0
  const b = new Bouncer({
    after: 30,
    leading: false,
    fn: () => calls++
  })

  b.fire()
  assert.is(calls, 0, '1: no initial call made')

  await delay(20)
  assert.is(calls, 0, '2: no call made as quiet period too short')

  b.fire()

  await delay(20)
  assert.is(calls, 0, '3: no call made as quiet period too short')

  await delay(20)
  assert.is(calls, 1, '4: call made after quiet period')

  await delay(50)
  assert.is(calls, 1, '5: no further calls made')

  b.fire()

  await delay(20)
  assert.is(calls, 1, '6: no call made as quiet period too short')

  await delay(20)
  assert.is(calls, 2, '7: call made after quiet period')

  await delay(50)
  assert.is(calls, 2, '8: no further calls made')
})

test('waiter with leading edge', async () => {
  let calls = 0
  const b = new Bouncer({
    after: 30,
    leading: true,
    fn: () => calls++
  })

  b.fire()

  assert.is(calls, 1, '1: initial call made')

  await delay(20)
  assert.is(calls, 1, '2: no call made as quiet period too short')

  b.fire()

  await delay(20)
  assert.is(calls, 1, '3: no call made as quiet period too short')

  await delay(20)
  assert.is(calls, 2, '4: call made after quiet period')

  await delay(50)
  assert.is(calls, 2, '5: no further calls made')

  b.fire()

  assert.is(calls, 3, '6: initial call made')

  await delay(20)
  assert.is(calls, 3, '7: no call made as quiet period too short')

  await delay(20)
  assert.is(calls, 4, '8: call made after quiet period')

  await delay(50)
  assert.is(calls, 4, '9: no further calls made')
})

test('repeater with (default) leading edge', async () => {
  let calls = 0
  const b = new Bouncer().set({
    every: 30,
    fn: () => calls++
  })

  b.fire()

  assert.is(calls, 1, '1: inital call made')

  await delay(20)

  b.fire()

  assert.is(calls, 1, '2: no call made yet')

  await delay(20)

  assert.is(calls, 2, '3: throttled call made')

  b.fire()

  assert.is(calls, 2, '4: no call made yet')

  await delay(30)

  assert.is(calls, 3, '5: throttled call made')

  await delay(30)

  assert.is(calls, 3, '6: no call made after quiet period')
  assert.is(b._tm.active, false, '7: *internal* interval turned off')
})

test('repeater without leading edge', async () => {
  let calls = 0
  const b = new Bouncer().set({
    every: 30,
    leading: false,
    fn: () => calls++
  })

  b.fire()

  assert.is(calls, 0, '1: no inital call made')

  await delay(20)

  b.fire()

  assert.is(calls, 0, '2: no call made yet')

  await delay(20)

  assert.is(calls, 1, '3: throttled call made')

  b.fire()

  assert.is(calls, 1, '4: no call made yet')

  await delay(30)

  assert.is(calls, 2, '5: throttled call made')

  await delay(30)

  assert.is(calls, 2, '6: no call made after quiet period')
  assert.is(b._tm.active, false, '7: *internal* interval turned off')
})

test('.stop on waiter', async () => {
  let calls = 0
  const b = new Bouncer({
    after: 30,
    leading: false,
    fn: () => calls++
  })

  b.fire()
  assert.is(calls, 0, '1: no initial call made')

  await delay(20)
  assert.is(calls, 0, '2: no call made as quiet period too short')

  b.stop()

  await delay(20)
  assert.is(calls, 0, '3: no call made as bouncer was stopped')
})

test('.stop on repeater', async () => {
  let calls = 0
  const b = new Bouncer({
    every: 30,
    fn: () => calls++
  })

  b.fire()

  assert.is(calls, 1, '1: inital call made')

  await delay(20)

  b.fire()

  assert.is(calls, 1, '2: no call made yet')

  b.stop()

  await delay(20)

  assert.is(calls, 1, '3: no call made as bouncer was stopped')
})

test.run()
