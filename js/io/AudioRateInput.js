import { AbstractInput } from "./AbstractInput.js";
import constants from "../shared/constants.js";
export class AudioRateInput extends AbstractInput {
    constructor(parent, audioSink) {
        super(parent, false);
        this.parent = parent;
        this.audioSink = audioSink;
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
