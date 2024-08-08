import { registry } from "./shared.js";
import { IS_WORKLET, mod } from "./utils.js";

export const BaseBufferWorkletProcessor = IS_WORKLET ?
  class BaseBufferWorkletProcessor extends AudioWorkletProcessor {
    bufferId: string
    constructor() {
      super()
      // Receives serialized input sent from postMessage() calls.
      // This is used to change the buffer at runtime.
      this.port.onmessage = (event) => {
        if (event.data.bufferId) {
          // NOTE: this must be set first due to logic in the buffer getter.
          this.bufferId = event.data.bufferId
        }
        if (event.data.buffer) {
          this.buffer = event.data.buffer
        }
      };
    }
    get buffer(): Float32Array[] {
      return registry[this.bufferId] ?? []
    }
    set buffer(value: Float32Array[]) {
      registry[this.bufferId] = value
    }
    get numSamples(): number {
      return this.buffer[0].length
    }
    get numChannels(): number {
      return this.buffer.length
    }
    toBufferIndex(sampleIdx: number): number {
      // Transforms the index to be within range.
      return Math.floor(mod(sampleIdx, this.numSamples))
    }
  } : null