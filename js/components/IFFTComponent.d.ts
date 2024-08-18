import { FFTInput } from "../io/input/FFTInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import { BaseComponent } from "./base/BaseComponent.js";
export declare class IFFTComponent extends BaseComponent {
    fftSize: number;
    readonly fftIn: FFTInput;
    readonly realOutput: AudioRateOutput;
    readonly imaginaryOutput: AudioRateOutput;
    protected worklet: AudioWorkletNode;
    constructor(fftSize?: number);
}
