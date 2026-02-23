import { expect } from "@esm-bundle/chai";
import ia from "../../dist/bundle.js";
import { ChunkTester, intaudioInit, wait } from "./testUtils.js";

const tester = new ChunkTester()

beforeEach(async () => {
  await intaudioInit()
  ia.config.useWorkletByDefault = true
})

describe("Delay modulation", () => {
  it("should work", async () => {
    // Audio source = a burst of noise.
    const whiteNoiseSource = ia.generate(() => Math.random() - 0.5)
    // A short envelope.
    const envelope = new ia.internals.ADSR(10, 50, 0, 10)
    const signal = ia.combine(
      [whiteNoiseSource, envelope],
      (noise, gain) => noise * gain,
    )
    // Trigger ADSR each 500ms
    setInterval(() => envelope.attackEvent(), 500)

    // A signal oscillating between 0 and 5000 at 0.3182 Hz.
    const delayValueSamps = ia.wave('sine', 0.3182)
      .transformAudio(x => ((x + 1) / 2) * 5000)

    // Create an echo effect with a modulating delay amount and 80% feedback
    const output = ia.combine(
      [signal.left, delayValueSamps.left],
      function (x, delay) {
        // Get the output from `delay` samples ago
        const prevVal = this.previousOutputs(delay)
        return x + prevVal * 0.8
      }
    )

    // Play through speakers
    output.connect(ia.out)

    await wait(10000)
    return tester.expectNonzero(output)
  })
})

// Input microphone
const mySignal = ia.audioIn()
const myCutoffSlider = ia.slider("#cutoff-slider")

// Brickwall filter using STFT
const myBrickwallSignal = ia.combine(
  [mySignal.fft(), myCutoffSlider],
  (frame, cutoff) => {
    // Zero all bins greater than the bin cutoff
    for (let i = 0; i < frame.magnitude.length; i++) {
      if (i > cutoff) frame.magnitude[i] = 0
    }
    return frame
  }).ifft()

myBrickwallSignal.connect(ia.out)