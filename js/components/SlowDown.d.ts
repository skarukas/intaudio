import { AudioRateInput } from "../io/input/AudioRateInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import { BaseComponent } from "./base/BaseComponent.js";
export declare class SlowDown extends BaseComponent {
    rate: number;
    bufferLengthSec: number;
    delayNode: DelayNode;
    delayModulator: ConstantSourceNode;
    readonly audioInput: AudioRateInput;
    readonly audioOutput: AudioRateOutput;
    readonly rampOut: AudioRateOutput;
    constructor(rate?: number, bufferLengthSec?: number);
    start(): void;
    mapFn(v: number): number;
}
