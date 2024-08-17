import { ControlInput } from "../io/input/ControlInput.js"
import { ControlOutput } from "../io/output/ControlOutput.js"
import { MidiLearn } from "../shared/MidiLearn.js"
import constants from "../shared/constants.js"
import { CanBeConnectedTo } from "../shared/types.js"
import { BangDisplay } from "../ui/BangDisplay.js"
import { VisualComponent } from "./base/VisualComponent.js"

export class Bang extends VisualComponent<BangDisplay> {
  display: BangDisplay
  readonly output: ControlOutput<typeof constants.TRIGGER>
  // Display options. TODO: move to display class?
  static defaultHeight = 48;
  static defaultWidth = 48;
  protected midiLearn: MidiLearn
  protected lastMidiValue: number = 0

  constructor() {
    super()
    this.display = new this._.BangDisplay(this)
    this.output = this.defineControlOutput('output')
    this.preventIOOverwrites()

    // Trigger on nonzero MIDI inputs.
    this.midiLearn = new MidiLearn({
      contextMenuSelector: this.uniqueDomSelector,
      learnMode: MidiLearn.Mode.FIRST_BYTE,
      onMidiMessage: this.handleMidiInput.bind(this)
    })
  }
  protected handleMidiInput(event: MIDIMessageEvent) {
    if (event.data == null) return
    const midiValue = event.data[2]
    if (midiValue) {
      if (!this.lastMidiValue) {
        this.trigger()
        this.display.showPressed()
      }
    } else {
      this.display.showUnpressed()
    }
    this.lastMidiValue = midiValue
  }
  connect(destination: CanBeConnectedTo) {
    let { component, input } = this.getDestinationInfo(destination)
    if (input instanceof ControlInput) {
      this.output.connect(input)
    } else if (component != undefined) {
      this.output.connect(component.triggerInput)
    } else {
      throw new Error(`Unable to connect to ${destination} because it is not a ControlInput and has no associated component.`)
    }
    return component
  }
  trigger() {
    this.output.setValue(constants.TRIGGER)
  }
}