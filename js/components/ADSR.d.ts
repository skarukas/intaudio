import constants from "../shared/constants.js";
import { BaseComponent } from "./base/BaseComponent.js";
import { ControlInput } from "../io/input/ControlInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
type I = {
    readonly attackEvent: ControlInput<typeof constants.TRIGGER>;
    readonly releaseEvent: ControlInput<typeof constants.TRIGGER>;
    readonly attackDurationMs: ControlInput<number>;
    readonly decayDurationMs: ControlInput<number>;
    readonly sustainAmplitude: ControlInput<number>;
    readonly releaseDurationMs: ControlInput<number>;
};
type O = {
    readonly audioOutput: AudioRateOutput;
};
export declare class ADSR extends BaseComponent<I, O> implements I, O {
    readonly attackEvent: ControlInput<any>;
    readonly releaseEvent: ControlInput<any>;
    readonly attackDurationMs: ControlInput<number>;
    readonly decayDurationMs: ControlInput<number>;
    readonly sustainAmplitude: ControlInput<number>;
    readonly releaseDurationMs: ControlInput<number>;
    readonly audioOutput: AudioRateOutput;
    private _paramModulator;
    private state;
    constructor(attackDurationMs: number, decayDurationMs: number, sustainAmplitude: number, releaseDurationMs: number);
    inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void;
}
export {};
