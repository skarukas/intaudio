var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SimplePolyphonicSynth_instances, _SimplePolyphonicSynth_createOscillatorGraph;
import { KeyEventType } from "../shared/events.js";
import { WaveType } from "../shared/types.js";
import { BaseComponent } from "./base/BaseComponent.js";
export class SimplePolyphonicSynth extends BaseComponent {
    constructor(numNotes = 4, waveform = WaveType.SINE) {
        super();
        _SimplePolyphonicSynth_instances.add(this);
        this._soundNodes = [];
        this._currNodeIdx = 0;
        this._masterGainNode = this.audioContext.createGain();
        // Inputs
        this.numNotes = this._defineControlInput('numNotes', numNotes);
        this.waveform = this._defineControlInput('waveform', waveform);
        this.midiInput = this._defineControlInput('midiInput');
        this._setDefaultInput(this.midiInput);
        // Output
        this.audioOutput = this._defineAudioOutput('audioOutput', this._masterGainNode);
        for (let i = 0; i < numNotes; i++) {
            this._soundNodes.push(__classPrivateFieldGet(this, _SimplePolyphonicSynth_instances, "m", _SimplePolyphonicSynth_createOscillatorGraph).call(this, this.waveform.value));
        }
        this._preventIOOverwrites();
    }
    inputDidUpdate(input, newValue) {
        if (input == this.midiInput) {
            this.onKeyEvent(newValue);
        }
        // TODO: fill in the rest.
    }
    onKeyEvent(event) {
        // Need better solution than this.
        let freq = 440 * Math.pow(2, ((event.eventPitch - 69) / 12));
        if (event.eventType == KeyEventType.KEY_DOWN) {
            let node = this._soundNodes[this._currNodeIdx];
            node.isPlaying && node.oscillator.stop();
            node.oscillator = this.audioContext.createOscillator();
            node.oscillator.connect(node.gainNode);
            node.oscillator.frequency.value = freq;
            node.gainNode.gain.value = event.eventVelocity / 128;
            node.oscillator.start();
            node.key = event.key;
            node.isPlaying = true;
            this._currNodeIdx = (this._currNodeIdx + 1) % this.numNotes.value;
        }
        else if (event.eventType == KeyEventType.KEY_UP) {
            for (let node of this._soundNodes) {
                if (event.key && (event.key == node.key)) {
                    node.oscillator.stop();
                    node.isPlaying = false;
                }
            }
        }
        else {
            throw new Error("invalid keyevent");
        }
    }
}
_SimplePolyphonicSynth_instances = new WeakSet(), _SimplePolyphonicSynth_createOscillatorGraph = function _SimplePolyphonicSynth_createOscillatorGraph(waveform) {
    let oscillator = this.audioContext.createOscillator();
    oscillator.type = waveform;
    let gainNode = this.audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(this._masterGainNode);
    this._masterGainNode.gain.setValueAtTime(1 / this.numNotes.value, this._now());
    return {
        oscillator: oscillator,
        gainNode: gainNode,
        isPlaying: false,
        // Unique identifier to help associate NOTE_OFF events with the correct
        // oscillator.
        key: undefined
    };
};
