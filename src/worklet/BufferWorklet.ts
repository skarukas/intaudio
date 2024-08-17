import { BaseBufferWorkletProcessor } from "./lib/BaseBufferWorkletProcessor.js";

export const BUFFER_WORKLET_NAME = "buffer-worklet"

export class BufferWorklet extends BaseBufferWorkletProcessor {
  process(
    [time]: [time: Float32Array[]],
    [output]: [output: Float32Array[]],
    parameters: any
  ) {
    if (!time.length) {
      return true
    }
    for (let c = 0; c < this.numChannels; c++) {
      const bufferChannel = this.buffer[c]
      // If the buffer has more channels than the input, copy the input to 
      // fill the internal channels.
      const inChannel = time[c % time.length]
      const outChannel = output[c % output.length]
      // The input is a series of sample indices.
      for (let i = 0; i < inChannel.length; i++) {
        const bufferIndex = this.toBufferIndex(inChannel[i])
        outChannel[i] = bufferChannel[bufferIndex]
      }
    }
    return true
  }
}