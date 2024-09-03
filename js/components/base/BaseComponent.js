import { BaseConnectable } from "../../shared/base/BaseConnectable.js";
import constants from "../../shared/constants.js";
import { AudioRateOutput } from "../../io/output/AudioRateOutput.js";
import { HybridOutput } from "../../io/output/HybridOutput.js";
import { arrayToObject, enumerate, isFunction, zip } from "../../shared/util.js";
const SPEC_MATCH_REST_SYMBOL = "*";
const SPEC_SPLIT_SYMBOL = ",";
export class BaseComponent extends BaseConnectable {
    constructor() {
        super();
        this.isComponent = true;
        this.inputs = {};
        this.outputs = {};
        // Reserved default inputs.
        this.isBypassed = this.defineControlInput('isBypassed', false);
        this.isMuted = this.defineControlInput('isMuted', false);
        this.triggerInput = this.defineControlInput('triggerInput');
        // Special inputs that are not automatically set as default I/O.
        this._reservedInputs = [this.isBypassed, this.isMuted, this.triggerInput];
        this._reservedOutputs = [];
        this.preventIOOverwrites();
        // Register component.
        this.config.state.components[this._uuid] = this;
    }
    logSignal({ samplePeriodMs = 1000, format } = {}) {
        this.getAudioOutputProperty('logSignal')({
            samplePeriodMs,
            format
        });
        return this;
    }
    capture(numSamples) {
        return this.getAudioOutputProperty('capture')(numSamples);
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
    defineInputOrOutput(propName, inputOrOutput, inputsOrOutputsObject) {
        inputsOrOutputsObject[propName] = inputOrOutput;
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
    defineCompoundInput(name, inputs, defaultInput) {
        let input = new this._.CompoundInput(name, this, inputs, defaultInput);
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
    defineCompoundOutput(name, outputs, defaultOutput) {
        let output = new this._.CompoundOutput(name, outputs, this, defaultOutput);
        return this.defineInputOrOutput(name, output, this.outputs);
    }
    defineControlOutput(name) {
        let output = new this._.ControlOutput(name, this);
        return this.defineInputOrOutput(name, output, this.outputs);
    }
    defineAudioOutput(name, audioNode) {
        let output = new this._.AudioRateOutput(name, audioNode, this);
        return this.defineInputOrOutput(name, output, this.outputs);
    }
    defineHybridOutput(name, audioNode) {
        let output = new this._.HybridOutput(name, audioNode, this);
        return this.defineInputOrOutput(name, output, this.outputs);
    }
    setDefaultInput(input) {
        this._defaultInput = input;
    }
    setDefaultOutput(output) {
        this._defaultOutput = output;
    }
    // TODO: replace with getter.
    getDefaultInput() {
        const name = '[[default]]';
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
    get defaultOutput() {
        if (this._defaultOutput) {
            return this._defaultOutput;
        }
        // Skip reserved outputs
        const ownOutputs = Object.values(this.outputs).filter(i => !this._reservedOutputs.includes(i));
        if (ownOutputs.length == 1) {
            return ownOutputs[0];
        }
    }
    get defaultInput() {
        return this.getDefaultInput();
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
            // TODO: should this really pass undefined here? Or call for EVERY input?
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
    outputAdded(destintion) { }
    inputAdded(source) { }
    onBypassEvent(event) { }
    onMuteEvent(event) { }
    inputDidUpdate(input, newValue) { }
    setBypassed(isBypassed = true) {
        this.isBypassed.setValue(isBypassed);
    }
    setMuted(isMuted = true) {
        this.isMuted.setValue(isMuted);
    }
    connect(destination) {
        let { component, input } = this.getDestinationInfo(destination);
        // || (input instanceof ComponentInput && !input.defaultInput) causes dict 
        // outputs to not work
        if (!input) {
            const inputs = component == undefined ? [] : Object.keys(component.inputs);
            throw new Error(`No default input found for ${component}, so unable to connect to it from ${this}. Found named inputs: [${inputs}]`);
        }
        component && this.outputAdded(input);
        const output = this.defaultOutput;
        if (!output) {
            throw new Error(`No default output found for ${this}, so unable to connect to destination: ${component}. Found named outputs: [${Object.keys(this.outputs)}]`);
        }
        output.connect(input);
        return component;
    }
    disconnect(destination) {
        for (const output of Object.values(this.outputs)) {
            output.disconnect(destination);
        }
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
    getInputsBySpecs(inputSpecs) {
        return this.getBySpecs(inputSpecs, this.inputs);
    }
    getChannelsBySpecs(channelSpecs) {
        const output = this.defaultOutput;
        if (!(output instanceof AudioRateOutput || output instanceof HybridOutput)) {
            throw new Error("No default audio-rate output found. Select a specific output to use this operation.");
        }
        // Convert to stringified numbers.
        const numberedSpecs = channelSpecs.map(spec => {
            const toNumber = (c) => {
                const noSpace = String(c).replace(/s/g, "");
                if (noSpace == "left")
                    return "0";
                if (noSpace == "right")
                    return "1";
                return String(c);
            };
            return spec instanceof Array ? spec.map(toNumber) : toNumber(spec);
        });
        const channelObj = arrayToObject(output.channels);
        return this.getBySpecs(numberedSpecs, channelObj);
    }
    getOutputsBySpecs(outputSpecs) {
        return this.getBySpecs(outputSpecs, this.outputs);
    }
    /**
     * Given an array of strings specifying which inputs/outputs to select, return an array of the same length where each entry contains the inputs/outputs matched by that spec.
     *
     * Each spec is one of:
     * 1. A string representing a specific input or output name. Example: `"in1"`.
     * 2. An array of input or output names. Example: `["in1", "in2"]`.
     * 3. A stringified version of (2). Example: `"in1, in2"`.
     * 4. The string `"*"` which means to match any unspecified. This may only appear once.
     *
     * NOTE: Any spaces will be removed, so `"in1,in2"`, `" in1 , in2 "`, and `"in1, in2"` are equivalent.
     */
    getBySpecs(specs, obj) {
        // Remove spaces.
        specs = specs.map(spec => {
            const removeSpaces = (s) => String(s).replace(/s/g, "");
            return spec instanceof Array ? spec.map(removeSpaces) : removeSpaces(spec);
        });
        const matchedObjects = specs.map(() => []);
        const matchedKeys = new Set();
        const starIndices = []; // Indices i in the list where specs[i] = "*"
        for (let [i, spec] of enumerate(specs)) {
            if (spec == SPEC_MATCH_REST_SYMBOL) {
                starIndices.push(i);
                continue;
            }
            else if (!(spec instanceof Array)) {
                spec = spec.split(SPEC_SPLIT_SYMBOL);
            }
            spec.forEach(key => {
                if (matchedKeys.has(key)) {
                    throw new Error(`Invalid spec. At most one instance of each key may be specified, but '${key}' was mentioned multiple times. Given: ${JSON.stringify(specs)}`);
                }
                matchedKeys.add(key);
            });
            matchedObjects[i] = spec.map(key => obj[key]);
        }
        if (starIndices.length > 1) {
            throw new Error(`Invalid spec. At most one key may be '*'. Given: ${JSON.stringify(specs)}`);
        }
        else if (starIndices.length == 1) {
            // Get any unmatched inputs/outputs.
            matchedObjects[starIndices[0]] = Object.keys(obj)
                .filter(key => !matchedKeys.has(key))
                .map(key => obj[key]);
        }
        return matchedObjects;
    }
    perOutput(functions) {
        if (functions instanceof Array)
            functions = arrayToObject(functions);
        const result = {};
        const keys = Object.keys(functions);
        const outputGroups = this.getOutputsBySpecs(keys);
        for (const [key, outputGroup] of zip(keys, outputGroups)) {
            if (isFunction(functions[key])) {
                // TODO: support these specs.
                if (key.includes(SPEC_SPLIT_SYMBOL)
                    || key.includes(SPEC_MATCH_REST_SYMBOL)) {
                    throw new Error("Array and rest specs not currently supported.");
                }
                const res = functions[key](outputGroup[0]);
                res && (result[key] = res);
            }
            // Otherwise, leave it out. TODO: Throw error if not explicitly null
            // or undefined?
        }
        return new this._.BundleComponent(result);
    }
    perChannel(functions) {
        var _a;
        if (functions instanceof Array)
            functions = arrayToObject(functions);
        const keys = Object.keys(functions);
        const outputGroups = this.getChannelsBySpecs(keys);
        const result = Array(outputGroups.length).fill(undefined);
        const toNum = (c) => {
            const noSpace = String(c).replace(/s/g, "");
            if (noSpace == "left")
                return 0;
            if (noSpace == "right")
                return 1;
            return c;
        };
        for (const [key, outputGroup] of zip(keys, outputGroups)) {
            if (isFunction(functions[key])) {
                // TODO: support these specs.
                if (key.includes(SPEC_SPLIT_SYMBOL)
                    || key.includes(SPEC_MATCH_REST_SYMBOL)) {
                    throw new Error("Array and rest specs not currently supported.");
                }
                const res = functions[key](outputGroup[0]);
                // NOTE: res.defaultOutput?.left is used because sometimes the output 
                // from the function may be multichannel.
                // TODO: reconsider.
                res && (result[toNum(key)] = (_a = res.defaultOutput) === null || _a === void 0 ? void 0 : _a.left);
            }
            // Otherwise, leave it out. TODO: Throw error if not explicitly null
            // or undefined?
        }
        return this._.ChannelStacker.fromInputs(result);
    }
    // Delegate the property to the default audio output (if any).
    getAudioOutputProperty(propName) {
        const output = this.defaultOutput;
        if (output instanceof AudioRateOutput) {
            const prop = output[propName];
            return isFunction(prop) ? prop.bind(output) : prop;
        }
        else {
            throw new Error(`Cannot get property '${propName}'. No default audio-rate output found for ${this}. Select an audio-rate output and use 'output.${propName}' instead.`);
        }
    }
    /** Methods delegated to default audio input / output. **/
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
    // TODO: these should work as both inputs and outputs.
    get left() {
        return this.getAudioOutputProperty('left');
    }
    get right() {
        return this.getAudioOutputProperty('right');
    }
    get channels() {
        return this.getAudioOutputProperty('channels');
    }
    transformAudio(fn, { windowSize, useWorklet, dimension = "none" } = {}) {
        return this.getAudioOutputProperty('transformAudio')(fn, { dimension, windowSize, useWorklet });
    }
    fft(fftSize = 128) {
        return this.getAudioOutputProperty('fft')(fftSize);
    }
    toChannels(numChannels, mode = 'speakers') {
        return this.getAudioOutputProperty('toChannels')(numChannels, mode);
    }
}
BaseComponent.instanceExists = false;
