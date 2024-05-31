import util from 'node:util'

import Timer from 'timer'

export default class Bouncer {
  // configuration
  #timer = undefined
  #fn = undefined
  #after = undefined
  #every = undefined
  #leading = false

  // state
  #called = false

  constructor ({ fn, after, every, leading }) {
    // validation of inputs
    if (typeof fn !== 'function') throw errNoFunctionSupplied()
    this.#fn = fn

    after = toInteger(after)
    every = toInteger(every)

    if (after) {
      this.#after = after
      this.#leading = !!leading
    } else if (every) {
      this.#every = every
      this.#leading = leading === undefined || !!leading
    } else {
      throw errNoDelaySupplied()
    }

    this.#addProperties()
    this.#configureTimer()
  }

  /* c8 ignore start */
  [util.inspect.custom] (depth, opts, inspect) {
    if (depth < 0) {
      return opts.stylize('[Bouncer]', 'date')
    }
    return [
      'Bouncer { ',
      this.after
        ? `after: ${opts.stylize(this.after, 'number')}`
        : `every: ${opts.stylize(this.every, 'number')}`,
      ', leading: ',
      opts.stylize(this.leading, 'boolean'),
      ' }'
    ].join('')
  }
  /* c8 ignore stop */

  get active () {
    return this.#timer.active
  }

  cancel () {
    if (this.active) this.#timer.cancel()
    return this
  }

  get #isRepeater () {
    return this.#every !== undefined
  }

  #fireRepeater () {
    this.#called = true
    if (!this.active) {
      this.#timer.refresh()
      if (this.#leading) this.#tickRepeater()
    }
  }

  #fireWaiter () {
    if (!this.active) {
      this.#timer.refresh()
      if (this.#leading) this.#tickWaiter()
    } else {
      this.#timer.refresh()
    }
  }

  #tickRepeater () {
    if (!this.#called) {
      this.#timer.cancel()
    } else {
      this.#called = false
      this.#fn()
    }
  }

  #tickWaiter () {
    this.#fn()
  }

  #addProperties () {
    const enumerable = true
    const configurable = true
    const props = {}
    props.fn = { enumerable, configurable, get: () => this.#fn }
    props.leading = { enumerable, configurable, get: () => this.#leading }
    props.fire = {
      enumerable: false,
      configurable,
      value: this.#isRepeater
        ? this.#fireRepeater.bind(this)
        : this.#fireWaiter.bind(this),
      writable: false
    }

    if (this.#every) {
      props.every = { enumerable, configurable, get: () => this.#every }
    }

    if (this.#after) {
      props.after = { enumerable, configurable, get: () => this.#after }
    }

    Object.defineProperties(this, props)
  }

  #configureTimer () {
    if (this.#isRepeater) {
      this.#timer = new Timer({
        ms: this.#every,
        repeat: true,
        fn: this.#tickRepeater.bind(this)
      })
    } else {
      this.#timer = new Timer({
        ms: this.#after,
        repeat: false,
        fn: this.#tickWaiter.bind(this)
      })
    }
    // Once configured cancel it until needed
    this.#timer.cancel()
  }
}

function toInteger (n) {
  n = Math.floor(n)
  return isNaN(n) ? undefined : n
}

function errNoFunctionSupplied () {
  return new Error('No function was supplied')
}

function errNoDelaySupplied () {
  return new Error('No delay was supplied')
}
