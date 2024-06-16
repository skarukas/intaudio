
// Begin main code

addEventListener('mousedown', () => {
  if (_GLOBAL_STATE.isInitialized) return
  _GLOBAL_STATE.isInitialized = true
  GLOBAL_AUDIO_CONTEXT.resume()
  afterAudioContextActivate()
})

const assertTrue = (pred, msg) => {
  console.assert(pred, msg)
  console.log("Passed assertion")
}

function assertThrows(fn, substr) {
  try {
    fn()
    assertTrue(False, "Method succeeded. " + fn)
  } catch (e) {
    assertTrue(e.toString().match(substr), "Wrong error " + e)
  }
}

function display(v, max=50) {
  let n = Math.floor(v * max)
  if (v > 0) {
    console.log(".".repeat(n))
  } else {
    //console.log("x".repeat(-n))
  }
}

function createOscillator(freq=440) {
  let oscillator = GLOBAL_AUDIO_CONTEXT.createOscillator()
  oscillator.type = 'sine'
  oscillator.frequency.value = freq
  oscillator.start()
  return oscillator
}

// TESTS
const tests = {
  multiInputControlFunction() {
    let subtractNumbers = new FunctionComponent((x, y) => x - y)
    let val;
    subtractNumbers.connect(v => {
      val = v
   })
    assertTrue(val == undefined)
    subtractNumbers.$x.setValue(10)
    subtractNumbers.$y.setValue(20)
    assertTrue(val == -10)
  },
  keyboardAndSynth() {
    const keyboard = new Keyboard(48)
    const synth = new SimplePolyphonicSynth()
    keyboard.addToDom('#keyboard')
    keyboard.connect(synth)
    synth.connect(MAIN_OUT)
    
    function removeNote(pitch) {
      if (pitch < 60) {
        return
      }
      keyboard.midiInput.setValue(new KeyEvent(KeyEventType.KEY_UP, pitch, 127))
      setTimeout(() => removeNote(pitch-2), 400)
    }
    function addNote(pitch) {
      if (pitch > 80) {
        removeNote(pitch)
        return
      }
      keyboard.midiInput.setValue(new KeyEvent(KeyEventType.KEY_DOWN, pitch, 127))
      setTimeout(() => addNote(pitch+2), 400)
    }
    // Add a bunch of notes, then remove them.
    addNote(60)
  },
  convertAudioToControl() {
    // Conversion from audio to control signal
    let oscillator = createOscillator()
    let oscillatorOutput = new AudioRateOutput(oscillator)

    // TODO: This does't work because there's no way to processs 2 signals 
    // together right now.
    // Will have to put the channels side by side or something?
    let subtractSignals = new FunctionComponent((x, y) => x - y)
    oscillatorOutput.connect(subtractSignals.$x)
    oscillatorOutput.connect(subtractSignals.$y)
    let t1 = subtractSignals.sampleSignal(1024)
    t1.connect(v => assertTrue(v == 0, v))

    let t2 = oscillatorOutput
      .connect(v => v * 300)
      .sampleSignal(1024)
    t2.connect(v => console.log("Current osc value: " + v))
    console.log(t1)
    setTimeout(() => {
      oscillator.stop()
      t1.stop()
      t2.stop()
    }, 5000)
  },
  generateWhiteNoise() {
    let whiteNoiseSource = new FunctionComponent(() => Math.random() - 0.5)
    whiteNoiseSource.connect(MAIN_OUT)
    setTimeout(() => {
      // TODO: doesn't work. Need to add gain node to every audio component...
      // whiteNoiseSource.setMuted()
      whiteNoiseSource.output.audioNode.disconnect(MAIN_OUT)
    }, 2000)
  },
  createBang() {
    let bang = new Bang()
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
  adsrEnvelopeSimple() {
    // This should:
    // - Play silence for 1 second
    // - Play attack and decay parts
    // - Release after another second
    let [a, d, s, r] = [100, 200, 0.1, 1000]
    let envelope = new ADSR(a, d, s, r)
    let osc = createOscillator()
    let gain = GLOBAL_AUDIO_CONTEXT.createGain()
    gain.gain.value = 0
    let attackBang = new Bang()
    attackBang.addToDom("#bang")

    // Control
    attackBang.connect(envelope.attackEvent).connect(gain.gain)
    attackBang.connect(() => {
      setTimeout(() => envelope.releaseEvent.trigger(), 2000)
    })
    // Audio flow
    osc.connect(gain).connect(MAIN_OUT)
    
    // Analyze the envelope
    envelope.connect(new ScrollingAudioMonitor()).addToDom("#monitor")
  },
  adsrSummingEnvelopes() {
    let envelope1 = new ADSR(500, 200, 0.5, 1000)
    let envelope2 = new ADSR(20, 20, 0.5, 10)
    let attackBang = new Bang()
    let releaseBang = new Bang()
    attackBang.addToDom("#bang")
    let oscillator = new AudioComponent(createOscillator(10))
    let oscillator2 = new AudioComponent(createOscillator(3))

    let fn = new FunctionComponent((e1, e2, w, w2) => (e1 + e2) * (w * 0.03 + w2 * 0.2 + Math.random() * 0.1))
    attackBang.connect(envelope1.attackEvent)
    attackBang.connect(envelope2.attackEvent)
    releaseBang.connect(envelope1.releaseEvent)
    releaseBang.connect(envelope2.releaseEvent)

    const compoundEnvelope = fn.call(envelope1, envelope2, oscillator, oscillator2)

    compoundEnvelope.connect(v => Math.random() * v).connect(MAIN_OUT)
    
    attackBang.connect(() => {
      setTimeout(() => releaseBang.trigger(), 2000)
    })
    attackBang.trigger()
    

    let monitor = new ScrollingAudioMonitor(20, 128, 'auto', 'auto')
    monitor.addToDom("#monitor")
    fn.connect(monitor)
  },
  adsrEnvelopeComplex() {
    // This should:
    // - Play a sine at 400 Hz for 1 sec.
    // - Over 100 ms, move to 450 Hz
    // - Over 10 ms, move to 425 Hz
    // - Wait until the release trigger (~1 sec)
    // - Over 1000 ms, move to 400 Hz
    let [a, d, s, r] = [1000, 10, 0.5, 1000]
    let envelope = new ADSR(a, d, s, r)
    let freq = 440
    let osc = createOscillator(freq)
    let scaled = envelope.connect(v => (v * 50) + freq)
    scaled.connect(osc.frequency)
    setTimeout(() => envelope.attackEvent.trigger(), 2000)
    setTimeout(() => {
      envelope.releaseEvent.trigger()
      osc.disconnect(MAIN_OUT)
    }, 4000)
    osc.connect(MAIN_OUT)
  },
  timeVaryingSignal() {
    let f1 = 880
    let signal = new TimeVaryingSignal(cy => {
      return Math.sin(cy * cy * f1) * 0.2
    }, TimeMeasure.CYCLES)
    let monitor = new ScrollingAudioMonitor(1, 64)
    monitor.addToDom("#monitor")
    signal.connect(monitor)
    signal.connect(MAIN_OUT)
    setTimeout(() => {
      signal.output.audioNode.disconnect(MAIN_OUT)
    }, 4000)
  },
  typingKeyboardInput() {
    const keyInput = new TypingKeyboardMIDI()
    const uiKeyboard = new Keyboard()
    const synth = new SimplePolyphonicSynth()
    keyInput.connect(uiKeyboard)
    uiKeyboard.connect(synth)
    uiKeyboard.addToDom("#keyboard")
    synth.connect(MAIN_OUT)

    let monitor = new ScrollingAudioMonitor(4, 128, 'auto', 'auto')
    monitor.addToDom("#monitor")
    synth.connect(monitor)
  },
  eliminateDuplicates() {
    const duplicateFilter = new IgnoreDuplicates()
    let envelope = new ADSR(100, 10, 0.5, 1000)
    // Log only when the signal changes
    envelope.sampleSignal()
      .connect(duplicateFilter)
      .connect(v => console.log(v))
    envelope.attackEvent.trigger()
  },
  setParamByDict() {
    let envelope = new ADSR(100, 10, 0.5, 1000)
    let fn = new FunctionComponent(() => ({
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
    let envelope = new ADSR(100, 10, 0.5, 1000)
    let fn = new FunctionComponent(x => {
      // This is undefined behavior but cannot be prevented.
      return {
        input: x,
        ham: 12398
      }
    })
    let oscFreq = new AudioComponent(createOscillator(400).frequency)
    // Try to modulate the frequency of the oscillator by using an object 
    // (throws error)
    envelope.connect(fn).connect(oscFreq)
  },
  sliderControl() {
    let slider = new RangeInputComponent()
    slider.addToDom("#knob")
    let inputs = []
    slider.connect(v => inputs.push(v))
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
  scopedClasses() {
    // Scopes let you create functionally separate component graphs, with 
    // different global settings and AudioContexts.
    let audioContext = new AudioContext()
    audioContext.__id = "new context"
    let sc = AudioScope.create(audioContext)
    let synth = new sc.SimplePolyphonicSynth()
    let transformed = synth.connect(x => x / 2)
    
    assertTrue(
      (transformed.scopeId == synth.scopeId) 
      && (sc.id == synth.scopeId),
      [sc.id, transformed.scopeId, synth.scopeId])
  },
  crossScopeConnnectionFailure() {
    let sc = AudioScope.create()
    let keyboard = new Keyboard()
    let synth = new sc.SimplePolyphonicSynth()
    assertThrows(
      () => keyboard.connect(synth),
      "Unable to connect components from different scopes.")
  }
  /* periodicWaveTest() {
    const w = new Wave(Wave.Type.SINE)
  } */
}

const keyInput = new TypingKeyboardMIDI()
const keyboard = new Keyboard(48)
keyboard.addToDom('#keyboard')  // Add UI component under arbitrary DOM element.
const synth = new SimplePolyphonicSynth()

keyInput             // Collect live computer keyboard presses (event-based).
  .connect(keyboard) // Display on UI (also responds to clicks).
  .connect(synth)    // Transform note on/off information into an audio-rate signal. 
  .connect(MAIN_OUT) // Play through speakers.

function afterAudioContextActivate() {
  return tests.crossScopeConnnectionFailure()
  for (let test in tests) {
    tests[test]()
  }
}

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