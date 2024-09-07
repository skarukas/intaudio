// A special wrapper for a symbolic input that maps object signals to property assignments.
// let i = new ComponentInput(parent)
import { AudioRateInput } from "./AudioRateInput.js";
// TODO: replace this whole class with compound input. This may require 
// refactoring of some code that relies on this class being a AudioRateInput 
// and having an audioNode.
// i.setValue({ input1: "val1", input2: "val2" })  // sets vals on parent.
export class ComponentInput extends AudioRateInput {
    get defaultInput() {
        return this._defaultInput;
    }
    constructor(name, parent, defaultInput) {
        const port = defaultInput instanceof AudioRateInput ? defaultInput.port : undefined;
        super(name, parent, port); // TODO: fix this issue...
        this.name = name;
        this._defaultInput = defaultInput;
        /* this._value = defaultInput?.value */
    }
    setValue(value) {
        var _a, _b, _c, _d;
        this.validate(value);
        // JS objects represent collections of parameter names and values
        const isPlainObject = (value === null || value === void 0 ? void 0 : value.constructor) === Object;
        if (isPlainObject && !value["_raw"]) {
            // Validate each param is defined in the target.
            for (const key in value) {
                // TODO: refactor "$" + key to a shared method.
                if (!(this.parent && (key in this.parent.inputs || "$" + key in this.parent.inputs))) {
                    throw new Error(`Given parameter object ${JSON.stringify(value)} but destination ${this.parent} has no input named '${key}' or '$${key}'. To pass a raw object without changing properties, set _raw: true on the object.`);
                }
            }
            for (const key in value) {
                (_d = ((_b = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.inputs[key]) !== null && _b !== void 0 ? _b : (_c = this.parent) === null || _c === void 0 ? void 0 : _c.inputs["$" + key])) === null || _d === void 0 ? void 0 : _d.setValue(value[key]);
            }
        }
        else if (this.defaultInput == undefined) {
            const inputs = this.parent == undefined ? [] : Object.keys(this.parent.inputs);
            throw new Error(`Component ${this.parent} unable to receive input because it has no default input configured. Either connect to one of its named inputs [${inputs}], or send a message as a plain JS object, with one or more input names as keys. Given ${JSON.stringify(value)}`);
        }
        else {
            isPlainObject && delete value["_raw"];
            this.defaultInput.setValue(value);
        }
    }
}
