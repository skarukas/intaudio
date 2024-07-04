import { ControlInput } from "../io/input/ControlInput.js"
import { ControlOutput } from "../io/output/ControlOutput.js"
import { KeyEvent, KeyEventType } from "../shared/events.js"
import { KeyboardDisplay } from "../ui/KeyboardDisplay.js"
import { VisualComponent } from "./base/VisualComponent.js"

export class Keyboard extends VisualComponent<KeyboardDisplay> {
  readonly numKeys: ControlInput<number>
  readonly lowestPitch: ControlInput<number>
  readonly midiInput: ControlInput<KeyEvent>
  readonly midiOutput: ControlOutput<KeyEvent>

  // Display options. TODO: move to display class?
  static defaultHeight = 64;
  static defaultWidth = 256;

  constructor(numKeys = 48, lowestPitch = 48) {
    super()
    this.display = new this._.KeyboardDisplay(this)
    // Inputs
    this.numKeys = this.defineControlInput('numKeys', numKeys)
    this.lowestPitch = this.defineControlInput('lowestPitch', lowestPitch)
    this.midiInput = this.defineControlInput('midiInput')
    this.setDefaultInput(this.midiInput)

    // Output
    this.midiOutput = this.defineControlOutput('midiOutput')
    this.preventIOOverwrites()
  }

  inputDidUpdate<T>(input: ControlInput<T>, newValue: T) {
    if (input == this.numKeys || input == this.lowestPitch) {
      //this.refreshDom()
      throw new Error("Can't update numKeys or lowestPitch yet.")
    }
    if (input == this.midiInput) {
      // Show key being pressed.
      this.display.showKeyEvent(newValue)
      // Propagate.
      this.midiOutput.setValue(<KeyEvent>newValue)
    }
  }

  get highestPitch() {
    return this.lowestPitch.value + this.numKeys.value
  }
  #getKeyId(keyNumber) {
    return `${this._uuid}-k${keyNumber}`  // Unique identifier.
  }
  _keyDown(keyNumber) {
    this.midiOutput.setValue(new KeyEvent(KeyEventType.KEY_DOWN, keyNumber, 64, this.#getKeyId(keyNumber)))
  }
  _keyUp(keyNumber) {
    this.midiOutput.setValue(new KeyEvent(KeyEventType.KEY_UP, keyNumber, 64, this.#getKeyId(keyNumber)))
  }
}