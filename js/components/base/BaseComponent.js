import { ComponentInput } from "../../io/input/ComponentInput.js";
import { BaseConnectable } from "../../shared/base/BaseConnectable.js";
import constants from "../../shared/constants.js";
import { AudioRateOutput } from "../../io/output/AudioRateOutput.js";
export class BaseComponent extends BaseConnectable {
    constructor() {
        super();
        this.isComponent = true;
        this.outputs = {};
        this.inputs = {};
        // Reserved default inputs.
        this.isBypassed = this.defineControlInput('isBypassed', false);
        this.isMuted = this.defineControlInput('isMuted', false);
        this.triggerInput = this.defineControlInput('triggerInput');
        // Special inputs that are not automatically set as default I/O.
        this._reservedInputs = [this.isBypassed, this.isMuted, this.triggerInput];
        this._reservedOutputs = [];
        this.preventIOOverwrites();
    }
    toString() {
        function _getNames(obj, except) {
            let entries = Object.keys(obj).filter(i => !except.includes(obj[i]));
            if (entries.length == 1) {
                return `${entries.join(", ")}`;
            }
            return `(${entries.join(", ")})`;
        }
        let inp = _getNames(this.inputs, this._reservedInputs);
        let out = _getNames(this.outputs, this._reservedOutputs);
        return `${this._className}(${inp} => ${out})`;
    }
    now() {
        return this.audioContext.currentTime;
    }
    validateIsSingleton() {
        const Class = this.constructor;
        if (Class.instanceExists) {
            throw new Error(`Only one instance of ${this.constructor} can exist.`);
        }
        Class.instanceExists = true;
    }
    preventIOOverwrites() {
        Object.keys(this.inputs).map(this.freezeProperty.bind(this));
        Object.keys(this.outputs).map(this.freezeProperty.bind(this));
    }
    freezeProperty(propName) {
        Object.defineProperty(this, propName, {
            writable: false,
            configurable: false
        });
    }
    defineInputOrOutput(propName, inputOrOutput, inputsOrOutputsArray) {
        inputsOrOutputsArray[propName] = inputOrOutput;
        return inputOrOutput;
    }
    defineOutputAlias(name, output) {
        return this.defineInputOrOutput(name, output, this.outputs);
    }
    defineInputAlias(name, input) {
        return this.defineInputOrOutput(name, input, this.inputs);
    }
    defineControlInput(name, defaultValue = constants.UNSET_VALUE, isRequired = false) {
        let input = new this._.ControlInput(name, this, defaultValue, isRequired);
        return this.defineInputOrOutput(name, input, this.inputs);
    }
    defineAudioInput(name, destinationNode) {
        let input = new this._.AudioRateInput(name, this, destinationNode);
        return this.defineInputOrOutput(name, input, this.inputs);
    }
    defineHybridInput(name, destinationNode, defaultValue = constants.UNSET_VALUE, isRequired = false) {
        let input = new this._.HybridInput(name, this, destinationNode, defaultValue, isRequired);
        return this.defineInputOrOutput(name, input, this.inputs);
    }
    defineControlOutput(name) {
        let output = new this._.ControlOutput(name);
        return this.defineInputOrOutput(name, output, this.outputs);
    }
    defineAudioOutput(name, audioNode) {
        let output = new this._.AudioRateOutput(name, audioNode);
        return this.defineInputOrOutput(name, output, this.outputs);
    }
    defineHybridOutput(name, audioNode) {
        let output = new this._.HybridOutput(name, audioNode);
        return this.defineInputOrOutput(name, output, this.outputs);
    }
    setDefaultInput(input) {
        this._defaultInput = input;
    }
    setDefaultOutput(output) {
        this._defaultOutput = output;
    }
    getDefaultInput() {
        const name = 'default';
        if (this._defaultInput) {
            return new this._.ComponentInput(name, this, this._defaultInput);
        }
        // Skip reserved inputs, e.g. isMuted / isBypassed
        const ownInputs = Object.values(this.inputs).filter(i => !this._reservedInputs.includes(i));
        if (ownInputs.length == 1) {
            return new this._.ComponentInput(name, this, ownInputs[0]);
        }
        return new this._.ComponentInput(name, this);
    }
    getDefaultOutput() {
        if (this._defaultOutput) {
            return this._defaultOutput;
        }
        // Skip reserved outputs
        const ownOutputs = Object.values(this.outputs).filter(i => !this._reservedOutputs.includes(i));
        if (ownOutputs.length == 1) {
            return ownOutputs[0];
        }
    }
    allInputsAreDefined() {
        let violations = [];
        for (let inputName in this.inputs) {
            let input = this.inputs[inputName];
            if (input.isRequired && input.value == constants.UNSET_VALUE) {
                violations.push(inputName);
            }
        }
        return !violations.length;
        /* if (violations.length) {
          throw new Error(`Unable to run ${this}. The following inputs are marked as required but do not have inputs set: [${violations}]`)
        } */
    }
    propagateUpdatedInput(inputStream, newValue) {
        if (inputStream == this.isBypassed) {
            this.onBypassEvent(newValue);
        }
        else if (inputStream == this.isMuted) {
            this.onMuteEvent(newValue);
        }
        if (inputStream == this.triggerInput) {
            // Always execute function, even if it's unsafe.
            this.inputDidUpdate(undefined, undefined);
        }
        else if (this.allInputsAreDefined()) {
            this.inputDidUpdate(inputStream, newValue);
        }
        else {
            console.warn("Not passing event because not all required inputs are defined.");
        }
    }
    // Abstract methods.
    outputAdded(output) { }
    inputAdded(output) { }
    onBypassEvent(event) { }
    onMuteEvent(event) { }
    inputDidUpdate(input, newValue) { }
    processEvent(event) {
        // Method describing how an incoming event is mutated before passing to the
        // component outputs.
        return event;
    }
    setBypassed(isBypassed = true) {
        this.isBypassed.setValue(isBypassed);
    }
    setMuted(isMuted = true) {
        this.isMuted.setValue(isMuted);
    }
    connect(destination) {
        let { component, input } = this.getDestinationInfo(destination);
        if (!input || (input instanceof ComponentInput && !input.defaultInput)) {
            throw new Error(`No default input found for ${component}, so unable to connect to it from ${this}. Found named inputs: [${Object.keys(component.inputs)}]`);
        }
        component && this.outputAdded(input);
        const output = this.getDefaultOutput();
        if (!output) {
            throw new Error(`No default output found for ${this}, so unable to connect to destination: ${component}. Found named outputs: [${Object.keys(this.outputs)}]`);
        }
        output.connect(input);
        return component;
    }
    withInputs(argDict) {
        var _a, _b;
        for (const name in argDict) {
            const thisInput = (_b = (_a = this.inputs[name]) !== null && _a !== void 0 ? _a : this.inputs["" + name]) !== null && _b !== void 0 ? _b : this.inputs["$" + name];
            if (!thisInput)
                continue;
            const argValue = argDict[name];
            if (argValue instanceof Object && 'connect' in argValue) {
                argValue.connect(thisInput);
            }
            else {
                thisInput.setValue(argValue);
            }
        }
        return this;
    }
    setValues(valueObj) {
        return this.getDefaultInput().setValue(valueObj);
    }
    wasConnectedTo(other) {
        this.inputAdded(other);
        return other;
    }
    getAudioOutputProperty(propName) {
        const output = this.getDefaultOutput();
        if (output instanceof AudioRateOutput) {
            const prop = output[propName];
            return prop instanceof Function ? prop.bind(output) : prop;
        }
        else {
            throw new Error(`Cannot get property '${propName}'. No default audio-rate output found for ${this}. Select an audio-rate output and use 'output.${propName}' instead.`);
        }
    }
    get numInputChannels() {
        return this.getDefaultInput().numInputChannels;
    }
    get numOutputChannels() {
        return this.getAudioOutputProperty('numOutputChannels');
    }
    sampleSignal(samplePeriodMs) {
        return this.getAudioOutputProperty('sampleSignal')(samplePeriodMs);
    }
    splitChannels(...inputChannelGroups) {
        return this.getAudioOutputProperty('splitChannels')(...inputChannelGroups);
    }
    transformAudio(fn, dimension = "none", { windowSize, useWorklet } = {}) {
        return this.getAudioOutputProperty('transformAudio')(fn, dimension, { windowSize, useWorklet });
    }
}
BaseComponent.instanceExists = false;
