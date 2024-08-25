import ia from "../../dist/bundle.js"
import { expect } from "@esm-bundle/chai";
import { intaudioInit, expectNonzeroSignal, expectSilentSignal, expectSignalEqual, DEFAULT_SAMPLE_RATE, expectSamples } from "./testUtils.js";

beforeEach(async () => {
  await intaudioInit()
})

for (const useWorklet of [true, false]) {
  const windowSize = useWorklet ? 128 : 512
  describe(`transformAudio [useWorklet=${useWorklet}]`, () => {
    it("applies an operation across time", async () => {
      const oscillator = new ia.internals.Wave('sine', 440)
      const channelTransform = oscillator.transformAudio(({ left, right }) => {
        return [left, undefined, right, undefined]
      }, { useWorklet, dimension: "channels" })

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
      const oscillator = new ia.internals.Wave('sine', 440)
      const ctTransform = oscillator.transformAudio(function ({ left, right }) {
        for (let i = 0; i < left.length; i++) {
          left[i] = (left[i] + right[(left.length - i) - 1]) / 2
        }
        return [left]
      }, { useWorklet, dimension: "all" })
      expect(ctTransform.numOutputChannels).to.equal(1)
      return expectNonzeroSignal(ctTransform.output.left)
    })

    it("applies an operation across channels and time", async () => {
      const oscillator = new ia.internals.Wave('sine', 440)
      // Apply to each sample in each channel.
      const sampleTransform = oscillator.transformAudio(function (x) {
        const windowSize = x.length
        let avg = x + this.previousInputs()[0]
        for (let t = 0; t < windowSize; t++) {
          avg += this.previousOutputs(t)[0] / windowSize
        }
        return -avg
      }, { useWorklet, windowSize })
      expect(sampleTransform.numOutputChannels).to.equal(2)
      return Promise.all([
        expectNonzeroSignal(sampleTransform.output.channels[0]),
        expectNonzeroSignal(sampleTransform.output.channels[1])
      ])
    })

    it("applies an operation across channels", async () => {
      const oscillator = new ia.internals.Wave('sine', 440)
      // Reduce over the time dimension.
      const timeTransform = oscillator.transformAudio(arr => {
        for (let i = 0; i < arr.length - 1; i++) {
          arr[i] = (arr[i] + arr[i + 1]) / 2
        }
        return arr
      }, { useWorklet, dimension: "time" })
      expect(timeTransform.numOutputChannels).to.equal(2)
      return Promise.all([
        expectNonzeroSignal(timeTransform.output.channels[0]),
        expectNonzeroSignal(timeTransform.output.channels[1])
      ])
    })

    it("has access to the SignalProcessingContext", async () => {
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
      }, { dimension: "channels", windowSize, useWorklet })
      expect(thisSampleTransform.numOutputChannels).to.equal(6)
      return Promise.all([
        expectNonzeroSignal(thisSampleTransform.output.channels[0]),
        expectSignalEqual(thisSampleTransform.output.channels[1], DEFAULT_SAMPLE_RATE),
        expectNonzeroSignal(thisSampleTransform.output.channels[2]),
        expectSignalEqual(thisSampleTransform.output.channels[3], -1),  
        expectNonzeroSignal(thisSampleTransform.output.channels[4]),
        expectSignalEqual(thisSampleTransform.output.channels[5], windowSize)
      ])
    })

    it("has access to previous inputs", async () => {
      const oscillator = new ia.internals.Wave('sine', 440)
      const transformedSignal = oscillator.transformAudio(function (x) {
        return this.previousInputs(4)[0]  // Look back 4 steps.
      }, { useWorklet })
      expect(transformedSignal.numOutputChannels).to.equal(2)
      return Promise.all([
        expectNonzeroSignal(transformedSignal.output.channels[0]),
        expectNonzeroSignal(transformedSignal.output.channels[1])
      ])
    })

    it("has access to previous outputs", async () => {
      const oscillator = new ia.internals.Wave('sine', 440)
      const transformedSignal = oscillator.transformAudio(function (x) {
        // Repeating ramp up to 255
        return (this.previousOutputs()[0] + 1) % 256
      }, { useWorklet })
      expect(transformedSignal.numOutputChannels).to.equal(2)
      return Promise.all([
        // Expect to be split 50-50 between [0, 128) and [128, 256)
        expectSamples(
          transformedSignal.output.channels[0],
          x => x.to.be.lessThan(128),
          { passRatio: 0.2 }
        ),
        expectSamples(
          transformedSignal.output.channels[0],
          x => x.to.be.greaterThanOrEqual(128),
          { passRatio: 0.2 }
        ),
      ])
    })
  })
}