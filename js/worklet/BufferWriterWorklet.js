import { BaseBufferWorkletProcessor } from "./lib/BaseBufferWorkletProcessor.js";
export const BUFFER_WRITER_WORKLET_NAME = "buffer-writer-worklet";
export class BufferWriterWorklet extends BaseBufferWorkletProcessor {
    constructor() {
        super(...arguments);
        this.bufferWritePeriodSec = 0.2;
        this.lastBufferWriteTime = 0;
    }
    updateMainThreadBuffer() {
        // TODO: consider using SharedArrayBuffer if available.
        // TODO: elimitate multiple copies of the same buffer when two worklet
        // processors share a buffer.
        if (this.buffer && this.buffer.length) {
            this.port.postMessage(this.buffer);
        }
    }
    process([position, value], __output, __parameters) {
        if (!position.length) {
            return true;
        }
        for (let c = 0; c < this.numChannels; c++) {
            const bufferChannel = this.buffer[c];
            // If the buffer has more channels than the input, copy the input to 
            // fill the internal channels.
            const posChannel = position[c % position.length];
            const valChannel = value[c % value.length];
            // The input is a series of sample indices and values.
            for (let i = 0; i < posChannel.length; i++) {
                const bufferIndex = this.toBufferIndex(posChannel[i]);
                bufferChannel[bufferIndex] = valChannel[i];
            }
        }
        if (currentTime - this.lastBufferWriteTime > this.bufferWritePeriodSec) {
            this.updateMainThreadBuffer();
            this.lastBufferWriteTime = currentTime;
        }
        return true;
    }
}
