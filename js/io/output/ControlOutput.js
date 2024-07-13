import { AudioRateInput } from "../input/AudioRateInput.js";
import { ComponentInput } from "../input/ComponentInput.js";
import { AbstractOutput } from "./AbstractOutput.js";
export class ControlOutput extends AbstractOutput {
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
