import { ControlOutput } from "../io/output/ControlOutput.js";
import { MidiLearn } from "../shared/MidiLearn.js";
import constants from "../shared/constants.js";
import { CanBeConnectedTo } from "../shared/types.js";
import { BangDisplay } from "../ui/BangDisplay.js";
import { VisualComponent } from "./base/VisualComponent.js";
export declare class Bang extends VisualComponent<BangDisplay> {
    display: BangDisplay;
    readonly output: ControlOutput<typeof constants.TRIGGER>;
    static defaultHeight: number;
    static defaultWidth: number;
    protected midiLearn: MidiLearn;
    protected lastMidiValue: number;
    constructor();
    protected handleMidiInput(event: MIDIMessageEvent): void;
    connect(destination: CanBeConnectedTo): import("./base/Component.js").Component<import("../shared/types.js").AnyInput, import("../shared/types.js").AnyOutput> | undefined;
    trigger(): void;
}
