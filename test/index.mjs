import test from 'node:test'
import assert from 'node:assert/strict'
import { setTimeout as delay } from 'node:timers/promises'

import Bouncer from '../src/index.mjs'

test('Bouncer', async t => {
  t.test('simple construction', () => {
    const fn = t.mock.fn()
    const after = 30
    const b = new Bouncer({ after, fn })

    assert.ok(b instanceof Bouncer, 'instance is created')
    assert.strictEqual(b.after, after, 'after set properly')
    assert.strictEqual(b.fn, fn, 'fn set properly')
    assert.strictEqual(b.leading, false, 'leading set properly')
  })

  await t.test('waiter with no leading edge', async () => {
    const fn = t.mock.fn()
    const after = 30
    const leading = false
    const b = new Bouncer({ fn, after, leading })
    const calls = () => fn.mock.callCount()
    const equal = (...args) => assert.strictEqual(...args)

    equal(b.active, false, 'bouncer initially inactive')

    b.fire()
    equal(calls(), 0, '1: no initial call made')
    equal(b.active, true, 'bouncer now active')

    await delay(20)
    equal(calls(), 0, '2: no call made as quiet period too short')

    b.fire()

    await delay(20)
    equal(calls(), 0, '3: no call made as quiet period too short')

    await delay(20)
    equal(calls(), 1, '4: call made after quiet period')
    equal(b.active, false, 'bouncer now inactive')

    await delay(50)
    equal(calls(), 1, '5: no further calls() made')

    b.fire()

    await delay(20)
    equal(calls(), 1, '6: no call made as quiet period too short')

    await delay(20)
    equal(calls(), 2, '7: call made after quiet period')

    await delay(50)
    equal(calls(), 2, '8: no further calls() made')
  })

  await t.test('waiter with leading edge', async () => {
    const fn = t.mock.fn()
    const after = 30
    const leading = true
    const b = new Bouncer({ fn, after, leading })
    const calls = () => fn.mock.callCount()
    const equal = (...args) => assert.strictEqual(...args)

    equal(b.active, false, 'bouncer initially inactive')
    b.fire()

    equal(calls(), 1, '1: initial call made')
    equal(b.active, true, 'bouncer now active')

    await delay(20)
    equal(calls(), 1, '2: no call made as quiet period too short')

    b.fire()

    await delay(20)
    equal(calls(), 1, '3: no call made as quiet period too short')

    await delay(20)
    equal(calls(), 2, '4: call made after quiet period')
    equal(b.active, false, 'bouncer now inactive')

    await delay(50)
    equal(calls(), 2, '5: no further calls made')

    b.fire()

    equal(calls(), 3, '6: initial call made')

    await delay(20)
    equal(calls(), 3, '7: no call made as quiet period too short')

    await delay(20)
    equal(calls(), 4, '8: call made after quiet period')

    await delay(50)
    equal(calls(), 4, '9: no further calls made')
  })

  await t.test('repeater with (default) leading edge', async () => {
    const fn = t.mock.fn()
    const every = 30
    const b = new Bouncer({ fn, every })
    const calls = () => fn.mock.callCount()
    const equal = (...args) => assert.strictEqual(...args)

    b.fire()

    equal(calls(), 1, '1: inital call made')

    await delay(20)

    b.fire()

    equal(calls(), 1, '2: no call made yet')

    await delay(20)

    equal(calls(), 2, '3: throttled call made')

    b.fire()

    equal(calls(), 2, '4: no call made yet')

    await delay(30)

    equal(calls(), 3, '5: throttled call made')

    await delay(30)

    equal(calls(), 3, '6: no call made after quiet period')
    equal(b.active, false, '7: No longer active')
  })

  await t.test('repeater without leading edge', async () => {
    const fn = t.mock.fn()
    const every = 30
    const leading = false
    const b = new Bouncer({ fn, every, leading })
    const calls = () => fn.mock.callCount()
    const equal = (...args) => assert.strictEqual(...args)

    b.fire()

    equal(calls(), 0, '1: no inital call made')

    await delay(20)

    b.fire()

    equal(calls(), 0, '2: no call made yet')

    await delay(20)

    equal(calls(), 1, '3: throttled call made')

    b.fire()

    equal(calls(), 1, '4: no call made yet')

    await delay(30)

    equal(calls(), 2, '5: throttled call made')

    await delay(30)

    equal(calls(), 2, '6: no call made after quiet period')
    equal(b.active, false, '7: bouncer no longer active')
  })

  await t.test('cancel a waiter', async () => {
    const fn = t.mock.fn()
    const after = 30
    const leading = false
    const b = new Bouncer({ fn, after, leading })
    const calls = () => fn.mock.callCount()
    const equal = (...args) => assert.strictEqual(...args)

    b.fire()
    equal(calls(), 0, '1: no initial call made')

    await delay(20)
    equal(calls(), 0, '2: no call made as quiet period too short')
    equal(b.active, true, 'bouncer still active')

    b.cancel()

    await delay(20)
    equal(calls(), 0, '3: no call made as bouncer was stopped')
    equal(b.active, false, 'bouncer no longer active')
  })

  await t.test('cancel a repeater', async () => {
    const fn = t.mock.fn()
    const every = 30
    const b = new Bouncer({ fn, every })
    const calls = () => fn.mock.callCount()
    const equal = (...args) => assert.strictEqual(...args)

    b.fire()

    equal(calls(), 1, '1: inital call made')

    await delay(20)

    b.fire()

    equal(calls(), 1, '2: no call made yet')

    b.cancel()

    await delay(20)

    equal(calls(), 1, '3: no call made as bouncer was stopped')
    equal(b.active, false, 'bouncer no longer active')
  })

  await t.test('allow waiter to be re-entrant', async () => {
    let count = 0
    const after = 30
    const leading = true
    const fn = () => {
      if (++count > 10) throw new Error('Loop detected')
      b.fire()
    }

    const b = new Bouncer({ fn, after, leading })

    b.fire()

    await delay(20)

    b.cancel()
  })

  await t.test('allow repeater to be re-entrant', async () => {
    let count = 0
    const every = 30
    const leading = true
    const fn = () => {
      if (++count > 10) throw new Error('Loop detected')
      b.fire()
    }
    const b = new Bouncer({ fn, every, leading })

    b.fire()

    await delay(20)

    b.cancel()
  })

  t.test('Errors', t => {
    assert.throws(() => new Bouncer(), Error, 'No data provided')

    assert.throws(
      () => new Bouncer({ after: 30, fn: 'function' }),
      /No function was supplied/,
      'Invalid function supplied'
    )

    assert.throws(
      () => new Bouncer({ after: 'xx', fn: () => {} }),
      /No delay was supplied/,
      'Invalid after'
    )

    assert.throws(
      () => new Bouncer({ every: 'xx', fn: () => {} }),
      /No delay was supplied/,
      'Invalid every'
    )
  })
})

/*

test.run()
*/
