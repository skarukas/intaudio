import { BaseWorkletProcessor } from "./lib/BaseWorkletProcessor.js";
import { FFTJS } from "./lib/fft.js";
import { carToPolArray, getChannel, map, polToCarArray, splitComplexArray, toComplexArray } from "./lib/utils.js";
import { ArrayView } from "./lib/views.js";
export const FFT_WORKLET_NAME = "fft-worklet";
export const IFFT_WORKLET_NAME = "ifft-worklet";
export class BaseFFTWorkletProcessor extends BaseWorkletProcessor {
    constructor({ numberOfInputs, numberOfOutputs, processorOptions: { useComplexValuedFft = false, fftSize = 128 } }) {
        super(fftSize, numberOfInputs, numberOfOutputs);
        this.fftSize = fftSize;
        this.fft = new FFTJS(this.fftSize);
        this.useComplexValuedFft = useComplexValuedFft;
    }
}
export class FFTWorklet extends BaseFFTWorkletProcessor {
    processChannel([realIn, imagIn], [sync, output1, output2]) {
        const complexInput = toComplexArray(realIn, imagIn);
        const complexOutput = this.fft.createComplexArray();
        this.fft.transform(complexOutput, complexInput);
        // TODO: does this need normalization?
        if (this.useComplexValuedFft) { // Outputs are [real, imaginary].
            // The output arrays are mutated.
            splitComplexArray(complexOutput, 
            /*real=*/ output1, 
            /*imaginary=*/ output2);
        }
        else { // Outputs are [magnitude, phase].
            const [real, imaginary] = ArrayView.createDeinterleavedViews(complexOutput, 2);
            // The magnitude and phase arrays will be mutated.
            carToPolArray(real, imaginary, 
            /*magnitude=*/ output1, 
            /*phase=*/ output2);
            // Normalize magnitudes.
            Array.prototype.forEach.call(output1, (v, i) => output1[i] = v / output1.length);
        }
        // Sync runs from 0 to fftSize-1 and ensures outputs are kept in sync 
        // with the processing frame.
        Array.prototype.forEach.call(output1, (_, i) => sync[i] = i);
    }
    processWindow([realSignal, imaginarySignal], [sync, output1, output2]) {
        const numChannels = Math.max(realSignal.length, imaginarySignal.length);
        for (let c = 0; c < numChannels; c++) {
            this.processChannel([getChannel(realSignal, c), getChannel(imaginarySignal, c)], [getChannel(sync, c), getChannel(output1, c), getChannel(output2, c)]);
        }
        return true;
    }
}
export class IFFTWorklet extends BaseFFTWorkletProcessor {
    resync(arr, sync) {
        const result = new Float32Array(arr.length);
        for (let i = 0; i < arr.length; i++) {
            result[sync[i]] = arr[i];
        }
        return result;
    }
    getInputChunkStartIndex(chunk) {
        // The sync signal goes from 0 to this.fftSize-1. We want the first index
        // such that it is the beginning of this ramp, e.g. a zero followed by a 
        // 1.
        const sync = chunk[0][0];
        return sync.findIndex((v, i, a) => i + 1 < sync.length && v == 0 && a[i + 1] == 1);
    }
    processChannel([__sync, input1, input2], [realSignal, imaginarySignal]) {
        // Note that the input chunk will be synced to the FFT frame, thanks to 
        // the logic in getInputChunkStartIndex. So we don't need __sync in this
        // method even though it is critical for FFT frame alignment.
        let real;
        let imaginary;
        if (this.useComplexValuedFft) { // Inputs are [real, imaginary].
            real = input1;
            imaginary = input2;
        }
        else { // Inputs are [magnitude, phase].
            // De-normalize magnitudes.
            map(input1, (v, i) => input1[i] = v * input1.length);
            const complex = polToCarArray(
            /*magnitude=*/ input1, 
            /*phase=*/ input2);
            real = complex.real;
            imaginary = complex.imaginary;
        }
        const complexInput = ArrayView.createInterleavedView(real, imaginary);
        const complexOutput = this.fft.createComplexArray();
        this.fft.inverseTransform(complexOutput, complexInput);
        // The real and imaginary arrays will be mutated.
        splitComplexArray(complexOutput, realSignal, imaginarySignal);
    }
    processWindow([sync, input1, input2], [realSignal, imaginarySignal]) {
        // Empty input
        if (sync.length == 0)
            return true;
        const numChannels = Math.max(input1.length, input2.length, realSignal.length, imaginarySignal.length);
        for (let c = 0; c < numChannels; c++) {
            this.processChannel([getChannel(sync, c), getChannel(input1, c), getChannel(input2, c)], [getChannel(realSignal, c), getChannel(imaginarySignal, c)]);
        }
        return true;
    }
}
