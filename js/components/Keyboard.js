import { KeyEvent, KeyEventType } from "../shared/events.js";
import { VisualComponent } from "./base/VisualComponent.js";
export class Keyboard extends VisualComponent {
    constructor(numKeys = 48, lowestPitch = 48) {
        super();
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
    getKeyId(keyNumber) {
        return `${this._uuid}-k${keyNumber}`; // Unique identifier.
    }
    keyDown(keyNumber) {
        this.midiOutput.setValue(new KeyEvent(KeyEventType.KEY_DOWN, keyNumber, 64, this.getKeyId(keyNumber)));
    }
    keyUp(keyNumber) {
        this.midiOutput.setValue(new KeyEvent(KeyEventType.KEY_UP, keyNumber, 64, this.getKeyId(keyNumber)));
    }
}
// Display options. TODO: move to display class?
Keyboard.defaultHeight = 64;
Keyboard.defaultWidth = 256;
