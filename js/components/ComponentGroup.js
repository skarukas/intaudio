import { BaseComponent } from "./base/BaseComponent.js";
/**
 * Represents a group of components that can be operated on independently.
 */
export class ComponentGroup extends BaseComponent {
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
        let index = 0;
        const items = this.componentValues;
        return {
            next() {
                if (index < items.length) {
                    return { value: items[index++], done: false };
                }
                else {
                    return { value: undefined, done: true };
                }
            },
        };
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
        return new ComponentGroup(returnValues);
    }
    connect(destination) {
        /* TODO: this actually needs to be different. Function components should
          separate them here. Example:
        
          ia.group({
            v1: ia.oscillator(12).multiply(0.2),
            v2: ia.oscillator(440).multiply(0.1)
          }).connect((v1, v2) => Math.max(v1, v2))
            .connect(ia.out)
    
          Maybe have a protected method ungroupOutputs() or something that each
          component implements, splitting each element into its
         */
        return this.getGroupedResult('connect', destination);
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
