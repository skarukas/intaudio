import ia from "../../dist/bundle.js"
import { expect } from "@esm-bundle/chai";
import { ChunkTester, intaudioInit, skip, wait } from "./testUtils.js";

beforeEach(async () => {
  await intaudioInit()
  ia.config.useWorkletByDefault = true
})

const tester = new ChunkTester({ delayMs: 0 })

describe("The toChannels method", () => {
  it("can be used to upmix naturally from mono to quad", async () => {
    // See https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Basic_concepts_behind_Web_Audio_API#up-mixing_and_down-mixing
    const mono = ia.generate(() => 1)
    expect(mono.numOutputChannels).to.equal(1)
    const quad = mono.toChannels(4)  // Default mode = 'speakers'
    expect(quad.numOutputChannels).to.equal(4)

    await wait(300)
    await tester.expectEqual(quad.channels[0], 1)
    await tester.expectEqual(quad.channels[1], 1)
    await tester.expectSilent(quad.channels[2])
    await tester.expectSilent(quad.channels[3])
  })

  it("can duplicate a mono signal to quad", async () => {
    const mono = ia.generate(() => 1)
    expect(mono.numOutputChannels).to.equal(1)
    const quad = mono.toChannels(4, 'repeat')
    expect(quad.numOutputChannels).to.equal(4)

    await wait(300)
    await tester.expectEqual(quad.channels[0], 1)
    await tester.expectEqual(quad.channels[1], 1)
    await tester.expectEqual(quad.channels[2], 1)
    await tester.expectEqual(quad.channels[3], 1)
  })

  it("can duplicate a channel view to stereo", async () => {
    const mono = ia.generate(() => 1)
    expect(mono.numOutputChannels).to.equal(1)
    const stereo = mono.left.toChannels(2, 'repeat')
    expect(stereo.numOutputChannels).to.equal(2)

    await wait(300)
    await tester.expectEqual(stereo.channels[0], 1)
    await tester.expectEqual(stereo.channels[1], 1)
  })

  it("can duplicate a stereo signal to quad", async () => {
    const stereo = ia.stackChannels([
      ia.generate(() => 1),
      ia.generate(() => 2)
    ])
    const quad = stereo.toChannels(4, 'repeat')
    expect(quad.numOutputChannels).to.equal(4)

    await wait(300)
    await tester.expectEqual(quad.channels[0], 1)
    await tester.expectEqual(quad.channels[1], 2)
    await tester.expectEqual(quad.channels[2], 1)
    await tester.expectEqual(quad.channels[3], 2)
  })

  it("can down-mix quad to stereo naturally", async () => {
    // See https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Basic_concepts_behind_Web_Audio_API#up-mixing_and_down-mixing
    const quad = ia.stackChannels([
      ia.generate(() => 1),  // L
      ia.generate(() => 2),  // R
      ia.generate(() => 4),  // SL
      ia.generate(() => 8)   // SR
    ])
    const stereo = quad.toChannels(2)  // Default mode = 'speakers'
    expect(stereo.numOutputChannels).to.equal(2)

    await wait(300)
    await tester.expectEqual(stereo.left, 2.5)  // (L + SL) / 2
    await tester.expectEqual(stereo.right, 5)  // (R + SR) / 2
  })

  for (const mode of ['repeat', 'discrete']) {
    // Times out. TODO: make library more efficient and add a method for 
    // disconnecting all nodes in between each test.
    skip.it(`truncates channels when down-mixing with mode='${mode}'`, async () => {
      const quad = ia.stackChannels([
        ia.generate(() => 1),
        ia.generate(() => 2),
        ia.generate(() => 4)
      ])
      const stereo = quad.toChannels(2, mode)
      expect(stereo.numOutputChannels).to.equal(2)

      await wait(300)
      await tester.expectEqual(stereo.left, 1)
      await tester.expectEqual(stereo.right, 2)
    })
  }
})