import { joinTypedArrays, map2d, SafeAudioWorkletProcessor } from "./lib/utils.js";

export const RECORDER_WORKLET_NAME = "recorder-worklet"

export class RecorderWorklet extends SafeAudioWorkletProcessor {
  // Chunks of audio data. Dimensions: [input, channel, chunk]
  floatDataChunks: Float32Array[][][] = []
  isRecording: boolean = false
  // After how many samples should the method return.
  maxNumSamples: number = Infinity
  currNumSamples: number = 0
  constructor() {
    super();
    this.port.onmessage = (event) => {
      this.handleMessage(event.data)
    };
  }
  protected handleMessage(data: { command: string, numSamples?: number }) {
    if (data.command == 'start') {
      this.start(data.numSamples)
    } else if (data.command == 'stop') {
      this.stop()
    } else {
      throw new Error(`Unrecognized data: ${JSON.stringify(data)}`)
    }
  }
  start(numSamples?: number) {
    this.floatDataChunks = []
    this.maxNumSamples = numSamples ?? Infinity
    this.currNumSamples = 0
    this.isRecording = true
  }
  stop() {
    this.isRecording = false
    const joinedData: Float32Array[][] = map2d(
      this.floatDataChunks,
      chunks => joinTypedArrays(chunks, Float32Array, this.maxNumSamples)
    ).filter(input => input.length)
    // Remove need for copy by transferring underlying ArrayBuffers to the 
    // main thread. See https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects#transferring_objects_between_threads 
    // for more details.
    const movedObjects: ArrayBuffer[] = map2d(
      joinedData, c => c.buffer
    ).flat()
    this.port.postMessage(joinedData, movedObjects)
    // Re-initialize; the old data is in an invalid state.
    this.floatDataChunks = []
  }
  process(
    inputs: Float32Array[][],
    __outputs: Float32Array[][],
    __parameters: any
  ) {
    if (this.isRecording) {
      if (this.currNumSamples > this.maxNumSamples) {
        this.stop()
        return true
      }
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i]
        const chunks = this.floatDataChunks[i] ?? []
        this.floatDataChunks[i] = chunks
        for (let c = 0; c < input.length; c++) {
          // Create channel if not exists, and append to it.
          const chunkArray = chunks[c] ?? []
          chunkArray.push(new Float32Array(input[c]))
          chunks[c] = chunkArray
        }
      }
      inputs[0] && (this.currNumSamples += inputs[0][0].length)
    }
    return true
  }
}