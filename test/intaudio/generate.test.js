import { expect } from "@esm-bundle/chai";
import ia from "../../dist/bundle.js";
import { approxEqual, ChunkTester, intaudioInit } from "./testUtils.js";

beforeEach(async () => {
  await intaudioInit()
})

describe("ia.generate", () => {
  it("can generate a constant signal", () => {
    const signal = ia.generate(() => 1)
    return ChunkTester.expectEqual(signal, 1)
  })
  it("can be used to generate a different value every sample", () => {
    const signal = ia.generate(() => Math.random())
    return ChunkTester.expectSamples(
      signal,
      // There may occasionally be a repeated entry.
      arr => arr.to.satisfy(a => new Set(a).size > a.length * 0.75)
    )
  })
  it("has a single channel", () => {
    const signal = ia.generate(() => 1)
    expect(signal.numOutputChannels).to.equal(1)
  })
  it("can use the current time in number of samples", () => {
    const signal = ia.generate(sampleIndex => sampleIndex, 'samples')
    return ChunkTester.expectSamples(
      signal,
      arr => arr.to.satisfy(a => a.every(
        // Values increment by 1.
        (v, i) => i == 0 || approxEqual(v, a[i-1] + 1, 0.01)
      )
    ))
  })
})