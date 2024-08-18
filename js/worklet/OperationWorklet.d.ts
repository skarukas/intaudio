import { SafeAudioWorkletProcessor } from "./lib/utils.js";
export declare const FUNCTION_WORKLET_NAME = "function-worklet";
export declare class OperationWorklet extends SafeAudioWorkletProcessor {
    processImpl: Function | undefined;
    constructor();
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: any): boolean;
}
