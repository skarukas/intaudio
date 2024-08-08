import { AbstractInput } from "./AbstractInput.js";
import { AudioRateInput } from "./AudioRateInput.js";
export class CompoundInput extends AbstractInput {
    get left() {
        return this.channels[0];
    }
    get right() {
        var _a;
        return (_a = this.channels[1]) !== null && _a !== void 0 ? _a : this.left;
    }
    get keys() {
        return new Set(Object.keys(this.inputs));
    }
    constructor(name, parent, inputs, defaultInput) {
        super(name, parent, false);
        this.name = name;
        this.parent = parent;
        this.defaultInput = defaultInput;
        this.activeChannel = undefined;
        this.inputs = {};
        // Define 'this.inputs' and 'this' interface for underlying inputs.
        Object.keys(inputs).map(name => {
            const input = inputs[name];
            if (Object.prototype.hasOwnProperty(name)) {
                console.warn(`Cannot create top-level CompoundInput property '${name}' because it is reserved. Use 'inputs.${name}' instead.`);
            }
            for (const obj of [this, this.inputs]) {
                Object.defineProperty(obj, name, {
                    get() {
                        return (this.activeChannel != undefined && input instanceof AudioRateInput) ? input.channels[this.activeChannel] : input;
                    },
                    enumerable: true
                });
            }
        });
    }
    mapOverInputs(fn) {
        const res = {};
        for (const inputName of this.keys) {
            res[inputName] = fn(this.inputs[inputName], inputName);
        }
        return res;
    }
    get numInputChannels() {
        const ic = this.mapOverInputs(i => i.numInputChannels);
        return Math.max(...Object.values(ic));
    }
    get value() {
        return this.mapOverInputs(input => input.value);
    }
    setValue(valueDict) {
        this.mapOverInputs((input, name) => input.setValue(valueDict[name]));
    }
}
