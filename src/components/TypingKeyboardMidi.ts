
import { ControlInput } from "../io/input/ControlInput.js"
import { ControlOutput } from "../io/output/ControlOutput.js"
import constants from "../shared/constants.js"
import { KeyEvent, KeyEventType } from "../shared/events.js"
import { ObjectOf } from "../shared/types.js"
import { BaseComponent } from "./base/BaseComponent.js"

const _MIDI_C0 = 12

export class TypingKeyboardMIDI extends BaseComponent {
  static OCTAVE_DOWN_KEY = "z"
  static OCTAVE_UP_KEY = "x"
  static CHROMATIC_KEY_SEQUENCE = "awsedftgyhujkolp;'"  // C to F

  readonly velocity: ControlInput<number>
  readonly octaveInput: ControlInput<number>
  readonly midiInput: ControlInput<KeyEvent>
  readonly midiOutput: ControlOutput<KeyEvent>
  readonly octaveOutput: ControlOutput<number>

  constructor(velocity = 64, octave = 4) {
    super()
    // Inputs
    this.velocity = this.defineControlInput('velocity', velocity)
    this.octaveInput = this.defineControlInput('octaveInput', octave)
    this.midiInput = this.defineControlInput('midiInput', <any>constants.UNSET_VALUE, false)
    this.setDefaultInput(this.midiInput)

    // Output
    this.midiOutput = this.defineControlOutput('midiOutput')
    this.octaveOutput = this.defineControlOutput('octaveOutput')
    this.setDefaultOutput(this.midiOutput)
    this.preventIOOverwrites()
    this.validateIsSingleton()

    this.#registerKeyHandlers()
  }
  #registerKeyHandlers() {
    const keyPressedMap: ObjectOf<{
      isPressed: boolean,
      pitch: number
    }> = {}
    const processKeyEvent = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return
      }
      const key = event.key
      const isAlreadyPressed = keyPressedMap[key]?.isPressed
      const isKeyDown = (event.type == KeyEventType.KEY_DOWN)
      let pitch;
      if (isAlreadyPressed) {
        if (isKeyDown) {
          // Extra keydown events are sent for holding, so ignore.
          return
        } else {
          // The pitch of the press may be different than the current pitch,
          // so send a note-off for that one instead.
          pitch = keyPressedMap[key].pitch
        }
      } else {
        pitch = this.#getPitchFromKey(key, isKeyDown)
      }
      if (pitch != undefined) {
        keyPressedMap[key] = {
          isPressed: isKeyDown,
          pitch: pitch
        }
        let id = this._uuid + key + pitch
        this.midiOutput.setValue(new KeyEvent(<KeyEventType>event.type, pitch, this.velocity.value, id))
      }
    }
    window.addEventListener("keydown", processKeyEvent, true)
    window.addEventListener("keyup", processKeyEvent, true)
  }
  #getPitchFromKey(key: string, isKeyDown: boolean) {
    const baseCPitch = _MIDI_C0 + this.octaveInput.value * 12
    const chromaticIdx = TypingKeyboardMIDI.CHROMATIC_KEY_SEQUENCE.indexOf(key)
    if (chromaticIdx != -1) {
      return chromaticIdx + baseCPitch
    } else if (isKeyDown && key == TypingKeyboardMIDI.OCTAVE_DOWN_KEY) {
      // The octaveOutput will automatically be updated
      this.octaveInput.setValue(this.octaveInput.value - 1)
    } else if (isKeyDown && key == TypingKeyboardMIDI.OCTAVE_UP_KEY) {
      this.octaveInput.setValue(this.octaveInput.value + 1)
    }
  }
  inputDidUpdate<T>(input: ControlInput<T>, newValue: T) {
    if (input == this.octaveInput) {
      this.octaveOutput.setValue(<number>newValue)
    } else if (input == this.midiInput) {
      // Passthrough, as MIDI does not affect component state.
      this.midiOutput.setValue(<KeyEvent>newValue)
    }
  }
}