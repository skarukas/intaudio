import { BaseBufferWorkletProcessor } from "./lib/BaseBufferWorkletProcessor.js";
export declare const BUFFER_WORKLET_NAME = "buffer-worklet";
export declare class BufferWorklet extends BaseBufferWorkletProcessor {
    process([time]: [time: Float32Array[]], [output]: [output: Float32Array[]], parameters: any): boolean;
}
