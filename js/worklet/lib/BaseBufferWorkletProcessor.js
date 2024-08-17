import { registry } from "./shared.js";
import { mod, SafeAudioWorkletProcessor } from "./utils.js";
export class BaseBufferWorkletProcessor extends SafeAudioWorkletProcessor {
    constructor({ numberOfInputs, numberOfOutputs, processorOptions: { bufferId, buffer } }) {
        super();
        if (bufferId) {
            this.bufferId = bufferId;
            buffer && (this.buffer = buffer);
        }
        // Receives serialized input sent from postMessage() calls.
        // This is used to change the buffer at runtime.
        this.port.onmessage = (event) => {
            if (event.data.bufferId) {
                // NOTE: this must be set first due to logic in the buffer getter.
                this.bufferId = event.data.bufferId;
            }
            if (event.data.buffer) {
                this.buffer = event.data.buffer;
            }
        };
    }
    get buffer() {
        var _a;
        if (this.bufferId == undefined) {
            return [];
        }
        return (_a = registry[this.bufferId]) !== null && _a !== void 0 ? _a : [];
    }
    set buffer(value) {
        if (this.bufferId) {
            registry[this.bufferId] = value;
        }
        else {
            throw new Error("Cannot set buffer if bufferId is not defined.");
        }
    }
    get numSamples() {
        return this.buffer.length ? this.buffer[0].length : 0;
    }
    get numChannels() {
        return this.buffer.length;
    }
    toBufferIndex(sampleIdx) {
        // Transforms the index to be within range.
        return Math.floor(mod(sampleIdx, this.numSamples));
    }
}
