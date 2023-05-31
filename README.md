# bouncer

_"Sorry mate, I've just let a load of functions in. You'll have to wait a bit"_ - Every club bouncer ever.

## Bouncer

The default export.

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

### Options

#### fn: () => void
`bouncer.fn = () => {...}`

The underling function to call

### after: milliseconds
`bouncer.after(ms)`

The bouncer should wait for `after` milliseconds of inactivity before calling the function.

If `leading` is also set, then the bouncer will call at the start of the activity, and then wait for
quiet before making a second call and returning to doze with his lemonade.

This is often referred to as a *debounce* style.

### every: milliseconds

`bouncer.every(ms)`

The bouncer should call at most once every `ms` milliseconds.

If `leading` is set, the bouncer will call at the start of the activity, and then every `ms` milliseconds.

Once an entire quiet period of `ms` has passed, the bouncer will go back to sleep.

Often referred to as a *throttle* style.

### leading: Boolean
```
bouncer.leading = true
bouncer.set({ fn, leading: true, every: ms })
```

Should the bouncer call at the start of the activity? Default is `true` for `every` style and `false` for `after` style.
