import ia from "../../dist/bundle.js"
import { expect } from "@esm-bundle/chai";
import { intaudioInit } from "./testUtils.js";

beforeEach(async () => {
  await intaudioInit()
})

describe(`Mapping function (FunctionComponent)`, () => {
  it("allows inputs to be accessed by name on the component", done => {
    const addOneComponent = ia.func(x => x + 1)
    addOneComponent.connect(x => {
      expect(x).to.equal(11)
      done()
    })
    addOneComponent.$x.setValue(10)
  })

  it("allows inputs to be accessed by index on the component", done => {
    const addOneComponent = ia.func(x => x + 1)
    addOneComponent.connect(x => {
      expect(x).to.equal(11)
      done()
    })
    addOneComponent.$0.setValue(10)
  })

  it("can operate on multiple inputs, which must all be provided", done => {
    const subtractComponent = ia.func((x, y) => x - y)
    // This is only fired when all required updates are filled.
    subtractComponent.connect(x => {
      expect(x).to.equal(8)
      done()
    })
    subtractComponent.$0.setValue(10)
    subtractComponent.$1.setValue(2)
  })

  it("can handle default values of inputs", done => {
    const subtractComponent = ia.func((x, y=2) => x - y)
    // Because y has a default, this is called when x is set as well.
    subtractComponent.connect(x => {
      expect(x).to.equal(8)
      done()
    })
    subtractComponent.$0.setValue(10)
  })

  it("can handle rest parameters", done => {
    const passthroughComponent = ia.func((...args) => args)
    let results = []
    passthroughComponent.connect(x => {
      results.push(x)
      if (results.length == 5) {
        expect(results).to.deep.equal([
          [0],
          [0, 1],
          [0, 1, 2],
          [-1, 1, 2],
          [-1, 1, 2, 3],
        ])
        done()
      }
    })
    passthroughComponent.$0.setValue(0)
    passthroughComponent.$1.setValue(1)
    passthroughComponent.$2.setValue(2)
    passthroughComponent.$0.setValue(-1)
    passthroughComponent.$3.setValue(3)
  })

  it("can handle destructured parameters", done => {
    const destructureComponent = ia.func(([a, b], { c, d }) => [a, b, c, d])
    destructureComponent.connect(x => {
      expect(x).to.deep.equal([0, 1, 2, 3])
      done()
    })
    destructureComponent.$0.setValue([0, 1])
    destructureComponent.$1.setValue({ d: 3, c: 2 })
  })

  it("can be applied to an array of arguments using withInputs", done => {
    const subtractComponent = ia.func((x, y) => x - y)
    subtractComponent.connect(x => {
      expect(x).to.equal(8)
      done()
    })
    subtractComponent.withInputs(10, 2)
  })

  it("can be applied to an object of arguments using withInputs", done => {
    const subtractComponent = ia.func((x, y) => x - y)
    subtractComponent.connect(x => {
      expect(x).to.equal(8)
      done()
    })
    subtractComponent.withInputs({ x: 10, y: 2 })
  })

  it("can be called directly with arguments", done => {
    const subtractComponent = ia.func((x, y) => x - y)
    subtractComponent.connect(x => {
      expect(x).to.equal(8)
      done()
    })
    subtractComponent(10, 2)
  })

  it("sets multiple parameters of a component by returning an object", () => {
    const envelope = new ia.internals.ADSR(100, 10, 0.5, 1000)
    const setParamsComponent = ia.func(() => ({
      attackDurationMs: 1000,
      decayDurationMs: 100,
      isMuted: true
    }))
    setParamsComponent.connect(envelope)
    setParamsComponent.triggerInput()
    expect(envelope.attackDurationMs.value).to.equal(1000)
    expect(envelope.decayDurationMs.value).to.equal(100)
    expect(envelope.isMuted.value).to.be.true
  })

  it("fills multiple parameters when it receives an object", done => {
    const setParamsComponent = ia.func(() => ({ a: "a", b: "b", c: "c" }))
    setParamsComponent
      .connect((a, b, c) => [a, b, c])
      .connect(x => {
        expect(x).to.deep.equal(["a", "b", "c"])
        done()
      })
    setParamsComponent.triggerInput()
  })

  it("passes an object directly when _raw is set", done => {
    const createRawObject = ia.func(() => ({ _raw: true, a: "a", b: "b" }))
    createRawObject
      .connect(obj => [obj.a, obj.b])
      .connect(x => {
        expect(x).to.deep.equal(["a", "b"])
        done()
      })
    createRawObject.triggerInput()
  })

  it("doesn't understand a plain object when no parameters match", () => {
    const createObject = ia.func(() => ({ a: "a", b: "b" }))
    createObject.connect(obj => [obj.a, obj.b])
    expect(createObject.triggerInput).to.throw(/Given parameter object {"a":"a","b":"b"} but destination .* has no input named 'a' or '\$a'. To pass a raw object without changing properties, set _raw: true on the object/g)
  })

  it("passes a 'non-plain' object as a single value", done => {
    class AB {
      a = "a"
      b = "b"
    }
    const createAB = ia.func(() => new AB())
    createAB
      .connect(obj => [obj.a, obj.b])
      .connect(x => {
        expect(x).to.deep.equal(["a", "b"])
        done()
      })
    createAB.triggerInput()
  })
})