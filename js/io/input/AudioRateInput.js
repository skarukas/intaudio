import { AbstractInput } from "./AbstractInput.js";
import constants from "../../shared/constants.js";
import { createMultiChannelView, getNumInputChannels } from "../../shared/multichannel.js";
export class AudioRateInput extends AbstractInput {
    get numInputChannels() {
        return this.activeChannel ? 1 : getNumInputChannels(this.audioSink);
    }
    constructor(name, parent, audioSink) {
        super(name, parent, false);
        this.name = name;
        this.parent = parent;
        this.audioSink = audioSink;
        this.activeChannel = undefined;
        this.channels = createMultiChannelView(this, audioSink);
    }
    get left() {
        return this.channels[0];
    }
    get right() {
        var _a;
        return (_a = this.channels[1]) !== null && _a !== void 0 ? _a : this.left;
    }
    get value() {
        return this.audioSink["value"]; // TODO: fix? AudioNodes have no value.
    }
    setValue(value) {
        if (value == constants.TRIGGER) {
            value = this.value;
        }
        this.audioSink["value"] = value;
    }
}
