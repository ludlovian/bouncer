import Timer from 'timer'

export default class Bouncer {
  constructor (opts = {}) {
    // sensible defaults
    this._tm = new Timer()
    // ssensible defaults
    this.set({ after: 500, ...opts })
    this.fire = this.fire.bind(this)
  }

  fire () {
    return this._waiter ? this._fireWaiter() : this._fireRepeater()
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

  stop () {
    this._tm.cancel()
    return this
  }

  //
  // Internal implementation
  //
  // Waiters - wait for a quiescent period before calling
  //

  _fireWaiter () {
    const tm = this._tm
    if (!tm.active) {
      if (this.leading && this.fn) this.fn()
      tm.set({
        after: this._ms,
        fn: () => {
          if (this.fn) this.fn()
        }
      })
    } else {
      tm.after(this._ms)
    }
  }

  //
  // Repeaters - call on schedule until we have a quiet period

  _fireRepeater () {
    const tm = this._tm
    if (!tm.active) {
      if (this.leading && this.fn) this.fn()
      tm.set({
        every: this._ms,
        fn: () => {
          if (!this._called) return tm.cancel()
          if (this.fn) this.fn()
          this._called = false
        }
      })
      this._called = false
    } else {
      this._called = true
    }
  }
}

Bouncer.prototype.set = function set ({ fn, after, every, leading } = {}) {
  if (fn) this.fn = fn
  if (after) this.after(after)
  if (every) this.every(every)
  if (leading != null) this.leading = !!leading
  return this
}
