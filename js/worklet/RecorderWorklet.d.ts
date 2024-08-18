import { SafeAudioWorkletProcessor } from "./lib/utils.js";
export declare const RECORDER_WORKLET_NAME = "recorder-worklet";
export declare class RecorderWorklet extends SafeAudioWorkletProcessor {
    floatDataChunks: Float32Array[][][];
    isRecording: boolean;
    maxNumSamples: number;
    currNumSamples: number;
    constructor();
    protected handleMessage(data: {
        command: string;
        numSamples?: number;
    }): void;
    start(numSamples?: number): void;
    stop(): void;
    process(inputs: Float32Array[][], __outputs: Float32Array[][], __parameters: any): boolean;
}
