// A special wrapper for a symbolic input that maps object signals to property assignments.
// let i = new ComponentInput(parent)
import { AudioRateInput } from "./AudioRateInput.js";
import { HybridInput } from "./HybridInput.js";
// i.setValue({ input1: "val1", input2: "val2" })  // sets vals on parent.
export class ComponentInput extends AudioRateInput {
    constructor(name, parent, defaultInput) {
        const audioNode = (defaultInput instanceof AudioRateInput || defaultInput instanceof HybridInput) ? defaultInput.audioSink : undefined;
        super(name, parent, audioNode);
        this.name = name;
        this.defaultInput = defaultInput;
        this.defaultInput = defaultInput;
        this._value = defaultInput === null || defaultInput === void 0 ? void 0 : defaultInput.value;
    }
    setValue(value) {
        this.validate(value);
        // JS objects represent collections of parameter names and values
        const isPlainObject = (value === null || value === void 0 ? void 0 : value.constructor) === Object;
        if (isPlainObject && !value["_raw"]) {
            // Validate each param is defined in the target.
            for (let key in value) {
                if (!(key in this.parent.inputs)) {
                    throw new Error(`Given parameter object ${JSON.stringify(value)} but destination ${this.parent} has no input named '${key}'. To pass a raw object without changing properties, set _raw: true on the object.`);
                }
            }
            for (let key in value) {
                this.parent.inputs[key].setValue(value[key]);
            }
        }
        else if (this.defaultInput == undefined) {
            throw new Error(`Component ${this.parent} unable to receive input because it has no default input configured. Either connect to one of its named inputs [${Object.keys(this.parent.inputs)}], or send a message as a plain JS object, with one or more input names as keys. Given ${JSON.stringify(value)}`);
        }
        else {
            isPlainObject && delete value["_raw"];
            this.defaultInput.setValue(value);
        }
    }
}
