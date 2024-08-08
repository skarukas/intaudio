import { registry } from "./shared.js";
import { IS_WORKLET, mod } from "./utils.js";
export const BaseBufferWorkletProcessor = IS_WORKLET ?
    class BaseBufferWorkletProcessor extends AudioWorkletProcessor {
        constructor() {
            super();
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
            return (_a = registry[this.bufferId]) !== null && _a !== void 0 ? _a : [];
        }
        set buffer(value) {
            registry[this.bufferId] = value;
        }
        get numSamples() {
            return this.buffer[0].length;
        }
        get numChannels() {
            return this.buffer.length;
        }
        toBufferIndex(sampleIdx) {
            // Transforms the index to be within range.
            return Math.floor(mod(sampleIdx, this.numSamples));
        }
    } : null;
