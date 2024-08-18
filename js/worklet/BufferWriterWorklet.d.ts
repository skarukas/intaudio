import { BaseBufferWorkletProcessor } from "./lib/BaseBufferWorkletProcessor.js";
export declare const BUFFER_WRITER_WORKLET_NAME = "buffer-writer-worklet";
export declare class BufferWriterWorklet extends BaseBufferWorkletProcessor {
    bufferWritePeriodSec: number;
    lastBufferWriteTime: number;
    updateMainThreadBuffer(): void;
    process([position, value]: [position: Float32Array[], value: Float32Array[]], __output: Float32Array[][], __parameters: any): boolean;
}
