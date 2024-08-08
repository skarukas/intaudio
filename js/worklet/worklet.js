// Entry point for the worklet.
import { deserializeWorkletMessage } from "./lib/serialization.js";
export const FUNCTION_WORKLET_NAME = "function-worklet";
export const BUFFER_WORKLET_NAME = "buffer-worklet";
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
    class BufferWorklet extends AudioWorkletProcessor {
        constructor() {
            super();
            // Receives serialized input sent from postMessage() calls.
            // This is used to change the buffer at runtime.
            this.port.onmessage = (event) => {
                this.buffer = event.data.buffer;
            };
        }
        toBufferIndex(sampleIdx) {
            // Ensures the index is within range.
            const length = this.buffer.length;
            return ((sampleIdx % length) + length) % length;
        }
        process([time], [output], parameters) {
            for (let c = 0; c < this.buffer.numberOfChannels; c++) {
                const bufferChannel = this.buffer.getChannelData(c);
                // If the buffer has more channels than the input, copy the input to 
                // fill the internal channels.
                const ioIndex = c % time.length;
                const inChannel = time[ioIndex];
                const outChannel = output[ioIndex];
                for (let i = 0; i < inChannel.length; i++) {
                    const bufferIndex = this.toBufferIndex(inChannel[i]);
                    outChannel[i] = bufferChannel[bufferIndex];
                }
            }
            return false;
        }
    }
    // Register the AudioWorkletProcessors
    registerProcessor(FUNCTION_WORKLET_NAME, OperationWorklet);
    registerProcessor(BUFFER_WORKLET_NAME, BufferWorklet);
}
