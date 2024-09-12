import { deserializeWorkletMessage } from "./lib/serialization.js";
import { SafeAudioWorkletProcessor } from "./lib/utils.js";
export const FUNCTION_WORKLET_NAME = "function-worklet";
export class OperationWorklet extends SafeAudioWorkletProcessor {
    constructor({ processorOptions: { inputChannelCount } }) {
        super();
        this.inputChannelCount = inputChannelCount;
        // Receives serialized input sent from postMessage() calls.
        // This is used to change the processing function at runtime.
        this.port.onmessage = (event) => {
            const windowSize = event.data.windowSize;
            this.processImpl = deserializeWorkletMessage(event.data, sampleRate, () => currentTime, () => Math.floor(currentFrame / windowSize));
        };
    }
    resizeChannels(channels, expectedNumChannels) {
        // Ensures the input data has the right size.
        if (channels.length == 0 || channels.length > expectedNumChannels) {
            return channels.slice(0, expectedNumChannels);
        }
        else {
            // TODO: make this expansion follow better logic than repeating channels.
            let newChannels = channels;
            while (newChannels.length < expectedNumChannels) {
                newChannels = [...newChannels, ...channels];
            }
            return newChannels;
        }
    }
    process(inputs, outputs, parameters) {
        inputs = inputs.map((v, i) => this.resizeChannels(v, this.inputChannelCount[i]));
        this.processImpl && this.processImpl(inputs, outputs, parameters);
        return true;
    }
}
