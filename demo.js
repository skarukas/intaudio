import ia from "./dist/bundle.js"

if (!ia) {
  throw new Error("Need audio library.")
}

// Determines which test cases to run.
const TEST_MATCHER = /(bundleObject).*/

ia.run(() => {
  const testNames = Object.keys(tests).filter(s => s.match(TEST_MATCHER))
  console.log("Running tests: " + testNames)
  const failedTests = []
  for (let testName of testNames) {
    const $testRoot = $(document.createElement('div'))
    try {
      const testCase = new TestCase(testName)
      tests[testName].bind(testCase)($testRoot)
    } catch (e) {
      console.error(`Failed to execute test case ${testName}.`)
      console.error(e)
      failedTests.push(testName)
    }
    ia.util.afterRender(() => {
      if ($testRoot.children().length) {
        $testRoot.appendTo('#root')
      }
    })
  }
  if (failedTests.length) {
    console.log(`The following tests failed to run due to errors: [${failedTests}]`)
  }
})

function wait(ms, fn) {
  let resolve;
  setTimeout(() => {
    resolve(fn())
  }, ms)
  return new Promise((res) => resolve = res)
}
let currMax = 0
function plot(arr, yrange = undefined, plotname = "plot") {
  if (yrange == undefined) {
    currMax = Math.max(currMax, ...arr)
    yrange = [0, currMax]
  }
  const data = [{ x: arr.map((v, i) => i), y: arr, mode: "lines" }]
  Plotly.react(plotname, data, { yaxis: { range: yrange } })
}

class TestCase {
  assertSamplingPeriodMs = 100
  constructor(name) {
    this.name = name
  }
  assertEqual(actual, expected, msg = undefined) {
    this.assertTrue(actual == expected, msg ?? `expected ${expected}, got ${actual}`)
  }
  assertFalse(pred, msg) {
    this.assertTrue(!pred, msg)
  }
  assertTrue(pred, msg) {
    const symbol = pred ? "✓" : "𐄂"
    const percent = pred ? 100 : 0
    console.assert(pred, msg)
    const $listItem = appendTestSuccessScore(this.name)
    $listItem
      .text(symbol)
      .css('color', getColor(percent))
  }
  assertSignal(output, predicate, description = undefined, maxGapMs = 4000) {
    description ??= `assertSignal(${output}, ${predicate})`
    if (!(output instanceof ia.BaseConnectable)) {
      throw new Error("Expected the signal to be a connectable (output or component), got " + output)
    }
    const $listItem = appendTestSuccessScore(this.name)
    let matchCount = 0
    let totalCount = 0
    const trace = Error().stack
    output.sampleSignal(this.assertSamplingPeriodMs).connect(v => {
      totalCount += 1
      matchCount += !!predicate(v)
      const matchPercent = 100 * matchCount / totalCount
      $listItem
        .text(`${description}: ${matchPercent.toFixed(2)}%`)
        .css('color', getColor(matchPercent))
    })
  }
  assertSilentSignal(output) {
    this.assertSignal(output, v => v == 0, `assertSilentSignal(${output})`)
  }

  assertSignalEquals(output, val, maxGapMs = 4000) {
    this.assertSignal(
      output,
      v => v == val,
      `assertSignalEquals(${output}, ${val})`,
      maxGapMs
    )
  }

  assertNonzeroSignal(output, maxGapMs = 4000) {
    this.assertSignal(
      output,
      v => v != 0,
      `assertNonzeroSignal(${output})`,
      maxGapMs
    )
  }

  assertThrows(fn, substr) {
    try {
      fn()
      this.assertTrue(false, "Method succeeded. " + fn)
    } catch (e) {
      this.assertTrue(e.toString().match(substr), "Wrong error " + e)
    }
  }
}


const $testStatusRoot = $(".test-status-root")
let testCaseListContainers = {}

function appendTestSuccessScore(testName) {
  if (!testCaseListContainers[testName]) {
    const $div = $(document.createElement("div"))
    const $title = $(document.createElement("p")).text(testName)
    const $list = $(document.createElement("ol"))
    $div.appendTo($testStatusRoot)
    $div.append($title, $list)
    testCaseListContainers[testName] = $list
  }
  const $listItem = $(document.createElement("li"))
  $listItem.appendTo(testCaseListContainers[testName])
  return $listItem
}

function interpolate(rgb1, rgb2, intval) {
  const res = []
  for (let i = 0; i < 3; i++) {
    res.push(Math.round(rgb1[i] * (1 - intval) + rgb2[i] * intval));
  }

  return `rgb(${res.join(",")})`
}

const redColor = [255, 0, 0]
const greenColor = [0, 200, 0]

function getColor(percent) {
  return interpolate(redColor, greenColor, percent / 100)
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
    this.assertTrue(val == undefined)
    subtractNumbers.$x.setValue(10)
    subtractNumbers.$y.setValue(20)
    this.assertTrue(val == "1020", val)
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
    let subtractSignals = new ia.AudioTransformComponent((x, y) => x - y)
    oscillatorOutput.connect(subtractSignals.$x)
    oscillatorOutput.connect(subtractSignals.$y)
    this.assertSilentSignal(subtractSignals)

    setTimeout(() => {
      oscillator.stop()
    }, 5000)
  },
  generateWhiteNoise() {
    let whiteNoiseSource = ia.generate(() => Math.random() - 0.5)
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
    this.assertTrue(bangs == 3, bangs)
  },
  adsrEnvelopeSimple($root) {
    // This should:
    // - Play silence for 1 second
    // - Play attack and decay parts
    // - Release after another second
    let [a, d, s, r] = [100, 200, 0.1, 1000]
    let envelope = new ia.ADSR(a, d, s, r)
    let osc = new ia.AudioComponent(createOscillator())
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
    new ia.AudioComponent(osc).connect(ia.out)
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
    this.assertTrue(envelope.attackDurationMs.value == 1000, envelope.attackDurationMs.value)
    this.assertTrue(envelope.decayDurationMs.value == 100, envelope.decayDurationMs.value)
  },
  audioParamByDictFailure() {
    this.assertThrows(() => {
      new ia.AudioTransformComponent(x => {
        return {
          input: x,
          myOtherKey: 12398
        }
      })
    }, 'Unable to read outputs from processing function')
  },
  sliderControl($root) {
    let slider = new ia.RangeInputComponent()
    slider.addToDom($root, { width: 100, height: 20, rotateDeg: -90 })
    let inputs = []
    // TODO: this currently fails because an audio event shows up and makes it 
    // activate twice. Consider making FunctionComponent *only* deal with 
    //control-rate.
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
      this.assertTrue(JSON.stringify(inputs) == JSON.stringify([30, 50]), inputs)
    }, 1000)
  },
  namespaceConfig() {
    // Configs (stache) let you create functionally separate component graphs,  
    // with different global settings and AudioContexts.
    let audioContext = new AudioContext()
    ia.audioContext.__id__ = "default"
    audioContext.__id__ = "special"
    audioContext.createBiquadFilter()
    const configId = "my-config"
    let ia2 = ia.withConfig({ audioContext }, configId)
    let synth = new ia2.SimplePolyphonicSynth()
    let transformed = synth.connect(x => x / 2)

    this.assertTrue(
      (transformed.configId == synth.configId)
      && (configId == synth.configId),
      [configId, transformed.configId, synth.configId])
  },
  crossNamespaceConnnectionFailure() {
    let audioContext = new AudioContext()
    let ia2 = ia.withConfig({ audioContext })
    let keyboard = new ia.Keyboard()
    let synth = new ia2.SimplePolyphonicSynth()
    this.assertThrows(
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
    }, { useWorklet: true, dimension: "channels" })
    channelTransform.connect(monitor.input.channels[2])
    this.assertEqual(channelTransform.numOutputChannels, 4)
    this.assertNonzeroSignal(channelTransform.output.channels[0])
    this.assertSilentSignal(channelTransform.output.channels[1])
    this.assertNonzeroSignal(channelTransform.output.channels[2])
    this.assertSilentSignal(channelTransform.output.channels[3])

    // Apply across channels and time.
    const ctTransform = oscillator.transformAudio(function ({ left, right }) {
      for (let i = 0; i < left.length; i++) {
        left[i] = (left[i] + right[(left.length - i) - 1]) / 2
      }
      return [left]
    }, { useWorklet: true, dimension: "all" })
    ctTransform.connect(monitor.input.channels[1])
    this.assertEqual(ctTransform.numOutputChannels, 1)
    this.assertNonzeroSignal(ctTransform.output.left)

    // Apply to each sample in each channel.
    const sampleTransform = oscillator.transformAudio(function (x) {
      const windowSize = 256
      let avg = x + this.previousInputs()[0]
      for (let t = 0; t < windowSize; t++) {
        avg += this.previousOutputs(t)[0] / windowSize
      }
      return -avg
    }, { useWorklet: true })
    sampleTransform.connect(monitor.input.channels[0])

    this.assertEqual(sampleTransform.numOutputChannels, 2)
    this.assertNonzeroSignal(sampleTransform.output.channels[0])
    this.assertNonzeroSignal(sampleTransform.output.channels[1])

    // The AudioProcessingEvent is bound to `this`.
    const thisSampleTransform = oscillator.transformAudio(function (x) {
      return this.currentTime
    })

    this.assertEqual(thisSampleTransform.numOutputChannels, 2)
    this.assertNonzeroSignal(thisSampleTransform.output.channels[0])
    this.assertNonzeroSignal(thisSampleTransform.output.channels[1])

    // Reduce over the time dimension.
    const timeTransform = oscillator.transformAudio(arr => {
      for (let i = 0; i < arr.length - 1; i++) {
        arr[i] = (arr[i] + arr[i + 1]) / 2
      }
      return arr
    }, { useWorklet: true, dimension: "time" })
    timeTransform.connect(monitor.input.channels[3])
    this.assertNonzeroSignal(timeTransform.output.channels[0])
    this.assertNonzeroSignal(timeTransform.output.channels[1])

    this.assertEqual(timeTransform.numOutputChannels, 2)
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
    setInterval(() => envelope.attackEvent(), 1000)

    // Control echo duration.
    let delaySlider = new ia.RangeInputComponent(0, 44100)
    delaySlider.addToDom($root)
    const delayedNoise = ia.combine(
      [gatedNoise, delaySlider],
      function (noise, delay) {
        const prevVal = this.previousOutputs(delay)[0] * 0.7
        return noise + prevVal
      }, { useWorklet: true }
    )

    // Display.
    const monitor = new ia.ScrollingAudioMonitor()
    monitor.addToDom($root, { top: 40 })

    delayedNoise.connect(monitor).connect(ia.out)
  },
  variableDelaySinewave($root) {
    // Source: gated noise.
    const whiteNoiseSource = ia.generate(() => Math.random() - 0.5)
    const envelope = new ia.ADSR(10, 50, 0, 10)
    const gatedNoise = ia.combine(
      [whiteNoiseSource, envelope],
      (noise, gain) => noise * gain,
      { useWorklet: true }
    )
    // Trigger ADSR each second.
    //setInterval(() => envelope.attackEvent.trigger(), 1000)
    envelope.attackEvent.trigger()

    // Control echo duration.

    const lfo = new ia.Wave("triangle", 21)
      .transformAudio(([l, r]) => {
        const bw = 44100
        return [
          (l ** 0.5 + Math.random()) * bw / 2, //((l + 1) / 2) * Math.random() * bw,
          (-(r ** 0.5) + Math.random()) * bw / 2 //((1 - r) / 2) * Math.random() * bw
        ]
      }, { dimension: "channels" })

    const delayedNoise = ia.combine(
      [gatedNoise, lfo],
      function (noise, delay) {
        if (Math.random() < 0.00001) return Math.random()
        const prevVal = this.previousOutputs(delay)[0]// * 0.8
        return noise + prevVal
      }, { useWorklet: true }
    )

    // Display.
    const monitor = new ia.ScrollingAudioMonitor()
    monitor.addToDom($root, { top: 40 })
    delayedNoise.connect(monitor).connect(ia.out)
  },
  bundleArray() {
    // Array destructuring and indexing.
    const a = ia.generate(() => 0.5)
    const b = ia.generate(() => -1)
    const bundle = ia.bundle([a, b])
    const [o1, o2] = bundle
    this.assertEqual(o1, a)
    this.assertEqual(o2, b)
    this.assertEqual(bundle[0], a)
    this.assertEqual(bundle[1], b)
  },
  bundleObject() {
    const a = ia.generate(() => 0.5)
    const b = ia.generate(() => -1)
    // Object destructuring and indexing.
    const bundle = ia.bundle({ o1: a, o2: b })
    this.assertEqual(bundle.o1, a)
    this.assertEqual(bundle.o2, b)

    // Applying functions to ordered and named inputs.
    this.assertSilentSignal(ia.bundle([a, b]).connect((a, b) => a * 2 + b))
    this.assertNonzeroSignal(ia.bundle([a, b]).connect((a) => a))
    this.assertSilentSignal(ia.bundle({ b, a }).connect((a, b) => a * 2 + b))
    this.assertNonzeroSignal(ia.bundle({ b, a }).connect((a) => a))
  },
  perOutputArrayInput() {
    const a = ia.generate(() => 0.5)
    const b = ia.generate(() => -1)
    const bundle = ia.bundle([a, b])
    const modifiedBundle = bundle.perOutput([
      a => a.connect(x => x + 5),
      b => b.connect(x => x * 2)
    ])
    const [a1, b1] = modifiedBundle
    this.assertSignalEquals(modifiedBundle[0], 5.5)
    this.assertSignalEquals(modifiedBundle[1], -2)
    this.assertSignalEquals(a1, 5.5)
    this.assertSignalEquals(b1, -2)
  },
  perOutputObjInput() {
    const a = ia.generate(() => 0.5)
    const b = ia.generate(() => -1)
    const bundle = ia.bundle({ b, a })
    const modifiedBundle = bundle.perOutput({
      a: a => a.connect(x => x + 5),
      b: b => b.connect(x => x * 2)
    })
    this.assertSignalEquals(modifiedBundle.a, 5.5)
    this.assertSignalEquals(modifiedBundle.b, -2)
  },
  perChannel() {
    const a = ia.generate(() => 0.5)
    const b = ia.generate(() => -1)
    // broken.... need to make this work for both outputs AND inputs
    const stack = ia.stackChannels([a, b])
    const modifiedStack = stack.perChannel({
      left: l => l.connect(x => x + 5),
      right: r => r.connect(x => x * 2)
    })
    this.assertSignalEquals(modifiedStack.output.left, 5.5)
    this.assertSignalEquals(modifiedStack.output.right, -2)
  },
  processingPreservesPhase() {
    // Currently fails for both worklet and non-worklet.
    // Could there be some way to keep signals synced? (prob not)
    const signal = ia.generate(() => Math.random())
    const processedSignal = signal.connect(x => x)
    const diff = ia.bundle([signal, processedSignal]).connect((x, y) => x - y)
    this.assertSilentSignal(diff)
  },
  bufferComponent($root) {
    ia.config.useWorkletByDefault = true
    const buffer = ia.bufferReader("assets/fugue.m4a")
    const timeRamp = ia.ramp('samples').transformAudio(
      x => (1 + Math.sin(x / (10 * 44100))) * 20 * 44100
    )
    ia.stackChannels([
      timeRamp.left,
      timeRamp.transformAudio(x => 20 * 44100 - x).left
    ]).connect(buffer.time)
      .logSignal()

    const monitor = new ia.ScrollingAudioMonitor()
    monitor.addToDom($root)
    buffer.connect(monitor).connect(ia.out)
  },
  bufferWriter() {
    const buffer = new AudioBuffer({
      numberOfChannels: 2,
      length: 128,
      sampleRate: ia.audioContext.sampleRate
    })
    const writer = ia.bufferWriter(buffer)
    const rand = ia.generate(() => Math.random())
    const position = rand.connect(v => Math.floor(v * 4))
    const value = rand.connect(v => Math.floor(v * 4) + v)
    position.connect(writer.position)
    value.connect(writer.valueToWrite)

    for (const c of [0, 1]) {  // For each channel
      wait(500, () => {
        // Expect (only) the first four values to be written.
        const channel = buffer.getChannelData(c)
        const firstSlice = channel.slice(0, 4)
        this.assertTrue(firstSlice.every(v => v != 0))
        // NOTE: Element 4 is sometimes nonzero, maybe due to float32 rounding 
        // of Math.random() values up to 1. So don't check it.
        this.assertTrue(channel.slice(5, 128).every(v => v == 0))
        return firstSlice
      }).then(firstSlice => wait(500, () => {
        // Verify that the buffer in the main thread is updated regularly.
        const secondSlice = buffer.getChannelData(c).slice(0, 4)
        this.assertTrue(secondSlice.every(v => v != 0))
        this.assertTrue(secondSlice.every((v, i) => v != firstSlice[i]))
      }))
    }
  },
  twoBufferWriters() {
    const buffer = new AudioBuffer({
      numberOfChannels: 2,
      length: 128,
      sampleRate: ia.audioContext.sampleRate
    })
    const rand = ia.generate(() => Math.random())

    // The first writer writes to the first 4 samples.
    const writer1 = ia.bufferWriter(buffer)
    const position1 = rand.connect(v => Math.floor(v * 4))
    const value1 = rand.connect(v => Math.floor(v * 4) + v)
    position1.connect(writer1.position)
    value1.connect(writer1.valueToWrite)

    // The second writer writes to samples 4-7.
    const writer2 = ia.bufferWriter(buffer)
    const position2 = rand.connect(v => Math.floor(v * 4) + 4)
    const value2 = rand.connect(v => Math.floor(v * 4) + 4 + v)
    position2.connect(writer2.position)
    value2.connect(writer2.valueToWrite)

    for (const c of [0, 1]) {  // For each channel
      wait(500, () => {
        // Expect (only) the first eight values to be written.
        const channel = buffer.getChannelData(c)
        const firstSlice = channel.slice(0, 8)
        this.assertTrue(firstSlice.every(v => v != 0))
        // NOTE: Element 8 is sometimes nonzero, maybe due to float32 rounding 
        // of Math.random() values up to 1. So don't check it.
        this.assertTrue(channel.slice(10, 128).every(v => v == 0))
        return firstSlice
      }).then(firstSlice => wait(500, () => {
        // Verify that the buffer in the main thread is updated regularly.
        const secondSlice = buffer.getChannelData(c).slice(0, 8)
        this.assertTrue(secondSlice.every(v => v != 0))
        this.assertTrue(secondSlice.every((v, i) => v != firstSlice[i]))
      }))
    }
  },
  bufferWriterAndReader() {
    const buffer = new AudioBuffer({
      numberOfChannels: 2,
      length: 128,
      sampleRate: ia.audioContext.sampleRate
    })
    // The reader loops the buffer.
    const time = ia.ramp('samples').connect(x => x % 128)
    const reader = ia.bufferReader(buffer)
    time.connect(reader.time)

    // The writer writes noise to the buffer.
    const writer = ia.bufferWriter(buffer)
    const rand = ia.generate(() => Math.random())
    const position = rand.connect(v => Math.floor(v * 128))
    position.connect(writer.position)
    rand.connect(writer.valueToWrite)

    // Even though the reader was initialized when the buffer was filled with 
    // zeros, it should still be updated by the writer.
    this.assertNonzeroSignal(reader)
    reader.logSignal()
  },
  /** Capture a live multichannel AudioBuffer from an audio stream. */
  capture() {
    // Generate stereo noise signal.
    // Each has a right channel which is silent. TODO: fix this. These should 
    // be single-channel signals.
    const signal1 = ia.generate(() => Math.random())
    const signal2 = ia.generate(() => Math.random())
    const stereoSignal = ia.stackChannels([signal1.left, signal2.left])

    // Waiting a bit as there is sometimes delay (zeros) from WebAudio when 
    // generating audio...
    wait(1000, () => {
      for (const numSamples of [1, 128, 44100]) {
        stereoSignal.capture(numSamples).then(([buffer]) => {
          this.assertEqual(buffer.length, numSamples)
          const l = buffer.getChannelData(0)
          const r = buffer.getChannelData(1)
          this.assertFalse(l.every(v => v == 0), 'Found silent left channel.')
          this.assertFalse(r.every(v => v == 0), 'Found silent right channel.')
          this.assertFalse(l.every((v, i) => v == r[i]), 'Found same data in left and right channels.')
        })
      }
    })
  },
  fftPassthrough($root) {
    // TODO: understand why this test doesn't pass when run in parallel... race 
    // condition with buffer reading?
    // TODO: Right channel of osc is muted (shouldn't be the case...)
    //const signal = new ia.AudioComponent(createOscillator(880)).left

    ia.config.useWorkletByDefault = true
    const signal = ia.bufferReader("assets/fugue.m4a")
    const timeRamp = ia.ramp('samples')
    timeRamp.connect(signal.time)

    // TODO: numbers greater than 128 are messed up.... how to fix?
    // Status: FFT calc seems correct. But the indices don't seem to match up.
    // Peaks are not at the same place in the 1024 output compared to the later 
    // recorded segment.
    // OLD:
    // - There is an issue with re-batched fft (probably not ifft)
    // - Not an issue with imaginary input missing
    // - Doesn't seem to be mismatch between queue sizes
    // - Doesn't seem to be due to rewritten input (have copied data)
    // - Can't reproduce offline...
    // - Confirmed using mag = sync that things are NOT aligned when data comes 
    //     out batched.
    // UPDATE:
    // - There was an issue with the capture code (again)
    // - FFT is likely not the issue because different bad sounds come from the 
    //    same FFT display.
    // - Suspect something in ifft
    // - Magnitudes at beginning of IFFT are mainly zero. It seems only one 
    //    nonzero slice (128) is actually getting thru
    // - Pre-sync looks fine--sync issue? Signal sum pre/post sync are 
    //    different. 
    // - The sync input to IFFT for some reason is always 128 samples repeating.
    //    Are all inputs like this? 
    // - *All inputs are the same 128 samples repeating*. This is probably true 
    //     for FFT too but didn't notice it bc the spectrum is similar enough.
    // - The issue was that I accidentally removed the code that duplicated the 
    //    input data... so it was being overwritten.
    // UPDATE 2:
    // - There is actually still a buzz (seems like DC issue?) or freq = 1/fftSize
    // - It's possible this is due to the batching... / FFT recieving an old 
    //    [0-127] section but a new 128-1024 section.
    // - Yep. Should be fixed now.
    const fftSize = 1024
    const fft = signal.fft(fftSize)
    const r = ia.recorder([fft.sync, fft.magnitude])
    function plotFft() {
      r.capture(fftSize).then(b => {
        const sync = b[0].getChannelData(0)
        const mag = b[1].getChannelData(0)
        const syncedMag = [...mag]
        sync.map((v, i) => {
          syncedMag[sync[i]] = mag[i]
        })
        syncedMag.forEach((v, i) => syncedMag[i] += (syncedMag[fftSize - i] ?? 0))
        plot(syncedMag.slice(0, Math.floor(syncedMag.length / 2)))
        // Redraw ASAP
        requestAnimationFrame(plotFft)
      })
    }
    plotFft()
    const passthrough = fft.ifft()
    /* const monitor = new ia.ScrollingAudioMonitor()
    monitor.addToDom($root)
    fft.sync.connect(monitor)
     */
    /*  
    const monitor = new ia.ScrollingAudioMonitor()
    monitor.addToDom($root)
    passthrough.connect(monitor) */
    passthrough.connect(ia.out)
    this.assertNonzeroSignal(passthrough)
  },
  // This is a wishlist example. TODO: implement required functionality.
  combineAllDataTypes($root) {
    return // Not working yet.
    // Audio player.
    const player = ia.bufferReader("assets/fugue.m4a")
    player.start()
    const bufferFft = player.fft()

    // UI Toggle.
    const freezeToggle = ia.toggle()
    freezeToggle.addToDom($root)

    // Random noise.
    const noiseSignal = ia.generate(() => Math.random())

    // Freeze spectrum when switch is true, otherwise add some noise.
    const frozenSpectrum = ia.combine(
      [bufferFft, noiseSignal, freezeToggle],
      (fft, noise, isFrozen) => {
        if (isFrozen) {
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
          const noisyMag = fft.magnitude.map(
            (v, i) => v + 0.1 * noise[i]
          )
          return {
            magnitude: noisyMag,
            phase: fft.phase
          }
        }
      }, { outputSignature: [ia.FFTOutput] })

    frozenSpectrum.ifft().connect(ia.out)
  }
}


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