var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _TypingKeyboardMIDI_instances, _a, _TypingKeyboardMIDI_registerKeyHandlers, _TypingKeyboardMIDI_getPitchFromKey;
import constants from "../shared/constants.js";
import { KeyEvent, KeyEventType } from "../shared/events.js";
import { BaseComponent } from "./base/BaseComponent.js";
const _MIDI_C0 = 12;
export class TypingKeyboardMIDI extends BaseComponent {
    constructor(velocity = 64, octave = 4) {
        super();
        _TypingKeyboardMIDI_instances.add(this);
        // Inputs
        this.velocity = this.defineControlInput('velocity', velocity);
        this.octaveInput = this.defineControlInput('octaveInput', octave);
        this.midiInput = this.defineControlInput('midiInput', constants.UNSET_VALUE, false);
        this.setDefaultInput(this.midiInput);
        // Output
        this.midiOutput = this.defineControlOutput('midiOutput');
        this.octaveOutput = this.defineControlOutput('octaveOutput');
        this.setDefaultOutput(this.midiOutput);
        this.preventIOOverwrites();
        this.validateIsSingleton();
        __classPrivateFieldGet(this, _TypingKeyboardMIDI_instances, "m", _TypingKeyboardMIDI_registerKeyHandlers).call(this);
    }
    inputDidUpdate(input, newValue) {
        if (input == this.octaveInput) {
            this.octaveOutput.setValue(newValue);
        }
        else if (input == this.midiInput) {
            // Passthrough, as MIDI does not affect component state.
            this.midiOutput.setValue(newValue);
        }
    }
}
_a = TypingKeyboardMIDI, _TypingKeyboardMIDI_instances = new WeakSet(), _TypingKeyboardMIDI_registerKeyHandlers = function _TypingKeyboardMIDI_registerKeyHandlers() {
    const keyPressedMap = {};
    const processKeyEvent = (event) => {
        var _b;
        if (event.defaultPrevented) {
            return;
        }
        const key = event.key;
        const isAlreadyPressed = (_b = keyPressedMap[key]) === null || _b === void 0 ? void 0 : _b.isPressed;
        const isKeyDown = (event.type == KeyEventType.KEY_DOWN);
        let pitch;
        if (isAlreadyPressed) {
            if (isKeyDown) {
                // Extra keydown events are sent for holding, so ignore.
                return;
            }
            else {
                // The pitch of the press may be different than the current pitch,
                // so send a note-off for that one instead.
                pitch = keyPressedMap[key].pitch;
            }
        }
        else {
            pitch = __classPrivateFieldGet(this, _TypingKeyboardMIDI_instances, "m", _TypingKeyboardMIDI_getPitchFromKey).call(this, key, isKeyDown);
        }
        if (pitch != undefined) {
            keyPressedMap[key] = {
                isPressed: isKeyDown,
                pitch: pitch
            };
            let id = this._uuid + key + pitch;
            this.midiOutput.setValue(new KeyEvent(event.type, pitch, this.velocity.value, id));
        }
    };
    window.addEventListener("keydown", processKeyEvent, true);
    window.addEventListener("keyup", processKeyEvent, true);
}, _TypingKeyboardMIDI_getPitchFromKey = function _TypingKeyboardMIDI_getPitchFromKey(key, isKeyDown) {
    const baseCPitch = _MIDI_C0 + this.octaveInput.value * 12;
    const chromaticIdx = _a.CHROMATIC_KEY_SEQUENCE.indexOf(key);
    if (chromaticIdx != -1) {
        return chromaticIdx + baseCPitch;
    }
    else if (isKeyDown && key == _a.OCTAVE_DOWN_KEY) {
        // The octaveOutput will automatically be updated
        this.octaveInput.setValue(this.octaveInput.value - 1);
    }
    else if (isKeyDown && key == _a.OCTAVE_UP_KEY) {
        this.octaveInput.setValue(this.octaveInput.value + 1);
    }
};
TypingKeyboardMIDI.OCTAVE_DOWN_KEY = "z";
TypingKeyboardMIDI.OCTAVE_UP_KEY = "x";
TypingKeyboardMIDI.CHROMATIC_KEY_SEQUENCE = "awsedftgyhujkolp;'"; // C to F
