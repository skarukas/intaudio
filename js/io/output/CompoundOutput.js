import { CompoundInput } from "../input/CompoundInput.js";
import { AbstractOutput } from "./AbstractOutput.js";
import { AudioRateOutput } from "./AudioRateOutput.js";
export class CompoundOutput extends AbstractOutput {
    connect(destination) {
        let { component, input } = this.getDestinationInfo(destination);
        if (input instanceof CompoundInput) {
            // First priority: try to connect all to same-named inputs.
            // TODO: could this requirement be configured to allow connection either:
            // - When inputs are a superset
            // - When any input matches
            // TODO: might be good to check the types are compatible as well.
            const inputIsSuperset = [...this.keys].every(v => input.keys.has(v));
            if (inputIsSuperset) {
                for (const key of this.keys) {
                    this.outputs[key].connect(input.inputs[key]);
                }
            }
        }
        else if (this.defaultOutput) {
            // Second priority: connect only default.
            // TODO: implement logic in each "sub-output" connect handler.
            this.defaultOutput.connect(input);
        }
        return component;
    }
    get keys() {
        return new Set(Object.keys(this.outputs));
    }
    get left() {
        return this.channels[0];
    }
    get right() {
        var _a;
        return (_a = this.channels[1]) !== null && _a !== void 0 ? _a : this.left;
    }
    constructor(name, outputs, parent, defaultOutput) {
        super(name, parent);
        this.name = name;
        this.parent = parent;
        this.defaultOutput = defaultOutput;
        this.activeChannel = undefined;
        this.outputs = {};
        // Define 'this.outputs' and 'this' interface for underlying inputs.
        Object.keys(outputs).map(name => {
            const output = outputs[name];
            if (Object.prototype.hasOwnProperty(name)) {
                console.warn(`Cannot create top-level CompoundOutput property '${name}' because it is reserved. Use 'outputs.${name}' instead.`);
            }
            for (const obj of [this, this.outputs]) {
                Object.defineProperty(obj, name, {
                    get() {
                        return (this.activeChannel != undefined && output instanceof AudioRateOutput) ? output.channels[this.activeChannel] : output;
                    },
                    enumerable: true
                });
            }
        });
    }
    mapOverOutputs(fn) {
        const res = {};
        for (const outputName of this.keys) {
            res[outputName] = fn(this.outputs[outputName], outputName);
        }
        return res;
    }
    get numOutputChannels() {
        const ic = this.mapOverOutputs(i => i.numOutputChannels);
        return Math.max(...Object.values(ic));
    }
}
