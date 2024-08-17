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


`perChannel`?

```js
ia.oscillator(440).perChannel({
  left: s => s.connect(ia.delay(10)),
  right: s => s
})
```

```js
ia.oscillator(440).perChannel([
  s => s.connect(ia.delay(10)),
  s => s
])
```

```js
mySignal.fft().perOutput({
  magnitudes: s => s.perChannel({
    left: l => l.delay(128)
  }),
  phases: s => s.connect(x => x + 2 * Math.PI)
}).ifft()
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

## Buffer handling

### Reading buffers

#### `ia.bufferReader`

##### Audio-rate interface

Control the offset of the playback using an audioInput (currently called `position`, will be renamed to `offset`).

##### Control-rate interface (TBD)
TODO: implement `start(playbackRate?)` and `stop()` methods / trigger controlInputs, which control the time. The audioInput should control the *offset* instead of the actual playback.

### Writing buffers

#### Control-rate interface: `ia.recorder`

Capture audio from a live component (audio stream).
- Capture predetermined length: `capture(numSamples) -> Promise<AudioBuffer>`. 
- Capture based on events: `start()` then  `stop() -> Promise<AudioBuffer>`

Also available through `component.capture(numSamples) -> Promise<AudioBuffer>`

#### Audio-rate interface: `ia.bufferWriter`

Two audio-rate inputs:
- `valueToWrite`
- `position`

No outputs, but the underlying buffer is changed and can be used in other components.

## FFT
(should probbaly call this stft)

Special type of I/O:
- `FFTInput`
- `FFTOutput`

Each has properties `magnitude` / `phase` (P0) *or* `real` / `imaginary` (P1) which are each `AudioRateOutput`. Also has `sync` which goes from `0` to `fftSize-1` and helps line up the beginning of the FFT window.

### Normal execution
```js
const fft = signal.fft({ windowSize })
// Or signal.connect(ia.fft({ windowSize }))
const mutatedSignal = fft.map(({ magnitude, phase }) => {
  // Supports audioTransform "context" methods
  // Also: this.frameSize, etc.
  const prevOutputFrame = this.previousOutput()
  magnitude[5] += + 0.8 * prevOutputFrame.magnitude[5]
  return { magnitude, phase }
}).ifft()
```
### Custom IFFT execution
```js
const sync = ia.ramp('samples').connect(v => v % windowSize)
// Only first partial (pretending this doesn't cause latency...).
// v == 1 might also not work...
const magnitude = sync.connect(v => v == 1 ? 1 : 0)
const ifft = ia.ifft({ windowSize })
magnitude.connect(ifft.magnitude)
sync.connect(ifft.sync)
```
"Map" function (working name) must return either `{ real, imaginary? }` or `{ magnitude, phase? }`. (Or should it assume mutation in place...?)

One idea: make `magnitude`, `phase`, `real`, and `imaginary` all available, with custom get / set bracket notation to overwrite the underlying buffer.

Problem: if someone uses the individual `AudioRateOutputs` (e.g. `magnitude`) then processing them individually may cause latency and make the sync signal no longer accurate. But this is a general issue that I don't fully understand.

## Integer issue

Sometimes, audio-rate signals must represent exact integers (e.g. sample index or FFT sync signal). However, float32 values are not exact integers.

### Option 1: Re-encode
One solution is to encode as integer buffers with the same number of bits:
```js
// Encode
const intArr = new Int32Array(128).map((v, i) => i)
floatArr = new Float32Array(intArr.buffer)

// Decode
const decodedArr = new Int32Array(floatArr.buffer)
```

We'd have to have a way to record which datatype an input should be... which opens up a can of worms about how to process functions with these inputs

```js
// Given the raw (number) values. 
f = ia.function((sync: int, val: float) => {
  // How do we know whether to encode the output as float or an int?
  return sync + val
})
```

Then if we attach that to a position:
```js
const reader = ia.bufferReader(fname)
f.connect(reader.offset)
```

The actual data will be upscaled to "real" float32 causing a problem

### Option 2: Round [preferred]

Whenever we need to process a number as an int, round it to the nearest integer at the beginning of processing

### Option 3: Round at source [preferred]

Whenever there is a ramp method with `units='samples'`, round the values **before** outputting them. I *think* they may still be `==` to javascript integers represented by the `number` type.

## Mapping

### North star: Combine FFT / audio / control elements.
```js
ia.combine(
  [myFft, myNoiseSignal, freezeSwitch],
  (fft, noise, swtch) => { 
    if (swtch) {
      // Freeze FFT ('state' stores user-defined properties).
      // NOTE: previousOutputs doesn't work, as it would initially 
      // be zero.
      this.state.frozenMagnitude ??= fft.magnitude
      return {
        magnitude: this.state.frozenMagnitude,
        phase: fft.phase
      }    
    } else {
      // Add some noise to magnitude.
      // The FFT size and audio frame size should always be the same.
      this.state.frozenMagnitude = undefined
      const noisyMag = fft.magnitude.map((v, i) => v + 0.1 * noise[i])
      return {
        magnitude: noisyMag,
        phase: fft.phase
      }
    }
}, { outputSignature: [FFTOutput]})
```

#### Concerns

- For FFT-based operations, we will need to synchonize two different FFT inputs. One may start 1 "audio frame" (128 samples) later but have an FFT size of 1024, for example.
- We also need to only allow FFTs of the same window size
- As far as dimensions: we should change it to be `includeTimeDimension: boolean` and `includeChannelDimension: boolean`. For operations involving FFT, `includeTimeDimension` must always be true. Any audio signal passed will have the same window size as the FFT.
- The control inputs should be tranferred over with a `postMessage()` call. This means they *must* be serializable.
- The current value of each control input on the worklet side should be used. So the event-based updating won't be controlled by the worklet processing.
- We need to have a way of processing according to an `inputSignature` and `outputSignature`. The `inputSignature` will be inferred.
- Dimensions always go `[outputs, channels, data]`, where `data` is either FFT keys, or an audio array or single number.
- We need to have a type check on the output. It is assumed to be audio-rate if `outputSignature` is not specified. Here's what it checks:
  - If the output is not an array, that's fine; it is converted to an array of size 1.
  - If `includeChannelDimension` is true, each entry in the output array must either be a dict with `left`, `right` and numbered keys, or an array.
  - FFT outputs must have keys `magnitude` and `phase`.
  - Audio outputs can be of type `Float32Array` or `number[]`.
  - `undefined` is only acceptable when specifying that a channel should be empty.
  - Control outputs are *not* allowed.

This is made simpler by the fact that `outputSignature` must be specified if the output is not audio.

```js
return [
  // Single-channel FFT output.
  {
    left: {
      magnitude: leftMagnitude,
      phase: leftPhase
    }
  },
  // Stereo FFT output, array-style.
  [
    {
      magnitude: leftMagnitude,
      phase: leftPhase
    },
    {
      magnitude: rightMagnitude,
      phase: rightPhase
    }
  ],
  // Stereo audio output, array-style.
  [leftAudio, rightAudio],
  // Quad audio output, object-style.
  {
    left: leftAudio,
    right: rightAudio,
    2: channel2Audio,
    3: channel3Audio
  }
]
```