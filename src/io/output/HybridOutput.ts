import { resolvePromiseArgs } from "../../shared/decorators.js"
import { CanBeConnectedTo } from "../../shared/types.js"
import { isType } from "../../shared/util.js"
import { AudioRateInput } from "../input/AudioRateInput.js"
import { ComponentInput } from "../input/ComponentInput.js"
import { ControlInput } from "../input/ControlInput.js"
import { HybridInput } from "../input/HybridInput.js"
import { AudioRateOutput } from "./AudioRateOutput.js"
import { ControlOutput } from "./ControlOutput.js"

// TODO: consider removing this class. Or not? Can be repurposed to handle fft data along with control and audio-rate.
export class HybridOutput<T = any> extends AudioRateOutput {
  connect(destination: CanBeConnectedTo) {
    let { input } = this.getDestinationInfo(destination)
    input = input instanceof ComponentInput && input.defaultInput instanceof AudioRateInput ? input.defaultInput : input
    if (isType(input, [ControlInput, ComponentInput])) {
      return ControlOutput.prototype.connect.bind(this)(destination)
    } else if (input instanceof AudioRateInput || input instanceof HybridInput) {
      return AudioRateOutput.prototype.connect.bind(this)(destination)
    } else {
      throw new Error("Unable to connect to " + destination)
    }
  }
  @resolvePromiseArgs
  setValue(value: T | Promise<T>, rawObject: boolean = false) {
    ControlOutput.prototype.setValue.bind(this)(value, rawObject)
  }
  onUpdate(callback: (val?: any) => void) {
    this.callbacks.push(callback)
  }
}