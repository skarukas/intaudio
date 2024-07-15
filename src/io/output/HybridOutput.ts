import { AudioRateInput } from "../input/AudioRateInput.js"
import { ControlInput } from "../input/ControlInput.js"
import { HybridInput } from "../input/HybridInput.js"
import { AudioRateOutput } from "./AudioRateOutput.js"
import { ControlOutput } from "./ControlOutput.js"

export class HybridOutput<T = any> extends AudioRateOutput {
  connect(destination) {
    let { input } = this.getDestinationInfo(destination)
    if (input instanceof AudioRateInput || input instanceof HybridInput) {
      return AudioRateOutput.prototype.connect.bind(this)(destination)
    } else if (input instanceof ControlInput) {
      return ControlOutput.prototype.connect.bind(this)(destination)
    } else {
      throw new Error("Unable to connect to " + destination)
    }
  }
  setValue(value: T, rawObject: boolean = false) {
    ControlOutput.prototype.setValue.bind(this)(value, rawObject)
  }
  onUpdate(callback: (val?) => void) {
    this.callbacks.push(callback)
  }
}