import ia from "../../dist/bundle.js"
import { expect } from "@esm-bundle/chai";
import { ChunkTester, intaudioInit, wait } from "./testUtils.js";

beforeEach(async () => {
  await intaudioInit()
})

describe("ia.splitChannels", () => {
  it("can split mono signals stacked by ia.stackChannels", async () => {
    const left = ia.generate(() => 1)
    const right = ia.generate(() => 2)
    const stacked = ia.stackChannels([left, right])
    const [l, r] = stacked.splitChannels()
    await ChunkTester.expectEqual(l, 1)
    await ChunkTester.expectEqual(r, 2)
  })

  it("splits non-mono signals into mono components", async () => {
    const left = ia.generate(() => 1)
    const right = ia.generate(() => 2)
    const stereoStack = ia.stackChannels([left, right])
    const stacked = ia.stackChannels([left, right, stereoStack])
    const unstack = Array(...stacked.splitChannels())
    expect(unstack.length).to.equal(4)
    unstack.map(chan => expect(chan.numOutputChannels).to.equal(1))
    await ChunkTester.expectEqual(unstack[0], 1)
    await ChunkTester.expectEqual(unstack[1], 2)
    await ChunkTester.expectEqual(unstack[2], 1)
    await ChunkTester.expectEqual(unstack[3], 2)
  })

  it("can be used to regroup existing channels", async () => {
    const tester = new ChunkTester({ delayMs: 0 })
    const channels = ia.util.range(8).map(v => ia.generate(() => v))
    const stacked = ia.stackChannels(channels)
    const [group1, group2, group3] = stacked.splitChannels(
      [0, 1, 2],
      [0, 4],
      [5, 6, 7]
    )
    await wait(500)
    await tester.expectEqual(group1.channels[0], 0)
    await tester.expectEqual(group1.channels[1], 1)
    await tester.expectEqual(group1.channels[2], 2)

    await tester.expectEqual(group2.channels[0], 0)
    await tester.expectEqual(group2.channels[1], 4)

    await tester.expectEqual(group3.channels[0], 5)
    await tester.expectEqual(group3.channels[1], 6)
    await tester.expectEqual(group3.channels[2], 7)
  })
})