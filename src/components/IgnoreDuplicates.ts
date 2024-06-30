import { ControlInput } from "../io/input/ControlInput.js"
import { ControlOutput } from "../io/output/ControlOutput.js"
import { BaseComponent } from "./base/BaseComponent.js"


export class IgnoreDuplicates<T = any> extends BaseComponent {
  input: ControlInput<T>
  output: ControlOutput<T>
  private value: T

  constructor() {
    super()
    this.input = this._defineControlInput('input')
    this.output = this._defineControlOutput('output')
  }
  inputDidUpdate(input: ControlInput<T>, newValue: T) {
    if (newValue != this.value) {
      this.output.setValue(newValue)
      this.value = newValue
    }
  }
}