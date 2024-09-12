import { deserializeWorkletMessage } from "./lib/serialization.js";
import { SafeAudioWorkletProcessor } from "./lib/utils.js";

// Define properties that will be present in the AudioWorkletGlobalScope
// (https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope).
declare const sampleRate: number
declare const currentTime: number
declare const currentFrame: number

export const FUNCTION_WORKLET_NAME = "function-worklet"

export class OperationWorklet extends SafeAudioWorkletProcessor {
  inputChannelCount: number[]
  processImpl: Function | undefined
  constructor({
    processorOptions: {
      inputChannelCount
    }
  }: {
    processorOptions: {
      inputChannelCount: number[]
    }
  }) {
    super();
    this.inputChannelCount = inputChannelCount
    // Receives serialized input sent from postMessage() calls.
    // This is used to change the processing function at runtime.
    this.port.onmessage = (event) => {
      const windowSize = event.data.windowSize
      this.processImpl = deserializeWorkletMessage(
        event.data,
        sampleRate,
        () => currentTime,
        () => Math.floor(currentFrame / windowSize)
      )
    };
  }
  resizeChannels(
    channels: Float32Array[],
    expectedNumChannels: number
  ): Float32Array[] {
    // Ensures the input data has the right size.
    if (channels.length == 0 || channels.length > expectedNumChannels) {
      return channels.slice(0, expectedNumChannels)
    } else {
      // TODO: make this expansion follow better logic than repeating channels.
      let newChannels = channels
      while (newChannels.length < expectedNumChannels) {
        newChannels = [...newChannels, ...channels]
      }
      return newChannels
    }
  }
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: any
  ) {
    inputs = inputs.map((v, i) => this.resizeChannels(v, this.inputChannelCount[i]))
    this.processImpl && this.processImpl(inputs, outputs, parameters)
    return true
  }
}