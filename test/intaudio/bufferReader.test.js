import ia from "../../dist/bundle.js";
import { ChunkTester, intaudioInit } from "./testUtils.js";

beforeEach(async () => {
  await intaudioInit()
  ia.config.useWorkletByDefault = true
})

describe("bufferReader", () => {
  it("supports arbitrary audio-rate time control", async () => {
    const buffer = ia.bufferReader("assets/fugue.m4a")
    const timeRamp = ia.ramp('samples').transformAudio(
      x => (1 + Math.sin(x / (10 * 44100))) * 20 * 44100
    )
    ia.stackChannels([
      timeRamp.left,
      timeRamp.transformAudio(x => 20 * 44100 - x).left
    ]).connect(buffer.time)
    const difference = ia.combine([buffer.left, buffer.right], (l, r) => l - r)
    return Promise.all([
      ChunkTester.expectNonzero(buffer.left),
      ChunkTester.expectNonzero(buffer.right),
      ChunkTester.expectNonzero(difference)  // Channels are not the same.
    ])
  })

  it("pulls in live updates from bufferWriters", async () => {
    const buffer = new AudioBuffer({
      numberOfChannels: 2,
      length: 128,
      sampleRate: ia.audioContext.sampleRate
    })
    // The reader loops the buffer.
    const time = ia.ramp('samples').connect(x => x % 128)
    const reader = ia.bufferReader(buffer)
    time.connect(reader.time)
  
    // The writer writes noise to the buffer at a random position.
    const writer = ia.bufferWriter(buffer)
    const rand = ia.generate(() => Math.random())
    const position = rand.connect(v => Math.floor(v * 128))
    position.connect(writer.position)
    rand.connect(writer.valueToWrite)
  
    // Even though the reader was initialized when the buffer was filled with 
    // zeros, it is still updated by the writer.
    return ChunkTester.expectNonzero(reader)
  })
})