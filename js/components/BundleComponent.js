import { BaseComponent } from "./base/BaseComponent.js";
import { FunctionComponent } from "./FunctionComponent.js";
/**
 * Represents a group of components that can be operated on independently.
 */
export class BundleComponent extends BaseComponent {
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
            // @ts-ignore No index signature.
            // TODO: export intersection with index signature type.
            this[key] = this.componentObject[key];
            this.defineInputAlias(key, this.componentObject[key].getDefaultInput());
            if (this.componentObject[key].defaultOutput) {
                this.defineOutputAlias(key, this.componentObject[key].defaultOutput);
            }
        }
    }
    [Symbol.iterator]() {
        return this.componentValues[Symbol.iterator]();
    }
    getDefaultInput() {
        throw new Error("Method not implemented.");
    }
    get defaultOutput() {
        throw new Error("Method not implemented.");
    }
    setBypassed(isBypassed) {
        this.getBundledResult('setBypassed', isBypassed);
    }
    setMuted(isMuted) {
        this.getBundledResult('setMuted', isMuted);
    }
    getBundledResult(fnName, ...inputs) {
        const returnValues = {};
        for (const key in this.componentObject) {
            returnValues[key] = this.componentObject[key][fnName](...inputs);
        }
        return new BundleComponent(returnValues);
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
        const bundledResult = this.getBundledResult('connect', destination);
        // All entries will be the same, so just return the first.
        return Object.values(bundledResult)[0];
    }
    withInputs(inputDict) {
        this.getBundledResult('withInputs', inputDict);
        return this;
    }
    setValues(valueObj) {
        return this.getBundledResult('setValues', valueObj);
    }
    wasConnectedTo(source) {
        this.getBundledResult('wasConnectedTo', source);
        return source;
    }
    // TODO: doesn't work.
    sampleSignal(samplePeriodMs) {
        return this.getBundledResult('sampleSignal', samplePeriodMs);
    }
    propagateUpdatedInput(input, newValue) {
        return this.getBundledResult('propagateUpdatedInput', input, newValue);
    }
}
