import ia from "../../dist/bundle.js"
import { expect } from "@esm-bundle/chai";
import { intaudioInit, ChunkTester } from "./testUtils.js";

beforeEach(async () => {
  await intaudioInit()
  ia.config.useWorkletByDefault = true
})

describe("The connect() method", () => {
  it("does not allow the same input to be connected twice", () => {
    const splitter = new ia.internals.ChannelSplitter([0], [1], [2])
    const signal = ia.generate(() => 1)
    signal.connect(splitter)
    expect(() => signal.connect(splitter.input)).to.throw(/The given input .* is already connected./)
  })

  it("allows different channels from the same input to be connected", async () => {
    const splitter = new ia.internals.ChannelSplitter([0], [1], [2])
    const signal = ia.stackChannels([
      ia.generate(() => 1),
      ia.generate(() => 2),
      ia.generate(() => 3),
    ])
    signal.channels[0].connect(splitter.input.channels[0])
    signal.channels[1].connect(splitter.input.channels[1])
    signal.channels[2].connect(splitter.input.channels[2])

    await ChunkTester.expectEqual(splitter.outputChannels[0], 1)
    await ChunkTester.expectEqual(splitter.outputChannels[1], 2)
    await ChunkTester.expectEqual(splitter.outputChannels[2], 3)
  })
})