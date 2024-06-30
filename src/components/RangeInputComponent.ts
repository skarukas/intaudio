
import { ControlInput } from "../io/input/ControlInput.js"
import { ControlOutput } from "../io/output/ControlOutput.js"
import { RangeType } from "../shared/types.js"
import { RangeInputDisplay } from "../ui/RangeInputDisplay.js"
import { VisualComponent } from "./base/VisualComponent.js"

export class RangeInputComponent extends VisualComponent<RangeInputDisplay> {
  readonly minValue: ControlInput<number>
  readonly maxValue: ControlInput<number>
  readonly step: ControlInput<number>
  readonly input: ControlInput<number>
  readonly output: ControlOutput<number>

  static Type = RangeType
  constructor(
    minValue: number = -1,
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
      defaultValue = (minValue + maxValue) / 2
    }
    // Inputs
    this.minValue = this._defineControlInput('minValue', minValue)
    this.maxValue = this._defineControlInput('maxValue', maxValue)
    this.step = this._defineControlInput('step', step)
    this.input = this._defineControlInput('input', defaultValue)
    this._setDefaultInput(this.input)

    // Output
    this.output = this._defineControlOutput('output')
  }
  inputDidUpdate(input: ControlInput<number>, newValue: number) {
    if (input == this.input) {
      this.display.updateValue(newValue)
      this.output.setValue(newValue)
    } else if (input == this.minValue) {
      this.display.updateMinValue(newValue)
    } else if (input == this.maxValue) {
      this.display.updateMaxValue(newValue)
    } else if (input == this.step) {
      this.display.updateStep(newValue)
    }
  }
}