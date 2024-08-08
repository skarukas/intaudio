var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { resolvePromiseArgs } from "../../shared/decorators.js";
import { AudioRateInput } from "../input/AudioRateInput.js";
import { ComponentInput } from "../input/ComponentInput.js";
import { AbstractOutput } from "./AbstractOutput.js";
export class ControlOutput extends AbstractOutput {
    constructor() {
        super(...arguments);
        this.numOutputChannels = 1;
    }
    connect(destination) {
        let { component, input } = this.getDestinationInfo(destination);
        // TODO: fix... should be "destination" but won't work for non-connectables like Function.
        /* const connectable = destination instanceof AbstractInput ? destination : component */
        // Conversion. TODO: figure out how to treat ComponentInput.
        if (input instanceof AudioRateInput && !(input instanceof ComponentInput)) {
            const converter = new this._.ControlToAudioConverter();
            converter.connect(input);
            input = converter.input;
        }
        this.connections.push(input);
        return component;
    }
    setValue(value, rawObject = false) {
        value = value;
        this.validate(value);
        if ((value === null || value === void 0 ? void 0 : value.constructor) === Object && rawObject) {
            value = Object.assign({ _raw: true }, value);
        }
        for (let c of this.connections) {
            c.setValue(value);
        }
        for (const callback of this.callbacks) {
            callback(value);
        }
    }
    onUpdate(callback) {
        this.callbacks.push(callback);
    }
}
__decorate([
    resolvePromiseArgs
], ControlOutput.prototype, "setValue", null);
