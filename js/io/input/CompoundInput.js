import { createMultiChannelView } from "../../shared/multichannel.js";
import { isPlainObject } from "../../shared/util.js";
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
    get defaultInput() {
        return this._defaultInput;
    }
    constructor(name, parent, inputs, defaultInput) {
        super(name, parent, false);
        this.name = name;
        this.parent = parent;
        this.activeChannel = undefined;
        this.inputs = {};
        let hasMultichannelInput = false;
        // Define 'this.inputs' and 'this' interface for underlying inputs.
        Object.keys(inputs).map(name => {
            const input = inputs[name];
            hasMultichannelInput || (hasMultichannelInput = input instanceof AudioRateInput && input.port instanceof AudioNode);
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
        this.channels = createMultiChannelView(this, hasMultichannelInput);
        this._defaultInput = defaultInput;
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
    setValue(value) {
        if (isPlainObject(value) && Object.keys(value).every(k => this.keys.has(k))) {
            // If each key is a valid value, assign it as such.
            this.mapOverInputs((input, name) => input.setValue(value[name]));
        }
        else if (this.defaultInput) {
            // Assume it's an input for the default input.
            this.defaultInput.setValue(value);
        }
        else {
            throw new Error(`The given compound input (${this}) has no default input, so setValue expected a plain JS object with keys equal to a subset of ${[...this.keys]}. Given: ${value} (${JSON.stringify(value)}). Did you intend to call setValue of one of its named inputs (.inputs[inputName])instead?`);
        }
    }
}
