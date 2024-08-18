import { ControlInput } from "../io/input/ControlInput.js";
import { ControlOutput } from "../io/output/ControlOutput.js";
import { KeyEvent } from "../shared/events.js";
import { KeyboardDisplay } from "../ui/KeyboardDisplay.js";
import { VisualComponent } from "./base/VisualComponent.js";
export declare class Keyboard extends VisualComponent<KeyboardDisplay> {
    display: KeyboardDisplay;
    readonly numKeys: ControlInput<number>;
    readonly lowestPitch: ControlInput<number>;
    readonly midiInput: ControlInput<KeyEvent>;
    readonly midiOutput: ControlOutput<KeyEvent>;
    static defaultHeight: number;
    static defaultWidth: number;
    constructor(numKeys?: number, lowestPitch?: number);
    protected inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void;
    get highestPitch(): number;
    private getKeyId;
    keyDown(keyNumber: number): void;
    keyUp(keyNumber: number): void;
}
