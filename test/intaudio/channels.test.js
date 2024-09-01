import ia from "../../dist/bundle.js"
import { expect } from "@esm-bundle/chai";
import { ChunkTester, intaudioInit } from "./testUtils.js";

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

  it("can be accessed directly on a component", () => {
    const signal = ia.generate(() => 1)
    ChunkTester.expectEqual(signal.left, 1)
    ChunkTester.expectEqual(signal.right, 1)
    ChunkTester.expectEqual(signal.channels[0], 1)
  })
})

// TODO: Test input channels.