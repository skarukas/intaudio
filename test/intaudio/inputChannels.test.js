import ia from "../../dist/bundle.js"
import { ChunkTester, intaudioInit, skipIf, wait } from "./testUtils.js";

beforeEach(async () => {
  await intaudioInit()
  ia.config.useWorkletByDefault = true
})

const tester = new ChunkTester({ delayMs: 0 })

describe("intaudio input channels", () => {
  for (const useWorklet of [true, false]) {
    // TODO: fails when useWorklet is false, connecting to func.$x.left for 
    // some reason scales the signal by a factor of 1 / sqrt(2).
    skipIf(!useWorklet).it("can be connected to individually", async () => {
      const func = new ia.internals.AudioTransformComponent(x => x + 4, { useWorklet })
      ia.generate(() => 1).connect(func.$x.left)
      await wait(300)
      await tester.expectEqual(func.channels[0], 5)
      await tester.expectEqual(func.channels[1], 4)
    })
  }

  it("can be connected to individually", async () => {
    const splitter = new ia.internals.ChannelSplitter([0], [1], [2])
    ia.generate(() => 1).connect(splitter.input.left)
    ia.generate(() => 3).connect(splitter.input.channels[2])
    
    await wait(300)
    await tester.expectEqual(splitter.outputChannels[0], 1)
    await tester.expectEqual(splitter.outputChannels[1], 0)
    await tester.expectEqual(splitter.outputChannels[2], 3)
  })

  it("sum together multiple single-channel connections", async () => {
    const splitter = new ia.internals.ChannelSplitter([0], [1], [2])
    ia.generate(() => 1).connect(splitter.input.left)
    ia.generate(() => 1).connect(splitter.input.left)
    ia.generate(() => 3).connect(splitter.input.channels[2])
    
    await wait(300)
    await tester.expectEqual(splitter.outputChannels[0], 2)
    await tester.expectEqual(splitter.outputChannels[1], 0)
    await tester.expectEqual(splitter.outputChannels[2], 3)
  })

  it("sum together single-channel and multichannel connections", async () => {
    const splitter = new ia.internals.ChannelSplitter([0], [1], [2])
    ia.generate(() => 1).connect(splitter.input.left)
    ia.generate(() => 10).toChannels(3, 'repeat').connect(splitter.input)
    
    await wait(300)
    await tester.expectEqual(splitter.outputChannels[0], 11)
    await tester.expectEqual(splitter.outputChannels[1], 10)
    await tester.expectEqual(splitter.outputChannels[2], 10)
  })
})