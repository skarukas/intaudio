import { ControlInput } from "../io/input/ControlInput.js"
import { ControlOutput } from "../io/output/ControlOutput.js"
import { BaseComponent } from "./base/BaseComponent.js"


export class IgnoreDuplicates<T = any> extends BaseComponent {
  input: ControlInput<T>
  output: ControlOutput<T>
  private value: T | undefined

  constructor() {
    super()
    this.input = this.defineControlInput('input')
    this.output = this.defineControlOutput('output')
  }
  // @ts-ignore ControlInput<T> doesn't cover all of base AbstractInput<T>
  protected inputDidUpdate(input: ControlInput<T>, newValue: T) {
    if (newValue != this.value) {
      this.output.setValue(newValue)
      this.value = newValue
    }
  }
}