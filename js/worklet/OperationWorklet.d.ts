import { SafeAudioWorkletProcessor } from "./lib/utils.js";
export declare const FUNCTION_WORKLET_NAME = "function-worklet";
export declare class OperationWorklet extends SafeAudioWorkletProcessor {
    inputChannelCount: number[];
    processImpl: Function | undefined;
    constructor({ processorOptions: { inputChannelCount } }: {
        processorOptions: {
            inputChannelCount: number[];
        };
    });
    resizeChannels(channels: Float32Array[], expectedNumChannels: number): Float32Array[];
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: any): boolean;
}
