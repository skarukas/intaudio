import { expect } from "@esm-bundle/chai";
import ia from "../../dist/bundle.js";
import { ChunkTester, intaudioInit, skip, wait } from "./testUtils.js";

beforeEach(async () => {
  await intaudioInit()
})

describe("ia.stackChannels", () => {
  it("can be applied to mono signals", async () => {
    const left = ia.generate(() => 1)
    const right = ia.generate(() => 2)
    const stacked = ia.stackChannels([left, right])
    await ChunkTester.expectEqual(stacked.channels.left, 1)
    await ChunkTester.expectEqual(stacked.channels.right, 2)
  })

  it("appends channels whenever inputs are non-mono", async () => {
    const left = ia.generate(() => 1)
    const right = ia.generate(() => 2)
    const c3 = ia.generate(() => 3)
    const threeChannelStack = ia.stackChannels([left, right, c3])
    const finalStack = ia.stackChannels([left, right, threeChannelStack])
    expect(finalStack.numOutputChannels).to.equal(5)
    await ChunkTester.expectEqual(finalStack.channels[0], 1)
    await ChunkTester.expectEqual(finalStack.channels[1], 2)
    await ChunkTester.expectEqual(finalStack.channels[2], 1)
    await ChunkTester.expectEqual(finalStack.channels[3], 2)
    await ChunkTester.expectEqual(finalStack.channels[4], 3)
  })
  
  // Does not reflect the current functionality.
  // TODO: implement a version that downmixes instead of stacking.
  skip.it("downmixes inputs so that each input is a channel", async () => {
    const left = ia.generate(() => 1)
    const right = ia.generate(() => 2)
    const stereoSignal = ia.stackChannels([left, right])
    // Downmixing happens here.
    const finalStack = ia.stackChannels([left, right, stereoSignal])
    expect(finalStack.numOutputChannels).to.equal(3)
    await ChunkTester.expectEqual(finalStack.channels.left, 1)
    await ChunkTester.expectEqual(finalStack.channels.right, 2)
    await ChunkTester.expectEqual(finalStack.channels[2], 3)
  })

  // Times out due to CPU overload--TODO: increase efficiency.
  skip.it("supports up to 32 channels", async () => {
    const tester = new ChunkTester({ delayMs: 0 })
    const maxChannels = 32
    // Channel i has constant value i.
    const channels = ia.util.range(maxChannels).map(v => ia.generate(() => v))
    const signal = ia.stackChannels(channels)
    await wait(500)
    for (let i = 0; i < maxChannels; i++) {
      await tester.expectEqual(signal.channels[i], i)
    }
  })
})