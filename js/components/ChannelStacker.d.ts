import { AudioRateInput } from "../io/input/AudioRateInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import { Connectable } from "../shared/base/Connectable.js";
import { BaseComponent } from "./base/BaseComponent.js";
export declare class ChannelStacker extends BaseComponent {
    readonly stackedInputs: AudioRateInput[];
    readonly output: AudioRateOutput;
    [idx: number]: AudioRateInput;
    private constructor();
    static fromInputs(destinations: Connectable[]): ChannelStacker;
}
