# bouncer

_"Sorry mate, I've just let a load of functions in. You'll have to wait a bit"_ - Every club bouncer ever.

## Bouncer

The default export.

A Bouncer is simply somebody who slows the rate of functions.

There are two styles of bouncers, _waiters_ and _repeaters_.

A _waiter_ will wait until there is a defined period of quiet before allowing the
function call to go ahead. Optionally they may allow a call at the start.
```
Activity -----X---X--X-X---X------------------
                            <---quiet-->
Calls         ^                         ^
              |                         |
          leading call               after things have settled
```

A _repeater_ will make the call repeatedly once things have kicked off.
They then make the calls on a regular schedule, until all activity has ceased.
Optionally, they may make a call at the start of the process.
```
Activity -----X---X--X-X---X--X--------------

Calls         ^     ^     ^     ^     .
              |     |     |     |      \
  optional leading                      no call made - shuts down
```

### new Bouncer(opts) => Bouncer
`bouncer = new Bouncer({...})`

Creates a new bouncer with the requested options. See **Options** below

### .set(opts) => Bouncer
`bouncer.set({...})`

Reconfigures the bouncer, returnsing itself for chaining. See **Options** below

### .after(ms) => Bouncer

Same as `.set({ after: ms })`

### .every(ms) => Bouncer

Same as `.set({ every: ms })`

### .fire: () => void
`fnToCall = bouncer.fire`

The debounced/throttled function that users should call.

Like all good bouncers, they accept no arguments.
Go elsewhere if you need closure.

### Options

#### fn: () => void
`bouncer.fn = () => {...}`

The underling function to call

### after: milliseconds
`bouncer.after(ms)`

Makes the bouncer a _waiter_ style, who will call **once** things settle down.

This is often referred to as a *debounce* style.

### every: milliseconds

`bouncer.every(ms)`

Makes the bouncer a _repeater_ style, who will call regularly **until** things
settle down.

Often referred to as a *throttle* style.

### leading: Boolean
```
bouncer.leading = true
bouncer.set({ fn, leading: true, every: ms })
```

Should the bouncer call at the start of the activity as well?

Default is `true` for _repeaters_  and `false` for _waiters_.
