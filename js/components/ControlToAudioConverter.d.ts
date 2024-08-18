import { ControlInput } from "../io/input/ControlInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import { BaseComponent } from "./base/BaseComponent.js";
export declare class ControlToAudioConverter extends BaseComponent {
    readonly input: ControlInput<number>;
    readonly output: AudioRateOutput;
    protected node: ConstantSourceNode;
    constructor();
    protected inputDidUpdate(input: any, newValue: any): void;
}
