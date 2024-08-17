import constants from "../../shared/constants.js";
import { connectWebAudioChannels, createMultiChannelView, getNumInputChannels, getNumOutputChannels } from "../../shared/multichannel.js";
import { AudioRateInput } from "../input/AudioRateInput.js";
import { ComponentInput } from "../input/ComponentInput.js";
import { HybridInput } from "../input/HybridInput.js";
import { AbstractOutput } from "./AbstractOutput.js";
// TODO: Add a GainNode here to allow muting and mastergain of the component.
export class AudioRateOutput extends AbstractOutput {
    constructor(name, audioNode, parent) {
        super(name, parent);
        this.name = name;
        this.audioNode = audioNode;
        this.parent = parent;
        this._channels = undefined;
        this.activeChannel = undefined;
        this.analyzer = new AnalyserNode(this.audioContext, { fftSize: constants.MAX_ANALYZER_LENGTH });
        this.connectNodes(this.audioNode, this.analyzer);
    }
    get channels() {
        var _a;
        return (_a = this._channels) !== null && _a !== void 0 ? _a : (this._channels = createMultiChannelView(this, true));
    }
    get left() {
        return this.channels[0];
    }
    get right() {
        var _a;
        return (_a = this.channels[1]) !== null && _a !== void 0 ? _a : this.left;
    }
    get numInputChannels() {
        return this.activeChannel != undefined ? 1 : getNumInputChannels(this.audioNode);
    }
    get numOutputChannels() {
        return this.activeChannel != undefined ? 1 : getNumOutputChannels(this.audioNode);
    }
    connectNodes(from, to, fromChannel = undefined, toChannel = undefined) {
        to && connectWebAudioChannels(this.audioContext, from, to, fromChannel, toChannel);
    }
    connect(destination) {
        let { component, input } = this.getDestinationInfo(destination);
        input = input instanceof ComponentInput ? input.defaultInput : input;
        if (!input) {
            const inputs = component == undefined ? [] : Object.keys(component.inputs);
            throw new Error(`No default input found for ${component}, so unable to connect to it from ${this}. Found named inputs: [${inputs}]`);
        }
        if (!(input instanceof AudioRateInput || input instanceof HybridInput)) {
            throw new Error(`Can only connect audio-rate outputs to inputs that support audio-rate signals. Given: ${input}. Use 'AudioRateSignalSampler' to force a conversion.`);
        }
        this.connectNodes(this.audioNode, input.audioSink, this.activeChannel, input.activeChannel);
        this.connections.push(input);
        component === null || component === void 0 ? void 0 : component.wasConnectedTo(this);
        return component;
    }
    sampleSignal(samplePeriodMs) {
        return this.connect(new this._.AudioRateSignalSampler(samplePeriodMs));
    }
    // TODO: Make a single global sampler so that all signals are logged together.
    logSignal({ samplePeriodMs = 1000, format } = {}) {
        if (!format) {
            format = "";
            // Maybe add parent
            if (this.parent != undefined) {
                const shortId = this.parent._uuid.split("-")[0];
                format += `${this.parent.constructor.name}#${shortId}.`;
            }
            format += this.name;
            // Maybe add channel spec
            if (this.activeChannel != undefined) {
                format += `.channels[${this.activeChannel}]`;
            }
            format += ": {}";
        }
        // TODO: Could this be optimized? Also, make this log the array, each channel.
        this.config.logger.register(this, format);
        return this;
    }
    splitChannels(...inputChannelGroups) {
        if (inputChannelGroups.length > 32) {
            throw new Error("Can only split into 32 or fewer channels.");
        }
        if (!inputChannelGroups.length) {
            // Split each channel separately: [0], [1], [2], etc.
            for (let i = 0; i < this.numOutputChannels; i++) {
                inputChannelGroups.push([i]);
            }
            /* // Seems to be broken? Consider removing "channel views" as they do not
            // have a correct channel count etc.
            // This is an optimization that returns the channel views instead of
            // split+merged channels.
            return this.channels */
        }
        return this.connect(new this._.ChannelSplitter(...inputChannelGroups));
    }
    transformAudio(fn, { windowSize, useWorklet, dimension = "none" } = {}) {
        const options = {
            dimension,
            windowSize,
            useWorklet,
            numChannelsPerInput: [this.numOutputChannels],
            numInputs: 1
        };
        const transformer = new this._.AudioTransformComponent(fn, options);
        return this.connect(transformer.inputs[0]); // First input of the function.
    }
    disconnect(destination) {
        // TODO: implement this and utilize it for temporary components / nodes.
        console.warn("Disconnect not yet supported.");
    }
    /**
     * Return the current audio samples.
     */
    capture(numSamples) {
        const recorder = new this._.AudioRecordingComponent();
        this.connect(recorder);
        const buffer = recorder.capture(numSamples);
        this.disconnect(recorder);
        return buffer;
    }
    fft(fftSize = 128) {
        const component = new this._.FFTComponent(fftSize);
        this.connect(component.realInput);
        this.connect(component.imaginaryInput);
        return component.fftOut;
    }
}
