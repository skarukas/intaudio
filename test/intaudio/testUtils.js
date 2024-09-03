import ia from "../../dist/bundle.js"
import { expect, use, Assertion } from "@esm-bundle/chai";
import chaiAsPromised from 'chai-as-promised';
import { sendMouse } from '@web/test-runner-commands';

afterEach(() => {
  ia.disconnectAll()
})

use(chaiAsPromised)

// Fix broken equal behavior.
Assertion.overwriteMethod('equal', function (_super) {
  return function assertEqual(val) {
    if (this._obj instanceof Function || val instanceof Function) {
      this.assert(
        this._obj === val,
        "expected #{this} to === #{exp}",
        "expected #{this} to !=== #{exp}",
        // There is some weird bug where when this is a function, the test 
        // hangs. So convert it to a string first.
        val + "", 
        this._obj + ""
    );
    } else {
      _super.apply(this, arguments);
    }
  };
});

export const defaults = {
  SAMPLE_DURATION_MS: 250,
  SAMPLING_PERIOD_MS: 10,
  SAMPLING_PASS_RATIO: 0.9
}
export const DEFAULT_SAMPLE_RATE = new AudioContext().sampleRate

export async function intaudioInit() {
  try {
    await sendMouse({
      type: 'click',
      position: [0, 0],
      button: 'right'
    })
  } catch (e) {
    console.error(e)
  }
  await ia.init()
}

class SignalTester {
  constructor({
    passRatio = defaults.SAMPLING_PASS_RATIO,
    trimLeadingZeros = true
  }) {
    this.passRatio = passRatio
    this.trimLeadingZeros = trimLeadingZeros
  }

  /**
   * Run a test against sampled values from an `intaudio` signal, and assert that the passing ratio is greater than a cutoff.
   * 
   * NOTE: this is an asynchronous test, so it must be returned in a chai test OR chained to the `done` callback.
   * 
   * @example
   * it("runs audio tests", async () => {
   *   return Promise.all([
   *     expectSamples(mySignal, x => x.to.equal(1)),
   *     expectSamples(myOtherSignal, x => x.to.be.greaterThan(0.5)),
   *   ])
   * })
   * 
   * @example
   * it("tests the signal is equal to 1", async done => {
   *   expectSamples(mySignal, x => x.to.equal(1)).then(done)
   * })
   * 
   * 
   * @param {*} signal An intaudio `AudioStream` to run a test against.
   * @param {*} fn A function to apply to a chai Assertion, e.g. `x => x.to.equal(1)`
   * @returns 
   */
  async expect(signal, fn) {
    let samples = await this.getSignalValues(signal)
    samples = this._maybeTrimLeadingZeros(samples)
    expectMost(samples, fn, this.passRatio, `Assertion on ${signal}`)
  }

  _maybeTrimLeadingZeros(samples) {
    if (this.trimLeadingZeros) {
      const firstNonzeroIndex = samples.findIndex(x => x != 0)
      if (firstNonzeroIndex != -1) {
        return samples.slice(firstNonzeroIndex)
      }
    }
    return samples
  }

  async expectSamples(signal, fn) {
    const chunk = await this.getSignalValues(signal)
    return fn(expect(chunk))
  }

  getSignalValues(signal) {
    throw new Error("Not implemented.")
  }

  expectNonzero(signal) {
    return this.expect(signal, x => x.to.not.be.equal(0))
  }

  expectSilent(signal) {
    return this.expectEqual(signal, 0)
  }

  expectEqual(signal, value) {
    return this.expect(signal, x => x.to.be.approximately(value, 1e-5))
  }

  static expect(signal, fn, options = {}) {
    return new this(options).expect(signal, fn)
  }

  static expectNonzero(signal, options = {}) {
    return new this(options).expectNonzero(signal)
  }

  static expectSilent(signal, options = {}) {
    return new this(options).expectSilent(signal)
  }

  static expectEqual(signal, value, options = {}) {
    return new this(options).expectEqual(signal, value)
  }

  static expectSamples(signal, fn, options = {}) {
    return new this(options).expectSamples(signal, fn)
  }
}

export class SamplerTester extends SignalTester {
  constructor({
    passRatio = 0.9,
    numSamples = 20,
    samplingPeriodMs = 50,
    trimLeadingZeros = true
  } = {}) {
    super({ passRatio, trimLeadingZeros })
    this.numSamples = numSamples
    this.samplingPeriodMs = samplingPeriodMs
  }
  
  async getSignalValues(signal) {
    let samples = []
    const counter = new PromiseCounter(this.numSamples)
    signal.sampleSignal(this.samplingPeriodMs).connect(v => {
      if (samples.length < this.numSamples) {
        samples.push(v)
        counter.tick()
      }
    })
    await counter.wait()
    return samples
  }
}

export function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

/**
 * Usage:
 * @example
 * async function countToThree() {
 *   const counter = new PromiseCounter(3)
 * 
 *   const interval = setInterval(() => {
 *     counter.tick()
 *   }, 1000)
 * 
 *   await counter.wait()
 *   clearInterval()
 *   return 
 * }
 */
export class PromiseCounter {
  #resolved = false
  constructor(numExpectedCalls) {
    this.numExpectedCalls = numExpectedCalls
  }
  tick() {
    if (--this.numExpectedCalls <= 0) {
      this.resolve && this.resolve()
      this.#resolved = true
    }
  }
  wait() {
    return new Promise(res => {
      this.resolve = res
      if (this.#resolved) {
        res()
      }
    })
  }
}

export class ChunkTester extends SignalTester {
  constructor({
    numSamples = 2000,
    passRatio = defaults.SAMPLING_PASS_RATIO,
    delayMs = 500,
    trimLeadingZeros = true
  } = {}) {
    super({ passRatio, trimLeadingZeros })
    this.numSamples = numSamples
    this.delayMs = delayMs
  }

  async getSignalValues(signal) {
    const recorder = ia.recorder(signal)
    // TODO: times out when worklet is not enabled ... (?)
    this.delayMs && await wait(this.delayMs)
    const buffers = await recorder.capture(this.numSamples)
    return buffers[0].getChannelData(0)
  }
}

export function expectMost(arr, fn, passRatio = 1, message="") {
  const failures = []
  for (const x of arr) {
    try {
      fn(expect(x))
    } catch (e) {
      failures.push(e)
    }
  }

  // Display failures.
  let exampleFailures = failures.slice(0, 5).map(e => " - " + e)
  const numHiddenFailures = failures.length - exampleFailures.length
  if (numHiddenFailures) {
    exampleFailures.push(`   ... (${numHiddenFailures} more) ...`)
  }
  const truePassRatio = 1 - (failures.length / arr.length)
  message = message ? message + ": " : ""
  message += `Failed ${failures.length}/${arr.length} times.\nRoot Failure(s):
  ${exampleFailures.join("\n  ")}
True pass ratio was not high enough`
  expect(truePassRatio).to.be.greaterThanOrEqual(passRatio, message)
}

export function approxEqual(a, b, e=1e-5) {
  return Math.abs(a - b) < e
}

export const skip =  { it: xit }
export function skipIf(condition) {
  return condition ? skip : { it }
}