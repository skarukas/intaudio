import { deserializeWorkletMessage } from "./lib/serialization.js";
import { SafeAudioWorkletProcessor } from "./lib/utils.js";
export const FUNCTION_WORKLET_NAME = "function-worklet";
export class OperationWorklet extends SafeAudioWorkletProcessor {
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
