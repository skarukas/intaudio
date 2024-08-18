import { ToStringAndUUID } from "./base/ToStringAndUUID.js";
declare class MidiListener extends ToStringAndUUID {
    listener: Function;
    protected listenerMap: {
        [id: string]: Function;
    };
    constructor(listener: Function, listenerMap: {
        [id: string]: Function;
    });
    remove(): void;
}
export declare class MidiAccessListener extends MidiListener {
    onMidiAccessChange: (access: MIDIAccess, event?: MIDIConnectionEvent) => void;
    constructor(onMidiAccessChange: (access: MIDIAccess, event?: MIDIConnectionEvent) => void);
}
export declare class MidiMessageListener extends MidiListener {
    onMidiMessage: (midiInput: MIDIInput, e: MIDIMessageEvent) => void;
    constructor(onMidiMessage: (midiInput: MIDIInput, e: MIDIMessageEvent) => void);
}
export {};
