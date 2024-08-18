import { FrameToSignatureConverter } from "./FrameToSignatureConverter.js";
import { MemoryBuffer } from "./MemoryBuffer.js";
import { AudioDimension, SignalProcessingFnInput } from "./types.js";
export declare class SignalProcessingContext<D extends AudioDimension> {
    protected inputMemory: MemoryBuffer<SignalProcessingFnInput<D>[]>;
    protected outputMemory: MemoryBuffer<SignalProcessingFnInput<D>>;
    /**
     * The number of samples being processed per second.
     */
    sampleRate: number;
    /**
     * The index of the frame, or the number of frames (of size `windowSize`) that elapsed before this frame.
     */
    frameIndex: number;
    /**
     * The index of the channel whose data is currently being processed.
     *
     * Only defined when there is no channel dimension in the data, e.g. when `dimension` is `"time"` or `"none"`.
     */
    channelIndex: number | undefined;
    /**
     * The index of the sample currently being processed, between 0 and `windowSize -1`.
     *
     * Only defined when there is no time dimension in the data, e.g. when `dimension` is `"channel"` or `"none"`.
     */
    sampleIndex: number | undefined;
    /**
     * The length of the audio frame currently being processed.
     *
     * NOTE: When `dimension` is `"channel"` or `"none"`, each sample is processed separately by the function. In that case, `windowSize`  has no relationship to the input size and is an implementation detail.
     */
    windowSize: number;
    /**
     * The AudioContext time at which the processing of this function begins.
     *
     * When the inputs have a time dimension (if `dimension` is `"time"` or `"all"`), this represents the time of the first sample in the window. Otherwise, this value will be equal to the time at which the current sample is processed.
     */
    currentTime: number;
    numInputs: number;
    numOutputs: number;
    protected maxInputLookback: number;
    protected maxOutputLookback: number;
    protected fixedInputLookback: number;
    protected fixedOutputLookback: number;
    protected ioConverter: FrameToSignatureConverter<D>;
    constructor(inputMemory: MemoryBuffer<SignalProcessingFnInput<D>[]>, outputMemory: MemoryBuffer<SignalProcessingFnInput<D>>, { windowSize, currentTime, frameIndex, sampleRate, ioConverter, channelIndex, sampleIndex }: {
        windowSize: number;
        currentTime: number;
        frameIndex: number;
        sampleRate: number;
        ioConverter: FrameToSignatureConverter<D>;
        channelIndex?: number;
        sampleIndex?: number;
    });
    previousInputs(t?: number): SignalProcessingFnInput<D>[];
    previousOutputs(t?: number): SignalProcessingFnInput<D>;
    setOutputMemorySize(n: number): void;
    setInputMemorySize(n: number): void;
    execute(fn: Function, inputs: SignalProcessingFnInput<D>[]): SignalProcessingFnInput<D>[];
    protected static resizeMemory<T>(memory: MemoryBuffer<T>, maxLookback: number, lookbackOverride: number): void;
}
