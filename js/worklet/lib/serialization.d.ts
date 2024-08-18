import { StreamSpec } from "../../shared/StreamSpec.js";
import { AudioDimension } from "./types.js";
export type SerializedWorkletMessage = {
    fnString: string;
    dimension: AudioDimension;
    inputSpec: StreamSpec;
    outputSpec: StreamSpec;
    windowSize: number;
    tracebackString: string;
};
export declare function serializeWorkletMessage(f: Function, { dimension, inputSpec, outputSpec, windowSize }: {
    dimension: AudioDimension;
    inputSpec: StreamSpec;
    outputSpec: StreamSpec;
    windowSize: number;
}): SerializedWorkletMessage;
export declare function deserializeWorkletMessage(message: SerializedWorkletMessage, sampleRate: number, getCurrentTime: () => number, getFrameIndex: () => number): Function;
