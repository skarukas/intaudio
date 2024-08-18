import { ControlInput } from "../io/input/ControlInput.js";
import { ControlOutput } from "../io/output/ControlOutput.js";
import { MidiLearn } from "../shared/MidiLearn.js";
import { RangeType } from "../shared/types.js";
import { RangeInputDisplay } from "../ui/RangeInputDisplay.js";
import { VisualComponent } from "./base/VisualComponent.js";
export declare class RangeInputComponent extends VisualComponent<RangeInputDisplay> {
    display: RangeInputDisplay;
    readonly minValue: ControlInput<number>;
    readonly maxValue: ControlInput<number>;
    readonly step: ControlInput<number>;
    readonly input: ControlInput<number>;
    readonly output: ControlOutput<number>;
    protected midiLearn: MidiLearn;
    static Type: typeof RangeType;
    constructor(minValue?: number, maxValue?: number, step?: number, defaultValue?: number, displayType?: RangeType);
    protected handleMidiUpdate(event: MIDIMessageEvent): void;
    protected updateValue(newValue: number): void;
    inputDidUpdate(input: any, newValue: any): void;
}
