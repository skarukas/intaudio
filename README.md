> [!NOTE]
> This project is currently in development as of summer 2024.

# interactive-audio
Declarative Javascript framework for interactive audio. Arbitrary audio-rate operations, event-based state management, UI components.

This framework exists primarily to provide the ability to build arbitrarily-complex, reactive web instruments using minimal, intuitive code. It utilizes a graph-based declarative style to send both event-based and audio-rate based data, which may be familiar with users of [Max](https://cycling74.com/products/max).

Some features of the framework:
- Shared interface for event-based and audio-rate signals.
- Components are reactive, with easily modulatable params through `source.connect(dest.paramName)`
- Chainable syntax: route audio using `.connect(...).connect(...)` 
- Easily extendable.
- Supports multiple scopes with differing configurations and `AudioContext`s.

## Examples
### Simple synth with an interactive UI keyboard
```js
const keyInput = new TypingKeyboardMIDI()
const keyboard = new Keyboard(48)
keyboard.addToDom('#keyboard')  // Add UI component under arbitrary DOM element.
const synth = new SimplePolyphonicSynth()

keyInput             // Collect live computer keyboard presses (event-based).
  .connect(keyboard) // Display on UI (also responds to clicks).
  .connect(synth)    // Transform note on/off information into an audio-rate signal. 
  .connect(MAIN_OUT) // Play through speakers.
```

### Generate arbitrary audio-rate signal `f(t)` and display the waveform.
```js
const signal = new TimeVaryingSignal(cy => {
  // f(t) = sin((2pi * t)^2)
  // 'cy' is measured in cycles and removes the need for a 2pi coefficient.
  return Math.sin(cy * cy)  
}, TimeMeasure.CYCLES)

const monitor = new ScrollingAudioMonitor(1, 64)
monitor.addToDom("#monitor")  // Add UI component under arbitrary DOM element.

signal
  .connect(monitor)               // Sample signal and display in the UI.
  .audioOutput.connect(MAIN_OUT)  // Connect audio-passthrough output of ScrollingAudioMonitor to the speakers. 
```

### Frequency modulation / Sample-rate operations
```js
const [carrierFreq, modWidth, modFreq] = [100, 30, 10]
const carrier = new Wave('sine', carrierFreq)
const modulator = new Wave('sine', modFreq)
modulator
  .connect(v => carrierFreq + v*modWidth)  // Apply sample-wise operation to return the new frequency value.
  .connect(carrier.frequency)              // Modulate the frequency at audio-rate.

carrier.connect(MAIN_OUT)
```
