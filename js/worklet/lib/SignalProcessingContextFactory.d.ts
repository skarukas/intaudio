import { StreamSpec } from "../../shared/StreamSpec.js";
import { FrameToSignatureConverter } from "./FrameToSignatureConverter.js";
import { MemoryBuffer } from "./MemoryBuffer.js";
import { SignalProcessingContext } from "./SignalProcessingContext.js";
import { AudioDimension, SignalProcessingFnInput } from "./types.js";
/**
 * A class collecting all current ongoing memory streams. Because some `dimension` settings process channels in parallel (`"none"` and `"time"`), memory streams are indexed by channel.
 */
export declare class SignalProcessingContextFactory<D extends AudioDimension> {
    inputHistory: {
        [channel: number]: MemoryBuffer<SignalProcessingFnInput<D>[]>;
    };
    outputHistory: {
        [channel: number]: MemoryBuffer<SignalProcessingFnInput<D>>;
    };
    windowSize: number;
    sampleRate: number;
    inputSpec: StreamSpec;
    outputSpec: StreamSpec;
    getFrameIndex: () => number;
    getCurrentTime: () => number;
    ioConverter: FrameToSignatureConverter<D>;
    constructor({ inputSpec, outputSpec, windowSize, dimension, getFrameIndex, getCurrentTime, sampleRate, }: {
        inputSpec: StreamSpec;
        outputSpec: StreamSpec;
        windowSize: number;
        dimension: D;
        sampleRate: number;
        getFrameIndex: () => number;
        getCurrentTime: () => number;
    });
    protected getDefaultValueFn({ dimension, windowSize, numChannelsPerStream }: {
        dimension: AudioDimension;
        windowSize: number;
        numChannelsPerStream: number[];
    }): () => (number | import("./types.js").ArrayLike<number> | import("./types.js").MultiChannelArray<import("./types.js").ArrayLike<number>>)[];
    getContext({ channelIndex, sampleIndex }?: {
        channelIndex?: number;
        sampleIndex?: number;
    }): SignalProcessingContext<D>;
}
