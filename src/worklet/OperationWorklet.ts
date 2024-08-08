import { deserializeWorkletMessage } from "./lib/serialization.js";
import { IS_WORKLET } from "./lib/utils.js";

// Define properties that will be present in the AudioWorkletGlobalScope
// (https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope).
declare const sampleRate: number
declare const currentTime: number
declare const currentFrame: number

export const FUNCTION_WORKLET_NAME = "function-worklet"

export const OperationWorklet = IS_WORKLET ?
  class OperationWorklet extends AudioWorkletProcessor {
    processImpl: Function
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
    process(inputs, outputs, parameters) {
      this.processImpl && this.processImpl(inputs, outputs, parameters)
      return true
    }
  } : null