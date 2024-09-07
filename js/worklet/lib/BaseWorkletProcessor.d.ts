import { Queue } from '@datastructures-js/queue';
import { SafeAudioWorkletProcessor } from "./utils.js";
import { ArrayView, WritableArrayLike } from "./views.js";
/**
 * A Queue that allows adding and popping many elements at a time, without copying the underlying data.
 */
declare class ChunkedQueue<T> {
    protected queue: Queue<WritableArrayLike<T>>;
    /**
     * Records how far into this.queue.front() we've already read.
     */
    protected numElementsAlreadyRead: number;
    length: number;
    protected getChunk(numElements: number, defaultValue?: T, removeItems?: boolean): ArrayView<T>;
    popChunk(numElements: number, defaultValue?: T): ArrayView<T>;
    peekChunk(numElements: number, defaultValue?: T): ArrayView<T>;
    addChunk(arr: WritableArrayLike<T>): void;
}
/**
 * A class that abstracts out the size of actual window received, ensuring all windows have a specific size.
 */
declare class AudioStreamScheduler {
    windowSize: number;
    numInputs: number;
    numOutputs: number;
    processWindow: (i: ArrayLike<number>[][], o: ArrayLike<number>[][]) => boolean | void;
    getChunkStartIndex: (chunk: ArrayView<number>[][]) => number;
    constructor(windowSize: number, numInputs: number, numOutputs: number, processWindow: (i: ArrayLike<number>[][], o: ArrayLike<number>[][]) => boolean | void, getChunkStartIndex?: (chunk: ArrayView<number>[][]) => number);
    inputQueues: ChunkedQueue<number>[][];
    outputQueues: ChunkedQueue<number>[][];
    private get inputQueueSize();
    private popInputChunk;
    private peekInputChunk;
    private popOutputChunk;
    private addToOutputQueue;
    private addToInputQueue;
    private getScheduledInputBatches;
    private processScheduledBatches;
    private copyToOutputs;
    process(inputs: Float32Array[][], outputs: Float32Array[][]): boolean;
}
/**
 * Uses input / output queuing to abstract sequence length away from the size of arrays passed to process().
 */
export declare class BaseWorkletProcessor extends SafeAudioWorkletProcessor {
    windowSize: number;
    numInputs: number;
    numOutputs: number;
    scheduler: AudioStreamScheduler;
    constructor(windowSize: number, numInputs: number, numOutputs: number);
    /**
     * Abstract method that receives chunks of size this.windowSize.
     */
    processWindow(inputs: ArrayLike<number>[][], outputs: ArrayLike<number>[][]): void;
    /**
     * This determines the index in the chunk at which to start the batch, and should be overridden by the subclass.
     *
     * This is mainly useful in situations where a specific chunk of data is required for the operation, such as magnitude values from 0 to 1023 in an FFT with a window size of 1024. If this method did not exist, an FFT frame could contain values like `[896 through 1023, 0 through 895]`, which should actually be processed as two separate frames--e.g. it should be delayed by 128 samples to process the frame starting from 0.
     *
     * Elements before this index will be discarded, and the batch will not be popped until it is full size. A return value of -1 indicates that the entire chunk should be discarded.
     */
    getInputChunkStartIndex(chunk: ArrayView<number>[][]): number;
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: any): boolean;
}
export {};
