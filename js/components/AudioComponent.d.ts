import { AudioRateInput } from "../io/input/AudioRateInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import { WebAudioConnectable } from "../shared/types.js";
import { BaseComponent } from "./base/BaseComponent.js";
export declare class AudioComponent extends BaseComponent {
    readonly input: AudioRateInput;
    readonly output: AudioRateOutput | undefined;
    constructor(inputNode: WebAudioConnectable);
}
