import { connectWebAudioChannels, createMultiChannelView, getNumInputChannels, getNumOutputChannels } from "../../shared/multichannel.js";
import { AudioRateInput } from "../input/AudioRateInput.js";
import { HybridInput } from "../input/HybridInput.js";
import { AbstractOutput } from "./AbstractOutput.js";
// TODO: Add a GainNode here to allow muting and mastergain of the component.
export class AudioRateOutput extends AbstractOutput {
    constructor(name, audioNode) {
        super(name);
        this.name = name;
        this.audioNode = audioNode;
        this._channels = undefined;
        this.activeChannel = undefined;
    }
    get channels() {
        var _a;
        return (_a = this._channels) !== null && _a !== void 0 ? _a : (this._channels = createMultiChannelView(this, this.audioNode));
    }
    get left() {
        return this.channels[0];
    }
    get right() {
        var _a;
        return (_a = this.channels[1]) !== null && _a !== void 0 ? _a : this.left;
    }
    get numInputChannels() {
        return this.activeChannel ? 1 : getNumInputChannels(this.audioNode);
    }
    get numOutputChannels() {
        return this.activeChannel ? 1 : getNumOutputChannels(this.audioNode);
    }
    connect(destination) {
        let { component, input } = this.getDestinationInfo(destination);
        if (!(input instanceof AudioRateInput || input instanceof HybridInput)) {
            throw new Error(`Can only connect audio-rate outputs to inputs that support audio-rate signals. Given: ${input}. Use 'AudioRateSignalSampler' to force a conversion.`);
        }
        input.audioSink && connectWebAudioChannels(this.audioContext, this.audioNode, input.audioSink, this.activeChannel, input.activeChannel);
        this.connections.push(input);
        component === null || component === void 0 ? void 0 : component.wasConnectedTo(this);
        return component;
    }
    sampleSignal(samplePeriodMs) {
        return this.connect(new this._.AudioRateSignalSampler(samplePeriodMs));
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
    transformAudio(fn, dimension, windowSize) {
        const options = {
            dimension,
            windowSize,
            numChannelsPerInput: this.numInputChannels
        };
        const transformer = new this._.AudioTransformComponent(fn, options);
        return this.connect(transformer);
    }
}
