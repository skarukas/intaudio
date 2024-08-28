import { enumerate, isType } from "../shared/util.js";
import { map } from "../worklet/lib/utils.js";
import { AudioTransformComponent } from "./AudioTransformComponent.js";
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
        for (const [i, key] of enumerate(Object.keys(this.componentObject))) {
            // @ts-ignore No index signature.
            // TODO: export intersection with index signature type.
            this[key] = this.componentObject[key];
            this.defineInputAlias(key, this.componentObject[key].getDefaultInput());
            if (i + '' != key) {
                // @ts-ignore No index signature.
                this[i] = this.componentObject[key];
                this.defineInputAlias(i, this.componentObject[key].getDefaultInput());
            }
            if (this.componentObject[key].defaultOutput) {
                this.defineOutputAlias(key, this.componentObject[key].defaultOutput);
            }
        }
        this.input = this.defineCompoundInput('input', map(this.componentObject, c => c.defaultInput));
        this.setDefaultInput(this.input);
        this.output = this.defineCompoundOutput('output', map(this.componentObject, c => c.defaultOutput));
        this.setDefaultOutput(this.output);
        this.length = this.componentValues.length;
    }
    get isControlStream() {
        return this.componentValues.every(c => c.isControlStream);
    }
    get isAudioStream() {
        return this.componentValues.every(c => c.isAudioStream);
    }
    get isStftStream() {
        return this.componentValues.every(c => c.isStftStream);
    }
    [Symbol.iterator]() {
        return this.componentValues[Symbol.iterator]();
    }
    getDefaultInput() {
        throw new Error("Method not implemented.");
    }
    get defaultOutput() {
        return undefined;
    }
    get numOutputChannels() {
        return Math.max(...this.componentValues.map(c => c.numOutputChannels)) || 0;
    }
    get numInputChannels() {
        return Math.max(...this.componentValues.map(c => c.numInputChannels)) || 0;
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
        if (isType(component, FunctionComponent)
            || isType(component, AudioTransformComponent)) {
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
