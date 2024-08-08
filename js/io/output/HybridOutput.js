var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { resolvePromiseArgs } from "../../shared/decorators.js";
import { AudioRateInput } from "../input/AudioRateInput.js";
import { ControlInput } from "../input/ControlInput.js";
import { HybridInput } from "../input/HybridInput.js";
import { AudioRateOutput } from "./AudioRateOutput.js";
import { ControlOutput } from "./ControlOutput.js";
// TODO: consider removing this class. Or not? Can be repurposed to handle fft data along with control and audio-rate.
export class HybridOutput extends AudioRateOutput {
    connect(destination) {
        let { input } = this.getDestinationInfo(destination);
        if (input instanceof AudioRateInput || input instanceof HybridInput) {
            return AudioRateOutput.prototype.connect.bind(this)(destination);
        }
        else if (input instanceof ControlInput) {
            return ControlOutput.prototype.connect.bind(this)(destination);
        }
        else {
            throw new Error("Unable to connect to " + destination);
        }
    }
    setValue(value, rawObject = false) {
        ControlOutput.prototype.setValue.bind(this)(value, rawObject);
    }
    onUpdate(callback) {
        this.callbacks.push(callback);
    }
}
__decorate([
    resolvePromiseArgs
], HybridOutput.prototype, "setValue", null);
