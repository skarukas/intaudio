import { BaseComponent } from "./base/BaseComponent.js";
import constants from "../shared/constants.js";
// @ts-ignore No d.ts file.
import describeFunction from 'function-descriptor';
// TODO: create shared base class with AudioTransformComponent.
export class FunctionComponent extends BaseComponent {
    constructor(fn) {
        super();
        this.fn = fn;
        this._orderedFunctionInputs = [];
        const descriptor = describeFunction(fn);
        const parameters = descriptor.parameters;
        for (let i = 0; i < parameters.length; i++) {
            const arg = parameters[i];
            const inputName = "$" + arg.name;
            const indexName = "$" + i;
            const isRequired = !arg.hasDefault;
            if (arg.destructureType == "rest") {
                // Can't use it or anything after it
                break;
            }
            else if (arg.destructureType) {
                throw new Error(`Invalid function for FunctionComponent. Parameters cannot use array or object destructuring. Given: ${arg.rawName}`);
            }
            // Define input and its alias.
            // @ts-ignore Improper index type.
            this[inputName] = this.defineControlInput(inputName, constants.UNSET_VALUE, isRequired);
            // @ts-ignore Improper index type.
            this[indexName] = this.defineInputAlias(indexName, this[inputName]);
            // @ts-ignore Improper index type.
            this._orderedFunctionInputs.push(this[inputName]);
        }
        let requiredArgs = parameters.filter((a) => !a.hasDefault);
        if (requiredArgs.length == 1) {
            // @ts-ignore Improper index type.
            this.setDefaultInput(this["$" + requiredArgs[0].name]);
        }
        this.output = this.defineControlOutput('output');
        this.preventIOOverwrites();
    }
    inputDidUpdate(input, newValue) {
        const args = this._orderedFunctionInputs.map(eachInput => eachInput.value);
        const result = this.fn(...args);
        this.output.setValue(result);
    }
    __call__(...inputs) {
        return this.withInputs(...inputs);
    }
    withInputs(...inputs) {
        var _a;
        let inputDict = {};
        if ((_a = inputs[0]) === null || _a === void 0 ? void 0 : _a.connect) { // instanceof Connectable
            if (inputs.length > this._orderedFunctionInputs.length) {
                throw new Error(`Too many inputs for the call() method on ${this}. Expected ${this._orderedFunctionInputs.length} but got ${inputs.length}.`);
            }
            for (let i = 0; i < inputs.length; i++) {
                inputDict["$" + i] = inputs[i];
            }
        }
        else {
            inputDict = inputs[0];
        }
        super.withInputs(inputDict);
        return this;
    }
}
class HasDynamicInput {
}
