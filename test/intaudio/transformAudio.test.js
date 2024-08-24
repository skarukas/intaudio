import ia from "../../dist/bundle.js"
import { expect } from "@esm-bundle/chai";
import { intaudioInit, expectNonzeroSignal, expectSilentSignal, expectSignalEqual, DEFAULT_SAMPLE_RATE } from "./testUtils.js";

describe("transformAudio", () => {
  it("applies an operation across time", async () => {
    await intaudioInit()

    const oscillator = new ia.internals.Wave('sine', 440)
    const channelTransform = oscillator.transformAudio(({ left, right }) => {
      return [left, undefined, right, undefined]
    }, { useWorklet: true, dimension: "channels" })

    // Apply to each sample, across channels.
    expect(channelTransform.numOutputChannels).to.equal(4)

    return Promise.all([
      expectNonzeroSignal(channelTransform.output.channels[0]),
      expectSilentSignal(channelTransform.output.channels[1]),
      expectNonzeroSignal(channelTransform.output.channels[2]),
      expectSilentSignal(channelTransform.output.channels[3]),
    ])
  })

  it("applies an operation to an audio frame", async () => {
    await intaudioInit()
    const oscillator = new ia.internals.Wave('sine', 440)
    const ctTransform = oscillator.transformAudio(function ({ left, right }) {
      for (let i = 0; i < left.length; i++) {
        left[i] = (left[i] + right[(left.length - i) - 1]) / 2
      }
      return [left]
    }, { useWorklet: true, dimension: "all" })
    expect(ctTransform.numOutputChannels).to.equal(1)
    return expectNonzeroSignal(ctTransform.output.left)
  })

  it("applies an operation across channels and time", async () => {
    await intaudioInit()
    const oscillator = new ia.internals.Wave('sine', 440)
    // Apply to each sample in each channel.
    const sampleTransform = oscillator.transformAudio(function (x) {
      const windowSize = 256
      let avg = x + this.previousInputs()[0]
      for (let t = 0; t < windowSize; t++) {
        avg += this.previousOutputs(t)[0] / windowSize
      }
      return -avg
    }, { useWorklet: true })
    expect(sampleTransform.numOutputChannels).to.equal(2)
    return Promise.all([
      expectNonzeroSignal(sampleTransform.output.channels[0]),
      expectNonzeroSignal(sampleTransform.output.channels[1])
    ])
  })

  it("applies an operation across channels", async () => {
    await intaudioInit()
    const oscillator = new ia.internals.Wave('sine', 440)
    // Reduce over the time dimension.
    const timeTransform = oscillator.transformAudio(arr => {
      for (let i = 0; i < arr.length - 1; i++) {
        arr[i] = (arr[i] + arr[i + 1]) / 2
      }
      return arr
    }, { useWorklet: true, dimension: "time" })
    expect(timeTransform.numOutputChannels).to.equal(2)
    return Promise.all([
      expectNonzeroSignal(timeTransform.output.channels[0]),
      expectNonzeroSignal(timeTransform.output.channels[1])
    ])
  })

  it("has access to the SignalProcessingContext", async () => {
    await intaudioInit()
    const oscillator = new ia.internals.Wave('sine', 440)

    // The context is bound to `this`.
    const thisSampleTransform = oscillator.transformAudio(function (x) {
      return [
        this.currentTime,  // Ramp.
        this.sampleRate,  // Depends on browser and device: 44.1k, 48k, etc.
        this.frameIndex,  // Ramp.
        this.channelIndex,  // Always -1 (each call processes all channels)
        this.sampleIndex + 1,  // Could be 0.
        this.windowSize  // Set by the user if useWorklet is false.
      ]
    }, { dimension: "channels", windowSize: 512 })
    expect(thisSampleTransform.numOutputChannels).to.equal(6)
    return Promise.all([
      expectNonzeroSignal(thisSampleTransform.output.channels[0]),
      expectSignalEqual(thisSampleTransform.output.channels[1], DEFAULT_SAMPLE_RATE),
      expectNonzeroSignal(thisSampleTransform.output.channels[2]),
      expectSignalEqual(thisSampleTransform.output.channels[3], -1),  
      expectNonzeroSignal(thisSampleTransform.output.channels[4]),
      expectSignalEqual(thisSampleTransform.output.channels[5], 512)
    ])
  })
})