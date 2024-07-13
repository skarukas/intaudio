// Entry point for the worklet.

import { deserializeWorkletMessage } from "./lib/serialization.js"

// Define properties that will be present in the AudioWorkletGlobalScope
// (https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope).
declare const sampleRate: number
declare const currentTime: number
declare const currentFrame: number

export const WORKLET_NAME = "function-worklet"

// Define AudioWorkletProcessor (if in Worklet)
if (typeof AudioWorkletProcessor != 'undefined') {
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
  }

  // Register the AudioWorkletProcessor.
  registerProcessor(WORKLET_NAME, OperationWorklet);
}