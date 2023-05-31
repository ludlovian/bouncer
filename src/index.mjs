import Timer from 'timer'

export default class Bouncer {
  constructor (opts = {}) {
    // sensible defaults
    this._tm = new Timer()
    // ssensible defaults
    this.set({ after: 500, ...opts })
  }

  get fire () {
    return this._fire.bind(this)
  }

  after (ms) {
    this._ms = ms
    this._waiter = true
  }

  every (ms) {
    this._ms = ms
    this._waiter = false
    this.leading = true
  }

  _fire () {
    const tm = this._tm
    if (this._waiter) {
      if (tm.active) {
        tm.after(this._ms)
      } else {
        if (this.leading && this.fn) this.fn()
        tm.set({ after: this._ms, fn: this._tickWaiter.bind(this) })
      }
    } else {
      if (tm.active) {
        this._called = true
      } else {
        if (this.leading && this.fn) this.fn()
        tm.set({ every: this._ms, fn: this._tickRepeater.bind(this) })
        this._called = false
      }
    }
  }

  _tickWaiter () {
    this._tm.cancel()
    if (this.fn) this.fn()
  }

  _tickRepeater () {
    if (!this._called) {
      this._tm.cancel()
    } else {
      if (this.fn) this.fn()
    }
    this._called = false
  }
}

Bouncer.prototype.set = function set ({ fn, after, every, leading } = {}) {
  if (fn) this.fn = fn
  if (after) this.after(after)
  if (every) this.every(every)
  if (leading != null) this.leading = !!leading
  return this
}
