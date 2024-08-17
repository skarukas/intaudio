import { AbstractInput } from "../io/input/AbstractInput.js"
import { ControlInput } from "../io/input/ControlInput.js"
import { ControlOutput } from "../io/output/ControlOutput.js"
import { MidiLearn } from "../shared/MidiLearn.js"
import { RangeType } from "../shared/types.js"
import { scaleRange } from "../shared/util.js"
import { RangeInputDisplay } from "../ui/RangeInputDisplay.js"
import { VisualComponent } from "./base/VisualComponent.js"

export class RangeInputComponent extends VisualComponent<RangeInputDisplay> {
  display: RangeInputDisplay
  readonly minValue: ControlInput<number>
  readonly maxValue: ControlInput<number>
  readonly step: ControlInput<number>
  readonly input: ControlInput<number>
  readonly output: ControlOutput<number>

  protected midiLearn: MidiLearn

  static Type = RangeType
  constructor(
    minValue: number = 0,
    maxValue: number = 1,
    step?: number,
    defaultValue?: number,
    displayType: RangeType = RangeType.SLIDER
  ) {
    super()
    this.display = (displayType == RangeType.SLIDER)
      ? new this._.SliderDisplay(this)
      : new this._.KnobDisplay(this)
    if (defaultValue == undefined) {
      defaultValue = minValue
    }
    // Inputs
    this.minValue = this.defineControlInput('minValue', minValue)
    this.maxValue = this.defineControlInput('maxValue', maxValue)
    this.step = this.defineControlInput('step', step)
    this.input = this.defineControlInput('input', defaultValue)
    this.setDefaultInput(this.input)

    // Output
    this.output = this.defineControlOutput('output')


    // Update slider on messages from Midi-learned control.
    this.midiLearn = new MidiLearn({
      learnMode: MidiLearn.Mode.FIRST_BYTE,
      contextMenuSelector: this.uniqueDomSelector,
      onMidiMessage: this.handleMidiUpdate.bind(this)
    })
  }
  protected handleMidiUpdate(event: MIDIMessageEvent) {
    if (event.data == null) return
    const uInt8Value = event.data[2]  // Velocity / value.
    const scaledValue = scaleRange(
      uInt8Value,
      [0, 127],
      [this.minValue.value, this.maxValue.value]
    )
    this.updateValue(scaledValue)
  }
  protected updateValue(newValue: number) {
    this.display.updateValue(newValue)
    this.output.setValue(newValue)
  }
  inputDidUpdate(input: any, newValue: any) {
    if (input == this.input) {
      this.updateValue(newValue)
    } else if (input == this.minValue) {
      this.display.updateMinValue(newValue)
    } else if (input == this.maxValue) {
      this.display.updateMaxValue(newValue)
    } else if (input == this.step) {
      this.display.updateStep(newValue)
    }
  }
}