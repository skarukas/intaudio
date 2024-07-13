
import { ControlInput } from "../io/input/ControlInput.js";
import { AudioRateOutput } from "../io/output/AudioRateOutput.js";
import { createConstantSource } from "../shared/util.js";
import { BaseComponent } from "./base/BaseComponent.js";

export class ControlToAudioConverter extends BaseComponent {
  readonly input: ControlInput<number>
  readonly output: AudioRateOutput
  protected node: ConstantSourceNode

  constructor() {
    super()
    this.input = this.defineControlInput('input')
    this.node = createConstantSource(this.audioContext)
    this.output = this.defineAudioOutput('output', this.node)
  }
  protected inputDidUpdate(input: any, newValue: any): void {
    if (input == this.input) {
      this.node.offset.setValueAtTime(newValue, 0)
    }
  }
}