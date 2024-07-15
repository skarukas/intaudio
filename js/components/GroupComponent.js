import { BaseComponent } from "./base/BaseComponent.js";
import { FunctionComponent } from "./FunctionComponent.js";
/**
 * Represents a group of components that can be operated on independently.
 */
export class GroupComponent extends BaseComponent {
    constructor(components) {
        super();
        if (components instanceof Array) {
            this.componentValues = components;
            this.componentObject = {};
            for (let i = 0; i < components.length; i++) {
                this.componentObject[i] = components[i];
            }
        }
        else {
            this.componentValues = Object.values(components);
            this.componentObject = components;
        }
        for (const key in this.componentObject) {
            this[key] = this.componentObject[key];
            this.defineInputAlias(key, this.componentObject[key].getDefaultInput());
            this.defineOutputAlias(key, this.componentObject[key].getDefaultOutput());
        }
    }
    [Symbol.iterator]() {
        return this.componentValues[Symbol.iterator]();
    }
    getDefaultInput() {
        throw new Error("Method not implemented.");
    }
    getDefaultOutput() {
        throw new Error("Method not implemented.");
    }
    setBypassed(isBypassed) {
        this.getGroupedResult('setBypassed', isBypassed);
    }
    setMuted(isMuted) {
        this.getGroupedResult('setMuted', isMuted);
    }
    getGroupedResult(fnName, ...inputs) {
        const returnValues = {};
        for (const key in this.componentObject) {
            returnValues[key] = this.componentObject[key][fnName](...inputs);
        }
        return new GroupComponent(returnValues);
    }
    connect(destination) {
        let { component } = this.getDestinationInfo(destination);
        if (component instanceof FunctionComponent) {
            try {
                return component.withInputs(this.componentObject);
            }
            catch (_a) {
                // Try with ordered inputs if named inputs don't match.
                return component.withInputs(this.componentValues);
            }
        }
        const groupedResult = this.getGroupedResult('connect', destination);
        // All entries will be the same, so just return the first.
        return Object.values(groupedResult)[0];
    }
    withInputs(inputDict) {
        this.getGroupedResult('withInputs', inputDict);
        return this;
    }
    setValues(valueObj) {
        return this.getGroupedResult('setValues', valueObj);
    }
    wasConnectedTo(other) {
        this.getGroupedResult('wasConnectedTo', other);
    }
    sampleSignal(samplePeriodMs) {
        return this.getGroupedResult('sampleSignal', samplePeriodMs);
    }
    propagateUpdatedInput(input, newValue) {
        return this.getGroupedResult('propagateUpdatedInput', input, newValue);
    }
}
