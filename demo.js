import ia from "./dist/bundle.js"

if (!ia) {
  throw new Error("Need audio library.")
}
console.log(ia)

function assertEqual(actual, expected, msg = undefined) {
  assertTrue(actual == expected, msg ?? `${actual} != ${expected}`)
}

const assertTrue = (pred, msg) => {
  console.assert(pred, msg)
  console.log("Passed assertion")
}

const ASSERT_SAMPLING_PERIOD_MS = 50

function assertSilentSignal(output) {
  const trace = Error().stack
  output.sampleSignal(ASSERT_SAMPLING_PERIOD_MS).connect(v => {
    if (v) {
      console.error(output)
      console.error(`Expected silent signal, found value ${v}. ` + trace)
      ia.disconnect()
    }
  })
}

function assertNonzeroSignal(output, maxGapMs = 4000) {
  let zeroCount = 0
  const trace = Error().stack
  output.sampleSignal(ASSERT_SAMPLING_PERIOD_MS).connect(v => {
    if (v) {
      zeroCount = 0
    } else {
      zeroCount++
      if (zeroCount > maxGapMs / ASSERT_SAMPLING_PERIOD_MS) {
        console.error(output)
        console.error(`Expected nonzero signal, found silence for more than ${maxGapMs}ms. ` + trace)
        ia.disconnect()
      }
    }
  })
}

function assertThrows(fn, substr) {
  try {
    fn()
    assertTrue(false, "Method succeeded. " + fn)
  } catch (e) {
    assertTrue(e.toString().match(substr), "Wrong error " + e)
  }
}

function display(v, max = 50) {
  let n = Math.floor(v * max)
  if (v > 0) {
    console.log(".".repeat(n))
  } else {
    //console.log("x".repeat(-n))
  }
}

function createOscillator(freq = 440) {
  let oscillator = ia.audioContext.createOscillator()
  oscillator.type = 'sine'
  oscillator.frequency.value = freq
  oscillator.start()
  return oscillator
}

// TESTS
const tests = {
  multiInputControlFunction() {
    let subtractNumbers = new ia.FunctionComponent((x, y) => x + y.toFixed(0))
    let val;
    subtractNumbers.connect(v => {
      val = v
    })
    assertTrue(val == undefined)
    subtractNumbers.$x.setValue(10)
    subtractNumbers.$y.setValue(20)
    assertTrue(val == "1020", val)
  },
  keyboardAndSynth($root) {
    const keyboard = new ia.Keyboard(48)
    const synth = new ia.SimplePolyphonicSynth()
    keyboard.addToDom($root)
    keyboard.connect(synth)
    synth.connect(ia.out)

    function removeNote(pitch) {
      if (pitch < 60) {
        return
      }
      keyboard.midiInput.setValue(new ia.KeyEvent(ia.KeyEventType.KEY_UP, pitch, 127))
      setTimeout(() => removeNote(pitch - 2), 400)
    }
    function addNote(pitch) {
      if (pitch > 80) {
        removeNote(pitch)
        return
      }
      keyboard.midiInput.setValue(new ia.KeyEvent(ia.KeyEventType.KEY_DOWN, pitch, 127))
      setTimeout(() => addNote(pitch + 2), 400)
    }
    // Add a bunch of notes, then remove them.
    addNote(60)
  },
  convertAudioToControl() {
    // Conversion from audio to control signal
    let oscillator = createOscillator()
    let oscillatorOutput = new ia.AudioRateOutput('osc', oscillator)

    // TODO: This does't work because there's no way to processs 2 signals 
    // together right now.
    // Will have to put the channels side by side or something?
    let subtractSignals = new ia.FunctionComponent((x, y) => x - y)
    oscillatorOutput.connect(subtractSignals.$x)
    oscillatorOutput.connect(subtractSignals.$y)
    let t1 = subtractSignals.sampleSignal(1024)
    t1.connect(v => assertTrue(v == 0, v))

    let t2 = oscillatorOutput
      .connect(v => v * 300)
      .sampleSignal(1024)
    // TODO: fix this! it's broken
    t2.connect(v => console.log("Current osc value: " + v))
    console.log(t1)
    setTimeout(() => {
      oscillator.stop()
      t1.stop()
      t2.stop()
    }, 5000)
  },
  generateWhiteNoise() {
    let whiteNoiseSource = new ia.FunctionComponent(() => Math.random() - 0.5)
    whiteNoiseSource.connect(ia.out)
    setTimeout(() => {
      // TODO: doesn't work. Need to add gain node to every audio component...
      // whiteNoiseSource.setMuted()
      whiteNoiseSource.output.audioNode.disconnect(ia.out)
    }, 2000)
  },
  createBang($root) {
    let bang = new ia.Bang()
    bang.addToDom($root)
    let bangs = 0
    bang.connect(_ => {
      console.log("bang!")
      bangs++
    })
    bang.trigger()
    bang.trigger()
    bang.trigger()
    assertTrue(bangs == 3, bangs)
  },
  adsrEnvelopeSimple($root) {
    // This should:
    // - Play silence for 1 second
    // - Play attack and decay parts
    // - Release after another second
    let [a, d, s, r] = [100, 200, 0.1, 1000]
    let envelope = new ia.ADSR(a, d, s, r)
    let osc = createOscillator()
    let gain = ia.audioContext.createGain()
    gain.gain.value = 0
    let attackBang = new ia.Bang()
    attackBang.addToDom($root, { width: 48, height: 48 })

    // Control
    attackBang.connect(envelope.attackEvent).connect(gain.gain)
    attackBang.connect(() => {
      setTimeout(() => envelope.releaseEvent.trigger(), 2000)
    })
    // Audio flow
    osc.connect(gain).connect(ia.out)

    // Analyze the envelope
    envelope.connect(new ia.ScrollingAudioMonitor())
      .addToDom($root, { top: 48, width: 128, height: 48 })
  },
  adsrSummingEnvelopes($root) {
    let envelope1 = new ia.ADSR(500, 200, 0.5, 1000)
    let envelope2 = new ia.ADSR(20, 20, 0.5, 10)
    let attackBang = new ia.Bang()
    let releaseBang = new ia.Bang()
    attackBang.addToDom($root, { width: 48, height: 48 })
    let oscillator = new ia.AudioComponent(createOscillator(440))
    let oscillator2 = new ia.AudioComponent(createOscillator(220))

    const compoundEnvelope = ia.combine(
      { e1: envelope1, e2: envelope2, w: oscillator, w2: oscillator2, v: 0.5 }, (e1, e2, w, w2, v) => {
        // Apply complex operation at signal-rate.
        return (e1 + e2) * (w * 0.03 + w2 * 0.2 + Math.random() * 0.01) * v
      })
    compoundEnvelope.connect(ia.out.right)

    attackBang.connect(envelope1.attackEvent)
    attackBang.connect(envelope2.attackEvent)
    releaseBang.connect(envelope1.releaseEvent)
    releaseBang.connect(envelope2.releaseEvent)

    attackBang.connect(() => {
      setTimeout(() => releaseBang.trigger(), 2000)
    })
    attackBang.trigger()

    let monitor = new ia.ScrollingAudioMonitor(20, 128, 'auto', 'auto')
    monitor.addToDom($root, { width: 256, height: 48, left: 48 })

    compoundEnvelope.connect(monitor.input.left)
    compoundEnvelope.connect(v => -v).connect(monitor.input.right)
    compoundEnvelope.connect(v => v + 0.1).connect(monitor.input.channels[2])
    compoundEnvelope.connect(v => v - 0.1).connect(monitor.input.channels[3])
  },
  adsrEnvelopeComplex() {
    // This should:
    // - Play a sine at 400 Hz for 1 sec.
    // - Over 100 ms, move to 450 Hz
    // - Over 10 ms, move to 425 Hz
    // - Wait until the release trigger (~1 sec)
    // - Over 1000 ms, move to 400 Hz
    let [a, d, s, r] = [1000, 10, 0.5, 1000]
    let envelope = new ia.ADSR(a, d, s, r)
    let freq = 440
    let osc = createOscillator(freq)
    let scaled = envelope.connect(v => (v * 50) + freq)
    scaled.connect(osc.frequency)
    setTimeout(() => envelope.attackEvent.trigger(), 2000)
    setTimeout(() => {
      envelope.releaseEvent.trigger()
      osc.disconnect(ia.out)
    }, 4000)
    osc.connect(ia.out)
  },
  timeVaryingSignal($root) {
    let f1 = 880
    let signal = new ia.TimeVaryingSignal(cy => {
      return Math.sin(cy * cy * f1) * 0.2
    }, 'cycles')
    let monitor = new ia.ScrollingAudioMonitor(1, 64)
    monitor.addToDom($root)
    signal.connect(monitor)
    signal.connect(ia.out)
    setTimeout(() => {
      signal.output.audioNode.disconnect(ia.out)
    }, 4000)
  },
  typingKeyboardInput($root) {
    const keyInput = new ia.TypingKeyboardMIDI()
    const uiKeyboard = new ia.Keyboard()
    const synth = new ia.SimplePolyphonicSynth()
    keyInput.connect(uiKeyboard)
    uiKeyboard.connect(synth)
    uiKeyboard.addToDom($root, { width: 512, height: 64, rotateDeg: -90 })
    synth.connect(ia.out)

    let monitor = new ia.ScrollingAudioMonitor(4, 128, 'auto', 'auto')
    monitor.addToDom($root, { top: 64, width: 512, height: 64 })
    synth.connect(monitor)
  },
  eliminateDuplicates() {
    const duplicateFilter = new ia.IgnoreDuplicates()
    let envelope = new ia.ADSR(100, 10, 0.5, 1000)
    // Log only when the signal changes
    envelope.sampleSignal()
      .connect(duplicateFilter)
      .connect(v => console.log(v))
    envelope.attackEvent.trigger()
  },
  setParamByDict() {
    let envelope = new ia.ADSR(100, 10, 0.5, 1000)
    let fn = new ia.FunctionComponent(() => ({
      attackDurationMs: 1000,
      decayDurationMs: 100,
      isMuted: true
    }))
    fn.connect(envelope)
    fn.triggerInput.trigger()
    assertTrue(envelope.attackDurationMs.value == 1000, envelope.attackDurationMs.value)
    assertTrue(envelope.decayDurationMs.value == 100, envelope.decayDurationMs.value)
  },
  audioParamByDictFailure() {
    let envelope = new ia.ADSR(100, 10, 0.5, 1000)
    let fn = new ia.FunctionComponent(x => {
      // This is undefined behavior but cannot be prevented.
      return {
        input: x,
        ham: 12398
      }
    })
    let oscFreq = new ia.AudioComponent(createOscillator(400).frequency)
    // Try to modulate the frequency of the oscillator by using an object 
    // (throws error)
    envelope.connect(fn).connect(oscFreq)
  },
  sliderControl($root) {
    let slider = new ia.RangeInputComponent()
    slider.addToDom($root, { width: 100, height: 20, rotateDeg: -90 })
    let inputs = []
    slider.connect(v => {
      console.log("slider value: " + v)
      inputs.push(v)
    })
    slider.setValues({
      maxValue: 100,
      minValue: 0,
      input: 30,
      step: 1
    })
    setTimeout(() => {
      slider.setValues({ input: 50 })
      assertTrue(JSON.stringify(inputs) == JSON.stringify([30, 50]), inputs)
    }, 1000)
  },
  namespaceConfig() {
    // Configs (stache) let you create functionally separate component graphs,  
    // with different global settings and AudioContexts.
    let audioContext = new AudioContext()
    const configId = "my-config"
    let ia2 = ia.withConfig({ audioContext }, configId)
    let synth = new ia2.SimplePolyphonicSynth()
    let transformed = synth.connect(x => x / 2)

    assertTrue(
      (transformed.configId == synth.configId)
      && (configId == synth.configId),
      [configId, transformed.configId, synth.configId])
  },
  crossNamespaceConnnectionFailure() {
    let audioContext = new AudioContext()
    let ia2 = ia.withConfig({ audioContext })
    let keyboard = new ia.Keyboard()
    let synth = new ia2.SimplePolyphonicSynth()
    assertThrows(
      () => keyboard.connect(synth),
      "Unable to connect components from different namespaces.")
  },
  midiInput($demo) {
    const midiIn = new ia.MidiInputDevice("newest")
    midiIn.addToDom($demo)
    midiIn.midiOut.connect(v => console.log(v))
    midiIn.availableDevices.connect(v => console.log(v))
    midiIn.activeDevices.connect(v => console.log(v))
  },
  mediaElement($root) {
    $root.append(`
    <div>
      <audio controls id="audio" crossorigin="anonymous">
        <source src="assets/fugue.m4a"  type="audio/mpeg">
      </audio>
      <video id="video" controls="controls" preload='none' width="600">
        <source id='mp4' src="http://media.w3.org/2010/05/sintel/trailer.mp4" type='video/mp4' />
      </video>
    </div>`)
    setTimeout(() => {
      const playbackRate = new ia.RangeInputComponent(0, 32, undefined, 1)
      const audio = new ia.MediaElementComponent("#audio")
      const video = new ia.MediaElementComponent("#video")

      playbackRate.addToDom($root)
      playbackRate.connect(audio.playbackRate)
      playbackRate.connect(video.playbackRate)
      audio.connect(ia.out)
      video.connect(ia.out)
    }, 1000)
  },
  slowDown($root) {
    $root.append(`
    <div>
      <audio controls id="audio" crossorigin="anonymous">
        <source src="assets/fugue.m4a"  type="audio/mpeg">
      </audio>
      <video id="video" controls="controls" preload='none' width="600">
        <source id='mp4' src="http://media.w3.org/2010/05/sintel/trailer.mp4" type='video/mp4' />
      </video>
    </div>`)
    setTimeout(() => {
      const audio = new ia.MediaElementComponent("#audio")
      const slow = new ia.SlowDown(0.5)
      audio.connect(slow).audioOutput.connect(ia.out)
      slow.rampOut.sampleSignal().connect(v => console.log(v))
      setTimeout(() => slow.start(), 5000)
    }, 1000)
  },
  channelStackerAndSplitter($root) {
    let oscillator = new ia.AudioComponent(createOscillator(440))
    let oscillator2 = new ia.AudioComponent(createOscillator(445))
    const monitor = new ia.ScrollingAudioMonitor()
    monitor.addToDom($root)

    // Weird quirk, each oscillator is actually stereo, so we need to discard 
    // channel 1 and 3 after stacking.
    const stacked = ia.stackChannels([oscillator, oscillator2])
    stacked.connect(monitor)
    // TODO: Maybe make stackAsChannels which mono-izes each 
    // input, or another arg numChannelsPerInput (ex: [1, 1]) that explicitly
    // clarifies the intended result?
    const [left, _1, right] = stacked.splitChannels()
    console.log([left, right])
    left.connect(ia.out.left)
    right.connect(ia.out.right)
  },
  transformAudio($root) {
    let oscillator = new ia.AudioComponent(createOscillator(440))
    const monitor = new ia.ScrollingAudioMonitor()
    monitor.addToDom($root)

    // Apply to each sample, across channels.
    const channelTransform = oscillator.transformAudio(({ left, right }) => {
      return [left, undefined, right, undefined]
    }, "channels", { useWorklet: true })
    channelTransform.connect(monitor.input.channels[2])
    assertEqual(channelTransform.numOutputChannels, 4)
    assertNonzeroSignal(channelTransform.output.channels[0])
    assertSilentSignal(channelTransform.output.channels[1])
    assertNonzeroSignal(channelTransform.output.channels[2])
    assertSilentSignal(channelTransform.output.channels[3])

    // Apply across channels and time.
    const ctTransform = oscillator.transformAudio(function ({ left, right }) {
      for (let i = 0; i < left.length; i++) {
        left[i] = (left[i] + right[(left.length - i) - 1]) / 2
      }
      return [left]
    }, "all", { useWorklet: true })
    ctTransform.connect(monitor.input.channels[1])
    assertEqual(ctTransform.numOutputChannels, 1)
    assertNonzeroSignal(ctTransform.output.left)

    // Apply to each sample in each channel.
    const sampleTransform = oscillator.transformAudio(function (x) {
      const windowSize = 256
      let avg = x + this.previousInputs()[0]
      for (let t = 0; t < windowSize; t++) {
        avg += this.previousOutput(t) / windowSize
      }
      return -avg
    }, "none", { useWorklet: true })
    sampleTransform.connect(monitor.input.channels[0])

    assertEqual(sampleTransform.numOutputChannels, 2)
    assertNonzeroSignal(sampleTransform.output.channels[0])
    assertNonzeroSignal(sampleTransform.output.channels[1])

    // The AudioProcessingEvent is bound to `this`.
    const thisSampleTransform = oscillator.transformAudio(function (x) {
      return this.currentTime
    }, "none")

    assertEqual(thisSampleTransform.numOutputChannels, 2)
    assertNonzeroSignal(thisSampleTransform.output.channels[0])
    assertNonzeroSignal(thisSampleTransform.output.channels[1])

    // Reduce over the time dimension.
    const timeTransform = oscillator.transformAudio(arr => {
      for (let i = 0; i < arr.length - 1; i++) {
        arr[i] = (arr[i] + arr[i + 1]) / 2
      }
      return arr
    }, "time", { useWorklet: true })
    timeTransform.connect(monitor.input.channels[3])
    assertNonzeroSignal(timeTransform.output.channels[0])
    assertNonzeroSignal(timeTransform.output.channels[1])

    assertEqual(timeTransform.numOutputChannels, 2)
  },
  multipleInputTransformGainSlider($root) {
    let slider = new ia.RangeInputComponent()
    slider.addToDom($root)
    let oscillator = new ia.AudioComponent(createOscillator(440))
    const monitor = new ia.ScrollingAudioMonitor()
    monitor.addToDom($root, { top: 40 })

    const transform = new ia.AudioTransformComponent((v, vol) => {
      return v * vol
    }, { dimension: "none", useWorklet: true }).withInputs(oscillator, slider)
    transform.connect(monitor).connect(ia.out)
  },
  variableDelayWithSlider($root) {
    // Source: gated noise.
    const whiteNoiseSource = ia.generate(() => Math.random() - 0.5)
    const envelope = new ia.ADSR(10, 50, 0, 10)
    const gatedNoise = ia.combine(
      [whiteNoiseSource, envelope],
      (noise, gain) => noise * gain,
      { useWorklet: true }
    )
    // Trigger ADSR each second.
    setInterval(() => envelope.attackEvent.trigger(), 1000)

    // Control echo duration.
    let delaySlider = new ia.RangeInputComponent(0, 44100)
    delaySlider.addToDom($root)
    const delayedNoise = ia.combine(
      [gatedNoise, delaySlider],
      function (noise, delay) {
        const prevVal = this.previousOutput(delay) * 0.7
        return noise + prevVal
      }, { useWorklet: true }
    )

    // Display.
    const monitor = new ia.ScrollingAudioMonitor()
    monitor.addToDom($root, { top: 40 })

    delayedNoise.connect(monitor).connect(ia.out)
  },
  groupComponents() {
    // Array destructuring and indexing.
    const a = ia.generate(() => 0.5)
    const b = ia.generate(() => -1)
    let group = ia.group([a, b])
    let [o1, o2] = group
    assertEqual(o1, a)
    assertEqual(o2, b)
    assertEqual(group[0], a)
    assertEqual(group[1], b)

    // Object destructuring and indexing.
    group = ia.group({ o1: a, o2: b })
    assertEqual(o1, a)
    assertEqual(o2, b)
    assertEqual(group.o1, a)
    assertEqual(group.o2, b)

    // Applying functions to ordered and named inputs.
    assertSilentSignal(ia.group([a, b]).connect((a, b) => a * 2 + b))
    assertNonzeroSignal(ia.group([a, b]).connect((a) => a))
    assertSilentSignal(ia.group({ b, a }).connect((a, b) => a * 2 + b))
    assertNonzeroSignal(ia.group({ b, a }).connect((a) => a))
  }
}






ia.run(() => {
  //return tests.midiInput()
  for (let test in { groupComponents: tests.groupComponents }) {
    const $testRoot = $(document.createElement('div'))
    tests[test]($testRoot)
    ia.util.afterRender(() => {
      if ($testRoot.children().length) {
        $testRoot.appendTo('#root')
      }
    })
  }
})

// Split then merge channels.
/* oscillator.transformAudio((left, right, c2, c3) => {
  left = left.connect(x => x * 0.5)
  return [left, right, c2, c3]
}, ["channels"]) */

//keyboard.setMuted(true)

// or could do someting more similar to Max, like
/*

// monophonic
keyboard.outputs.pitch
  .connect(mtof)
  .connect(synth.inputs.frequency)

// polyphonic
keyboard.outputs.pitches
  .connect(mtof)
  .connect(synth.inputs.frequencies)

keyboard.outputs.velocities
  .connect(v => v / 128)
  .connect(synth.inputs.gains)

// OR also...?
// I like this.
let knob = new Knob(0, 1)
knob.addToDom('#master-gain-knob')
knod.connect(synth.parameters.masterGain)

// To have both the ability to connect an *interface* to another interface
// e.g.
keyboard.connect(synth)  // "default" input

// TODO: maybe rename addOutput to connect()?
// TODO: let it take in function inputs
*/

function extra() {
  let knob = new Knob(0, 1)
  knob.addToDom('#master-gain-knob')
  knob.connect(synth.parameters.masterGain)

  synth1.outputs.audioStream.connect(synth2.parameters.masterGain)
  synth1.connect(synth2.parameters.masterGain)  // Shorthand for default output.

  knob.connect(v => v * Math.floor(128))
    .connect(keyboard.parameters.lowestPitch)


  let keyboardMute = new Toggle('button')
  keyboardMute.addToDom('#keyboard-mute-button')
  keyboardMute.connect(keyboard.parameters.isMuted)
}