import { SafeAudioWorkletProcessor } from "./utils.js";
export declare class BaseBufferWorkletProcessor extends SafeAudioWorkletProcessor {
    bufferId?: string;
    constructor({ processorOptions: { bufferId, buffer } }: {
        processorOptions: {
            bufferId?: string;
            buffer?: Float32Array[];
        };
    });
    get buffer(): Float32Array[];
    set buffer(value: Float32Array[]);
    get numSamples(): number;
    get numChannels(): number;
    toBufferIndex(sampleIdx: number): number;
}
