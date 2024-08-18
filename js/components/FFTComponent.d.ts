import { AudioRateInput } from "../io/input/AudioRateInput.js";
import { FFTOutput } from "../io/output/FFTOutput.js";
import { AudioSignalStream } from "../shared/AudioSignalStream.js";
import { FFTStream } from "../shared/FFTStream.js";
import { BaseComponent } from "./base/BaseComponent.js";
export declare class FFTComponent extends BaseComponent implements FFTStream {
    fftSize: number;
    readonly realInput: AudioRateInput;
    readonly imaginaryInput: AudioRateInput;
    readonly fftOut: FFTOutput;
    protected worklet: AudioWorkletNode;
    constructor(fftSize?: number);
    ifft(): AudioSignalStream;
}
