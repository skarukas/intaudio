import constants from "../shared/constants.js";
import { BaseComponent } from "./base/BaseComponent.js";
// @ts-ignore No d.ts file.
import describeFunction from 'function-descriptor';
import { enumerate, isPlainObject, range } from "../shared/util.js";
// TODO: create shared base class with AudioTransformComponent.
export class FunctionComponent extends BaseComponent {
    constructor(fn) {
        super();
        this.fn = fn;
        this._orderedFunctionInputs = [];
        const descriptor = describeFunction(fn);
        const parameters = descriptor.parameters;
        let argInfos = [];
        for (let i = 0; i < parameters.length; i++) {
            const arg = parameters[i];
            if (arg.destructureType == "spread") {
                // Fill it with 10 extra args.
                const restArgs = range(10).fill({ hasDefault: true, name: undefined });
                argInfos.push(...restArgs);
                break;
            }
            else if (arg.destructureType) {
                arg.name = undefined;
            }
            argInfos.push(arg);
        }
        for (const [i, arg] of enumerate(argInfos)) {
            // Define input and its alias.
            const indexName = "$" + i;
            // @ts-ignore Improper index type.
            this[indexName] = this.defineControlInput(indexName, constants.UNSET_VALUE, !arg.hasDefault);
            if (arg.name) {
                const inputName = "$" + arg.name;
                // @ts-ignore Improper index type.
                this[inputName] = this.defineInputAlias(inputName, this[indexName]);
            }
            // @ts-ignore Improper index type.
            this._orderedFunctionInputs.push(this[indexName]);
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
        let definedArgsLength = args.length;
        for (const i of range(args.length).reverse()) {
            if (args[i] != constants.UNSET_VALUE) {
                definedArgsLength = i + 1;
                break;
            }
        }
        const result = this.fn(...args.slice(0, definedArgsLength));
        this.output.setValue(result);
    }
    __call__(...inputs) {
        return this.withInputs(...inputs);
    }
    withInputs(...inputs) {
        let inputDict = {};
        if (isPlainObject(inputs[0])) {
            inputDict = inputs[0];
        }
        else {
            if (inputs.length > this._orderedFunctionInputs.length) {
                throw new Error(`Too many inputs for the call() method on ${this}. Expected ${this._orderedFunctionInputs.length} but got ${inputs.length}.`);
            }
            for (let i = 0; i < inputs.length; i++) {
                inputDict["$" + i] = inputs[i];
            }
        }
        super.withInputs(inputDict);
        return this;
    }
}
class HasDynamicInput {
}
