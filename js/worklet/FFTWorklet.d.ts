import { BaseWorkletProcessor } from "./lib/BaseWorkletProcessor.js";
import { ArrayView, WritableArrayLike } from "./lib/views.js";
export declare const FFT_WORKLET_NAME = "fft-worklet";
export declare const IFFT_WORKLET_NAME = "ifft-worklet";
export declare class BaseFFTWorkletProcessor extends BaseWorkletProcessor {
    fftSize: number;
    fft: any;
    /**
     * Whether the FFT has parts [real, imaginary] instead of [magnitude, phase].
     */
    useComplexValuedFft: boolean;
    constructor({ numberOfInputs, numberOfOutputs, processorOptions: { useComplexValuedFft, fftSize } }: {
        numberOfInputs: number;
        numberOfOutputs: number;
        processorOptions: {
            useComplexValuedFft?: boolean;
            fftSize?: number;
        };
    });
}
export declare class FFTWorklet extends BaseFFTWorkletProcessor {
    processChannel([realIn, imagIn]: [
        realIn: WritableArrayLike<number>,
        imagIn: WritableArrayLike<number>
    ], [sync, output1, output2]: [
        sync: WritableArrayLike<number>,
        output1: WritableArrayLike<number>,
        output2: WritableArrayLike<number>
    ]): void;
    processWindow([realSignal, imaginarySignal]: [
        realSignal: WritableArrayLike<number>[],
        imaginarySignal: WritableArrayLike<number>[]
    ], [sync, output1, output2]: [
        sync: WritableArrayLike<number>[],
        output1: WritableArrayLike<number>[],
        output2: WritableArrayLike<number>[]
    ]): boolean;
}
export declare class IFFTWorklet extends BaseFFTWorkletProcessor {
    resync(arr: Float32Array, sync: Float32Array): Float32Array;
    getInputChunkStartIndex(chunk: ArrayView<number>[][]): number;
    processChannel([__sync, input1, input2]: [
        __sync: WritableArrayLike<number>,
        input1: WritableArrayLike<number>,
        input2: WritableArrayLike<number>
    ], [realSignal, imaginarySignal]: [
        realSignal: WritableArrayLike<number>,
        imaginarySignal: WritableArrayLike<number>
    ]): void;
    processWindow([sync, input1, input2]: [
        sync: WritableArrayLike<number>[],
        output1: WritableArrayLike<number>[],
        output2: WritableArrayLike<number>[]
    ], [realSignal, imaginarySignal]: [
        realSignal: WritableArrayLike<number>[],
        imaginarySignal: WritableArrayLike<number>[]
    ]): boolean;
}
