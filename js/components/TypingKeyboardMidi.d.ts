import { ControlInput } from "../io/input/ControlInput.js";
import { ControlOutput } from "../io/output/ControlOutput.js";
import { KeyEvent } from "../shared/events.js";
import { BaseComponent } from "./base/BaseComponent.js";
export declare class TypingKeyboardMIDI extends BaseComponent {
    #private;
    static OCTAVE_DOWN_KEY: string;
    static OCTAVE_UP_KEY: string;
    static CHROMATIC_KEY_SEQUENCE: string;
    readonly velocity: ControlInput<number>;
    readonly octaveInput: ControlInput<number>;
    readonly midiInput: ControlInput<KeyEvent>;
    readonly midiOutput: ControlOutput<KeyEvent>;
    readonly octaveOutput: ControlOutput<number>;
    constructor(velocity?: number, octave?: number);
    inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void;
}
