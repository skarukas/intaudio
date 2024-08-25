import ia from "../../dist/bundle.js"
import { expect, use } from "@esm-bundle/chai";
import chaiAsPromised from 'chai-as-promised';
import { sendMouse } from '@web/test-runner-commands';

use(chaiAsPromised)

export const DEFAULT_SAMPLE_DURATION_MS = 500
export const DEFAULT_SAMPLING_PERIOD_MS = 10
export const DEFAULT_SAMPLING_PASS_RATIO = 0.9
export const DEFAULT_SAMPLE_RATE = new AudioContext().sampleRate

export async function intaudioInit() {
  await sendMouse({
    type: 'click',
    position: [0, 0],
    button: 'right'
  })
  await ia.init()
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
 * @param {*} options passRatio: The acceptable lower bound for passing. durationMs: How long to sample the signal. samplingPeriodMs: How often to sample the signal.
 * @returns 
 */
export function expectSamples(
  signal,
  fn,
  {
    passRatio = DEFAULT_SAMPLING_PASS_RATIO,
    durationMs = DEFAULT_SAMPLE_DURATION_MS,
    samplingPeriodMs = DEFAULT_SAMPLING_PERIOD_MS,
    trimLeadingZeros = true
  } = {}
) {
  // Set up sampling.
  let sampledSignal = []
  let resolve, reject
  signal.sampleSignal(samplingPeriodMs).connect(v => sampledSignal.push(v))

  // Stop sampling and read sampled signal.
  setTimeout(() => {
    try {
      if (trimLeadingZeros) {
        const firstNonzeroIndex = sampledSignal.findIndex(x => x != 0)
        if (firstNonzeroIndex != -1) {
          sampledSignal = sampledSignal.slice(firstNonzeroIndex)
        }
      }
      expectMost(sampledSignal, fn, passRatio, `Assertion on ${signal}`)
      resolve()
    } catch (e) {
      reject(e)
    }
  }, durationMs)
  return new Promise((res, rej) => { resolve = res; reject = rej })
}

export function expectNonzeroSignal(
  signal,   
  {
    passRatio = DEFAULT_SAMPLING_PASS_RATIO,
    durationMs = DEFAULT_SAMPLE_DURATION_MS,
    samplingPeriodMs = DEFAULT_SAMPLING_PERIOD_MS,
    trimLeadingZeros = true
  } = {}
) {
  return expectSamples(
    signal,
    x => x.to.not.be.equal(0),
    { passRatio, durationMs, samplingPeriodMs, trimLeadingZeros }
  )
}

export function expectSilentSignal(
  signal,   
  {
    passRatio = DEFAULT_SAMPLING_PASS_RATIO,
    durationMs = DEFAULT_SAMPLE_DURATION_MS,
    samplingPeriodMs = DEFAULT_SAMPLING_PERIOD_MS,
    trimLeadingZeros = true
  } = {}
) {
  return expectSignalEqual(
    signal,
    0,
    { passRatio, durationMs, samplingPeriodMs, trimLeadingZeros }
  )
}

export function expectSignalEqual(
  signal,
  value,
  {
    passRatio = DEFAULT_SAMPLING_PASS_RATIO,
    durationMs = DEFAULT_SAMPLE_DURATION_MS,
    samplingPeriodMs = DEFAULT_SAMPLING_PERIOD_MS,
    trimLeadingZeros = true
  } = {}
) {
  return expectSamples(
    signal,
    x => x.to.be.equal(value),
    { passRatio, durationMs, samplingPeriodMs, trimLeadingZeros }
  )
}