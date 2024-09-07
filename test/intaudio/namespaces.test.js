import { expect } from "@esm-bundle/chai";
import ia from "../../dist/bundle.js";
import { intaudioInit, SamplerTester } from "./testUtils.js";

beforeEach(async () => {
  await intaudioInit()
})

describe("intaudio namespaces", () => {
  it("cannot be directly connected", done => {
    let audioContext = new AudioContext()
    let keyboard = new ia.internals.Keyboard()
    ia.createThread({ audioContext }).then(ia2 => {
      let synth = new ia2.internals.SimplePolyphonicSynth()
      expect(() => keyboard.connect(synth)).to.throw("Unable to connect components from different namespaces.")
      done()
    })
  })

  it("have top-level methods and internal classes", done => {
    // Configs (stache) let you create functionally separate component graphs,  
    // with different global settings and AudioContexts.
    const audioContext = new AudioContext()
    const configId = "ia2"
    ia.createThread({ name: configId, audioContext }).then(ia2 => {
      const func2 = ia2.func(() => 1)
      const transformed = func2.connect(new ia2.internals.Bang())
  
      expect(transformed.configId).to.equal(configId)
      expect(transformed.configId).to.equal(func2.configId)
      expect(transformed.audioContext).to.equal(audioContext)
      expect(ia2.audioContext).to.equal(audioContext)
      done()
    })
  })

  it("can be connected using ia.join()", async () => {
    return Promise.all([ia.createThread(), ia.createThread()])
      .then(([thread1, thread2]) => {
        // Different audio contexts can be connected through join (MediaStream).
        expect(thread1.audioContext).to.not.equal(thread2.audioContext)
        expect(ia.audioContext).to.not.equal(thread2.audioContext)
        const osc1 = thread1.generate(() => 1)
        const osc2 = thread2.generate(() => 2)
        const joinedSignal = ia.join([osc1, osc2])
        return SamplerTester.expectEqual(joinedSignal, 3)
    })
  })
})