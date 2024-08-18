import { Component } from "../../components/base/Component.js";
import { AudioSignalStream } from "../../shared/AudioSignalStream.js";
import { FFTStream } from "../../shared/FFTStream.js";
import { AudioRateOutput } from "./AudioRateOutput.js";
import { CompoundOutput } from "./CompoundOutput.js";
export declare class FFTOutput extends CompoundOutput<{
    magnitude: AudioRateOutput;
    phase: AudioRateOutput;
    sync: AudioRateOutput;
}> implements FFTStream {
    name: string | number;
    parent?: Component | undefined;
    fftSize: number;
    magnitude: AudioRateOutput;
    phase: AudioRateOutput;
    sync: AudioRateOutput;
    constructor(name: string | number, magnitude: AudioRateOutput, phase: AudioRateOutput, sync: AudioRateOutput, parent?: Component | undefined, fftSize?: number);
    ifft(): AudioSignalStream;
}
