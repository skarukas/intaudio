import ia from "../../dist/bundle.js"
import { expect } from "@esm-bundle/chai";
import { ChunkTester, intaudioInit, wait } from "./testUtils.js";

beforeEach(async () => {
  await intaudioInit()
  ia.config.useWorkletByDefault = true
})

const tester = new ChunkTester({ delayMs: 0 })

describe("intaudio output channels", () => {
  it("are always defined when accessed through left / right", async () => {
    const signal = ia.generate(() => 2)  // Mono signal.
    await wait(300)
    await tester.expectEqual(signal.output.left, 2)
    await tester.expectEqual(signal.output.right, 2)
  })

  it("are only defined up to numOutputChannels", async () => {
    const signal = ia.generate(() => 1)
    await ChunkTester.expectEqual(signal.output.channels[0], 1)
    expect(signal.numOutputChannels).to.equal(1)
    expect(signal.output.channels[2]).to.be.undefined
  })

  it("can be accessed directly on a component", async () => {
    const signal = ia.generate(() => 1)
    await wait(300)
    await tester.expectEqual(signal.left, 1)
    await tester.expectEqual(signal.right, 1)
    await tester.expectEqual(signal.channels[0], 1)
  })
})