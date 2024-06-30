import { BaseComponent } from "../internals.js";
const list = document.getElementById('midi-list');
const debugEl = document.getElementById('debug');
class MidiInputComponent extends BaseComponent {
    constructor() {
        super();
        this.midiOut = this._defineControlOutput('midiOut');
        navigator.requestMIDIAccess().then(function (access) {
            for (const v of access.inputs.values()) {
                console.log(v);
                v.addEventListener('onmidimessage', this.sendMidiMessage.bind(this));
            }
        });
    }
    sendMidiMessage(m) {
        const [cmd, key, v] = m.data;
        this.midiOut.setValue([cmd, key, v]);
    }
}
function connectToDevice(device) {
    console.log('Connecting to device', device);
    device.onmidimessage = function (m) {
        const [command, key, velocity] = m.data;
        console.log(m.data);
        if (command === 145) {
            debugEl.innerText = 'KEY UP: ' + key;
        }
        else if (command === 129) {
            debugEl.innerText = 'KEY DOWN';
        }
    };
}
function replaceElements(inputs) {
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
    const elements = inputs.map(e => {
        console.log(e);
        const el = document.createElement('li');
        el.innerText = `${e.name} (${e.manufacturer})`;
        el.addEventListener('click', connectToDevice.bind(null, e));
        return el;
    });
    elements.forEach(e => list.appendChild(e));
}
console.log('access', access);
replaceElements(Array.from(access.inputs.values()));
access.onstatechange = function (e) {
    replaceElements(Array.from(this.inputs.values()));
};
