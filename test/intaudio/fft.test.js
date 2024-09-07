import { expect } from "@esm-bundle/chai";
import ia from "../../dist/bundle.js";
import { ChunkTester, intaudioInit, wait } from "./testUtils.js";

beforeEach(async () => {
  await intaudioInit()
})


// TODO: Add this to STFT library / expand upon capture ability for STFT.
async function getMagnitudeSpectrum(fftSignal, fftSize) {
  const buffers = await ia.recorder([fftSignal.sync, fftSignal.magnitude]).capture(fftSize)
  const sync = buffers[0].getChannelData(0)
  const mag = buffers[1].getChannelData(0)
  const syncedMag = [...mag]
  sync.forEach((v, i) => syncedMag[sync[i]] = mag[i])
  syncedMag.forEach((v, i) => syncedMag[i] += (syncedMag[fftSize - i] ?? 0))
  return syncedMag.slice(0, Math.floor(syncedMag.length / 2))
}

const fftSize = 1024
describe('The fft() method with windowSize ' + fftSize, () => {
  it("transforms audio into STFT data", async () => {
    const fftSampleFrequency = ia.audioContext.sampleRate / fftSize
    // This frequency is 4x the sample period and will be index 4 of the FFT.
    const wave = new ia.internals.Wave('sine', fftSampleFrequency*4)
    const fft = wave.fft(fftSize)
    await wait(200)
    const spectrum = await getMagnitudeSpectrum(fft, fftSize)
    expect(spectrum[4]).to.not.equal(0)
    expect(spectrum[4]).to.equal(Math.max(...spectrum))
  })

  it("can be inverted by ifft() to produce a nonzero signal", () => {
    const signal = ia.bufferReader("assets/fugue.m4a")
    const timeRamp = ia.ramp('samples')
    timeRamp.connect(signal.time)
    const passthrough = signal.fft(fftSize).ifft()
    return ChunkTester.expectNonzero(passthrough)
  })

  it("can be exactly inverted by ifft()", () => {
    const signal = ia.generate(() => 1)
    const passthrough = signal.fft(fftSize).ifft()
    return ChunkTester.expectEqual(passthrough, 1, { passRatio: 1 })
  })

  it("can be exactly inverted by ifft() with fftSize 64", () => {
    const signal = ia.generate(() => 1)
    const passthrough = signal.fft(64).ifft()
    return ChunkTester.expectEqual(passthrough, 1, { passRatio: 1 })
  })
})