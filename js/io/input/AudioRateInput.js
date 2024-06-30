import { AbstractInput } from "./AbstractInput.js";
import constants from "../../shared/constants.js";
export class AudioRateInput extends AbstractInput {
    constructor(name, parent, audioSink) {
        super(name, parent, false);
        this.name = name;
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
