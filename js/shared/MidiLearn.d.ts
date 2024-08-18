import { MidiMessageListener } from "./MidiListener.js";
declare enum MidiLearnMode {
    /** Accept all messages matching the input device from the MIDI learn message. */
    INPUT = "input",
    /** Accept all messages matching the input device and status from the MIDI learn message. */
    STATUS = "status",
    /** Accept all messages matching the input device, status, and the first message byte (ex: pitch) from the MIDI learn message. */
    FIRST_BYTE = "first-byte"
}
export declare class MidiLearn {
    static Mode: typeof MidiLearnMode;
    isInMidiLearnMode: boolean;
    learnMode: MidiLearnMode;
    learnedMidiInput: MIDIInput | undefined;
    learnedMidiEvent: MIDIMessageEvent | undefined;
    protected midiMessageListener: MidiMessageListener;
    protected $contextMenu: JQuery | undefined;
    protected onMidiLearnConnection: ((input: MIDIInput, data: Uint8Array) => void);
    protected onMidiMessage: ((event: MIDIMessageEvent) => void);
    constructor({ learnMode, contextMenuSelector, onMidiLearnConnection, onMidiMessage }?: {
        learnMode?: MidiLearnMode;
        contextMenuSelector?: string;
        onMidiLearnConnection?: ((input: MIDIInput, data: Uint8Array) => void);
        onMidiMessage?: ((event: MIDIMessageEvent) => void);
    });
    private addMidiLearnContextMenu;
    enterMidiLearnMode(): void;
    exitMidiLearnMode(): void;
    private matchesLearnedFilter;
    private midiMessageHandler;
}
export {};
