# Interface design (wishlist)

The interface should follow the following principles:
- Encourage method chaining
- Discourage syncronous modification
- Embrace "dataflow" / declarative paradigm (what, not how)
- 

## One-to-one chaining

### Direct component chaining with `connect()`
```javascript
const c1 = ...
const c2 = ...
const c3 = ...

// ! Relies on the components being defined earlier
c1
  .connect(c2)
  .connect(c3)
  .connect(ia.out)
```

### Method chaining (custom methods)

Not preferred because it is not very clear.

```javascript
ia.oscillator(oscOptions)
  .gain(gainOptions)
  .out(options)
```

### `connect()` + top-level props

This has simple notation and seems to be flexible to custom types.

```javascript
ia.oscillator(oscOptions)
  .connect(ia.gain(gainOptions))
  .connect(x => /* Arbitrary signal-processing code. */)
  .connect(ia.out)
```

## Many-to-many chaining

### Many-to-one with `ia.group()`

This can be a symbolic grouping of two components. Each operation is applied to each component independently, until a `connect()` call, in which it is expected that the keys will match 

Modulate parameters using multiple signals. 

#### Named group
```js
ia.group({
  v1: ia.oscillator(12).multiply(0.2),
  v2: ia.oscillator(440).multiply(0.1)
}).connect((v1, v2) => Math.max(v1, v2))
  .connect(ia.out)
```

This also would apply to built-in components, for example:
```js
ia.group({
  frequency: ia.oscillator({ frequency: 12 }).plus(440)
  detune: ia.oscillator({ frequency: 1 })
}).connect(ia.oscillator())  // Frequency can be optional because it is a modulated param. 
  .connect(ia.out)
```

> [!NOTE]: Parameter modulation should also be able to work like this:
>
> ```js
> ia.oscillator({ frequency: 12 })
>   .plus(440)
>   .connect(ia.oscillator(440).frequency)
>   .connect(ia.out)
> ```



#### Array group
This only works for components with numbered inputs.
```js
ia.group([
  ia.oscillator(12).multiply(0.2),
  ia.oscillator(440).multiply(0.1)
]).connect((v1, v2) => Math.max(v1, v2))
  .connect(ia.out)
```

### One-to-many, returned: destructuring

```js
const {c1, c2} = ia.group({
  c1: ia.oscillator(12).multiply(0.2),
  c2: ia.oscillator(440).multiply(0.1)
})
```

```js
const [c1, c2] = ia.group([
  ia.oscillator(440),
  ia.oscillator(441),
])
```

### One-to-many, returned: `split()`

I guess what `split()` actually does in this case is just rekey the group.

```js
const [c1, c2] = ia.group({
  c1: ia.oscillator(12).multiply(0.2),
  c2: ia.oscillator(440).multiply(0.1)
}).split(['c1', 'c2'])
```

```js
const group = ia.group({
  c1: ia.oscillator(220),
  c2: ia.oscillator(440),
  c3: ia.oscillator(880),
  c4: ia.oscillator(1760)
})
// Two options:
let [low, hi] = group.split(['c1, c2', 'c3, c4'])
[low, hi] = group.split([['c1', 'c2'], ['c3, c4']])
```

### One-to-many, mapped: `split(fns)`

#### Named groups
```js
ia.group({
  c1: ia.oscillator(12).multiply(0.2),
  c2: ia.oscillator(440).multiply(0.1)
}).split({
  c1: comp1 => comp1.connect(...),
  c2: comp2 => comp2.connect(...)
})
```

#### Array group
```js
ia.group([
  ia.oscillator(12).multiply(0.2),
  ia.oscillator(440).multiply(0.1)
]).split([
  comp1 => comp1.connect(...),
  comp2 => comp2.connect(...)
])
```

#### Splitting by channels
Open question: should this be a different method, to avoid confusion?

I am leaning towards option 3, with option 2 being supported as well.

##### Option 1
Here it is inferred that the numbered outputs are the channels.

But this leads to inconsistencies--what if the component is already a group? Do you separate the channels or the inputs?
```js
ia.oscillator(440)
  .split([
    left => left.connect(...),
    right => right.connect(...),
    channel3 => channel3.connect()
  ])
```

##### Option 2
Here `channels` returns an `ia.group` of the channels, and `merge()` converts them back into a single signal.
```js
ia.oscillator(440).channels
  .split([
    left => left.connect(...),
    right => right.connect(...),
    channel3 => channel3.connect()
  ]).merge()
```

##### Option 3
Here, there is a separate method for performing the split-like operation, but over the channels.
```js
ia.oscillator(440)
  .splitChannels([
    left => left.connect(...),
    right => right.connect(...),
    channel3 => channel3.connect()
  ])
```

Either way, this should support similar operations, along with grouping:
```js
ia.oscillator(440)
  .splitChannels({
    'left,right': component => component.connect(...),
    '*': undefined  // Means the channel is removed.
  })
```

### Dynamic processing

#### `ia.selector`: Switch between different audio processing modules.

- Input: `key`: The selection key or index.
- Other inputs: the intersection of the inputs
- Other outputs: the intersection of the outputs

If the components have a `key` property, it will be unusable.

Note: the type returned can be an intersection of the given types.

```js
ia.selector([
  ia.delay(),
  ia.reverb(),
  component => component.connect(...)  // Not sure about this one.
])
```

Can also be specified as an object.
```js
ia.group({
  key: createDropdown(["delay", "reverb", "myFn"]),
  input: ia.oscillator(440)  // Assumes *every* option has an input property.
}).connect(ia.selector({
  delay: ia.delay(),
  reverb: ia.reverb(),
  myFn: component => component.connect(...)
}))
```

And should have UI functionality.
```js
ia.oscillator(440)
  .connect(
    ia.selector({
      delay: ia.delay(),
      reverb: ia.reverb(),
      myFn: component => component.connect(...)
    }).withDisplay($root, options)  // Can replace addToDom
  )
```

#### `ia.patcher`: Dynamically route components

This is for making the actual definition of the audio graph interactive.

The input is a connection/disconnection command, for example:
- `["connect", "gain.left", "out"]`
- `["disconnect", "osc1", "gain"]`

```js
ia.patcher({
  gain: ia.gain(),
  osc1: ia.oscillator(440),
  osc2: ia.oscillator(880),
})
```

This could also have a UI, which is a patching environment (this would be really cool but difficult).