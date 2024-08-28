import ia from "../../dist/bundle.js"
import { expect } from "@esm-bundle/chai";
import { ChunkTester, intaudioInit, PromiseCounter } from "./testUtils.js";

beforeEach(async () => {
  await intaudioInit()
})


const chunkTester = new ChunkTester()

describe("intaudio ia.bundle", () => {
  it("supports array creation, destructuring and indexing", () => {
    const a = ia.generate(() => 0.5)
    const b = ia.generate(() => -1)
    const bundle = ia.bundle([a, b])
    expect(bundle[0]).to.equal(a)
    expect(bundle[1]).to.equal(b)

    const [o1, o2] = bundle
    expect(o1).to.equal(a)
    expect(o2).to.equal(b)
  })

  it("supports object creation, destructuring and indexing", () => {
    const a = ia.generate(() => 0.5)
    const b = ia.generate(() => -1)
    const bundle = ia.bundle({ o1: a, o2: b })
    expect(bundle.o1).to.equal(a)
    expect(bundle.o2).to.equal(b)

    const { o1, o2 } = bundle
    expect(o1).to.equal(a)
    expect(o2).to.equal(b)
  })

  it("supports array destructuring / indexing when created by an object", () => {
    const a = ia.generate(() => 0.5)
    const b = ia.generate(() => -1)
    const bundle = ia.bundle({ o1: a, o2: b })
    expect(bundle[0]).to.equal(a)
    expect(bundle[1]).to.equal(b)

    const [o1, o2] = bundle
    expect(o1).to.equal(a)
    expect(o2).to.equal(b)
  })

  it("can be connected to multiple named audio component inputs", async () => {
    const a = ia.generate(() => 0.5)
    const b = ia.generate(() => -1)
    const bundle = ia.bundle({ a, b })
    return Promise.all([
      chunkTester.expectSilent(bundle.connect((b, a) => a * 2 + b)),
      chunkTester.expectNonzero(bundle.connect(a => a))
    ])
  })

  it("can be connected to multiple numbered audio-rate inputs", async () => {
    const a = ia.generate(() => 0.5)
    const b = ia.generate(() => -1)
    const bundle = ia.bundle([a, b])
    return Promise.all([
      chunkTester.expectSilent(bundle.connect((a, b) => a * 2 + b)),
      chunkTester.expectNonzero(bundle.connect(a => a))
    ])
  })

  it("can be connected to multiple named control-rate inputs", async () => {
    const a = ia.func(() => 0.5)
    const b = ia.func(() => -1)
    const bundle = ia.bundle({ a, b })
    
    const counter = new PromiseCounter(2)
    bundle.connect((b, a) => a * 2 + b).connect(v => {
      expect(v).to.equal(0)
      counter.tick()
    })
      
    bundle.connect(a => a).connect(v => {
      expect(v).to.equal(0.5)
      counter.tick()
    })
    a.triggerInput()
    b.triggerInput()
    return counter.wait() 
  })

  it("can be connected to multiple numbered control-rate inputs", async () => {
    const a = ia.func(() => 0.5)
    const b = ia.func(() => -1)
    const bundle = ia.bundle([a, b])
    const counter = new PromiseCounter(2)
    bundle.connect((a, b) => a * 2 + b).connect(v => {
      expect(v).to.equal(0)
      counter.tick()
    })
      
    bundle.connect(a => a).connect(v => {
      expect(v).to.equal(0.5)
      counter.tick()
    })
    a.triggerInput()
    b.triggerInput()
    return counter.wait() 
  })

  it("applies a graph to each numbered input using perOutput()", async () => {
    const a = ia.generate(() => 0.5)
    const b = ia.generate(() => -1)
    const bundle = ia.bundle([a, b])
    const modifiedBundle = bundle.perOutput([
      a => a.connect(x => x + 5),
      b => b.connect(x => x * 2)
    ])
    const [a1, b1] = modifiedBundle
    return Promise.all([
      chunkTester.expectEqual(modifiedBundle[0], 5.5),
      chunkTester.expectEqual(modifiedBundle[1], -2),
      chunkTester.expectEqual(a1, 5.5),
      chunkTester.expectEqual(b1, -2)
    ])
  })
  it("applies a graph to each named input using perOutput()", async () => {
    const a = ia.generate(() => 0.5)
    const b = ia.generate(() => -1)
    const bundle = ia.bundle({ b, a })
    const modifiedBundle = bundle.perOutput({
      a: a => a.connect(x => x + 5),
      b: b => b.connect(x => x * 2)
    })
    const  { a: a1, b: b1 } = modifiedBundle
    return Promise.all([
      chunkTester.expectEqual(modifiedBundle.a, 5.5),
      chunkTester.expectEqual(modifiedBundle.b, -2),
      chunkTester.expectEqual(a1, 5.5),
      chunkTester.expectEqual(b1, -2)
    ])
  })
})