import ia from "../../dist/bundle.js"
import { expect } from "@esm-bundle/chai";
import { intaudioInit, wait } from "./testUtils.js";

beforeEach(async () => {
  await intaudioInit()
  ia.config.useWorkletByDefault = true
})

describe("bufferWriter", () => {
  it("supports arbitrary audio-rate positions and values", async () => {
    const buffer = new AudioBuffer({
      numberOfChannels: 2,
      length: 128,
      sampleRate: ia.audioContext.sampleRate
    })
    // This writer writes floor(4r) + r to index floor(4r)for r in [0, 1), so 
    // only the first 4 values will be nonzero.
    const writer = ia.bufferWriter(buffer)
    const rand = ia.generate(() => Math.random())
    rand.connect(v => Math.floor(v * 4)).connect(writer.position)
    rand.connect(v => Math.floor(v * 4) + v).connect(writer.valueToWrite)
    
    for (const c of [0, 1]) {  // For each channel
      await wait(500)
      // Expect (only) the first four values to be written.
      const channel = buffer.getChannelData(c)
      const firstSlice = channel.slice(0, 4)
      firstSlice.forEach(v => expect(v).to.not.equal(0))
      // NOTE: Element 4 is sometimes nonzero, maybe due to float32 rounding 
      // of Math.random() values up to 1. So don't check it.
      channel.slice(5, 128).forEach(v => expect(v).to.equal(0))

      await wait(500)
      // Verify that the buffer in the main thread is updated regularly.
      const secondSlice = buffer.getChannelData(c).slice(0, 4)
      secondSlice.forEach(v => expect(v).to.not.equal(0))
      secondSlice.forEach((v, i) => expect(v).to.not.equal(firstSlice[i]))
    }
  })

  it("can write in parallel with another bufferWriter", async () => {
    const buffer = new AudioBuffer({
      numberOfChannels: 2,
      length: 128,
      sampleRate: ia.audioContext.sampleRate
    })
    const rand = ia.generate(() => Math.random())
  
    // The first writer writes to the first 4 samples.
    const writer1 = ia.bufferWriter(buffer)
    rand.connect(v => Math.floor(v * 4)).connect(writer1.position)
    rand.connect(v => Math.floor(v * 4) + v).connect(writer1.valueToWrite)
  
    // The second writer writes to samples 4-7.
    const writer2 = ia.bufferWriter(buffer)
    rand.connect(v => Math.floor(v * 4) + 4).connect(writer2.position)
    rand.connect(v => Math.floor(v * 4) + 4 + v).connect(writer2.valueToWrite)
  
    for (const c of [0, 1]) {  // For each channel
      await wait(500)
      // Expect (only) the first eight values to be written.
      const channel = buffer.getChannelData(c)
      const firstSlice = channel.slice(0, 8)
      firstSlice.forEach(v => expect(v).to.not.equal(0))
      // NOTE: Element 8 is sometimes nonzero, maybe due to float32 rounding 
      // of Math.random() values up to 1. So don't check it.
      channel.slice(10, 128).forEach(v => expect(v).to.equal(0))

      await wait(500)
      // Verify that the buffer in the main thread is updated regularly.
      const secondSlice = buffer.getChannelData(c).slice(0, 8)
      secondSlice.forEach(v => expect(v).to.not.equal(0))
      secondSlice.forEach((v, i) => expect(v).to.not.equal(firstSlice[i]))
    }
  })
})