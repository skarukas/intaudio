import { AudioRateInput } from "../input/AudioRateInput.js"
import { ControlInput } from "../input/ControlInput.js"
import { AudioRateOutput } from "./AudioRateOutput.js"
import { ControlOutput } from "./ControlOutput.js"

export class HybridOutput extends AudioRateOutput {
  connect(destination) {
    let { input } = this.getDestinationInfo(destination)
    if (input instanceof AudioRateInput) {
      return AudioRateOutput.prototype.connect.bind(this)(destination)
    } else if (input instanceof ControlInput) {
      return ControlOutput.prototype.connect.bind(this)(destination)
    } else {
      throw new Error("Unable to connect to " + destination)
    }
  }
  setValue(value, rawObject: boolean = false) {
    ControlOutput.prototype.setValue.bind(this)(value, rawObject)
  }
  onUpdate(callback: (val?) => void) {
    this.callbacks.push(callback)
  }
}