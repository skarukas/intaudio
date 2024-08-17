import { deserializeWorkletMessage } from "./lib/serialization.js";
import { SafeAudioWorkletProcessor } from "./lib/utils.js";

// Define properties that will be present in the AudioWorkletGlobalScope
// (https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope).
declare const sampleRate: number
declare const currentTime: number
declare const currentFrame: number

export const FUNCTION_WORKLET_NAME = "function-worklet"

export class OperationWorklet extends SafeAudioWorkletProcessor {
  processImpl: Function | undefined
  constructor() {
    super();
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
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: any
  ) {
    this.processImpl && this.processImpl(inputs, outputs, parameters)
    return true
  }
}