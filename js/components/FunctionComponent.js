var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _FunctionComponent_instances, _FunctionComponent_parallelApplyAcrossChannels;
import { BaseComponent } from "./base/BaseComponent.js";
import constants from "../shared/constants.js";
import { createConstantSource } from "../shared/util.js";
import describeFunction from 'function-descriptor';
export class FunctionComponent extends BaseComponent {
    constructor(fn) {
        super();
        _FunctionComponent_instances.add(this);
        this.fn = fn;
        this._orderedFunctionInputs = [];
        const descriptor = describeFunction(fn);
        const parameters = descriptor.parameters;
        // TODO: This assumes each input is mono. This should not be a requirement.
        let numChannelsPerInput = 1; // TODO: Have a way of getting this info
        this._audioProcessor = this._createScriptProcessor(descriptor.maxArgs, numChannelsPerInput);
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
            //
            const passThroughInput = createConstantSource(this.audioContext);
            // Define input and its alias.
            this[inputName] = this.defineHybridInput(inputName, passThroughInput.offset, constants.UNSET_VALUE, isRequired);
            this[indexName] = this.defineInputAlias(indexName, this[inputName]);
            for (let c = 0; c < numChannelsPerInput; c++) {
                const fromChannel = c;
                const toChannel = numChannelsPerInput * i + c;
                passThroughInput.connect(this.channelMerger, fromChannel, toChannel);
            }
            //
            // this[inputName] = this._defineHybridInput(inputName, this._audioProcessor, _UNSET_VALUE, isRequired)
            this._orderedFunctionInputs.push(this[inputName]);
        }
        let requiredArgs = parameters.filter(a => !a.hasDefault);
        if (requiredArgs.length == 1) {
            this.setDefaultInput(this["$" + requiredArgs[0].name]);
        }
        // TODO: Change to splitter + merger to make the output size correct.
        const out = createConstantSource(this.audioContext);
        this._audioProcessor.connect(out.offset);
        this.output = this.defineHybridOutput('output', out);
        this.preventIOOverwrites();
    }
    _createScriptProcessor(numInputs, numChannelsPerInput) {
        const bufferSize = undefined; // 256
        let numInputChannels = (numChannelsPerInput * numInputs) || 1;
        // TODO: I don't think the handling of channels is correct here because the 
        // output still has N channels.
        this.channelMerger = this.audioContext.createChannelMerger(numInputChannels);
        let processor = this.audioContext.createScriptProcessor(bufferSize, numInputChannels, numChannelsPerInput);
        this.channelMerger.connect(processor);
        function _getTrueChannels(buffer) {
            // Returns an array of length numChannelsPerInput, and the i'th entry
            // contains the i'th channel for each input.
            let inputsGroupedByChannel = [];
            for (let c = 0; c < numChannelsPerInput; c++) {
                let channelData = [];
                for (let i = 0; i < numInputs; i++) {
                    channelData.push(buffer.getChannelData(c * numChannelsPerInput + i));
                }
                inputsGroupedByChannel.push(channelData);
            }
            return inputsGroupedByChannel;
        }
        const handler = e => {
            // Apply the function for each sample in each channel.
            const inputChannels = _getTrueChannels(e.inputBuffer);
            let outputChannels = [];
            for (let c = 0; c < numChannelsPerInput; c++) {
                outputChannels.push(e.outputBuffer.getChannelData(c));
            }
            try {
                __classPrivateFieldGet(this, _FunctionComponent_instances, "m", _FunctionComponent_parallelApplyAcrossChannels).call(this, inputChannels, outputChannels);
            }
            catch (e) {
                processor.removeEventListener('audioprocess', handler);
                throw e;
            }
        };
        processor.addEventListener('audioprocess', handler);
        return processor;
    }
    inputDidUpdate(input, newValue) {
        const args = this._orderedFunctionInputs.map(eachInput => eachInput.value);
        const result = this.fn(...args);
        this.output.setValue(result);
    }
    process(event) {
        return this.fn(event);
    }
    withInputs(...inputs) {
        var _a;
        let inputDict;
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
_FunctionComponent_instances = new WeakSet(), _FunctionComponent_parallelApplyAcrossChannels = function _FunctionComponent_parallelApplyAcrossChannels(inputChannels, outputChannels) {
    for (let c = 0; c < inputChannels.length; c++) {
        let outputChannel = outputChannels[c];
        const inputChannel = inputChannels[c];
        for (let i = 0; i < outputChannel.length; i++) {
            // For the current sample and channel, apply the function across the
            // inputs.
            const inputs = inputChannel.map(inp => inp[i]);
            const res = this.fn(...inputs);
            if (typeof res != 'number') {
                throw new Error("FunctionComponents that operate on audio-rate inputs must return numbers. Given: " + (typeof res));
            }
            outputChannel[i] = res;
        }
    }
};
class HasDynamicInput {
}
