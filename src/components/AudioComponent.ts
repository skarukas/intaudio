
import { AudioRateInput } from "../io/input/AudioRateInput.js"
import { AudioRateOutput } from "../io/output/AudioRateOutput.js"
import { WebAudioConnectable } from "../shared/types.js"
import { BaseComponent } from "./base/BaseComponent.js"

export class AudioComponent extends BaseComponent {
  readonly input: AudioRateInput
  readonly output: AudioRateOutput

  constructor(inputNode: WebAudioConnectable) {
    super()
    this.input = this._defineAudioInput('input', inputNode)
    if (inputNode instanceof AudioNode) {
      this.output = this._defineAudioOutput('output', inputNode)
    } else if (!(inputNode instanceof AudioParam)) {
      throw new Error("AudioComponents must be built from either and AudioNode or AudioParam")
    }
    this._preventIOOverwrites()
  }
}