import ia from "../../dist/bundle.js"
import { expect, use } from "@esm-bundle/chai";
import chaiAsPromised from 'chai-as-promised';
import { sendMouse } from '@web/test-runner-commands';

use(chaiAsPromised)

export const defaults = {
  SAMPLE_DURATION_MS: 250,
  SAMPLING_PERIOD_MS: 10,
  SAMPLING_PASS_RATIO: 0.9
}
export const DEFAULT_SAMPLE_RATE = new AudioContext().sampleRate

export async function intaudioInit() {
  await sendMouse({
    type: 'click',
    position: [0, 0],
    button: 'right'
  })
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
  expect(signal, fn) {
    return new Promise((resolve, reject) => {
      this.getSignalValues(signal).then(samples => {
        if (this.trimLeadingZeros) {
          const firstNonzeroIndex = samples.findIndex(x => x != 0)
          if (firstNonzeroIndex != -1) {
            samples = samples.slice(firstNonzeroIndex)
          }
        }
        expectMost(samples, fn, this.passRatio, `Assertion on ${signal}`)
        resolve()
      }).catch(reject)
    })
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
    return this.expect(signal, x => x.to.be.equal(value))
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
}

export class SamplerTester extends SignalTester {
  constructor({
    passRatio = defaults.SAMPLING_PASS_RATIO,
    durationMs = defaults.SAMPLE_DURATION_MS,
    samplingPeriodMs = defaults.SAMPLING_PERIOD_MS,
    trimLeadingZeros = true
  } = {}) {
    super({ passRatio, trimLeadingZeros })
    this.durationMs = durationMs
    this.samplingPeriodMs = samplingPeriodMs
  }

  async getSignalValues(signal) {
    let samples = []
    signal.sampleSignal(this.samplingPeriodMs).connect(v => samples.push(v))
    await wait(this.durationMs)
    return samples
  }
}

export function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

export class ChunkTester extends SignalTester {
  constructor({
    numSamples = 128,
    passRatio = defaults.SAMPLING_PASS_RATIO,
    trimLeadingZeros = true
  } = {}) {
    super({ passRatio, trimLeadingZeros })
    this.numSamples = numSamples
  }

  async getSignalValues(signal) {
    // TODO: times out when worklet is not enabled ... (?)
    const buffers = await signal.capture(this.numSamples)
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