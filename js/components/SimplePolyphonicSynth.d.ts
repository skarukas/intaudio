import { ControlInput } from "../io/input/ControlInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import { KeyEvent } from "../shared/events.js";
import { WaveType } from "../shared/types.js";
import { BaseComponent } from "./base/BaseComponent.js";
export declare class SimplePolyphonicSynth extends BaseComponent {
    #private;
    readonly numNotes: ControlInput<number>;
    readonly waveform: ControlInput<WaveType>;
    readonly midiInput: ControlInput<KeyEvent>;
    readonly audioOutput: AudioRateOutput;
    private _soundNodes;
    private _currNodeIdx;
    protected _masterGainNode: GainNode;
    constructor(numNotes?: number, waveform?: WaveType);
    inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void;
    onKeyEvent(event: KeyEvent): void;
}
