import { AudioRateInput } from "../io/input/AudioRateInput.js";
import { ControlInput } from "../io/input/ControlInput.js";
import { AbstractOutput } from "../io/output/AbstractOutput.js";
import { ControlOutput } from "../io/output/ControlOutput.js";
import { BaseComponent } from "./base/BaseComponent.js";
export declare class AudioRateSignalSampler extends BaseComponent {
    #private;
    private interval;
    audioInput: AudioRateInput;
    samplePeriodMs: ControlInput<number>;
    controlOutput: ControlOutput<number>;
    private _analyzer;
    constructor(samplePeriodMs?: number);
    getCurrentSignalValue(): number;
    stop(): void;
    inputAdded(source: AbstractOutput<any>): void;
    inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void;
}
