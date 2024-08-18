import { ControlInput } from "../io/input/ControlInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import constants from "../shared/constants.js";
import { BaseComponent } from "./base/BaseComponent.js";
type MaybeJQuery<T> = JQuery<T> | T;
export declare class MediaElementComponent extends BaseComponent {
    readonly start: ControlInput<typeof constants.TRIGGER>;
    readonly stop: ControlInput<typeof constants.TRIGGER>;
    readonly volume: ControlInput<number>;
    readonly playbackRate: ControlInput<number>;
    readonly audioOutput: AudioRateOutput;
    mediaElement: HTMLMediaElement;
    audioNode: MediaElementAudioSourceNode;
    constructor(selectorOrElement: string | MaybeJQuery<HTMLMediaElement>, { preservePitchOnStretch }?: {
        preservePitchOnStretch?: boolean;
    });
    inputDidUpdate(input: any, newValue: any): void;
}
export {};
