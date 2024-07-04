var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Keyboard_instances, _Keyboard_getKeyId;
import { KeyEvent, KeyEventType } from "../shared/events.js";
import { VisualComponent } from "./base/VisualComponent.js";
export class Keyboard extends VisualComponent {
    constructor(numKeys = 48, lowestPitch = 48) {
        super();
        _Keyboard_instances.add(this);
        this.display = new this._.KeyboardDisplay(this);
        // Inputs
        this.numKeys = this.defineControlInput('numKeys', numKeys);
        this.lowestPitch = this.defineControlInput('lowestPitch', lowestPitch);
        this.midiInput = this.defineControlInput('midiInput');
        this.setDefaultInput(this.midiInput);
        // Output
        this.midiOutput = this.defineControlOutput('midiOutput');
        this.preventIOOverwrites();
    }
    inputDidUpdate(input, newValue) {
        if (input == this.numKeys || input == this.lowestPitch) {
            //this.refreshDom()
            throw new Error("Can't update numKeys or lowestPitch yet.");
        }
        if (input == this.midiInput) {
            // Show key being pressed.
            this.display.showKeyEvent(newValue);
            // Propagate.
            this.midiOutput.setValue(newValue);
        }
    }
    get highestPitch() {
        return this.lowestPitch.value + this.numKeys.value;
    }
    _keyDown(keyNumber) {
        this.midiOutput.setValue(new KeyEvent(KeyEventType.KEY_DOWN, keyNumber, 64, __classPrivateFieldGet(this, _Keyboard_instances, "m", _Keyboard_getKeyId).call(this, keyNumber)));
    }
    _keyUp(keyNumber) {
        this.midiOutput.setValue(new KeyEvent(KeyEventType.KEY_UP, keyNumber, 64, __classPrivateFieldGet(this, _Keyboard_instances, "m", _Keyboard_getKeyId).call(this, keyNumber)));
    }
}
_Keyboard_instances = new WeakSet(), _Keyboard_getKeyId = function _Keyboard_getKeyId(keyNumber) {
    return `${this._uuid}-k${keyNumber}`; // Unique identifier.
};
// Display options. TODO: move to display class?
Keyboard.defaultHeight = 64;
Keyboard.defaultWidth = 256;
