import Timer from '@ludlovian/timer'

const customInspect = Symbol.for('nodejs.util.inspect.custom')

function doNothing () {}

export default class Bouncer {
  // configuration
  #timer = new Timer()
  #fn = undefined
  #after = undefined
  #every = undefined
  #leading = false

  // state
  #called = false

  constructor (opts) {
    this.#addProperties()
    this.set(opts)
  }

  ['set'] ({
    fn, // the function to call
    after, // waiting-style
    every, // repeater-style
    leading
  } = {}) {
    // defaults
    fn ??= doNothing
    if (after === undefined && every === undefined) after = 0

    // validation of inputs
    if (typeof fn !== 'function') throw errNoFunctionSupplied()
    this.#fn = fn

    after = toInteger(after)
    every = toInteger(every)

    if (!isNaN(after)) {
      this.#after = after
      this.#every = undefined
      this.#leading = !!leading
    } else if (!isNaN(every)) {
      this.#every = every
      this.#after = undefined
      this.#leading = leading === undefined || !!leading
    } else {
      throw errNoDelaySupplied()
    }

    this.#configureTimer()
  }

  /* c8 ignore start */
  [customInspect] (depth, opts, inspect) {
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
    this.#timer.cancel()
    return this
  }

  get #isRepeater () {
    return this.#every !== undefined
  }

  #fire () {
    // called by users of the Bouncer
    if (this.#isRepeater) {
      this.#called = true
      if (!this.active) {
        this.#timer.refresh()
        if (this.#leading) this.#tick()
      }
    } else {
      if (!this.active) {
        this.#timer.refresh()
        if (this.#leading) this.#tick()
      } else {
        this.#timer.refresh()
      }
    }
  }

  #tick () {
    // called by the Bouncer's timer
    if (this.#isRepeater) {
      if (!this.#called) {
        this.#timer.cancel()
      } else {
        this.#called = false
        this.#fn()
      }
    } else {
      this.#fn()
    }
  }

  #addProperties () {
    const enumerable = true
    Object.defineProperties(this, {
      fn: { enumerable, get: () => this.#fn },
      leading: { enumerable, get: () => this.#leading },
      every: { enumerable, get: () => this.#every },
      after: { enumerable, get: () => this.#after },
      fire: { value: this.#fire.bind(this) }
    })
  }

  #configureTimer () {
    this.#timer.set({
      fn: this.#tick.bind(this),
      every: this.#every,
      after: this.#after,
      inactive: true
    })
  }
}

function toInteger (n) {
  n = Math.max(0, Math.floor(n))
  return isNaN(n) ? undefined : n
}

function errNoFunctionSupplied () {
  return new Error('No function was supplied')
}

function errNoDelaySupplied () {
  return new Error('No delay was supplied')
}
