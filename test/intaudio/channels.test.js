import ia from "../../dist/bundle.js"
import { expect } from "@esm-bundle/chai";
import { ChunkTester, intaudioInit, skipIf } from "./testUtils.js";

beforeEach(async () => {
  await intaudioInit()
})

describe("intaudio output channels", () => {
  it("are always defined when accessed through left / right", async () => {
    const signal = ia.generate(() => 2)  // Mono signal.
    await ChunkTester.expectEqual(signal.output.left, 2)
    await ChunkTester.expectEqual(signal.output.right, 2)
  })

  it("are only defined up to numOutputChannels", async () => {
    const signal = ia.generate(() => 1)
    await ChunkTester.expectEqual(signal.output.channels[0], 1)
    expect(signal.numOutputChannels).to.equal(1)
    expect(signal.output.channels[2]).to.be.undefined
  })

  it("can be accessed directly on a component", async () => {
    const signal = ia.generate(() => 1)
    await ChunkTester.expectEqual(signal.left, 1)
    await ChunkTester.expectEqual(signal.right, 1)
    await ChunkTester.expectEqual(signal.channels[0], 1)
  })
})

describe("intaudio input channels", () => {
  for (const useWorklet of [true, false]) {
    // TODO: fails when useWorklet is false, connecting to func.$x.left for 
    // some reason scales the signal by a factor of 1 / sqrt(2).
    skipIf(!useWorklet).it("can be connected to individually", async () => {
      const func = new ia.internals.AudioTransformComponent(x => x + 4, { useWorklet })
      ia.generate(() => 1).connect(func.$x.left)
      await ChunkTester.expectEqual(func.channels[0], 5)
      await ChunkTester.expectEqual(func.channels[1], 4)
    })
  }

  it("can be connected to individually", async () => {
    const splitter = new ia.internals.ChannelSplitter([0], [1], [2])
    ia.generate(() => 1).connect(splitter.input.left)
    ia.generate(() => 3).connect(splitter.input.channels[2])
    
    await ChunkTester.expectEqual(splitter.outputChannels[0], 1)
    await ChunkTester.expectEqual(splitter.outputChannels[1], 0)
    await ChunkTester.expectEqual(splitter.outputChannels[2], 3)
  })

  it("sum together multiple single-channel connections", async () => {
    const splitter = new ia.internals.ChannelSplitter([0], [1], [2])
    ia.generate(() => 1).connect(splitter.input.left)
    ia.generate(() => 1).connect(splitter.input.left)
    ia.generate(() => 3).connect(splitter.input.channels[2])
    
    await ChunkTester.expectEqual(splitter.outputChannels[0], 2)
    await ChunkTester.expectEqual(splitter.outputChannels[1], 0)
    await ChunkTester.expectEqual(splitter.outputChannels[2], 3)
  })

  it("sum together single-channel and multichannel connections", async () => {
    const splitter = new ia.internals.ChannelSplitter([0], [1], [2])
    ia.generate(() => 1).connect(splitter.input.left)
    // TODO: create an instance method for channel conversion.
    const mono = ia.generate(() => 10)
    ia.stackChannels([mono, mono, mono]).connect(splitter.input)
    
    await ChunkTester.expectEqual(splitter.outputChannels[0], 11)
    await ChunkTester.expectEqual(splitter.outputChannels[1], 10)
    await ChunkTester.expectEqual(splitter.outputChannels[2], 10)
  })
})