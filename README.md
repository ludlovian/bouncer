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

Creates a new bouncer with the requested options.

#### Configuration Options

Options are specified as an object with the following properties:

##### fn: () => void

The underlying function you want to call. It takes no arguments, so use closures

##### after: milliseconds

Makes the bouncer a _waiter_ style, who will call **once** things settle down.

This is often referred to as a *debounce* style.

Incompatible with `every`

##### every: milliseconds

`bouncer.every(ms)`

Makes the bouncer a _repeater_ style, who will call regularly **until** things
settle down.

Often referred to as a *throttle* style.

Incompatible with `after`

##### leading: Boolean

Should the bouncer call at the start of the activity as well?

Default is `true` for _repeaters_  and `false` for _waiters_.

### .after / .every / .leading / .fn

Enumerable and read-only properties showing the current configuration.

Can be useful for cloning a bouncer.
`b2 = new Bouncer({ ...b1, fn: () => .... })`

### .fire: () => void
`fnToCall = bouncer.fire`

The debounced/throttled function that users should call.

Like all good bouncers, they accept no arguments.
Go elsewhere if you need closure.

### .cancel() => Bouncer

Cancels any outstanding timers, so no further calls will be made to the
underlying function.

Of course, if you call `fire` again, it will start up.

### .active => Boolean

Tells you if the bouncer is currently active

