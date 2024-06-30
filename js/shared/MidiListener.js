import { ToStringAndUUID } from "./base/ToStringAndUUID.js";
class MidiListener extends ToStringAndUUID {
    constructor(listener, listenerMap) {
        super();
        this.listener = listener;
        this.listenerMap = listenerMap;
        MidiState.connect();
        listenerMap[this._uuid] = listener;
    }
    remove() {
        delete this.listenerMap[this._uuid];
    }
}
class MidiState {
    static connect() {
        if (this.isInitialized) {
            return Promise.resolve();
        }
        else {
            // Avoid race conditions by requesting access only once.
            this.isInitialized = true;
            return navigator.requestMIDIAccess().then(access => {
                this.onMidiAccessChange(access);
                access.onstatechange = this.onMidiAccessChange.bind(this, access);
            });
        }
    }
    static onMidiAccessChange(access, event) {
        for (const listener of Object.values(this.accessListeners)) {
            listener(access, event);
        }
        for (const input of access.inputs.values()) {
            input.onmidimessage = MidiState.onMidiMessage.bind(this, input);
        }
    }
    static onMidiMessage(midiInput, event) {
        for (const listener of Object.values(this.messageListeners)) {
            listener(midiInput, event);
        }
    }
}
MidiState.accessListeners = {};
MidiState.messageListeners = {};
MidiState.isInitialized = false;
// Utility for listening to current state of MIDI devices. There are many MIDI 
// listeners but only one MIDI state.
export class MidiAccessListener extends MidiListener {
    constructor(onMidiAccessChange) {
        super(onMidiAccessChange, MidiState.accessListeners);
        this.onMidiAccessChange = onMidiAccessChange;
    }
}
export class MidiMessageListener extends MidiListener {
    constructor(onMidiMessage) {
        super(onMidiMessage, MidiState.messageListeners);
        this.onMidiMessage = onMidiMessage;
    }
}
