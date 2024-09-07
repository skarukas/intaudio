import { connectWebAudioChannels, createMultiChannelView } from "../../shared/multichannel.js";
import { range } from "../../shared/util.js";
import { AudioRateInput } from "../input/AudioRateInput.js";
import { ComponentInput } from "../input/ComponentInput.js";
import { AbstractOutput } from "./AbstractOutput.js";
// TODO: Add a GainNode here to allow muting and mastergain of the component.
export class AudioRateOutput extends AbstractOutput {
    constructor(name, port, parent) {
        super(name, parent);
        this.name = name;
        this.parent = parent;
        this._channels = undefined;
        this.activeChannel = undefined;
        this.port = port instanceof AudioNode ? new this._.NodeOutputPort(port) : port;
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
    // TODO: remove this from AudioSignalStream.
    get numInputChannels() {
        return this.activeChannel != undefined ? 1 : this.port.numChannels;
    }
    get numOutputChannels() {
        return this.activeChannel != undefined ? 1 : this.port.numChannels;
    }
    toString() {
        const superCall = super.toString();
        return this.activeChannel == undefined ?
            superCall
            : `${superCall}.channels[${this.activeChannel}]`;
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
        if (!(input instanceof AudioRateInput)) {
            throw new Error(`Can only connect audio-rate outputs to inputs that support audio-rate signals. Given: ${input}. Use 'AudioRateSignalSampler' to force a conversion.`);
        }
        this.port.connect(input.port, this.activeChannel, input.activeChannel);
        if (input._uuid in this.connections) {
            throw new Error(`The given input ${input} (${input._uuid}) is already connected.`);
        }
        this.connections[input._uuid] = input;
        component === null || component === void 0 ? void 0 : component.wasConnectedTo(this);
        return component;
    }
    disconnect(destination) {
        if (destination == undefined) {
            for (const input of Object.values(this.connections)) {
                this.disconnect(input);
            }
        }
        else {
            const input = this.getDestinationInfo(destination).input;
            // Disconnect audio node.
            this.port.disconnect(input.port, this.activeChannel, input.activeChannel);
            delete this.connections[input._uuid];
        }
    }
    sampleSignal(samplePeriodMs) {
        return this.connect(new this._.AudioRateSignalSampler(samplePeriodMs));
    }
    logSignal({ 
    // TODO: remove this param.
    samplePeriodMs = 1000, format } = {}) {
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
    toChannels(numChannels, mode = 'speakers') {
        if (mode == 'repeat') {
            // Custom mode -- repeat all the channels you have to fill the target.
            let c = 0;
            const channels = [];
            for (const _ of range(numChannels)) {
                channels.push(this.channels[c]);
                // Cycle over available channels.
                c = (c + 1) % this.numOutputChannels;
            }
            return this._.ChannelStacker.fromInputs(channels);
        }
        else {
            // Native WebAudio up- or down-mixing to the right number of channels.
            const gain = new GainNode(this.audioContext, {
                channelCount: numChannels,
                channelCountMode: "explicit",
                channelInterpretation: mode
            });
            return this.connect(gain);
        }
    }
}
