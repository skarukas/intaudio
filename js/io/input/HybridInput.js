import { AbstractInput } from "./AbstractInput.js";
import constants from "../../shared/constants.js";
import { createMultiChannelView } from "../../shared/multichannel.js";
export class HybridInput extends AbstractInput {
    // Hybrid input can connect an audio input to a sink, but it also can
    // receive control inputs.
    constructor(name, parent, audioSink, defaultValue = constants.UNSET_VALUE, isRequired = false) {
        super(name, parent, isRequired);
        this.name = name;
        this.parent = parent;
        this.audioSink = audioSink;
        this.isRequired = isRequired;
        this.activeChannel = undefined;
        this._value = defaultValue;
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
        return this._value;
    }
    setValue(value) {
        var _a;
        if (value == constants.TRIGGER && this.value != undefined) {
            value = this.value;
        }
        this._value = value;
        if (isFinite(+value)) {
            this.audioSink["value"] = +value;
        }
        (_a = this.parent) === null || _a === void 0 ? void 0 : _a.propagateUpdatedInput(this, value);
    }
}
