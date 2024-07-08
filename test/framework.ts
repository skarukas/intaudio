function expectThatAudio(fn, numChannels = 32) {
  const context = new OfflineAudioContext()
  const output = context.destination
  const buffer = fn(context,)
  return new AudioMatcher(buffer)
}

function assertEqual(actual, expected, msg?: string) {
  console.assert(
    actual,
    expected,
    msg ?? `${JSON.stringify(actual)} != ${JSON.stringify(expected)}`
  )
}

// Specify which portions of an audio file to care about.
type AudioSegmentSpec = {
  channels?: number[]
  audioStartSec?: number
  audioEndSec?: number
}

class AudioMatcher {
  numChannels: number
  numSamples: number

  constructor(public buffer: number[][]) {
    this.numChannels = buffer.length
    this.numSamples = buffer[0].length
  }
  getAudioSegment({ channels = undefined, audioStartSec = 0, audioEndSec = undefined }: AudioSegmentSpec = {}): number[][] {
    return this.buffer // TODO: implement
  }

  hasMagnitudeSpectrum(magnitudes: number[]) {
    const numBins = magnitudes.length
    const actualMagnitudes;
    // Calculate FFT with numBins
    assertEqual(actualMagnitudes, magnitudes)
  }
  isSilent(
    { channels = undefined, audioStartSec = 0, audioEndSec = undefined }: AudioSegmentSpec = {}) {
    // Make sure these channels have data.
    const segment = this.getAudioSegment({ channels, audioStartSec, audioEndSec })
    assertEqual(segment.every(channel => channel.some(x => x != 0)), true)
  }
}


expectThatAudio((context, output) => {

}).