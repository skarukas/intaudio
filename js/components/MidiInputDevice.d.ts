import { ControlInput } from "../io/input/ControlInput.js";
import { ControlOutput } from "../io/output/ControlOutput.js";
import { MidiLearn } from "../shared/MidiLearn.js";
import { MidiAccessListener, MidiMessageListener } from "../shared/MidiListener.js";
import { VisualComponent } from "./base/VisualComponent.js";
type MidiEvent = [number, number, number];
export interface SupportsSelect {
    selectOptions: {
        id: string;
        name: string;
    }[];
    readonly selectedId: string | undefined;
    setOption(id: string): void;
}
export declare enum DefaultDeviceBehavior {
    NONE = "none",
    ALL = "all",
    NEWEST = "newest"
}
type DeviceSelectorFn = (inputs: MIDIInput[]) => MIDIInput;
export declare class MidiInputDevice extends VisualComponent implements SupportsSelect {
    defaultDeviceBehavior: DefaultDeviceBehavior | DeviceSelectorFn;
    display: any;
    readonly selectedDeviceInput: ControlInput<string>;
    readonly midiOut: ControlOutput<MidiEvent>;
    readonly availableDevices: ControlOutput<{
        [id: string]: MIDIInput;
    }>;
    readonly activeDevices: ControlOutput<MIDIInput[]>;
    selectOptions: {
        id: string;
        name: string;
    }[];
    selectedId: string | undefined;
    protected deviceMap: {
        [id: string]: MIDIInput;
    };
    protected accessListener: MidiAccessListener;
    protected messageListener: MidiMessageListener;
    protected midiLearn: MidiLearn;
    constructor(defaultDeviceBehavior?: DefaultDeviceBehavior | DeviceSelectorFn);
    protected static buildSelectOptions(inputMap: {
        [id: string]: MIDIInput;
    }): {
        id: string;
        name: string;
    }[];
    protected getSelectedMidiDevicesById(id: string): MIDIInput[];
    selectDevice(id: string): void;
    protected onMidiAccessChange(access: MIDIAccess, event?: MIDIConnectionEvent): void;
    protected autoSelectNewDevice(deviceMap: {
        [id: string]: MIDIInput;
    }, event?: MIDIConnectionEvent): string | undefined;
    protected sendMidiMessage(midiInput: MIDIInput, e: MIDIMessageEvent): void;
    inputDidUpdate<T>(input: ControlInput<T>, newValue: T): void;
    setOption(id: string): void;
}
export {};
