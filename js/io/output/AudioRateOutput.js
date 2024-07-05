import { AudioRateSignalSampler } from "../../components/AudioRateSignalSampler.js";
import { connectWebAudioChannels, createMultiChannelView } from "../../shared/multichannel.js";
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
    connect(destination) {
        let { component, input } = this.getDestinationInfo(destination);
        if (!(input instanceof AudioRateInput || input instanceof HybridInput)) {
            throw new Error(`Can only connect audio-rate outputs to inputs that support audio-rate signals. Given: ${input}. Use ${AudioRateSignalSampler.name} to force a conversion.`);
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
        if (inputChannelGroups.length) {
            return this.connect(new this._.ChannelSplitter(...inputChannelGroups));
        }
        else {
            // This is an optimization that returns the channel views instead of 
            // split+merged channels.
            return this.channels;
        }
    }
}
