// Entry point for the worklet.
import { deserializeWorkletMessage } from "./lib/serialization.js";
export const WORKLET_NAME = "function-worklet";
// Define AudioWorkletProcessor (if in Worklet)
if (typeof AudioWorkletProcessor != 'undefined') {
    class OperationWorklet extends AudioWorkletProcessor {
        constructor() {
            super();
            // Receives serialized input sent from postMessage() calls.
            // This is used to change the processing function at runtime.
            this.port.onmessage = (event) => {
                const windowSize = event.data.windowSize;
                this.processImpl = deserializeWorkletMessage(event.data, sampleRate, () => currentTime, () => Math.floor(currentFrame / windowSize));
            };
        }
        process(inputs, outputs, parameters) {
            this.processImpl && this.processImpl(inputs, outputs, parameters);
            return true;
        }
    }
    // Register the AudioWorkletProcessor.
    registerProcessor(WORKLET_NAME, OperationWorklet);
}
