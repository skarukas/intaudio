import { AudioRateInput } from "../io/input/AudioRateInput.js";
import { ControlInput } from "../io/input/ControlInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import { BaseComponent } from "./base/BaseComponent.js";
type I = {
    time: AudioRateInput;
    buffer: ControlInput<AudioBuffer>;
};
type O = {
    output: AudioRateOutput;
};
export declare class BufferComponent extends BaseComponent<I, O> {
    readonly time: AudioRateInput;
    readonly buffer: ControlInput<AudioBuffer>;
    readonly output: AudioRateOutput;
    protected worklet: AudioWorkletNode;
    constructor(buffer?: AudioBuffer);
    get bufferId(): string;
    setBuffer(buffer: AudioBuffer): void;
    protected inputDidUpdate(input: any, newValue: any): void;
}
export {};
