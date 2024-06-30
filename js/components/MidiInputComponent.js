import { BaseComponent } from "./base/BaseComponent.js";
export class MidiInputComponent extends BaseComponent {
    constructor() {
        super();
        this.midiOut = this._defineControlOutput('midiOut');
        this.availableDevices = this._defineControlOutput('availableDevices');
        this.selectedDevice = this._defineControlOutput('selectedDevice');
        navigator.requestMIDIAccess().then(access => {
            this.onMidiAccessChange(access);
            access.onstatechange = this.onMidiAccessChange.bind(this, access);
        });
    }
    onMidiAccessChange(access) {
        const inputs = [...access.inputs.values()];
        inputs.map(this.receiveMidiConnection.bind(this));
        this.availableDevices.setValue(inputs);
    }
    receiveMidiConnection(midiInput) {
        midiInput.onmidimessage = this.sendMidiMessage.bind(this, midiInput);
    }
    sendMidiMessage(midiInput, e) {
        const [cmd, key, v] = e.data;
        this.midiOut.setValue([cmd, key, v]);
    }
}
